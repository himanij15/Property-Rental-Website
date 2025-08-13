import { useState } from "react";
import { Send, MessageCircle, User, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface ChatMessage {
  id: string;
  type: "user" | "agent" | "system";
  message: string;
  timestamp: Date;
  sender?: string;
  avatar?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    type: "system",
    message: "Negotiation chat started for Modern Downtown Loft - $450,000",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    type: "user",
    message: "Can you lower the rent?",
    timestamp: new Date(Date.now() - 240000),
    sender: "You"
  },
  {
    id: "3", 
    type: "agent",
    message: "I pooche counter on a thyly or month",
    timestamp: new Date(Date.now() - 180000),
    sender: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "4",
    type: "agent", 
    message: "I can do that. Please send the updated lease agreement.",
    timestamp: new Date(Date.now() - 120000),
    sender: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b14c?w=100&h=100&fit=crop&crop=face"
  }
];

export function NegotiationChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: newMessage,
      timestamp: new Date(),
      sender: "You"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-teal-600" />
            Negotiation Chat
          </CardTitle>
          {isActive && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "system" ? (
                <div className="text-center">
                  <span className="text-xs text-warm-gray-500 bg-warm-gray-100 px-2 py-1 rounded">
                    {message.message}
                  </span>
                </div>
              ) : (
                <div className={`flex gap-2 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="w-6 h-6">
                    {message.avatar ? (
                      <AvatarImage src={message.avatar} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {message.type === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`flex-1 ${message.type === "user" ? "text-right" : ""}`}>
                    <div className="text-xs text-warm-gray-600 mb-1">
                      {message.sender} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-xs ${
                      message.type === "user" 
                        ? "bg-teal-500 text-white" 
                        : "bg-warm-gray-100 text-warm-gray-900"
                    }`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            size="icon"
            className="bg-teal-500 hover:bg-teal-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Leave
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 text-xs bg-teal-500 hover:bg-teal-600"
          >
            Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}