"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  Search,
  Star,
  Code,
  Server,
  Globe,
  Zap,
  Clock,
  Check,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";



type TemplateSelectionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data:{
        title: string;
        template: "REACT" | "NEXTJS"| "VUE" | "ANGULAR" | "EXPRESS"| "HONO" | "FLASK" |  "DOTNET";
        description: string;
    }) => void;
};  

interface TemplateOption{
    id : string;
    name: string;
    description: string;
    icon: string;
    color: string;
    popularity: number;
    tags: string[];
    features: string[];
    category: "Frontend" | "Backend"| "Fullstack";
}

const TemplateSelectionModal = (isOpen,c) => {
    const [step, setStep] = useState<"select" | "configure">("select");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState<
        "all" | "frontend" | "backend" | "fullstack"
    >("all");
    const [projectName, setProjectName] = useState("");
    return(
            <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Reset state when closing
          setStep("select");
          setSelectedTemplate(null);
          setProjectName("");
        }
      }}
    >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            {
                step === "select" ? ( <DialogHeader>
                    <>

                <DialogTitle className="text-2xl font-bold text-[blue] flex items-center gap-2">
                    <Plus size={24} className="text-[blue]" /> Select a Template
                </DialogTitle>

                    <DialogDescription>
                        Choose a Template to get started with your new playground.
                    </DialogDescription>
                    <div className="flex flex-col gap-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 outline-none"
                    size={18}
                    />
                    <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    />

                            </div>
                            <Tabs
                                defaultValue="all"
                                className="w-full sm:w-auto"
                                onValueChange={(value) => setCategory(value as any)}>
                            </Tabs>

                        </div>

                    </div>
                </>
            </DialogHeader>) : ( <></>)
            }
        </DialogContent>
    </Dialog>
    
    )
}
export default TemplateSelectionModal;