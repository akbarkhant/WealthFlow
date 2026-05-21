// server.js

const http = require('http');
const app = require('./src/app');
const { config } = require('./src/config/index.config');

// Create HTTP server
const server = http.createServer(app);

const PORT = config.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log('────────────────────────────────────');
  console.log(`🚀 Server Started Successfully`);
  console.log(`🌍 Environment : ${config.NODE_ENV}`);
  console.log(`🔗 Port        : ${PORT}`);
  console.log(`📡 URL         : http://localhost:${PORT}`);
  console.log('────────────────────────────────────');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);

  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown (CTRL + C)
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});