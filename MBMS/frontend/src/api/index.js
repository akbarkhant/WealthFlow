// index.js

export { default as api, request, setServerErrorHandler, API_URL } from './client';
export * as authApi from './authApi';
export * as userApi from './userApi';
export * as transactionsApi from './transactionsApi';
export * as chartsApi from './chartsApi';
export * as budgetsApi from './budgetsApi';
export * as categoriesApi from './categoriesApi';
export * as dashboardApi from './dashboardApi';

// Default export for backward compatibility
export { default } from './client';
