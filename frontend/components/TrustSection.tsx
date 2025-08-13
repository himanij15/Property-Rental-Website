import { Star, Shield, Users, Award, CheckCircle, Home } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const stats = [
  {
    icon: Home,
    value: "50,000+",
    label: "Properties Listed"
  },
  {
    icon: Users,
    value: "100,000+",
    label: "Happy Customers"
  },
  {
    icon: Award,
    value: "15 Years",
    label: "Experience"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Secure Transactions"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Home Buyer",
    content: "Dwellogo made finding my dream home so easy. The search filters were exactly what I needed and the team was incredibly helpful throughout the process.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Property Investor",
    content: "I've used many real estate platforms, but Dwellogo stands out with its comprehensive property data and market insights. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "First-time Seller",
    content: "Selling my property through Dwellogo was seamless. The platform connected me with qualified buyers quickly and the support team was amazing.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5
  }
];

export function TrustSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-warm-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-warm-gray-600 max-w-2xl mx-auto mb-12">
            Join the growing community of satisfied customers who have found their perfect homes with Dwellogo
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-lg mb-4">
                  <stat.icon className="h-8 w-8 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-warm-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-warm-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-2xl font-bold text-center text-warm-gray-900 mb-8">
            What Our Customers Say
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-warm-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-warm-gray-600 mb-4">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-warm-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-warm-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-warm-gray-900 mb-2">
              Verified Listings
            </h4>
            <p className="text-warm-gray-600">
              All properties are verified and regularly updated to ensure accuracy
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-warm-gray-900 mb-2">
              Secure Transactions
            </h4>
            <p className="text-warm-gray-600">
              Your data and transactions are protected with bank-level security
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-warm-gray-900 mb-2">
              Expert Support
            </h4>
            <p className="text-warm-gray-600">
              Our team of real estate experts is here to help you every step of the way
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}