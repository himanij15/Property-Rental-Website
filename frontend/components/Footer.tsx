import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Footer() {
  return (
    <footer className="bg-warm-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-semibold">Dwellogo</span>
            </div>
            <p className="text-warm-gray-300 mb-4">
              Your trusted partner in finding the perfect home. We make real estate simple, transparent, and accessible for everyone.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-warm-gray-400 hover:text-white hover:bg-warm-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-warm-gray-400 hover:text-white hover:bg-warm-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-warm-gray-400 hover:text-white hover:bg-warm-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-warm-gray-400 hover:text-white hover:bg-warm-gray-800">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Buy Properties
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Rent Properties
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Sell Your Home
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Property Management
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Market Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-warm-gray-300 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-warm-gray-300">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-warm-gray-300">
                <Mail className="h-4 w-4" />
                <span>hello@dwellogo.com</span>
              </div>
              <div className="flex items-start gap-3 text-warm-gray-300">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Real Estate Ave<br />New York, NY 10001</span>
              </div>
            </div>
            
            <div>
              <p className="text-warm-gray-300 mb-3">
                Subscribe to our newsletter for the latest property updates and market insights.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your email"
                  className="bg-warm-gray-800 border-warm-gray-700 text-white placeholder:text-warm-gray-400"
                />
                <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-warm-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-warm-gray-400 text-sm">
            © 2024 Dwellogo. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="text-warm-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-warm-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-warm-gray-400 hover:text-white text-sm transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}