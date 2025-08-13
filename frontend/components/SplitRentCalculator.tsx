import { useState } from "react";
import { Calculator, Users, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function SplitRentCalculator() {
  const [totalRent, setTotalRent] = useState(2500);
  const [utilities, setUtilities] = useState(200);
  const [numRoommates, setNumRoommates] = useState(2);

  const perPersonCost = (totalRent + utilities) / numRoommates;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-teal-600" />
          Split Rent Calculator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rent Input */}
        <div className="space-y-2">
          <Label htmlFor="rent">Monthly Rent</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
            <Input
              id="rent"
              type="number"
              value={totalRent}
              onChange={(e) => setTotalRent(Number(e.target.value))}
              className="pl-10"
              placeholder="2,500"
            />
          </div>
        </div>

        {/* Utilities Input */}
        <div className="space-y-2">
          <Label htmlFor="utilities">Monthly Utilities</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
            <Input
              id="utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(Number(e.target.value))}
              className="pl-10"
              placeholder="200"
            />
          </div>
        </div>

        {/* Roommates Input */}
        <div className="space-y-2">
          <Label htmlFor="roommates">Number of Roommates</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
            <Input
              id="roommates"
              type="number"
              min="1"
              max="10"
              value={numRoommates}
              onChange={(e) => setNumRoommates(Number(e.target.value))}
              className="pl-10"
              placeholder="2"
            />
          </div>
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">
              ${Math.round(perPersonCost).toLocaleString()}
            </div>
            <div className="text-sm text-warm-gray-600">Per Person Cost</div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray-600">Rent per person:</span>
              <span className="font-medium">${Math.round(totalRent / numRoommates)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray-600">Utilities per person:</span>
              <span className="font-medium">${Math.round(utilities / numRoommates)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total per person:</span>
              <span className="text-teal-600">${Math.round(perPersonCost)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="default"
            className="flex-1 bg-teal-500 hover:bg-teal-600"
          >
            Accept
          </Button>
          <Button variant="outline" className="flex-1">
            Counter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}