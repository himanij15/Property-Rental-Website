import { useState } from "react";
import { 
  Smartphone, 
  Camera, 
  RotateCw, 
  Move, 
  Trash2, 
  Plus,
  Sofa,
  Bed,
  ChefHat,
  Lamp
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface FurnitureItem {
  id: string;
  name: string;
  category: "living" | "bedroom" | "kitchen" | "lighting";
  price: string;
  image: string;
  isPlaced: boolean;
}

const furnitureItems: FurnitureItem[] = [
  {
    id: "1",
    name: "Modern Sectional Sofa",
    category: "living",
    price: "$1,299",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop",
    isPlaced: false
  },
  {
    id: "2", 
    name: "Coffee Table",
    category: "living",
    price: "$399",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=150&fit=crop",
    isPlaced: true
  },
  {
    id: "3",
    name: "Queen Platform Bed",
    category: "bedroom",
    price: "$899",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=150&fit=crop",
    isPlaced: false
  },
  {
    id: "4",
    name: "Kitchen Island",
    category: "kitchen", 
    price: "$1,599",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop",
    isPlaced: false
  }
];

export function ARFurniturePlacement() {
  const [selectedRoom, setSelectedRoom] = useState("living-room");
  const [placedItems, setPlacedItems] = useState<string[]>(["2"]);
  const [isARActive, setIsARActive] = useState(false);

  const toggleItemPlacement = (itemId: string) => {
    setPlacedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "living": return Sofa;
      case "bedroom": return Bed;
      case "kitchen": return ChefHat;
      case "lighting": return Lamp;
      default: return Sofa;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-teal-600" />
          AR Furniture Placement
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Room Preview */}
        <div className="relative">
          <div className="aspect-video bg-warm-gray-100 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop"
              alt="Room"
              className="w-full h-full object-cover"
            />
            {/* AR Overlay */}
            {isARActive && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">AR View Active</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant={isARActive ? "default" : "outline"}
              onClick={() => setIsARActive(!isARActive)}
              className={isARActive ? "bg-teal-500 text-white" : "bg-white/90"}
            >
              <Camera className="h-4 w-4 mr-1" />
              {isARActive ? "Exit AR" : "Start AR"}
            </Button>
          </div>
        </div>

        {/* Room Selection */}
        <div>
          <label className="block font-medium text-warm-gray-900 mb-2">
            Select Room
          </label>
          <Tabs value={selectedRoom} onValueChange={setSelectedRoom}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="living-room" className="text-xs">Living</TabsTrigger>
              <TabsTrigger value="bedroom" className="text-xs">Bedroom</TabsTrigger>
              <TabsTrigger value="kitchen" className="text-xs">Kitchen</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Furniture Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-warm-gray-900">Furniture</span>
            <Badge className="bg-teal-100 text-teal-800">
              {placedItems.length} placed
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {furnitureItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              const isPlaced = placedItems.includes(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-2 rounded border transition-colors ${
                    isPlaced ? "border-teal-200 bg-teal-50" : "border-warm-gray-200"
                  }`}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-10 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-warm-gray-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-warm-gray-600 flex items-center gap-1">
                      <IconComponent className="h-3 w-3" />
                      {item.price}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isPlaced ? "default" : "outline"}
                    onClick={() => toggleItemPlacement(item.id)}
                    className={isPlaced ? "bg-teal-500 text-white" : ""}
                  >
                    {isPlaced ? (
                      <Trash2 className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AR Controls */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Move className="h-3 w-3 mr-1" />
            Move
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCw className="h-3 w-3 mr-1" />
            Rotate
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Camera className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>

        {/* Cost Summary */}
        <div className="p-3 bg-warm-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-warm-gray-900">Total Cost</span>
            <span className="font-bold text-teal-600">$1,698</span>
          </div>
          <div className="text-xs text-warm-gray-600">
            {placedItems.length} items • Estimated delivery: 2-4 weeks
          </div>
        </div>
      </CardContent>
    </Card>
  );
}