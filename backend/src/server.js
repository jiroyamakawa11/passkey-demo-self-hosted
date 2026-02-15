// アプリ起動のエントリーポイント
const app = require('./app');
const { initDb } = require('./db');
const { port } = require('./config');

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
