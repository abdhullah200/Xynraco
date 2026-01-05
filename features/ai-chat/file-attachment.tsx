"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Loader2,
  Send,
  User,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  Paperclip,
  File,
  ImportIcon as Insert,
  FileText,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import Image from "next/image"

interface FileAttachment {
  id: string
  name: string
  content: string
  language: string
  size: number
  type: "code" | "text"
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  id?: string
  timestamp?: Date
  attachments?: FileAttachment[]
  suggestions?: CodeSuggestion[]
}

interface CodeSuggestion {
  id: string
  title: string
  description: string
  code: string
  language: string
  insertPosition?: { line: number; column: number }
  fileName?: string
}

interface FileAttachmentChatProps {
  isOpen: boolean
  onClose: () => void
  onInsertCode?: (code: string, fileName?: string) => void
}

const FilePreview: React.FC<{
  file: FileAttachment
  onRemove: () => void
  compact?: boolean
}> = ({ file, onRemove, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
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
      json: "json",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
    }
    return langMap[ext || ""] || "text"
  }

  const truncateContent = (content: string, maxLines = 10): string => {
    const lines = content.split("\n")
    if (lines.length <= maxLines) return content
    return lines.slice(0, maxLines).join("\n") + "\n..."
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50">
        <File className="h-4 w-4 text-zinc-400" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-200 truncate">{file.name}</div>
          <div className="text-xs text-zinc-500">
            {file.language} • {file.size} chars
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0 text-zinc-400 hover:text-red-400">
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="border border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-900/50">
      <div className="flex items-center justify-between p-3 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-zinc-400" />
          <div>
            <div className="text-sm font-medium text-zinc-200">{file.name}</div>
            <div className="text-xs text-zinc-500">
              {file.language} • {file.size} characters
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
          >
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-700/50">
          <SyntaxHighlighter
            language={getLanguageFromFileName(file.name)}
            style={vscDarkPlus}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              padding: "12px",
              background: "transparent",
              fontSize: "12px",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {isExpanded ? file.content : truncateContent(file.content)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}

const CodeSuggestionCard: React.FC<{
  suggestion: CodeSuggestion
  onInsert: () => void
  onCopy: () => void
}> = ({ suggestion, onInsert, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-900/30 my-3">
      <div className="p-3 bg-zinc-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-zinc-200 mb-1">{suggestion.title}</h4>
            <p className="text-xs text-zinc-400">{suggestion.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="ml-1 text-xs">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onInsert}
              className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <Insert className="h-3 w-3" />
              <span className="ml-1 text-xs">Insert</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-700/50">
        <SyntaxHighlighter
          language={suggestion.language}
          style={vscDarkPlus}
          showLineNumbers={false}
          customStyle={{
            margin: 0,
            padding: "12px",
            background: "transparent",
            fontSize: "12px",
          }}
        >
          {suggestion.code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export const FileAttachmentChat: React.FC<FileAttachmentChatProps> = ({ isOpen, onClose, onInsertCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  const detectLanguage = (fileName: string, content: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
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
        json: "json",
      }
      return langMap[ext] || "text"
    }

    // Content-based detection
    if (content.includes("import React") || content.includes("useState")) return "jsx"
    if (content.includes("interface ") || content.includes(": string")) return "typescript"
    if (content.includes("def ") || content.includes("import ")) return "python"

    return "text"
  }

  const addFileAttachment = (fileName: string, content: string) => {
    const language = detectLanguage(fileName, content)
    const newFile: FileAttachment = {
      id: Date.now().toString(),
      name: fileName,
      content: content.trim(),
      language,
      size: content.length,
      type: ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c"].includes(language) ? "code" : "text",
    }
    setAttachments((prev) => [...prev, newFile])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text")

    // Check if pasted content looks like a file (has multiple lines and code-like structure)
    if (pastedText.length > 100 && pastedText.includes("\n")) {
      const lines = pastedText.split("\n")

      // Heuristics to detect if it's likely a code file
      const hasImports = lines.some((line) => line.trim().startsWith("import ") || line.trim().startsWith("from "))
      const hasFunctions = lines.some(
        (line) => line.includes("function ") || line.includes("def ") || line.includes("=>"),
      )
      const hasCodeStructure = lines.some((line) => line.includes("{") || line.includes("}") || line.includes("class "))

      if (hasImports || hasFunctions || hasCodeStructure) {
        e.preventDefault()

        // Try to detect file type and suggest a name
        let suggestedName = "pasted-code.txt"
        if (hasImports && pastedText.includes("React")) {
          suggestedName =
            pastedText.includes("tsx") || pastedText.includes("interface") ? "component.tsx" : "component.jsx"
        } else if (pastedText.includes("def ") || pastedText.includes("import ")) {
          suggestedName = "script.py"
        } else if (pastedText.includes("function ") || pastedText.includes("=>")) {
          suggestedName = "script.js"
        }

        const fileName = prompt(`Detected code content! Enter filename:`, suggestedName)
        if (fileName) {
          addFileAttachment(fileName, pastedText)
          return
        }
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        addFileAttachment(file.name, content)
      }
      reader.readAsText(file)
    })
  }

  const generateCodeSuggestions = (content: string, attachments: FileAttachment[]): CodeSuggestion[] => {
    const suggestions: CodeSuggestion[] = []

    // Analyze attachments for context
    attachments.forEach((file) => {
      if (file.type === "code") {
        // Generate suggestions based on file content
        if (file.content.includes("TODO") || file.content.includes("FIXME")) {
          suggestions.push({
            id: `todo-${file.id}`,
            title: `Complete TODO in ${file.name}`,
            description: "Implementation for the TODO comment",
            code: `// Implementation for TODO\nconst implementation = () => {\n  // Add your logic here\n  return true;\n};`,
            language: file.language,
            fileName: file.name,
          })
        }

        if (file.content.includes("function") && !file.content.includes("return")) {
          suggestions.push({
            id: `return-${file.id}`,
            title: `Add return statement to ${file.name}`,
            description: "Add missing return statement to function",
            code: `return result;`,
            language: file.language,
            fileName: file.name,
          })
        }

        if (file.language === "jsx" || file.language === "tsx") {
          suggestions.push({
            id: `hook-${file.id}`,
            title: `Add React hooks to ${file.name}`,
            description: "Add useState and useEffect hooks",
            code: `const [state, setState] = useState(null);\n\nuseEffect(() => {\n  // Effect logic here\n}, []);`,
            language: file.language,
            fileName: file.name,
          })
        }
      }
    })

    // Generate general suggestions based on user message
    if (content.toLowerCase().includes("error handling")) {
      suggestions.push({
        id: "error-handling",
        title: "Add Error Handling",
        description: "Comprehensive error handling pattern",
        code: `try {\n  // Your code here\n  const result = await operation();\n  return result;\n} catch (error) {\n  console.error('Operation failed:', error);\n  throw new Error(\`Operation failed: \${error.message}\`);\n}`,
        language: "javascript",
      })
    }

    if (content.toLowerCase().includes("validation")) {
      suggestions.push({
        id: "validation",
        title: "Add Input Validation",
        description: "Input validation function",
        code: `const validateInput = (input) => {\n  if (!input || typeof input !== 'string') {\n    throw new Error('Invalid input: must be a non-empty string');\n  }\n  \n  if (input.length < 3) {\n    throw new Error('Input too short: minimum 3 characters');\n  }\n  \n  return input.trim();\n};`,
        language: "javascript",
      })
    }

    return suggestions
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const newMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: [...attachments],
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Prepare context with file attachments
      let contextualMessage = input.trim()
      if (attachments.length > 0) {
        contextualMessage += "\n\nAttached files:\n"
        attachments.forEach((file) => {
          contextualMessage += `\n**${file.name}** (${file.language}):\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n`
        })
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: contextualMessage,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Generate code suggestions
        const suggestions = generateCodeSuggestions(input.trim(), attachments)

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            suggestions: suggestions.length > 0 ? suggestions : undefined,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please check your internet connection and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      // Clear attachments after sending
      setAttachments([])
    }
  }

  const handleInsertCode = (code: string, fileName?: string) => {
    if (onInsertCode) {
      onInsertCode(code, fileName)
    }
  }

  const handleCopySuggestion = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-5xl bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 z-10 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-400 font-medium">Drop files here to attach</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                <Image src={"/logo.svg"} alt="Logo" width={28} height={28} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">AI Code Assistant</h2>
                <p className="text-sm text-zinc-400">With file attachments & code insertion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Clear
                </Button>
              )}
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
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="p-6 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-zinc-500 py-16">
                <div className="relative w-16 h-16 border rounded-full flex flex-col justify-center items-center mx-auto mb-4">
                  <Image src={"/logo.svg"} alt="Logo" width={32} height={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-300">AI Code Assistant</h3>
                <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
                  Attach code files, get AI suggestions, and insert code directly into your editor. Paste code or drag &
                  drop files to get started!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Review my React component",
                    "Add error handling to this function",
                    "Optimize this algorithm",
                    "Add TypeScript types",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm text-zinc-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className="space-y-4">
                <div
                  className={cn("flex items-start gap-4 group", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                      <Image src={"/logo.svg"} alt="Logo" width={28} height={28} />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl shadow-sm",
                      msg.role === "user"
                        ? "bg-zinc-900/70 text-white p-4 rounded-br-md"
                        : "bg-zinc-900/80 backdrop-blur-sm text-zinc-100 p-5 rounded-bl-md border border-zinc-800/50",
                    )}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Show attachments for user messages */}
                    {msg.role === "user" && msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-zinc-400 mb-2">Attached files:</div>
                        {msg.attachments.map((file) => (
                          <FilePreview key={file.id} file={file} onRemove={() => {}} compact={true} />
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <Avatar className="h-9 w-9 border border-zinc-700 bg-zinc-800 shrink-0">
                      <AvatarFallback className="bg-zinc-700 text-zinc-300">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Code suggestions */}
                {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="ml-14 space-y-2">
                    <div className="text-sm font-medium text-zinc-300 mb-3">💡 Code Suggestions:</div>
                    {msg.suggestions.map((suggestion) => (
                      <CodeSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onInsert={() => handleInsertCode(suggestion.code, suggestion.fileName)}
                        onCopy={() => handleCopySuggestion(suggestion.code)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-4 justify-start">
                <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                  <Image src={"/logo.svg"} alt="Logo" width={28} height={28} />
                </div>
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 p-5 rounded-xl rounded-bl-md flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm text-zinc-300">Analyzing code...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* File Attachments Preview */}
        {attachments.length > 0 && (
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-sm font-medium text-zinc-300 mb-3">Attached Files ({attachments.length})</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attachments.map((file) => (
                <FilePreview key={file.id} file={file} onRemove={() => removeAttachment(file.id)} compact={true} />
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Ask about your code, request improvements, or paste code to analyze... (Ctrl+Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSendMessage(e as any)
                  }
                }}
                disabled={isLoading}
                className="max-h-32 bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
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
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md,.txt"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            files.forEach((file) => {
              const reader = new FileReader()
              reader.onload = (event) => {
                const content = event.target?.result as string
                addFileAttachment(file.name, content)
              }
              reader.readAsText(file)
            })
            e.target.value = "" // Reset input
          }}
        />
      </div>
    </>
  )
}