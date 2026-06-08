// src/config/cron.config.js

const cron = require('node-cron');
const currencyService = require('../modules/currencies/currencies.service');
const { logger } = require('./logger.config');

function initCronJobs() {
  // '0 6 * * *' means: Every day at exactly 06:00 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('[CRON_JOB]: Starting morning exchange rate synchronization sync...');
    
    try {
      // Explicitly pull down and update your system's core target pairs
      await currencyService.syncSpecificPair('USD', 'PKR');
      
      // Other currency combinations your app scales up to support:
      await currencyService.syncSpecificPair('EUR', 'PKR');
      await currencyService.syncSpecificPair('GBP', 'PKR');

      logger.info('[CRON_JOB]: Morning exchange rates updated successfully.');
    } catch (error) {
      logger.error(`[CRON_JOB_ERROR]: Morning currency sync failed: ${error.message}`);
    }
  });
  
  logger.info('[CRON_SYSTEM]: Background schedulers initialized running in state: ACTIVE');
}

module.exports = { initCronJobs };