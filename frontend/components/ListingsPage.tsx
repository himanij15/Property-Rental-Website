import { useState } from "react";
import { Search, Filter, Grid, List, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { PropertyCard } from "./PropertyCard";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useRouter } from "./Router";

const mockProperties = [
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
  },
  {
    id: "3",
    title: "Cozy Family Home",
    price: "$2,800/month",
    location: "Austin, TX",
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=400&fit=crop",
    status: "For Rent" as const,
    images: 18
  },
  {
    id: "4",
    title: "Penthouse with City View",
    price: "$2,100,000",
    location: "Manhattan, NY",
    beds: 4,
    baths: 3,
    sqft: 2800,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
    status: "For Sale" as const,
    images: 28
  },
  {
    id: "5",
    title: "Suburban Dream House",
    price: "$680,000",
    location: "Portland, OR",
    beds: 4,
    baths: 3,
    sqft: 2200,
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=400&fit=crop",
    status: "For Sale" as const,
    images: 22
  },
  {
    id: "6",
    title: "Waterfront Condo",
    price: "$3,200/month",
    location: "Miami Beach, FL",
    beds: 2,
    baths: 2,
    sqft: 1400,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=400&fit=crop",
    status: "For Rent" as const,
    images: 26
  }
];

const propertyTypes = [
  "House",
  "Apartment", 
  "Condo",
  "Townhouse",
  "Villa",
  "Studio"
];

const amenities = [
  "Swimming Pool",
  "Gym/Fitness Center",
  "Parking",
  "Balcony/Patio",
  "Air Conditioning",
  "Laundry",
  "Pet Friendly",
  "Security System"
];

export function ListingsPage() {
  const { navigate } = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handlePropertyClick = (propertyId: string) => {
    navigate("property-details", { id: propertyId });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-warm-gray-900 mb-2">
                Properties for Sale
              </h1>
              <p className="text-warm-gray-600">
                {mockProperties.length} properties found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border border-warm-gray-200 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-teal-500 text-white" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-teal-500 text-white" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Search */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
              <Input
                placeholder="Search by location..."
                className="pl-10 bg-white border-warm-gray-200"
              />
            </div>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside className="w-80 hidden lg:block">
            <div className="bg-white rounded-lg border border-warm-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-teal-600" />
                <h2 className="font-semibold text-warm-gray-900">Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="block font-medium text-warm-gray-900 mb-3">
                    Price Range
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={2000000}
                    step={50000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-warm-gray-600">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block font-medium text-warm-gray-900 mb-3">
                    Property Type
                  </label>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label htmlFor={type} className="text-sm text-warm-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block font-medium text-warm-gray-900 mb-3">
                    Bedrooms
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1+", "2+", "3+", "4+"].map((beds) => (
                      <Button
                        key={beds}
                        variant="outline"
                        size="sm"
                        className="border-warm-gray-200 hover:border-teal-500 hover:bg-teal-50"
                      >
                        {beds}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block font-medium text-warm-gray-900 mb-3">
                    Bathrooms
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1+", "2+", "3+", "4+"].map((baths) => (
                      <Button
                        key={baths}
                        variant="outline"
                        size="sm"
                        className="border-warm-gray-200 hover:border-teal-500 hover:bg-teal-50"
                      >
                        {baths}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block font-medium text-warm-gray-900 mb-3">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                            }
                          }}
                        />
                        <label htmlFor={amenity} className="text-sm text-warm-gray-700">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-warm-gray-300 text-warm-gray-700"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Property Grid */}
          <main className="flex-1">
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {mockProperties.map((property) => (
                <div key={property.id} onClick={() => handlePropertyClick(property.id)}>
                  <PropertyCard 
                    property={property}
                    size={viewMode === "list" ? "large" : "default"}
                  />
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <div className="flex gap-2">
                <Button size="sm" className="bg-teal-500 text-white">1</Button>
                <Button size="sm" variant="outline">2</Button>
                <Button size="sm" variant="outline">3</Button>
                <span className="px-2 text-warm-gray-500">...</span>
                <Button size="sm" variant="outline">12</Button>
              </div>
              <Button variant="outline" className="border-teal-500 text-teal-600">
                Next
              </Button>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}