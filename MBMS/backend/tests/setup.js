// tests/setup.js

require('dotenv').config({
  path: '.env.test',
});

// Increase timeout for DB operations
jest.setTimeout(30000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(
    '❌ Unhandled Promise Rejection:',
    err
  );

  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(
    '❌ Uncaught Exception:',
    err
  );

  process.exit(1);
});

beforeAll(async () => {
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  console.log('✅ Test suite finished');
});