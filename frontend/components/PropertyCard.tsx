import { Heart, MapPin, Bed, Bath, Square, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    beds: number;
    baths: number;
    sqft: number;
    image: string;
    status: "For Sale" | "For Rent" | "Sold" | "Rented";
    featured?: boolean;
    images: number;
  };
  size?: "default" | "large";
  onClick?: () => void;
}

export function PropertyCard({ property, size = "default", onClick }: PropertyCardProps) {
  const isLarge = size === "large";
  
  return (
    <Card 
      className="group overflow-hidden border-warm-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div className={`aspect-[4/3] overflow-hidden ${isLarge ? "h-64" : "h-48"}`}>
          <ImageWithFallback
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        
        {/* Overlay Elements */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge 
            variant={property.status === "For Sale" || property.status === "For Rent" ? "default" : "secondary"}
            className={
              property.status === "For Sale" || property.status === "For Rent"
                ? "bg-teal-500 text-white"
                : "bg-warm-gray-500 text-white"
            }
          >
            {property.status}
          </Badge>
          {property.featured && (
            <Badge className="bg-orange-500 text-white">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white/90 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite toggle
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
            <Camera className="h-3 w-3" />
            <span>{property.images}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-warm-gray-900 line-clamp-1">
              {property.title}
            </h3>
            <p className="text-sm text-warm-gray-600 flex items-center gap-1 mt-1">
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
              <span>{property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths} bath{property.baths !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}