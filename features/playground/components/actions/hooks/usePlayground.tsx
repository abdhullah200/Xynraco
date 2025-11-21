import { getAllPlaygroundForUser } from "@/features/dashboard/action";
import { TemplateFolder } from "@/features/playground/lib/path-to-json";
import { db } from "@/lib/db";
import { set } from "date-fns";
import { fi } from "date-fns/locale";
import { get } from "http";
import { useState,useEffect,useCallback } from "react";
import { toast } from "sonner";

interface PlaygroundData{
    id: string;
    name?: string;
    [key: string]: any;
}

interface UsePlaygroundReturn {
    playground: PlaygroundData | null;
    templateData: any;
    isLoading: boolean;
    error: string | null;
    loadPlayground: ()=>Promise<void>;
    saveTemplate: (data: TemplateFolder)=>Promise<void>;
}

export const UsePlayground = (id:string): UsePlaygroundReturn => {
    const [playground, setPlayground] = useState<PlaygroundData | null>(null);
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const loadPlayground = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaygroundById(id);
    //   @ts-ignore
      setPlaygroundData(data);

      const rawContent = data?.templateFiles?.[0]?.content;
      if (typeof rawContent === "string") {
        const parsedContent = JSON.parse(rawContent);
        setTemplateData(parsedContent);
        toast.success("Playground loaded successfully");
        return;
      }

      // Load template from API if not in saved content
      const res = await fetch(`/api/template/${id}`);
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = await res.json();
      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(templateRes.templateJson || {
          folderName: "Root",
          items: [],
        });
      }

      toast.success("Template loaded successfully");
    } catch (error) {
      console.error("Error loading playground:", error);
      setError("Failed to load playground data");
      toast.error("Failed to load playground data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);
}