import React, { createContext, useContext, useCallback } from 'react';

// Create the context
export const TransactionContext = createContext();

// Create a provider component
export const TransactionProvider = ({ children }) => {
  // This will store the refetch function passed from the Transactions page
  const [refetchFn, setRefetchFn] = React.useState(null);

  // Call this from the Transactions component to register its loadData function
  const registerRefetch = useCallback((loadDataFn) => {
    setRefetchFn(() => loadDataFn);
  }, []);

  // Call this from TransactionImportComplete when import is successful
  const triggerRefresh = useCallback(async () => {
    if (refetchFn) {
      await refetchFn();
    }
  }, [refetchFn]);

  return (
    <TransactionContext.Provider value={{ registerRefetch, triggerRefresh }}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the context
export const useTransactionRefresh = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionRefresh must be used within TransactionProvider');
  }
  return context;
};