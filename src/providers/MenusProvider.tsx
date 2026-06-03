/* eslint-disable no-unused-vars */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import { IMenuItemConfig, TMenuConfig } from '@/components/menu';

export interface IMenusProps {
  configs: Map<string, TMenuConfig | null>;
  setMenuConfig: (name: string, config: TMenuConfig | null) => void;
  getMenuConfig: (name: string) => TMenuConfig | null;
  setCurrentMenuItem: (config: IMenuItemConfig | null) => void;
  getCurrentMenuItem: () => IMenuItemConfig | null;
}

const initialProps: IMenusProps = {
  configs: new Map(),
  setMenuConfig: () => {},
  getMenuConfig: () => null,
  setCurrentMenuItem: () => {},
  getCurrentMenuItem: () => null
};

const MenuContext = createContext<IMenusProps>(initialProps);
const useMenus = () => useContext(MenuContext);

const MenusProvider = ({ children }: PropsWithChildren) => {
  const [currentMenuItem, setCurrentMenuItem] = useState<IMenuItemConfig | null>(null);
  const configsRef = useRef<Map<string, TMenuConfig | null>>(new Map());
  const currentMenuItemRef = useRef<IMenuItemConfig | null>(currentMenuItem);
  currentMenuItemRef.current = currentMenuItem;

  const setMenuConfig = useCallback((name: string, config: TMenuConfig | null) => {
    configsRef.current.set(name, config);
  }, []);

  const getCurrentMenuItem = useCallback((): IMenuItemConfig | null => {
    return currentMenuItemRef.current;
  }, []);

  const getMenuConfig = useCallback((name: string): TMenuConfig | null => {
    return configsRef.current.get(name) ?? null;
  }, []);

  const value = useMemo(
    () => ({
      configs: configsRef.current,
      setMenuConfig,
      getMenuConfig,
      setCurrentMenuItem,
      getCurrentMenuItem
    }),
    [setMenuConfig, getMenuConfig, getCurrentMenuItem]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { MenusProvider, useMenus };
