"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface MarkedToggleButtonProps {
  markedForRevision?: boolean;
  id: string;
}

export function MarkedToggleButton({ markedForRevision = false, id }: MarkedToggleButtonProps) {
  const [isMarked, setIsMarked] = useState(markedForRevision);

  const handleToggle = () => {
    setIsMarked(!isMarked);
    // Add your toggle logic here
    console.log(`Toggle star for project ${id}: ${!isMarked}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="flex items-center justify-start w-full p-2 h-auto"
    >
      <Star
        className={`h-4 w-4 mr-2 ${
          isMarked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
      {isMarked ? "Unstar" : "Star"}
    </Button>
  );
}