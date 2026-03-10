import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({} as SidebarContextType);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggle = () => setIsExpanded(prev => !prev);

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);