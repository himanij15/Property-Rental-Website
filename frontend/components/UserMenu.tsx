import { 
  User, 
  Settings, 
  Heart, 
  MessageSquare, 
  Calendar,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { useRouter } from "./Router";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("home");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "agent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-warm-gray-100 text-warm-gray-800 border-warm-gray-200";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-teal-500 text-white">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-medium leading-none">{user.name}</p>
              {user.role !== "user" && (
                <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                  {user.role === "admin" ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    "Agent"
                  )}
                </Badge>
              )}
            </div>
            <p className="text-sm leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => navigate("user-dashboard")}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          <span>Saved Properties</span>
          <Badge className="ml-auto bg-teal-100 text-teal-800 text-xs">24</Badge>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Messages</span>
          <Badge className="ml-auto bg-blue-100 text-blue-800 text-xs">3</Badge>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Appointments</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}