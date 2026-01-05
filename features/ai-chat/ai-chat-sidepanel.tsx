"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  User,
  Copy,
  Check,
  X,
  Paperclip,
  FileText,
  Code,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Plus,
  Minus,
  Settings,
  Zap,
  Brain,
  Terminal,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { EnhancedCodeBlock } from "./ai-chat-code-blocks";
import { EnhancedFilePreview } from "./file-preview";
import "katex/dist/katex.min.css";

interface FileAttachment {
  id: string;
  name: string;
  content: string;
  language: string;
  size: number;
  type: "code";
  preview?: string;
  mimeType?: string;
}

interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  insertPosition?: { line: number; column: number };
  fileName?: string;
  confidence?: number;
  category?: "optimization" | "bug_fix" | "feature" | "refactor" | "security";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  suggestions?: CodeSuggestion[];
  type?: "chat" | "code_review" | "suggestion" | "error_fix" | "optimization";
  tokens?: number;
  model?: string;
}

interface AIChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode?: (
    code: string,
    fileName?: string,
    position?: { line: number; column: number }
  ) => void;
  onRunCode?: (code: string, language: string) => void;
  activeFileName?: string;
  activeFileContent?: string;
  activeFileLanguage?: string;
  cursorPosition?: { line: number; column: number };
  theme?: "dark" | "light";
}

const MessageTypeIndicator: React.FC<{
  type?: string;
  model?: string;
  tokens?: number;
}> = ({ type, model, tokens }) => {
  const getTypeConfig = (type?: string) => {
    switch (type) {
      case "code_review":
        return { icon: Code, color: "text-blue-400", label: "Code Review" };
      case "suggestion":
        return {
          icon: Sparkles,
          color: "text-purple-400",
          label: "Suggestion",
        };
      case "error_fix":
        return { icon: RefreshCw, color: "text-red-400", label: "Error Fix" };
      case "optimization":
        return { icon: Zap, color: "text-yellow-400", label: "Optimization" };
      default:
        return { icon: MessageSquare, color: "text-zinc-400", label: "Chat" };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        <Icon className={cn("h-3 w-3", config.color)} />
        <span className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {model && <span>{model}</span>}
        {tokens && <span>{tokens} tokens</span>}
      </div>
    </div>
  );
};

const CodeSuggestionCard: React.FC<{
  suggestion: CodeSuggestion;
  onInsert: () => void;
  onCopy: () => void;
  onRun?: (code: string, language: string) => void;
  activeFileName?: string;
}> = ({ suggestion, onInsert, onCopy, onRun, activeFileName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "optimization":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "bug_fix":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "feature":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "refactor":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "security":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="border border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-900/30 my-3 group hover:bg-zinc-900/50 transition-colors">
      <div className="p-3 bg-zinc-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-zinc-200">
                {suggestion.title}
              </h4>
              {suggestion.category && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getCategoryColor(suggestion.category)
                  )}
                >
                  {suggestion.category}
                </Badge>
              )}
              {suggestion.confidence && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}% match
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              {suggestion.description}
            </p>
            {suggestion.fileName && (
              <div className="text-xs text-zinc-500">
                Target: {suggestion.fileName}
                {suggestion.insertPosition && (
                  <span className="ml-2">
                    Line {suggestion.insertPosition.line}:
                    {suggestion.insertPosition.column}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="ml-1 text-xs">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code to clipboard</TooltipContent>
            </Tooltip>

            {onRun &&
              ["javascript", "python", "bash"].includes(
                suggestion.language
              ) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onRun(suggestion.code, suggestion.language)
                      }
                      className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      <Terminal className="h-3 w-3" />
                      <span className="ml-1 text-xs">Run</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Run code</TooltipContent>
                </Tooltip>
              )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onInsert}
                  className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  disabled={!activeFileName}
                >
                  <Plus className="h-3 w-3" />
                  <span className="ml-1 text-xs">Insert</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {activeFileName
                  ? `Insert into ${activeFileName}`
                  : "No active file"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-700/50">
        <EnhancedCodeBlock
          className={`language-${suggestion.language}`}
          onInsert={() => onInsert()}
          onRun={onRun}
          fileName={suggestion.fileName}
        >
          {suggestion.code}
        </EnhancedCodeBlock>
      </div>
    </div>
  );
};

export const AIChatSidePanel: React.FC<AIChatSidePanelProps> = ({
  isOpen,
  onClose,
  onInsertCode,
  onRunCode,
  activeFileName,
  activeFileContent,
  activeFileLanguage,
  cursorPosition,
  theme = "dark",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [chatMode, setChatMode] = useState<
    "chat" | "review" | "fix" | "optimize"
  >("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [streamResponse, setStreamResponse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Enhanced language detection with more file types
  const detectLanguage = (fileName: string, content: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext) {
      const langMap: { [key: string]: string } = {
        js: "javascript",
        jsx: "jsx",
        ts: "typescript",
        tsx: "tsx",
        py: "python",
        java: "java",
        cpp: "cpp",
        c: "c",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        json: "json",
        xml: "xml",
        yaml: "yaml",
        yml: "yaml",
        md: "markdown",
        sql: "sql",
        sh: "bash",
        bash: "bash",
        ps1: "powershell",
        php: "php",
        rb: "ruby",
        go: "go",
        rs: "rust",
        swift: "swift",
        kt: "kotlin",
        dart: "dart",
        r: "r",
        scala: "scala",
        clj: "clojure",
        hs: "haskell",
        elm: "elm",
        vue: "vue",
        svelte: "svelte",
      };
      return langMap[ext] || "text";
    }

    // Enhanced content-based detection
    if (content.includes("import React") || content.includes("useState"))
      return "jsx";
    if (content.includes("interface ") || content.includes(": string"))
      return "typescript";
    if (content.includes("def ") && content.includes("import "))
      return "python";
    if (content.includes("package ") && content.includes("public class"))
      return "java";
    if (content.includes("#include") && content.includes("int main"))
      return "cpp";
    if (content.includes("<!DOCTYPE html") || content.includes("<html"))
      return "html";
    if (content.includes("SELECT") && content.includes("FROM")) return "sql";

    return "text";
  };

  const detectFileType = (
    fileName: string,
    content: string
  ): FileAttachment["type"] => {
    // Only allow code files
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "cpp",
        "c",
        "html",
        "css",
        "scss",
        "json",
        "xml",
        "yaml",
        "sql",
        "sh",
        "php",
        "rb",
        "go",
        "rs",
      ].includes(ext || "")
    )
      return "code";
    return "code"; // fallback: treat everything as code
  };

  const addFileAttachment = (
    fileName: string,
    content: string,
    mimeType?: string
  ) => {
    const language = detectLanguage(fileName, content);
    const type = detectFileType(fileName, content);
    if (type !== "code") return; // Only allow code files
    const newFile: FileAttachment = {
      id: Date.now().toString(),
      name: fileName,
      content: content.trim(),
      language,
      size: content.length,
      type,
      preview: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      mimeType,
    };
    setAttachments((prev) => [...prev, newFile]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  // Enhanced paste detection
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");

    if (pastedText.length > 50 && pastedText.includes("\n")) {
      const lines = pastedText.split("\n");
      const hasImports = lines.some(
        (line) =>
          line.trim().startsWith("import ") || line.trim().startsWith("from ")
      );
      const hasFunctions = lines.some(
        (line) =>
          line.includes("function ") ||
          line.includes("def ") ||
          line.includes("=>") ||
          line.includes("class ") ||
          line.includes("interface ")
      );
      const hasCodeStructure = lines.some(
        (line) =>
          line.includes("{") ||
          line.includes("}") ||
          line.includes("class ") ||
          line.includes("SELECT") ||
          line.includes("CREATE")
      );

      if (hasImports || hasFunctions || hasCodeStructure) {
        e.preventDefault();

        let suggestedName = "pasted-code.txt";
        if (hasImports && pastedText.includes("React")) {
          suggestedName =
            pastedText.includes("tsx") || pastedText.includes("interface")
              ? "component.tsx"
              : "component.jsx";
        } else if (
          pastedText.includes("def ") ||
          pastedText.includes("import ")
        ) {
          suggestedName = "script.py";
        } else if (
          pastedText.includes("function ") ||
          pastedText.includes("=>")
        ) {
          suggestedName = pastedText.includes("interface")
            ? "script.ts"
            : "script.js";
        } else if (
          pastedText.includes("SELECT") ||
          pastedText.includes("CREATE")
        ) {
          suggestedName = "query.sql";
        } else if (
          pastedText.includes("<!DOCTYPE") ||
          pastedText.includes("<html")
        ) {
          suggestedName = "page.html";
        } else if (pastedText.includes("public class")) {
          suggestedName = "Main.java";
        }

        const fileName = prompt(
          `Detected code content! Enter filename:`,
          suggestedName
        );
        if (fileName) {
          addFileAttachment(fileName, pastedText);
          return;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        addFileAttachment(file.name, content, file.type);
      };
      reader.readAsText(file);
    });
  };

  // Enhanced code suggestions with more categories
  const generateCodeSuggestions = (
    content: string,
    attachments: FileAttachment[]
  ): CodeSuggestion[] => {
    const suggestions: CodeSuggestion[] = [];

    // Context-aware suggestions based on active file
    if (activeFileContent && activeFileName) {
      // Security suggestions
      if (
        content.toLowerCase().includes("security") ||
        content.toLowerCase().includes("vulnerability")
      ) {
        suggestions.push({
          id: "security-headers",
          title: "Add Security Headers",
          description: "Implement security headers for web applications",
          code: `// Security headers middleware\nconst securityHeaders = {\n  'X-Content-Type-Options': 'nosniff',\n  'X-Frame-Options': 'DENY',\n  'X-XSS-Protection': '1; mode=block',\n  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',\n  'Content-Security-Policy': \"default-src 'self'\"\n};\n\napp.use((req, res, next) => {\n  Object.entries(securityHeaders).forEach(([key, value]) => {\n    res.setHeader(key, value);\n  });\n  next();\n});`,
          language: activeFileLanguage || "javascript",
          fileName: activeFileName,
          confidence: 0.9,
          category: "security",
        });
      }

      // Performance optimization suggestions
      if (
        content.toLowerCase().includes("optimize") ||
        content.toLowerCase().includes("performance")
      ) {
        suggestions.push({
          id: "performance-optimization",
          title: "Performance Optimization",
          description:
            "Optimize component rendering with React.memo and useMemo",
          code: `import React, { memo, useMemo, useCallback } from 'react';\n\nconst OptimizedComponent = memo(({ data, onUpdate }) => {\n  const processedData = useMemo(() => {\n    return data.map(item => ({\n      ...item,\n      processed: true\n    }));\n  }, [data]);\n\n  const handleUpdate = useCallback((id) => {\n    onUpdate(id);\n  }, [onUpdate]);\n\n  return (\n    <div>\n      {processedData.map(item => (\n        <div key={item.id} onClick={() => handleUpdate(item.id)}>\n          {item.name}\n        </div>\n      ))}\n    </div>\n  );\n});\n\nexport default OptimizedComponent;`,
          language: activeFileLanguage || "jsx",
          fileName: activeFileName,
          confidence: 0.85,
          category: "optimization",
        });
      }

      // Error handling suggestions
      if (
        content.toLowerCase().includes("error") ||
        content.toLowerCase().includes("fix")
      ) {
        suggestions.push({
          id: "error-boundary",
          title: "Add Error Boundary",
          description: "Comprehensive error boundary for React applications",
          code: `import React from 'react';\n\nclass ErrorBoundary extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { hasError: false, error: null, errorInfo: null };\n  }\n\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error, errorInfo) {\n    this.setState({\n      error: error,\n      errorInfo: errorInfo\n    });\n    \n    // Log error to monitoring service\n    console.error('Error caught by boundary:', error, errorInfo);\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return (\n        <div className=\"error-boundary\">\n          <h2>Something went wrong.</h2>\n          <details style={{ whiteSpace: 'pre-wrap' }}>\n            {this.state.error && this.state.error.toString()}\n            <br />\n            {this.state.errorInfo.componentStack}\n          </details>\n        </div>\n      );\n    }\n\n    return this.props.children;\n  }\n}`,
          language: activeFileLanguage || "jsx",
          fileName: activeFileName,
          confidence: 0.88,
          category: "bug_fix",
        });
      }

      // Type safety suggestions for TypeScript
      if (activeFileLanguage === "typescript" || activeFileLanguage === "tsx") {
        suggestions.push({
          id: "advanced-types",
          title: "Advanced TypeScript Types",
          description: "Improve type safety with advanced TypeScript patterns",
          code: `// Utility types for better type safety\ntype DeepReadonly<T> = {\n  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];\n};\n\ntype NonNullable<T> = T extends null | undefined ? never : T;\n\ntype ApiResponse<T> = {\n  data: T;\n  status: 'success' | 'error';\n  message?: string;\n  timestamp: Date;\n};\n\n// Generic hook with proper typing\nfunction useApi<T>(url: string): {\n  data: T | null;\n  loading: boolean;\n  error: string | null;\n  refetch: () => Promise<void>;\n} {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const refetch = useCallback(async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      const response = await fetch(url);\n      const result: ApiResponse<T> = await response.json();\n      setData(result.data);\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'Unknown error');\n    } finally {\n      setLoading(false);\n    }\n  }, [url]);\n\n  return { data, loading, error, refetch };\n}`,
          language: "typescript",
          fileName: activeFileName,
          confidence: 0.92,
          category: "feature",
        });
      }
    }

    // Analyze attachments for context
    attachments.forEach((file) => {
      if (file.type === "code") {
        if (file.content.includes("TODO") || file.content.includes("FIXME")) {
          suggestions.push({
            id: `todo-${file.id}`,
            title: `Complete TODO in ${file.name}`,
            description: "Implementation for the TODO comment",
            code: `// Implementation for TODO\nconst implementation = async () => {\n  try {\n    // Add your logic here\n    const result = await performOperation();\n    return { success: true, data: result };\n  } catch (error) {\n    console.error('Operation failed:', error);\n    return { success: false, error: error.message };\n  }\n};`,
            language: file.language,
            fileName: file.name,
            confidence: 0.7,
            category: "feature",
          });
        }

        if (
          file.content.includes("console.log") &&
          file.language === "javascript"
        ) {
          suggestions.push({
            id: `logging-${file.id}`,
            title: `Improve Logging in ${file.name}`,
            description: "Replace console.log with proper logging",
            code: `// Improved logging utility\nconst logger = {\n  info: (message, data) => {\n    console.info(\`[INFO] \${new Date().toISOString()}: \${message}\`, data);\n  },\n  warn: (message, data) => {\n    console.warn(\`[WARN] \${new Date().toISOString()}: \${message}\`, data);\n  },\n  error: (message, error) => {\n    console.error(\`[ERROR] \${new Date().toISOString()}: \${message}\`, error);\n  },\n  debug: (message, data) => {\n    if (process.env.NODE_ENV === 'development') {\n      console.debug(\`[DEBUG] \${new Date().toISOString()}: \${message}\`, data);\n    }\n  }\n};\n\n// Usage: logger.info('User logged in', { userId: 123 });`,
            language: file.language,
            fileName: file.name,
            confidence: 0.75,
            category: "refactor",
          });
        }
      }
    });

    return suggestions;
  };

  const getChatModePrompt = (mode: string, content: string, context: any) => {
    const baseContext = {
      activeFile: activeFileName,
      language: activeFileLanguage,
      cursorPosition,
      attachments: attachments.map((f) => ({
        name: f.name,
        language: f.language,
        size: f.size,
        type: f.type,
      })),
    };

    switch (mode) {
      case "review":
        return `Please review this code and provide detailed suggestions for improvement, including performance, security, and best practices:\n\n**Context:** ${JSON.stringify(
          baseContext
        )}\n\n**Request:** ${content}`;
      case "fix":
        return `Please help fix issues in this code, including bugs, errors, and potential problems:\n\n**Context:** ${JSON.stringify(
          baseContext
        )}\n\n**Problem:** ${content}`;
      case "optimize":
        return `Please analyze this code for performance optimizations and suggest improvements:\n\n**Context:** ${JSON.stringify(
          baseContext
        )}\n\n**Code to optimize:** ${content}`;
      default:
        return content;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageType =
      chatMode === "chat"
        ? "chat"
        : chatMode === "review"
        ? "code_review"
        : chatMode === "fix"
        ? "error_fix"
        : "optimization";
    const newMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: [...attachments],
      id: Date.now().toString(),
      type: messageType,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare enhanced context
      let contextualMessage = getChatModePrompt(chatMode, input.trim(), {
        activeFile: activeFileName,
        activeFileContent: activeFileContent?.substring(0, 2000), // Increased context size
        language: activeFileLanguage,
        cursorPosition,
      });

      if (attachments.length > 0) {
        contextualMessage += "\n\nAttached files:\n";
        attachments.forEach((file) => {
          contextualMessage += `\n**${file.name}** (${file.language}, ${
            file.type
          }):\n\`\`\`${file.language}\n${file.content.substring(
            0,
            1000
          )}\n\`\`\`\n`;
        });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: contextualMessage,
          history: messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: streamResponse,
          mode: chatMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = generateCodeSuggestions(input.trim(), attachments);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            suggestions: suggestions.length > 0 ? suggestions : undefined,
            id: Date.now().toString(),
            type: messageType,
            tokens: data.tokens,
            model: data.model || "AI Assistant",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date(),
            id: Date.now().toString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check your internet connection and try again.",
          timestamp: new Date(),
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setAttachments([]);
    }
  };

  const handleInsertCode = (
    code: string,
    fileName?: string,
    position?: { line: number; column: number }
  ) => {
    if (onInsertCode) {
      onInsertCode(
        code,
        fileName || activeFileName,
        position || cursorPosition
      );
    }
  };

  const handleCopySuggestion = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const addCurrentFileAsContext = () => {
    if (activeFileName && activeFileContent) {
      addFileAttachment(activeFileName, activeFileContent);
    }
  };

  const exportChat = () => {
    const chatData = {
      messages,
      timestamp: new Date().toISOString(),
      activeFile: activeFileName,
      attachments: attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages
    .filter((msg) => {
      if (filterType === "all") return true;
      return msg.type === filterType;
    })
    .filter((msg) => {
      if (!searchTerm) return true;
      return msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <TooltipProvider>
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />

        {/* Side Panel */}
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-full max-w-6xl bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 z-10 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-400 font-medium">
                  Drop files here to attach
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Header */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                  <Image src={"/logo.png"} alt="Logo" width={28} height={28} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Enhanced AI Assistant
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {activeFileName
                      ? `Working on ${activeFileName}`
                      : "No active file"}{" "}
                    • {messages.length} messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFileName && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addCurrentFileAsContext}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Current File
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add current file as context</TooltipContent>
                  </Tooltip>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    >
                      Auto-save conversations
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={streamResponse}
                      onCheckedChange={setStreamResponse}
                    >
                      Stream responses
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportChat}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMessages([])}>
                      Clear All Messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Controls */}
            <Tabs
              value={chatMode}
              onValueChange={(value) => setChatMode(value as any)}
              className="px-6"
            >
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-full grid-cols-4 max-w-md">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="review"
                    className="flex items-center gap-1"
                  >
                    <Code className="h-3 w-3" />
                    Review
                  </TabsTrigger>
                  <TabsTrigger value="fix" className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Fix
                  </TabsTrigger>
                  <TabsTrigger
                    value="optimize"
                    className="flex items-center gap-1"
                  >
                    <Zap className="h-3 w-3" />
                    Optimize
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-500" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 h-8 w-40 bg-zinc-800/50 border-zinc-700/50"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterType("all")}>
                        All Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("chat")}>
                        Chat Only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterType("code_review")}
                      >
                        Code Reviews
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterType("error_fix")}
                      >
                        Error Fixes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterType("optimization")}
                      >
                        Optimizations
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-zinc-950">
            <div className="p-6 space-y-6">
              {filteredMessages.length === 0 && !isLoading && (
                <div className="text-center text-zinc-500 py-16">
                  <div className="relative w-16 h-16 border rounded-full flex flex-col justify-center items-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-zinc-300">
                    Enhanced AI Assistant
                  </h3>
                  <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
                    Advanced AI coding assistant with file attachments, code
                    execution, smart suggestions, and comprehensive analysis
                    capabilities.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                    {[
                      "Review my React component for performance",
                      "Fix TypeScript compilation errors",
                      "Optimize database query performance",
                      "Add comprehensive error handling",
                      "Implement security best practices",
                      "Refactor code for better maintainability",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredMessages.map((msg, index) => (
                <div key={msg.id} className="space-y-4">
                  <div
                    className={cn(
                      "flex items-start gap-4 group",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                        <Brain className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl shadow-sm",
                        msg.role === "user"
                          ? "bg-zinc-900/70 text-white p-4 rounded-br-md"
                          : "bg-zinc-900/80 backdrop-blur-sm text-zinc-100 p-5 rounded-bl-md border border-zinc-800/50"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <MessageTypeIndicator
                          type={msg.type}
                          model={msg.model}
                          tokens={msg.tokens}
                        />
                      )}

                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code: ({
                              children,
                              className,
                              ...props
                            }) => {
                              // Check if it's inline code by looking for language class
                              // Fenced code blocks have className like "language-js"
                              const isInline = !className?.startsWith("language-");
                              return (
                                <EnhancedCodeBlock
                                  className={className}
                                  inline={isInline}
                                  onInsert={
                                    onInsertCode
                                      ? (code) => handleInsertCode(code)
                                      : undefined
                                  }
                                  onRun={onRunCode}
                                  theme={theme}
                                >
                                  {String(children)}
                                </EnhancedCodeBlock>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Show attachments for user messages */}
                      {msg.role === "user" &&
                        msg.attachments &&
                        msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs text-zinc-400 mb-2">
                              Attached files:
                            </div>
                            {msg.attachments.map((file) => (
                              <EnhancedFilePreview
                                key={file.id}
                                file={file}
                                onRemove={() => {}}
                                compact={true}
                                onInsert={
                                  onInsertCode
                                    ? (code) => handleInsertCode(code)
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        )}

                      {/* Message actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-700/30">
                        <div className="text-xs text-zinc-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(msg.content)
                            }
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInput(msg.content)}
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {msg.role === "user" && (
                      <Avatar className="h-9 w-9 border border-zinc-700 bg-zinc-800 shrink-0">
                        <AvatarFallback className="bg-zinc-700 text-zinc-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Enhanced Code suggestions */}
                  {msg.role === "assistant" &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 && (
                      <div className="ml-14 space-y-2">
                        <div className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          Smart Code Suggestions ({msg.suggestions.length}):
                        </div>
                        {msg.suggestions.map((suggestion) => (
                          <CodeSuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onInsert={() =>
                              handleInsertCode(
                                suggestion.code,
                                suggestion.fileName,
                                suggestion.insertPosition
                              )
                            }
                            onCopy={() => handleCopySuggestion(suggestion.code)}
                            onRun={onRunCode}
                            activeFileName={activeFileName}
                          />
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                  <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                    <Brain className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 p-5 rounded-xl rounded-bl-md flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm text-zinc-300">
                      {chatMode === "review"
                        ? "Analyzing code structure and patterns..."
                        : chatMode === "fix"
                        ? "Identifying issues and solutions..."
                        : chatMode === "optimize"
                        ? "Analyzing performance bottlenecks..."
                        : "Processing your request..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>
          {/* Enhanced File Attachments Preview */}
          {attachments.length > 0 && (
            <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm font-medium text-zinc-300 mb-3 flex items-center justify-between">
                <span>Attached Code Files ({attachments.length})</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {attachments.reduce((acc, file) => acc + file.size, 0)}{" "}
                    chars total
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments([])}
                    className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attachments.map((file) => (
                  <EnhancedFilePreview
                    key={file.id}
                    file={{ ...file, type: "code" }}
                    onRemove={() => removeAttachment(file.id)}
                    compact={true}
                    onInsert={
                      onInsertCode
                        ? (code) => handleInsertCode(code)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  placeholder={
                    chatMode === "chat"
                      ? "Ask about your code, request improvements, or paste code to analyze..."
                      : chatMode === "review"
                      ? "Describe what you'd like me to review in your code..."
                      : chatMode === "fix"
                      ? "Describe the issue you're experiencing..."
                      : "Describe what you'd like me to optimize..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage(e as any);
                    }
                  }}
                  disabled={isLoading}
                  className="min-h-11 max-h-32 bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none pr-20"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                  >
                    <Paperclip className="h-3 w-3" />
                  </Button>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
                    ⌘↵
                  </kbd>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md,.txt,.sql,.sh,.php,.rb,.go,.rs,.swift,.kt,.dart,.r,.scala,.clj,.hs,.elm,.vue,.svelte"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  addFileAttachment(file.name, content, file.type);
                };
                reader.readAsText(file);
              });
              e.target.value = "";
            }}
          />
        </div>
      </>
    </TooltipProvider>
  );
};