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

const WS_BASE_URL = (() => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return 'http://localhost:5000';
  } else {
    return '';
  }
})();

// Track API availability to reduce redundant error messages
let apiAvailabilityChecked = false;
let isApiAvailable = false;

// Check API availability once
const checkApiAvailability = async (): Promise<boolean> => {
  if (apiAvailabilityChecked) return isApiAvailable;
  
  try {
    // Create timeout signal manually for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      isApiAvailable = true;
      console.log('✅ Backend API is available');
    } else {
      isApiAvailable = false;
    }
  } catch (error) {
    isApiAvailable = false;
    console.info('ℹ️ Backend API not available - using demo mode');
  }
  
  apiAvailabilityChecked = true;
  return isApiAvailable;
};

// Types
export interface Property {
  _id: string;
  title: string;
  description: string;
  location: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
    neighborhood?: string;
    walkabilityScore?: number;
    transitScore?: number;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    propertyType: string;
    amenities: string[];
    parking?: {
      spaces: number;
      type: string;
    };
  };
  pricing: {
    listPrice: number;
    rent?: number;
    taxes?: {
      annual: number;
      perMonth: number;
    };
    hoa?: {
      monthly: number;
      amenities: string[];
    };
  };
  media: {
    images: Array<{
      url: string;
      alt?: string;
      isPrimary: boolean;
      room?: string;
    }>;
    virtualTour?: {
      url: string;
      rooms: Array<{
        name: string;
        thumbnailUrl: string;
        panoramaUrl: string;
      }>;
    };
  };
  status: string;
  listingAgent: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  views: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  _id: string;
  property: string | Property;
  host: string;
  title: string;
  description?: string;
  scheduledTime: string;
  duration: number;
  type: 'virtual' | 'in-person' | 'hybrid';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  participants: Array<{
    user: string;
    role: 'host' | 'participant' | 'agent';
    joinedAt: string;
    isActive: boolean;
  }>;
  maxParticipants: number;
  isPrivate: boolean;
  accessCode?: string;
  currentLocation?: {
    room: string;
    controlledBy: string;
  };
  chat: Array<{
    _id: string;
    user: string;
    message: string;
    timestamp: string;
    type: 'message' | 'system' | 'annotation';
  }>;
}

export interface MaintenanceTask {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  property: string;
  createdBy: string;
  assignedTo?: string;
  contractor?: {
    name: string;
    company: string;
    phone: string;
    email: string;
  };
  estimatedCost?: number;
  actualCost?: number;
  dueDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Negotiation {
  _id: string;
  property: string | Property;
  buyer: string;
  seller?: string;
  buyerAgent?: string;
  sellerAgent?: string;
  status: 'active' | 'pending-acceptance' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  offers: Array<{
    _id: string;
    amount: number;
    terms: any;
    status: string;
    submittedBy: string;
    submittedAt: string;
    expiresAt?: string;
  }>;
  messages: Array<{
    _id: string;
    sender: string;
    recipient: string;
    message: string;
    type: string;
    timestamp: string;
    isRead: boolean;
  }>;
  currentOffer?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced API helper function with better error handling
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  // Check API availability first for non-health endpoints
  if (endpoint !== '/health' && !isApiAvailable) {
    await checkApiAvailability();
  }
  
  const token = localStorage.getItem("dwellogo_token");
  
  // Create timeout signal manually for better browser compatibility
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      // For expected 404s when API is not available, don't log as errors
      if (response.status === 404 && !isApiAvailable) {
        throw new Error('API_NOT_AVAILABLE');
      }
      
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
      return { success: false, message: 'Invalid response format' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle specific error types more gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('API_NOT_AVAILABLE');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('API_TIMEOUT');
    }
    
    if (error.message === 'API_NOT_AVAILABLE') {
      throw error;
    }
    
    throw error;
  }
};

// Wrapper for API calls with automatic fallback
const apiCallWithFallback = async <T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData: T,
  operationName: string
): Promise<T> => {
  try {
    const result = await apiCall(endpoint, options);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'API_NOT_AVAILABLE') {
      console.info(`📦 ${operationName}: Using demo data (backend not available)`);
    } else if (errorMessage === 'API_TIMEOUT') {
      console.warn(`⏱️ ${operationName}: API timeout, using demo data`);
    } else {
      console.warn(`⚠️ ${operationName}: API error (${errorMessage}), using demo data`);
    }
    
    return fallbackData;
  }
};

// Properties API
export const propertiesApi = {
  getAll: async (params: Record<string, any> = {}): Promise<{ properties: Property[]; pagination: any }> => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/properties${queryString ? `?${queryString}` : ''}`;
    
    return apiCallWithFallback(
      endpoint,
      {},
      {
        properties: mockData.properties,
        pagination: {
          page: 1,
          limit: 12,
          total: mockData.properties.length,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      'Get Properties'
    );
  },

  getById: async (id: string): Promise<{ property: Property }> => {
    return apiCallWithFallback(
      `/properties/${id}`,
      {},
      { property: mockData.properties.find(p => p._id === id) || mockData.properties[0] },
      'Get Property Details'
    );
  },

  getSimilar: async (id: string): Promise<{ properties: Property[] }> => {
    return apiCallWithFallback(
      `/properties/${id}/similar`,
      {},
      { properties: mockData.properties.slice(0, 3) },
      'Get Similar Properties'
    );
  },

  toggleFavorite: async (id: string): Promise<{ isFavorited: boolean }> => {
    return apiCallWithFallback(
      `/properties/${id}/favorite`,
      { method: 'POST' },
      { isFavorited: Math.random() > 0.5 },
      'Toggle Favorite'
    );
  },

  create: async (propertyData: Partial<Property>): Promise<{ property: Property }> => {
    try {
      return await apiCall('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
    } catch (error) {
      console.error('Create property failed:', error);
      throw error;
    }
  },

  update: async (id: string, propertyData: Partial<Property>): Promise<{ property: Property }> => {
    try {
      return await apiCall(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      });
    } catch (error) {
      console.error('Update property failed:', error);
      throw error;
    }
  },

  uploadImages: async (id: string, formData: FormData): Promise<{ images: any[] }> => {
    const token = localStorage.getItem("dwellogo_token");
    
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}/images`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  },
};

// Tours API
export const toursApi = {
  getAll: async (): Promise<{ tours: Tour[] }> => {
    return apiCallWithFallback(
      '/tours',
      {},
      { tours: mockData.tours },
      'Get Tours'
    );
  },

  getById: async (id: string): Promise<{ tour: Tour }> => {
    try {
      return await apiCall(`/tours/${id}`);
    } catch (error) {
      console.error('Get tour failed:', error);
      throw error;
    }
  },

  create: async (tourData: Partial<Tour>): Promise<{ tour: Tour }> => {
    try {
      return await apiCall('/tours', {
        method: 'POST',
        body: JSON.stringify(tourData),
      });
    } catch (error) {
      console.error('Create tour failed:', error);
      throw error;
    }
  },

  join: async (id: string): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/tours/${id}/join`,
      { method: 'POST' },
      { success: false },
      'Join Tour'
    );
  },

  leave: async (id: string): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/tours/${id}/leave`,
      { method: 'POST' },
      { success: false },
      'Leave Tour'
    );
  },

  addMessage: async (id: string, message: string): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/tours/${id}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      },
      { success: false },
      'Send Tour Message'
    );
  },
};

// Maintenance API
export const maintenanceApi = {
  getTasks: async (propertyId?: string): Promise<{ tasks: MaintenanceTask[] }> => {
    const endpoint = propertyId ? `/maintenance?property=${propertyId}` : '/maintenance';
    
    return apiCallWithFallback(
      endpoint,
      {},
      { tasks: mockData.maintenanceTasks },
      'Get Maintenance Tasks'
    );
  },

  createTask: async (taskData: Partial<MaintenanceTask>): Promise<{ task: MaintenanceTask }> => {
    try {
      return await apiCall('/maintenance', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    } catch (error) {
      console.error('Create maintenance task failed:', error);
      throw error;
    }
  },

  updateTask: async (id: string, taskData: Partial<MaintenanceTask>): Promise<{ task: MaintenanceTask }> => {
    try {
      return await apiCall(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    } catch (error) {
      console.error('Update maintenance task failed:', error);
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/maintenance/${id}`,
      { method: 'DELETE' },
      { success: false },
      'Delete Maintenance Task'
    );
  },
};

// Negotiations API
export const negotiationsApi = {
  getAll: async (): Promise<{ negotiations: Negotiation[] }> => {
    return apiCallWithFallback(
      '/negotiations',
      {},
      { negotiations: mockData.negotiations },
      'Get Negotiations'
    );
  },

  getById: async (id: string): Promise<{ negotiation: Negotiation }> => {
    try {
      return await apiCall(`/negotiations/${id}`);
    } catch (error) {
      console.error('Get negotiation failed:', error);
      throw error;
    }
  },

  create: async (negotiationData: Partial<Negotiation>): Promise<{ negotiation: Negotiation }> => {
    try {
      return await apiCall('/negotiations', {
        method: 'POST',
        body: JSON.stringify(negotiationData),
      });
    } catch (error) {
      console.error('Create negotiation failed:', error);
      throw error;
    }
  },

  addMessage: async (id: string, messageData: any): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/negotiations/${id}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(messageData),
      },
      { success: false },
      'Send Negotiation Message'
    );
  },

  addOffer: async (id: string, offerData: any): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      `/negotiations/${id}/offers`,
      {
        method: 'POST',
        body: JSON.stringify(offerData),
      },
      { success: false },
      'Submit Offer'
    );
  },
};

// Tools API
export const toolsApi = {
  // Split Rent Calculator
  calculateSplitRent: async (data: {
    totalRent: number;
    roommates: Array<{ name: string; income: number; roomSize: string }>;
  }): Promise<{ splits: any[] }> => {
    return apiCallWithFallback(
      '/tools/split-rent',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      (() => {
        // Fallback calculation
        const { totalRent, roommates } = data;
        const totalIncome = roommates.reduce((sum, r) => sum + r.income, 0);
        
        const splits = roommates.map(roommate => ({
          name: roommate.name,
          amount: Math.round((roommate.income / totalIncome) * totalRent),
          percentage: Math.round((roommate.income / totalIncome) * 100)
        }));
        
        return { splits };
      })(),
      'Calculate Split Rent'
    );
  },

  // Neighborhood Analysis
  getNeighborhoodData: async (address: string): Promise<any> => {
    return apiCallWithFallback(
      `/tools/neighborhood-analysis?address=${encodeURIComponent(address)}`,
      {},
      {
        walkabilityScore: 85,
        transitScore: 72,
        bikeScore: 65,
        crimeRate: 'Low',
        schools: [
          { name: 'Lincoln Elementary', rating: 8.5, distance: '0.3 miles' },
          { name: 'Roosevelt High School', rating: 9.2, distance: '0.8 miles' }
        ],
        amenities: {
          restaurants: 24,
          cafes: 12,
          grocery: 6,
          parks: 3,
          hospitals: 2
        }
      },
      'Get Neighborhood Data'
    );
  },

  // AR Furniture
  getFurnitureItems: async (): Promise<{ items: any[] }> => {
    return apiCallWithFallback(
      '/tools/furniture-items',
      {},
      {
        items: [
          { id: '1', name: 'Modern Sofa', category: 'living-room', price: 899 },
          { id: '2', name: 'Coffee Table', category: 'living-room', price: 299 },
          { id: '3', name: 'Dining Table', category: 'dining-room', price: 599 }
        ]
      },
      'Get Furniture Items'
    );
  },

  saveFurnitureLayout: async (data: any): Promise<{ success: boolean }> => {
    return apiCallWithFallback(
      '/tools/furniture-layout',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { success: false },
      'Save Furniture Layout'
    );
  },
};

// Real-time WebSocket connection
export class SocketService {
  private socket: any = null;

  async connect(): Promise<void> {
    if (typeof window !== 'undefined' && !this.socket) {
      // Check if API is available before connecting
      await checkApiAvailability();
      
      if (!isApiAvailable) {
        console.info('🔌 WebSocket: Backend not available, skipping connection');
        return;
      }

      try {
        // Dynamically import socket.io-client for client-side only
        const { io } = await import('socket.io-client');
        
        this.socket = io(WS_BASE_URL, {
          auth: {
            token: localStorage.getItem("dwellogo_token"),
          },
        });

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected');
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 WebSocket disconnected');
        });
      } catch (error) {
        console.info('🔌 WebSocket: Connection skipped (backend not available)');
      }
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Tour-related socket methods
  joinTour(tourId: string): void {
    if (this.socket) {
      this.socket.emit('join-tour', tourId);
    }
  }

  leaveTour(tourId: string): void {
    if (this.socket) {
      this.socket.emit('leave-tour', tourId);
    }
  }

  sendTourMessage(tourId: string, message: string): void {
    if (this.socket) {
      this.socket.emit('chat-message', { tourId, message });
    }
  }

  navigateTour(tourId: string, room: string, position: any): void {
    if (this.socket) {
      this.socket.emit('tour-navigate', { tourId, room, position });
    }
  }

  // Negotiation-related socket methods
  joinNegotiation(negotiationId: string): void {
    if (this.socket) {
      this.socket.emit('join-negotiation', negotiationId);
    }
  }

  sendNegotiationMessage(negotiationId: string, message: string, type = 'message'): void {
    if (this.socket) {
      this.socket.emit('negotiation-message', { negotiationId, message, type });
    }
  }

  // Event listeners
  onTourMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onTourNavigation(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('tour-navigate', callback);
    }
  }

  onNegotiationMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('negotiation-message', callback);
    }
  }

  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// Export singleton socket service instance
export const socketService = new SocketService();

// Initialize API availability check on module load
if (typeof window !== 'undefined') {
  checkApiAvailability();
}

// Mock data fallbacks for development
export const mockData = {
  properties: [
    {
      _id: "1",
      title: "Modern Downtown Apartment",
      description: "Beautiful modern apartment in the heart of downtown with stunning city views.",
      location: {
        address: {
          street: "123 Main St",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "US"
        },
        coordinates: { latitude: 47.6062, longitude: -122.3321 },
        neighborhood: "Downtown",
        walkabilityScore: 95,
        transitScore: 88
      },
      features: {
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        propertyType: "apartment",
        amenities: ["Pool", "Gym", "Concierge", "Rooftop Deck"]
      },
      pricing: {
        listPrice: 450000,
        taxes: { annual: 4500, perMonth: 375 },
        hoa: { monthly: 250, amenities: ["Pool", "Gym"] }
      },
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop", alt: "Living room", isPrimary: true }
        ]
      },
      status: "for-sale",
      listingAgent: {
        _id: "agent1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "(555) 123-4567",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop"
      },
      views: 234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  tours: [],
  maintenanceTasks: [],
  negotiations: []
};

export default {
  properties: propertiesApi,
  tours: toursApi,
  maintenance: maintenanceApi,
  negotiations: negotiationsApi,
  tools: toolsApi,
  socket: socketService,
  mock: mockData
};