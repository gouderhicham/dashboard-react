/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface IPathnameContextProps {
  pathname: string;
  prevPathname: string | undefined;
}

const PathnameContext = createContext<IPathnameContextProps | undefined>(undefined);

const PathnameProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [prevPathname, setPrevPathname] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPrevPathname(pathname);
  }, [pathname]);

  const value = useMemo(() => ({ pathname, prevPathname }), [pathname, prevPathname]);

  return <PathnameContext.Provider value={value}>{children}</PathnameContext.Provider>;
};

const usePathname = (): IPathnameContextProps => {
  const context = useContext(PathnameContext);
  if (!context) {
    throw new Error('usePathname must be used within a PathnameProvider');
  }
  return context;
};

export { PathnameProvider, usePathname };
