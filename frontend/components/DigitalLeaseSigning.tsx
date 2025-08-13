import { useState } from "react";
import { FileText, CheckCircle, Pen, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export function DigitalLeaseSigning() {
  const [signingProgress, setSigningProgress] = useState(75);
  const [isComplete, setIsComplete] = useState(false);

  const handleSign = () => {
    setSigningProgress(100);
    setIsComplete(true);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-600" />
          Digital Lease Signing
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Document Preview */}
        <div className="border border-warm-gray-200 rounded-lg p-4 bg-warm-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Lease Agreement</span>
            {isComplete ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="border-orange-200 text-orange-600">
                Pending
              </Badge>
            )}
          </div>
          
          {/* Signature Area */}
          <div className="border-2 border-dashed border-warm-gray-300 rounded p-4 text-center">
            {isComplete ? (
              <div className="space-y-2">
                <div className="text-2xl font-script text-teal-600">
                  {/* Signature placeholder */}
                  <svg width="120" height="40" viewBox="0 0 120 40" className="mx-auto">
                    <path 
                      d="M10 25 Q 20 15, 30 25 T 50 25 Q 60 15, 70 25 T 90 25 Q 100 15, 110 25" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="text-xs text-warm-gray-600">
                  Signed on {new Date().toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Pen className="h-6 w-6 text-warm-gray-400 mx-auto" />
                <div className="text-sm text-warm-gray-600">
                  Click to sign
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-warm-gray-600">Progress</span>
            <span className="font-medium">{signingProgress}%</span>
          </div>
          <Progress value={signingProgress} className="h-2" />
        </div>

        {/* Status Steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-warm-gray-600">Document reviewed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-warm-gray-600">Terms accepted</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 border-2 border-warm-gray-300 rounded-full" />
            )}
            <span className={isComplete ? "text-warm-gray-900" : "text-warm-gray-600"}>
              Signature {isComplete ? "complete" : "pending"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isComplete ? (
            <Button 
              onClick={handleSign}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              <Pen className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
          ) : (
            <Button 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Copy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}