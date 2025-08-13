import { useState } from "react";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Wifi, 
  Dumbbell, 
  Waves,
  Shield,
  Calendar,
  Phone,
  Mail,
  Star
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { VirtualCoTour } from "./VirtualCoTour";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const propertyDetails = {
  id: "luxury-downtown-loft",
  title: "Luxury Downtown Loft with City Views",
  price: "$450,000",
  address: "123 Arts District Blvd, Los Angeles, CA 90012",
  beds: 2,
  baths: 2,
  sqft: 1200,
  yearBuilt: 2019,
  lotSize: "N/A",
  propertyType: "Condo",
  status: "For Sale",
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"
  ],
  description: `This stunning modern loft offers the perfect blend of luxury and urban living. Located in the heart of the Arts District, this property features floor-to-ceiling windows, exposed brick walls, and an open-concept design that maximizes space and natural light.

The gourmet kitchen boasts stainless steel appliances, granite countertops, and a large island perfect for entertaining. The master suite includes a walk-in closet and spa-like bathroom with a soaking tub and separate shower.

Building amenities include a rooftop deck with city views, fitness center, and secured parking. Walking distance to trendy restaurants, art galleries, and public transportation.`,
  amenities: [
    { icon: Car, name: "Parking Garage" },
    { icon: Dumbbell, name: "Fitness Center" },
    { icon: Waves, name: "Rooftop Pool" },
    { icon: Wifi, name: "High-Speed Internet" },
    { icon: Shield, name: "24/7 Security" }
  ],
  agent: {
    name: "Sarah Johnson",
    title: "Senior Real Estate Agent",
    phone: "(555) 123-4567",
    email: "sarah@dwellogo.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    experience: "8 years"
  }
};

export function PropertyDetailsPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={propertyDetails.images[currentImageIndex]}
                  alt={propertyDetails.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-teal-500 text-white">
                    {propertyDetails.status}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="grid grid-cols-4 gap-2">
                {propertyDetails.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                      index === currentImageIndex 
                        ? "border-teal-500" 
                        : "border-warm-gray-200 hover:border-warm-gray-300"
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">
                    {propertyDetails.title}
                  </h1>
                  <p className="text-warm-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {propertyDetails.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-600 mb-1">
                    {propertyDetails.price}
                  </div>
                  <div className="text-sm text-warm-gray-600">
                    ${Math.round(450000 / propertyDetails.sqft)}/sqft
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-warm-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <div className="font-semibold text-warm-gray-900">{propertyDetails.beds}</div>
                  <div className="text-sm text-warm-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-warm-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <div className="font-semibold text-warm-gray-900">{propertyDetails.baths}</div>
                  <div className="text-sm text-warm-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-warm-gray-50 rounded-lg">
                  <Square className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <div className="font-semibold text-warm-gray-900">{propertyDetails.sqft.toLocaleString()}</div>
                  <div className="text-sm text-warm-gray-600">Square Feet</div>
                </div>
                <div className="text-center p-4 bg-warm-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <div className="font-semibold text-warm-gray-900">{propertyDetails.yearBuilt}</div>
                  <div className="text-sm text-warm-gray-600">Year Built</div>
                </div>
              </div>

              {/* Virtual Tour Button */}
              <div className="mb-6">
                <VirtualCoTour />
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="neighborhood">Neighborhood</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-warm-gray max-w-none">
                      {propertyDetails.description.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-warm-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="amenities" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {propertyDetails.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-warm-gray-50 rounded-lg">
                          <amenity.icon className="h-5 w-5 text-teal-600" />
                          <span className="text-warm-gray-900">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="neighborhood" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-warm-gray-700 mb-4">
                      The Arts District is one of LA's most vibrant neighborhoods, known for its creative community, 
                      industrial architecture, and proximity to downtown amenities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-warm-gray-900 mb-2">Nearby Attractions</h4>
                        <ul className="text-warm-gray-700 space-y-1">
                          <li>• MOCA Grand Avenue (0.5 mi)</li>
                          <li>• Walt Disney Concert Hall (0.7 mi)</li>
                          <li>• Grand Central Market (0.8 mi)</li>
                          <li>• Angel City Brewery (0.3 mi)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-warm-gray-900 mb-2">Transportation</h4>
                        <ul className="text-warm-gray-700 space-y-1">
                          <li>• Metro Gold Line (0.4 mi)</li>
                          <li>• DASH Downtown (0.2 mi)</li>
                          <li>• LAX Airport (18 mi)</li>
                          <li>• Union Station (1.2 mi)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={propertyDetails.agent.avatar} />
                      <AvatarFallback>
                        {propertyDetails.agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-warm-gray-900">
                        {propertyDetails.agent.name}
                      </div>
                      <div className="text-sm text-warm-gray-600">
                        {propertyDetails.agent.title}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span className="font-medium">{propertyDetails.agent.rating}</span>
                        <span className="text-warm-gray-600">
                          ({propertyDetails.agent.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Call {propertyDetails.agent.phone}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book In-Person Tour
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request More Info
                  </Button>
                  <div className="text-center text-sm text-warm-gray-600">
                    Available 7 days a week
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-gray-600">Property Type:</span>
                    <span className="font-medium">{propertyDetails.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray-600">Year Built:</span>
                    <span className="font-medium">{propertyDetails.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray-600">Lot Size:</span>
                    <span className="font-medium">{propertyDetails.lotSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray-600">HOA Fees:</span>
                    <span className="font-medium">$250/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray-600">Property Tax:</span>
                    <span className="font-medium">$4,500/year</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}