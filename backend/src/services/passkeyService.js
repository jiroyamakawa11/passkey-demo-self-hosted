const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');

const { rpID, expectedOrigin, sessionMaxAgeMs } = require('../config');
const { nowMs } = require('../lib/time');
const { httpError } = require('../lib/errors');
const userRepository = require('../repositories/userRepository');
const credentialRepository = require('../repositories/credentialRepository');
const sessionService = require('./sessionService');

/**
 * 登録開始 - チャレンジを生成
 * @param {{userId: number}} session
 * @returns {Promise<any>}
 */
async function startRegistration(session) {
  // セッションからユーザを取得
  const user = await userRepository.getById(session.userId);
  if (!user) {
    throw httpError(404, 'user_not_found');
  }
  // Passkeyが登録されている場合は、エラーとする（本デモでは、Passkeyは1人1つとした）
  const existing = await credentialRepository.getByUserId(user.id);
  if (existing) {
    throw httpError(409, 'passkey_exists');
  }

  // チャレンジの生成
  const options = await generateRegistrationOptions({
    // Relying Party(RP)の表示名（ユーザーの認証器に表示されるサービス名）
    // Relying Partyとは認証を要求し検証するサービスを指す（今回はWebアプリと認証サーバ）
    rpName: 'Passkey Demo',
    // RP ID（今回はlocalhost固定）
    rpID,
    // 認証器（Passkey側）に保存される内部識別子（ランダムなユーザーハンドルを使用）
    userID: user.user_handle,
    // UIで表示される「ユーザー名」的な識別子
    userName: user.username,
    // より人間向けに表示する名前（今回はユーザー名と同一）
    userDisplayName: user.username,
    // Attestationは取得しない
    // attestationTypeは、認証器の証明書情報を受け取るかどうかのタイプ
    attestationType: 'none',
    // 認証器の要件
    // residentKey: Discoverable Credentialを「必須」
    //   認証器にユーザー識別情報を保存する（Discoverable Credential を作る）
    //   ユーザーがユーザー名入力なしで認証できるようにするため
    // userVerification: ユーザー検証（生体認証やPINなど）を「必須」
    //   認証機でユーザ認証を必須に設定する
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
  });

  // セッションに発行したチャレンジと登録中であることを格納
  session.challenge = options.challenge;
  session.challengeType = 'registration';
  await sessionService.updateSession(session);

  return options;
}

/**
 * 登録完了 - 公開鍵で署名を検証し、公開鍵を保存
 * @param {{userId: number, challenge: string | null, challengeType: string | null}} session
 * @param {any} body
 * @returns {Promise<void>}
 */
async function finishRegistration(session, body) {
  // セッションからユーザを取得
  const user = await userRepository.getById(session.userId);
  if (!user) {
    throw httpError(404, 'user_not_found');
  }
  // チャレンジの存在と登録中であることを確認する
  if (!session.challenge || session.challengeType !== 'registration') {
    throw httpError(400, 'missing_challenge');
  }

  let verification;
  try {
    // 検証
    verification = await verifyRegistrationResponse({
      // ブラウザから返ってきた登録レスポンス
      response: body,
      // サーバーで保持していたチャレンジと一致するか
      expectedChallenge: session.challenge,
      // 期待するOrigin（RPのオリジン）
      expectedOrigin,
      // 期待するRP ID
      expectedRPID: rpID,
      // ユーザー検証（生体/PIN）を必須にする
      requireUserVerification: true,
    });
  } catch (err) {
    throw httpError(400, 'verification_failed');
  }

  // 検証結果の確認
  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw httpError(400, 'verification_failed');
  }

  // 認証器が発行したCredential IDをBase64URL文字列化して保存
  const credentialId = isoBase64URL.fromBuffer(registrationInfo.credentialID);
  // 認証器の公開鍵をBase64URL文字列化して保存
  const publicKey = isoBase64URL.fromBuffer(registrationInfo.credentialPublicKey);
  // 署名カウンタ
  // （認証のたびに増える値。クローン検知、つまり同じ鍵がコピーされたことを検知することに利用）
  const counter = registrationInfo.counter;
  // 認証器の伝送手段（internal/usb/nfc/ble など）
  const transports = body?.response?.transports
    ? JSON.stringify(body.response.transports)
    : null;

  // 公開鍵をDBに保存
  await credentialRepository.create({
    userId: user.id,
    credentialId,
    publicKey,
    counter,
    transports,
    createdAt: nowMs(),
  });

  // セッションからチャレンジと登録中であることを破棄する。
  // 破棄しないともう一度使えてしまう
  session.challenge = null;
  session.challengeType = null;
  await sessionService.updateSession(session);
}

/**
 * 認証開始 - チャレンジの生成
 * @param {{}} session
 * @returns {Promise<any>}
 */
async function startAuthentication(session) {
  // チャレンジの生成
  const options = await generateAuthenticationOptions({
    // RP ID（今回はlocalhost固定）
    rpID,
    // ユーザー検証（生体/PIN）を必須にする
    userVerification: 'required',
  });

  // セッションにチャレンジと認証中であることを格納
  session.challenge = options.challenge;
  session.challengeType = 'authentication';
  await sessionService.updateSession(session);

  return options;
}

/**
 * 認証完了 - 保存されている公開鍵で署名を検証
 * @param {{challenge: string | null, challengeType: string | null}} session
 * @param {any} body
 * @returns {Promise<void>}
 */
async function finishAuthentication(session, body) {
  // チャレンジの存在と認証中であることを確認する
  if (!session.challenge || session.challengeType !== 'authentication') {
    throw httpError(400, 'missing_challenge');
  }

  // 認証レスポンスに含まれるCredential ID（登録時に保存したものと同じ値）
  const credentialId = body?.id;
  if (!credentialId) {
    throw httpError(400, 'missing_credential');
  }

  // Credential IDをキーに、保存済みの公開鍵などを取得
  const credential = await credentialRepository.getByCredentialId(credentialId);
  if (!credential) {
    throw httpError(400, 'unknown_credential');
  }

  // ユーザ情報を取得
  const user = await userRepository.getById(credential.user_id);
  if (!user) {
    throw httpError(400, 'user_not_found');
  }

  let verification;
  try {
    // 認証
    verification = await verifyAuthenticationResponse({
      // ブラウザから返ってきた認証レスポンス
      response: body,
      // サーバーで保持していたチャレンジと一致するか
      expectedChallenge: session.challenge,
      // 期待するOrigin（RPのオリジン）
      expectedOrigin,
      // 期待するRP ID
      expectedRPID: rpID,
      // DBに保存している認証器情報（公開鍵とカウンタ）
      authenticator: {
        credentialID: isoBase64URL.toBuffer(credential.credential_id),
        credentialPublicKey: isoBase64URL.toBuffer(credential.public_key),
        counter: credential.counter,
      },
      // ユーザー検証（生体/PIN）が実施されていることを必須にする
      requireUserVerification: true,
    });
  } catch (err) {
    throw httpError(400, 'verification_failed');
  }

  // 検証結果の確認
  const { verified, authenticationInfo } = verification;
  if (!verified || !authenticationInfo) {
    throw httpError(400, 'verification_failed');
  }

  // 認証カウンタを更新（クローン検知用）
  await credentialRepository.updateCounter(credential.id, authenticationInfo.newCounter);

  // セッションに認証したユーザのIDを保存し、チャレンジと認証中であることを破棄
  session.userId = user.id;
  session.challenge = null;
  session.challengeType = null;
  session.expiresAt = nowMs() + sessionMaxAgeMs;
  await sessionService.updateSession(session);
}

/**
 * Passkey削除。
 * @param {{userId: number}} session
 * @returns {Promise<void>}
 */
async function deletePasskey(session) {
  await credentialRepository.deleteByUserId(session.userId);
}

module.exports = {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
  deletePasskey,
};
