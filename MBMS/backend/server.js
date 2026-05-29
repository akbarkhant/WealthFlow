const http = require('http');
const app = require('./src/app');
const { config } = require('./src/config/index.config');
const { connectRedis, disconnectRedis } = require('./src/config/redis.config');
const {pool} = require('./src/config/db.config');
const { registerProcessHandlers } = require('./src/middleware/errorHandler.middleware');

const server = http.createServer(app);
const PORT = config.PORT || 5000;

async function start() {
  try {
    // ── Connect Database ──────────────────────
    await pool.connect().then(client => {
      console.log('✅ Database connected');
      client.release();
    });

    // ── Connect Redis ─────────────────────────
    await connectRedis();

    // ── Start Server ──────────────────────────
    server.listen(PORT, () => {
      console.log('────────────────────────────────────');
      console.log(`🚀 Server Started Successfully`);
      console.log(`🌍 Environment : ${config.NODE_ENV}`);
      console.log(`🔗 Port        : ${PORT}`);
      console.log(`📡 URL         : http://localhost:${PORT}`);
      console.log('────────────────────────────────────');
    });

    registerProcessHandlers(server);

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

