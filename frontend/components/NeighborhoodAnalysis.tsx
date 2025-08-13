import { useState } from "react";
import { 
  MapPin, 
  Star, 
  TrendingUp, 
  Coffee, 
  GraduationCap, 
  ShoppingCart,
  Car,
  Train,
  Shield,
  Leaf
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface NeighborhoodData {
  name: string;
  walkabilityScore: number;
  transitScore: number;
  safetyRating: number;
  schoolRating: number;
  averagePrice: string;
  priceChange: number;
  amenities: {
    restaurants: number;
    cafes: number;
    grocery: number;
    schools: number;
    parks: number;
  };
  demographics: {
    avgAge: number;
    families: number;
    professionals: number;
  };
}

const neighborhoodData: NeighborhoodData = {
  name: "Arts District, LA",
  walkabilityScore: 88,
  transitScore: 76,
  safetyRating: 4.2,
  schoolRating: 4.0,
  averagePrice: "$450,000",
  priceChange: 12.5,
  amenities: {
    restaurants: 85,
    cafes: 42,
    grocery: 12,
    schools: 8,
    parks: 15
  },
  demographics: {
    avgAge: 32,
    families: 35,
    professionals: 65
  }
};

export function NeighborhoodAnalysis() {
  const [selectedMetric, setSelectedMetric] = useState("walkability");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600" />
          Neighborhood Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location Header */}
        <div className="text-center">
          <h3 className="font-semibold text-warm-gray-900">
            {neighborhoodData.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-lg font-bold text-teal-600">
              {neighborhoodData.averagePrice}
            </span>
            <Badge className={`${
              neighborhoodData.priceChange > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              +{neighborhoodData.priceChange}%
            </Badge>
          </div>
        </div>

        {/* Key Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-warm-gray-50 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(neighborhoodData.walkabilityScore).split(' ')[0]}`}>
              {neighborhoodData.walkabilityScore}
            </div>
            <div className="text-xs text-warm-gray-600">Walkability</div>
          </div>
          
          <div className="text-center p-3 bg-warm-gray-50 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(neighborhoodData.transitScore).split(' ')[0]}`}>
              {neighborhoodData.transitScore}
            </div>
            <div className="text-xs text-warm-gray-600">Transit Score</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-warm-gray-700">Safety Rating</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.floor(neighborhoodData.safetyRating) 
                      ? "text-yellow-400 fill-current" 
                      : "text-warm-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm font-medium ml-1">
                {neighborhoodData.safetyRating}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-sm text-warm-gray-700">School Rating</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.floor(neighborhoodData.schoolRating) 
                      ? "text-yellow-400 fill-current" 
                      : "text-warm-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm font-medium ml-1">
                {neighborhoodData.schoolRating}
              </span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-medium text-warm-gray-900 mb-3">Nearby Amenities</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                <span>Restaurants & Cafes</span>
              </div>
              <span className="font-medium">
                {neighborhoodData.amenities.restaurants + neighborhoodData.amenities.cafes}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                <span>Grocery Stores</span>
              </div>
              <span className="font-medium">
                {neighborhoodData.amenities.grocery}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span>Schools</span>
              </div>
              <span className="font-medium">
                {neighborhoodData.amenities.schools}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>Parks & Recreation</span>
              </div>
              <span className="font-medium">
                {neighborhoodData.amenities.parks}
              </span>
            </div>
          </div>
        </div>

        {/* Transportation */}
        <div>
          <h4 className="font-medium text-warm-gray-900 mb-3">Transportation</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Train className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm text-warm-gray-700">Public Transit</div>
                <Progress value={neighborhoodData.transitScore} className="h-1 mt-1" />
              </div>
              <span className="text-sm font-medium">{neighborhoodData.transitScore}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-warm-gray-600" />
              <div className="text-sm text-warm-gray-700">
                Avg commute time: 24 minutes
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div>
          <h4 className="font-medium text-warm-gray-900 mb-3">Demographics</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-warm-gray-50 rounded">
              <div className="font-semibold text-warm-gray-900">
                {neighborhoodData.demographics.avgAge}
              </div>
              <div className="text-xs text-warm-gray-600">Avg Age</div>
            </div>
            <div className="p-2 bg-warm-gray-50 rounded">
              <div className="font-semibold text-warm-gray-900">
                {neighborhoodData.demographics.families}%
              </div>
              <div className="text-xs text-warm-gray-600">Families</div>
            </div>
            <div className="p-2 bg-warm-gray-50 rounded">
              <div className="font-semibold text-warm-gray-900">
                {neighborhoodData.demographics.professionals}%
              </div>
              <div className="text-xs text-warm-gray-600">Young Pros</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
          View Full Report
        </Button>
      </CardContent>
    </Card>
  );
}