import { Search, MapPin, Home, DollarSign, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useRouter } from "./Router";

export function HeroSection() {
  const { navigate } = useRouter();

  return (
    <section 
      className="relative bg-gradient-to-b from-teal-50 to-white py-16 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-warm-gray-900 mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-lg text-warm-gray-600 mb-8">
            Discover thousands of properties with our advanced search and find your dream home today.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="rent">Rent</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-0">
              <SearchForm navigate={navigate} />
            </TabsContent>
            <TabsContent value="rent" className="mt-0">
              <SearchForm navigate={navigate} />
            </TabsContent>
            <TabsContent value="sell" className="mt-0">
              <div className="bg-white rounded-lg border border-warm-gray-200 p-6 shadow-lg">
                <div className="text-center">
                  <Home className="mx-auto h-12 w-12 text-teal-500 mb-4" />
                  <h3 className="text-lg font-semibold text-warm-gray-900 mb-2">
                    Ready to Sell Your Property?
                  </h3>
                  <p className="text-warm-gray-600 mb-4">
                    Get a free valuation and connect with top real estate agents.
                  </p>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Get Started
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function SearchForm({ navigate }: { navigate: (page: string) => void }) {
  const handleSearch = () => {
    navigate("listings");
  };

  return (
    <div className="bg-white rounded-lg border border-warm-gray-200 p-6 shadow-lg backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
            <Input
              placeholder="Location, city, or neighborhood"
              className="pl-10 bg-warm-gray-50 border-warm-gray-200"
            />
          </div>
        </div>
        
        <Select>
          <SelectTrigger className="bg-warm-gray-50 border-warm-gray-200">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="bg-warm-gray-50 border-warm-gray-200">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-200k">$0 - $200,000</SelectItem>
            <SelectItem value="200k-500k">$200,000 - $500,000</SelectItem>
            <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
            <SelectItem value="1m+">$1,000,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-32 bg-warm-gray-50 border-warm-gray-200">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+ Bed</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-32 bg-warm-gray-50 border-warm-gray-200">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+ Bath</SelectItem>
              <SelectItem value="2">2+ Baths</SelectItem>
              <SelectItem value="3">3+ Baths</SelectItem>
              <SelectItem value="4">4+ Baths</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="bg-teal-500 hover:bg-teal-600 text-white px-8"
          onClick={handleSearch}
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}