import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageLoaderContextType {
  isPageLoading: boolean;
}

const PageLoaderContext = createContext<PageLoaderContextType | undefined>(undefined);

export const PageLoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <PageLoaderContext.Provider value={{ isPageLoading }}>
      {children}
    </PageLoaderContext.Provider>
  );
};

export const usePageLoader = () => {
  const context = useContext(PageLoaderContext);
  if (context === undefined) {
    // Return a safe fallback if context is not present (e.g. Admin page)
    return { isPageLoading: false };
  }
  return context;
};
