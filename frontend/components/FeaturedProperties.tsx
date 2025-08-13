import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { PropertyCard } from "./PropertyCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

const featuredProperties = [
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
    images: 22
  }
];

export function FeaturedProperties() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-warm-gray-900 mb-2">
              Featured Properties
            </h2>
            <p className="text-warm-gray-600">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          <Button variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50">
            View All
          </Button>
        </div>

        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {featuredProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <PropertyCard property={property} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </section>
  );
}