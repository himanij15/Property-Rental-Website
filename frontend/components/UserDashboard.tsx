import { useState } from "react";
import { 
  Home, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Bell,
  Search,
  Filter,
  BarChart3
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PropertyCard } from "./PropertyCard";
import { NegotiationChat } from "./NegotiationChat";
import { SplitRentCalculator } from "./SplitRentCalculator";
import { DigitalLeaseSigning } from "./DigitalLeaseSigning";
import { ARFurniturePlacement } from "./ARFurniturePlacement";
import { NeighborhoodAnalysis } from "./NeighborhoodAnalysis";
import { MaintenanceHelper } from "./MaintenanceHelper";
import { useAuth } from "./AuthContext";
import { useRouter } from "./Router";

const savedProperties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    price: "$450,000",
    location: "Downtown Seattle, WA",
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop",
    status: "For Sale" as const,
    images: 24
  },
  {
    id: "2",
    title: "Luxury Villa with Pool",
    price: "$1,250,000",
    location: "Beverly Hills, CA",
    beds: 5,
    baths: 4,
    sqft: 3500,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop",
    status: "For Sale" as const,
    images: 32
  }
];

const upcomingViewings = [
  {
    id: "1",
    property: "Modern Downtown Loft",
    date: "Today, 2:00 PM",
    agent: "Sarah Johnson",
    type: "Virtual Tour"
  },
  {
    id: "2", 
    property: "Cozy Family Home",
    date: "Tomorrow, 10:00 AM",
    agent: "Mike Chen",
    type: "In-Person"
  }
];

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("home");
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-warm-gray-600">
            Welcome back to your dashboard. Here's what's happening with your properties.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Heart className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warm-gray-900">24</div>
                      <div className="text-sm text-warm-gray-600">Saved Properties</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warm-gray-900">3</div>
                      <div className="text-sm text-warm-gray-600">Upcoming Viewings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warm-gray-900">5</div>
                      <div className="text-sm text-warm-gray-600">Active Chats</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warm-gray-900">92%</div>
                      <div className="text-sm text-warm-gray-600">Match Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Viewings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingViewings.map((viewing) => (
                      <div key={viewing.id} className="flex items-center justify-between p-3 bg-warm-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-warm-gray-900">{viewing.property}</div>
                          <div className="text-sm text-warm-gray-600">{viewing.date}</div>
                          <div className="text-xs text-warm-gray-500">with {viewing.agent}</div>
                        </div>
                        <Badge variant={viewing.type === "Virtual Tour" ? "default" : "secondary"}>
                          {viewing.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-warm-gray-50 rounded-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop" 
                        alt="Property" 
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-warm-gray-900">Modern Loft</div>
                        <div className="text-sm text-warm-gray-600">Arts District, LA</div>
                      </div>
                      <Badge className="bg-green-500 text-white">94% Match</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Properties Tab */}
          <TabsContent value="saved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings & Viewings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingViewings.map((viewing) => (
                    <div key={viewing.id} className="border border-warm-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-warm-gray-900">{viewing.property}</h3>
                        <Badge variant={viewing.type === "Virtual Tour" ? "default" : "secondary"}>
                          {viewing.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-warm-gray-600">Date & Time:</span>
                          <div className="font-medium">{viewing.date}</div>
                        </div>
                        <div>
                          <span className="text-warm-gray-600">Agent:</span>
                          <div className="font-medium">{viewing.agent}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="outline">Cancel</Button>
                        <Button size="sm" className="bg-teal-500 hover:bg-teal-600">Join</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NegotiationChat />
              <Card>
                <CardHeader>
                  <CardTitle>All Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-warm-gray-200 rounded-lg cursor-pointer hover:bg-warm-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Sarah Johnson</span>
                        <span className="text-xs text-warm-gray-500">2 min ago</span>
                      </div>
                      <div className="text-sm text-warm-gray-600">I can do that. Please send the updated...</div>
                    </div>
                    <div className="p-3 border border-warm-gray-200 rounded-lg cursor-pointer hover:bg-warm-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Mike Chen</span>
                        <span className="text-xs text-warm-gray-500">1 hour ago</span>
                      </div>
                      <div className="text-sm text-warm-gray-600">The viewing is confirmed for tomorrow...</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-2">
                Advanced Real Estate Tools
              </h2>
              <p className="text-warm-gray-600">
                Powerful tools to help you make informed decisions and streamline your real estate experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Row 1 */}
              <NegotiationChat />
              <SplitRentCalculator />
              <DigitalLeaseSigning />
              
              {/* Row 2 */}
              <ARFurniturePlacement />
              <NeighborhoodAnalysis />
              <MaintenanceHelper />
            </div>
            
            {/* Additional Tools Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-warm-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-warm-gray-900">Market Trends</div>
                        <div className="text-sm text-warm-gray-600">Real-time market analysis</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-warm-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded">
                        <Home className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-warm-gray-900">Property Valuator</div>
                        <div className="text-sm text-warm-gray-600">AI-powered home valuation</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}