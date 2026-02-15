# Passkey Demo Self-Hosted WebAuthn

A minimal demo app that implements Passkey without using an IdP.
Built with React (Vite) + Express and `@simplewebauthn`.

This project is for learning and prototyping. It intentionally skips many production concerns.

## Features

- User registration (no email)
- Password login
- Passkey registration (single passkey per user)
- Passkey login
- Passkey status on My Page
- Passkey deletion
- Logout
- Passkey operations protected by password re-auth (short-lived)

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- WebAuthn: `@simplewebauthn/server`
- DB: SQLite (via `sql.js`)
- Session: HttpOnly Cookie

## Design Notes

- Vite proxy is used to keep the same origin (no CORS).
- RP ID: `localhost`
- Learning/prototype setup only (no production hardening).

## Project Structure

```
backend/
  src/
    app.js
    server.js
    routes/
    controllers/
    services/
    repositories/
    middleware/
    db/
frontend/
  src/
    pages/
    components/
    features/
```

## Getting Started

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

Open the app at:

```
http://localhost:5173
```

## Notes / Limitations

- Attestation is not collected (simplified).
- No account recovery.
- One passkey per user.
- Not production-ready (security, monitoring, scaling, etc.).

## License

MIT. See `LICENSE`.
