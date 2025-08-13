import { useState } from "react";
import { Search, Menu, Heart, MessageSquare, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useRouter } from "./Router";
import { useAuth } from "./AuthContext";
import { UserMenu } from "./UserMenu";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";

export function Header() {
  const { currentPage, navigate } = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  const switchToSignup = () => {
    setShowLoginDialog(false);
    setShowSignupDialog(true);
  };

  const switchToLogin = () => {
    setShowSignupDialog(false);
    setShowLoginDialog(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-warm-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("home")}
            >
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-xl font-semibold text-warm-gray-900">Dwellogo</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate("home")}
                className={`transition-colors ${
                  currentPage === "home" 
                    ? "text-teal-600 font-medium" 
                    : "text-warm-gray-600 hover:text-teal-600"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate("listings")}
                className={`transition-colors ${
                  currentPage === "listings" 
                    ? "text-teal-600 font-medium" 
                    : "text-warm-gray-600 hover:text-teal-600"
                }`}
              >
                Properties
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate("user-dashboard")}
                  className={`transition-colors ${
                    currentPage === "user-dashboard" 
                      ? "text-teal-600 font-medium" 
                      : "text-warm-gray-600 hover:text-teal-600"
                  }`}
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => navigate("about")}
                className={`transition-colors ${
                  currentPage === "about" 
                    ? "text-teal-600 font-medium" 
                    : "text-warm-gray-600 hover:text-teal-600"
                }`}
              >
                About
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Authenticated User Actions */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden sm:flex relative"
                    onClick={() => navigate("user-dashboard")}
                  >
                    <Heart className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-teal-500 text-white">
                      3
                    </Badge>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden sm:flex relative"
                    onClick={() => navigate("user-dashboard")}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-blue-500 text-white">
                      2
                    </Badge>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden sm:flex relative"
                  >
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                      1
                    </Badge>
                  </Button>
                  
                  <UserMenu />
                </>
              ) : (
                <>
                  {/* Unauthenticated User Actions */}
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLoginDialog(true)}
                    className="hidden sm:flex"
                  >
                    Sign In
                  </Button>
                  
                  <Button 
                    onClick={() => setShowSignupDialog(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white hidden sm:flex"
                  >
                    Sign Up
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Dialogs */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSwitchToSignup={switchToSignup}
      />
      
      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}