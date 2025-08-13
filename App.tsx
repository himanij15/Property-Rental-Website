import { useRouter } from "./components/Router";
import { AuthProvider } from "./components/AuthContext";
import { HomePage } from "./components/HomePage";
import { ListingsPage } from "./components/ListingsPage";
import { PropertyDetailsPage } from "./components/PropertyDetailsPage";
import { UserDashboard } from "./components/UserDashboard";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { currentPage } = useRouter();

  switch (currentPage) {
    case "home":
      return <HomePage />;
    case "listings":
      return <ListingsPage />;
    case "property-details":
      return <PropertyDetailsPage />;
    case "user-dashboard":
      return <UserDashboard />;
    case "about":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e7e5e4',
            color: '#1c1917',
          },
          className: 'font-medium',
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-warm-gray-900 mb-8">About Dwellogo</h1>
          <div className="space-y-6 text-warm-gray-700">
            <p className="text-lg">
              Dwellogo is revolutionizing the real estate experience with AI-powered matching, 
              virtual tours, and seamless digital tools that make finding your perfect home effortless.
            </p>
            <p>
              Our platform combines advanced technology with personalized service to help buyers, 
              sellers, and renters navigate the property market with confidence.
            </p>
            <p>
              From smart property matching to virtual co-touring and digital lease signing, 
              we're building the future of real estate, one home at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-warm-gray-900 mb-8">Contact Us</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">Get in Touch</h2>
              <p className="text-warm-gray-700 mb-6">
                Have questions about our platform? We'd love to hear from you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-warm-gray-900 mb-2">Phone</h3>
                <p className="text-warm-gray-700">+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold text-warm-gray-900 mb-2">Email</h3>
                <p className="text-warm-gray-700">hello@dwellogo.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-warm-gray-900 mb-2">Address</h3>
                <p className="text-warm-gray-700">
                  123 Real Estate Ave<br />
                  New York, NY 10001
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-warm-gray-900 mb-2">Hours</h3>
                <p className="text-warm-gray-700">
                  Monday - Friday: 9am - 6pm<br />
                  Saturday: 10am - 4pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}