import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "agent" | "admin";
  phone?: string;
  savedProperties?: string[];
  preferences?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// API configuration - using fallback values for browser environment
const API_BASE_URL = (() => {
  // Try to detect if we're in development vs production
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return 'http://localhost:5000/api';
  } else {
    // In production, you might want to use a relative path or configure this differently
    return '/api';
  }
})();

// API helper function with improved error handling
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("dwellogo_token");
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is ok
    if (!response.ok) {
      // Try to parse as JSON first, fall back to text
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // If everything fails, use the status message
          errorMessage = `API request failed with status ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }
    
    // Try to parse response as JSON
    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      // If JSON parsing fails, the response might be empty or not JSON
      console.warn('Response is not valid JSON:', parseError);
      return { success: false, message: 'Invalid response format' };
    }
  } catch (error) {
    // Handle network errors and other fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - backend server may not be running:', error);
      throw new Error('Backend server is not available');
    }
    
    console.error('API call failed:', error);
    throw error;
  }
};

// Mock users for fallback (development mode)
const mockUsers = [
  {
    id: "1",
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "user" as const,
    savedProperties: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    _id: "2", 
    name: "Sarah Johnson",
    email: "sarah@dwellogo.com",
    password: "agent123",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop&crop=face",
    role: "agent" as const,
    savedProperties: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    _id: "3",
    name: "Admin User",
    email: "admin@dwellogo.com", 
    password: "admin123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "admin" as const,
    savedProperties: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("dwellogo_token");
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Try to get user from API
      const data = await apiCall('/auth/me');
      
      if (data.success && data.user) {
        setUser({
          ...data.user,
          id: data.user._id, // Ensure id field exists for compatibility
        });
      } else {
        // Clear invalid token
        localStorage.removeItem("dwellogo_token");
        localStorage.removeItem("dwellogo_user");
      }
    } catch (error) {
      console.warn('Backend not available, using stored user data:', error.message);
      
      // Fallback to stored user data (development mode)
      const storedUser = localStorage.getItem("dwellogo_user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          localStorage.removeItem("dwellogo_user");
          localStorage.removeItem("dwellogo_token");
        }
      }
    }
    
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try API login first
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.success && data.token && data.user) {
        const userWithId = {
          ...data.user,
          id: data.user._id, // Ensure id field exists
        };
        
        setUser(userWithId);
        localStorage.setItem("dwellogo_token", data.token);
        localStorage.setItem("dwellogo_user", JSON.stringify(userWithId));
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.warn('Backend login failed, using demo data:', error.message);
    }
    
    // Fallback to mock authentication (development mode)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem("dwellogo_user", JSON.stringify(userWithoutPassword));
      // Create a mock token for development
      localStorage.setItem("dwellogo_token", `mock-token-${mockUser.id}`);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try API signup first
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      if (data.success && data.token && data.user) {
        const userWithId = {
          ...data.user,
          id: data.user._id, // Ensure id field exists
        };
        
        setUser(userWithId);
        localStorage.setItem("dwellogo_token", data.token);
        localStorage.setItem("dwellogo_user", JSON.stringify(userWithId));
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.warn('Backend signup failed, using demo data:', error.message);
    }
    
    // Fallback to mock signup (development mode)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Check if user already exists in mock data
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setLoading(false);
      return false;
    }
    
    // Create new mock user
    const newUser: User = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      name,
      email,
      role: "user",
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`,
      savedProperties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem("dwellogo_user", JSON.stringify(newUser));
    localStorage.setItem("dwellogo_token", `mock-token-${newUser.id}`);
    setLoading(false);
    return true;
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Try API update first
      const data = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      if (data.success && data.user) {
        const updatedUser = {
          ...data.user,
          id: data.user._id,
        };
        
        setUser(updatedUser);
        localStorage.setItem("dwellogo_user", JSON.stringify(updatedUser));
        return true;
      }
    } catch (error) {
      console.warn('Backend user update failed, updating locally:', error.message);
    }
    
    // Fallback to local update (development mode)
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("dwellogo_user", JSON.stringify(updatedUser));
    return true;
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const data = await apiCall('/auth/me');
      
      if (data.success && data.user) {
        const updatedUser = {
          ...data.user,
          id: data.user._id,
        };
        
        setUser(updatedUser);
        localStorage.setItem("dwellogo_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.warn('Failed to refresh user data from backend:', error.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dwellogo_user");
    localStorage.removeItem("dwellogo_token");
    
    // Call logout endpoint to invalidate token on server (optional)
    apiCall('/auth/logout', { method: 'POST' }).catch(error => {
      console.warn('Backend logout failed (this is expected if backend is not running):', error.message);
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}