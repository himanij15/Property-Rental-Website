import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Info, Sparkles, MapPin, Bed, Bath, Square, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRouter } from "./Router";

interface MatchedProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  status: "For Sale" | "For Rent";
  matchPercentage: number;
  matchReasons: string[];
  images: number;
}

const matchedProperties: MatchedProperty[] = [
  {
    id: "1",
    title: "Modern Loft in Arts District",
    price: "$425,000",
    location: "Arts District, LA",
    beds: 2,
    baths: 2,
    sqft: 1100,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop",
    status: "For Sale",
    matchPercentage: 94,
    matchReasons: [
      "Matches your preferred modern style",
      "Within your budget range ($400-500k)",
      "Near art galleries (your interest)",
      "2BR/2BA matches your needs"
    ],
    images: 28
  },
  {
    id: "2",
    title: "Eco-Friendly Townhouse",
    price: "$385,000",
    location: "Green Valley, Portland",
    beds: 3,
    baths: 2,
    sqft: 1650,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=400&fit=crop",
    status: "For Sale",
    matchPercentage: 89,
    matchReasons: [
      "Solar panels match eco preferences",
      "Excellent walkability score",
      "Near organic markets",
      "Family-friendly neighborhood"
    ],
    images: 24
  },
  {
    id: "3",
    title: "Downtown High-Rise Condo",
    price: "$2,850/month",
    location: "Downtown Seattle, WA",
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
    status: "For Rent",
    matchPercentage: 87,
    matchReasons: [
      "5-minute walk to tech companies",
      "Gym and pool amenities",
      "City view preference",
      "Public transit access"
    ],
    images: 32
  },
  {
    id: "4",
    title: "Cozy Craftsman Home",
    price: "$465,000",
    location: "Hawthorne, Portland",
    beds: 2,
    baths: 1,
    sqft: 1050,
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=400&fit=crop",
    status: "For Sale",
    matchPercentage: 82,
    matchReasons: [
      "Historic charm matches taste",
      "Walkable to cafes and shops",
      "Recently renovated kitchen",
      "Corner lot with garden space"
    ],
    images: 20
  },
  {
    id: "5",
    title: "Luxury Waterfront Apartment",
    price: "$3,200/month",
    location: "Marina District, SF",
    beds: 1,
    baths: 1,
    sqft: 850,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=400&fit=crop",
    status: "For Rent",
    matchPercentage: 78,
    matchReasons: [
      "Water view preference",
      "High-end finishes",
      "Pet-friendly building",
      "Concierge services"
    ],
    images: 26
  }
];

export function SmartMatchmaking() {
  const { navigate } = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showMatchReasons, setShowMatchReasons] = useState<string | null>(null);

  const toggleFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate("property-details", { id: propertyId });
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 80) return "bg-teal-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-teal-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-warm-gray-900">
            Smart Matches for You
          </h2>
        </div>
        <p className="text-warm-gray-600 mb-8 max-w-2xl">
          Based on your preferences, search history, and saved properties, we've found these perfect matches.
        </p>

        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {matchedProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card 
                  className="group overflow-hidden border-warm-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden h-48">
                      <ImageWithFallback
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Match Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getMatchColor(property.matchPercentage)} text-white border-0`}>
                        {property.matchPercentage}% Match
                      </Badge>
                    </div>
                    
                    {/* Status & Info */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white backdrop-blur-sm"
                          onMouseEnter={() => setShowMatchReasons(property.id)}
                          onMouseLeave={() => setShowMatchReasons(null)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="h-4 w-4 text-teal-600" />
                        </Button>
                        
                        {/* Custom Tooltip */}
                        {showMatchReasons === property.id && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-warm-gray-200 rounded-lg shadow-lg p-3 z-10">
                            <p className="font-semibold text-sm text-warm-gray-900 mb-2">Why we matched this:</p>
                            <ul className="text-xs space-y-1 text-warm-gray-700">
                              {property.matchReasons.map((reason, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-teal-500 mt-0.5">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className="bg-white/90 hover:bg-white backdrop-blur-sm"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favoriteIds.includes(property.id) 
                              ? "fill-red-500 text-red-500" 
                              : "text-warm-gray-600"
                          }`} 
                        />
                      </Button>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge 
                        variant="default"
                        className="bg-teal-500 text-white"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    
                    {/* Image Count */}
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        <span>{property.images} photos</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-warm-gray-900 line-clamp-1 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-warm-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      </div>
                      
                      <div className="text-xl font-bold text-teal-600">
                        {property.price}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-warm-gray-600">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.beds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.baths}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          <span>{property.sqft.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property.id);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-teal-500 text-teal-600 hover:bg-teal-50"
            onClick={() => navigate("listings")}
          >
            View All Matches
          </Button>
        </div>
      </div>
    </section>
  );
}