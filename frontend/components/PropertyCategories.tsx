import { Home, Building, Building2, TreePine, Warehouse, Key } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const categories = [
  {
    icon: Home,
    title: "Houses",
    description: "Single family homes",
    count: "2,543"
  },
  {
    icon: Building,
    title: "Apartments",
    description: "High-rise living",
    count: "1,892"
  },
  {
    icon: Building2,
    title: "Condos",
    description: "Modern condominiums", 
    count: "847"
  },
  {
    icon: TreePine,
    title: "Vacation Homes",
    description: "Weekend getaways",
    count: "356"
  },
  {
    icon: Warehouse,
    title: "Commercial",
    description: "Business properties",
    count: "198"
  },
  {
    icon: Key,
    title: "New Construction",
    description: "Brand new homes",
    count: "127"
  }
];

export function PropertyCategories() {
  return (
    <section className="py-16 bg-warm-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-warm-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-warm-gray-600 max-w-2xl mx-auto">
            Find the perfect property type that matches your lifestyle and needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="group cursor-pointer border-warm-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-4 group-hover:bg-teal-200 transition-colors">
                  <category.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-warm-gray-900 mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-warm-gray-600 mb-2">
                  {category.description}
                </p>
                <span className="text-sm font-medium text-teal-600">
                  {category.count} listings
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}