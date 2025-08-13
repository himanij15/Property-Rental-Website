import { useState, useEffect } from "react";

export type PageType = 
  | "home" 
  | "listings" 
  | "property-details" 
  | "user-dashboard" 
  | "admin-dashboard"
  | "about"
  | "contact";

interface RouterContextType {
  currentPage: PageType;
  navigate: (page: PageType, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

let routerContext: RouterContextType = {
  currentPage: "home",
  navigate: () => {},
  params: {}
};

const listeners: Set<() => void> = new Set();

export function navigate(page: PageType, params: Record<string, string> = {}) {
  routerContext.currentPage = page;
  routerContext.params = params;
  
  // Update URL hash for basic navigation
  window.location.hash = page === "home" ? "" : `#${page}`;
  
  // Notify all listeners
  listeners.forEach(listener => listener());
}

export function useRouter(): RouterContextType {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    
    // Handle browser back/forward
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as PageType;
      if (hash && hash !== routerContext.currentPage) {
        routerContext.currentPage = hash || "home";
        forceUpdate({});
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    
    // Set initial page from hash
    const initialHash = window.location.hash.slice(1) as PageType;
    if (initialHash) {
      routerContext.currentPage = initialHash;
    }
    
    return () => {
      listeners.delete(listener);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
  return {
    currentPage: routerContext.currentPage,
    navigate,
    params: routerContext.params
  };
}