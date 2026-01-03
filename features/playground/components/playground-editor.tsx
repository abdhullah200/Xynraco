"use client"
import React , {useRef,useEffect, useCallback, act} from 'react'
import Editor, {type Monaco} from "@monaco-editor/react"
import { TemplateFile } from '@/features/playground/lib/path-to-json'
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from '@/features/playground/lib/editor-config'
import { config } from 'dotenv'
import { is } from 'date-fns/locale'


interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined
  content: string
  onContentChange: (value: string) => void
  suggestion: string | null
  suggestionLoading: boolean
  suggestionPosition: { line: number; column: number } | null
  onAcceptSuggestion: (editor: any, monaco: any) => void
  onRejectSuggestion: (editor: any) => void
  onTriggerSuggestion: (type: string, editor: any) => void
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const inlineCompletionProviderRef = useRef<any>(null)
  const currentSuggestionRef = useRef<{
    text: string;
    id: string;
    position: { line: number; column: number }
  } | null>(null)
  const isAcceptingSuggestionRef = useRef(false)
  const suggestionAcceptedRef = useRef(false)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tabCommandRef = useRef<any>(null)

  // Generate unique ID for each suggestion
  const generateSuggestionId = () => `suggestion-${Date.now()}-${Math.random()}`

  // Create inline completion provider
  const createInlineCompletionProvider = useCallback(
    (monaco: Monaco) => {
      return {
        provideInlineCompletions: ()=>{
          if (!suggestion || isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
            return { items: []}
        }

          const suggestionId = generateSuggestionId()
          currentSuggestionRef.current = {
            text: suggestion,
            id: suggestionId,
            position: suggestionPosition!,
          }

          // Clean the suggestion text (remove \r characters)
          const cleanSuggestion = suggestion.replace(/\r/g, "")

          return {
            items: [
              {
                insertText: cleanSuggestion,
                range: new monaco.Range(
                  editorRef.current.getPosition().lineNumber,
                  editorRef.current.getPosition().column,
                  editorRef.current.getPosition().lineNumber,
                  editorRef.current.getPosition().column,
                ),
                kind: monaco.languages.CompletionItemKind.Snippet,
                label: "AI Suggestion",
                detail: "AI-generated code suggestion",
                documentation: "Press Tab to accept",
                sortText: "0000", // High priority
                filterText: "",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhiteSpace,
              },
            ],
          }
        },
        freeInlineCompletions: (completions: any) => {
          
        },
        disposeInlineCompletions: (completions: any) => {
          
        },
      }
    },
    [suggestion],
  )

  // Clear current suggestion
  const clearCurrentSuggestion = useCallback(() => {
    console.log("Clearing current suggestion")
    currentSuggestionRef.current = null
    suggestionAcceptedRef.current = false
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null)
    }
  }, [])

  // Accept current suggestion with double-acceptance prevention
  const acceptCurrentSuggestion = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !currentSuggestionRef.current) return false
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) return false

    isAcceptingSuggestionRef.current = true
    suggestionAcceptedRef.current = true

    try {
      const editor = editorRef.current
      const monaco = monacoRef.current
      const cleanSuggestionText = currentSuggestionRef.current.text.replace(/\r/g, "")
      const position = editor.getPosition()

      // Safety: Prevent duplicate if already inserted
      const modelTextAtCursor = editor.getModel().getValueInRange(
        new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column + cleanSuggestionText.length
        )
      )

      if (modelTextAtCursor === cleanSuggestionText) {
        return false
      }

      // Insert suggestion
      editor.executeEdits("ai-suggestion", [
        {
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ])

      // Calculate end position
      const lines = cleanSuggestionText.split("\n")
      const endLine = position.lineNumber + lines.length - 1
      const endColumn = lines.length === 1 ? position.column + cleanSuggestionText.length : lines[lines.length - 1].length + 1

      // Move cursor to end
      editor.setPosition({ lineNumber: endLine, column: endColumn })

      clearCurrentSuggestion()
      onAcceptSuggestion(editor, monaco)

      return true
    } catch (error) {
      console.error("Error accepting suggestion:", error)
      return false
    } finally {
      // Reset accepting flag immediately
      isAcceptingSuggestionRef.current = false

      // Keep accepted flag for longer to prevent immediate re-acceptance
      setTimeout(() => {
        suggestionAcceptedRef.current = false
        console.log("Reset suggestionAcceptedRef flag")
      }, 1000) // Increased delay to 1 second
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion])

  // Check if there's an active inline suggestion at current position
  const hasActiveSuggestionAtPosition = useCallback(() => {
    // Simplified: just check if we have a suggestion, don't be too strict about position
    if (!currentSuggestionRef.current) return false
    if (!editorRef.current || !suggestionPosition) return false

    const position = editorRef.current.getPosition()

    // Be more lenient with position matching - allow within 5 columns
    return (
      position.lineNumber === suggestionPosition.line &&
      position.column >= suggestionPosition.column - 1 &&
      position.column <= suggestionPosition.column + 10
    )
  }, [suggestionPosition])

  // Update inline completions when suggestion changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return

    const editor = editorRef.current
    const monaco = monacoRef.current

    console.log("Suggestion changed", {
      hasSuggestion: !!suggestion,
      hasPosition: !!suggestionPosition,
      isAccepting: isAcceptingSuggestionRef.current,
      suggestionAccepted: suggestionAcceptedRef.current,
    })

    // Don't update if we're in the middle of accepting a suggestion
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("Skipping update - currently accepting/accepted suggestion")
      return
    }

    // Dispose previous provider
    if (inlineCompletionProviderRef.current) {
      inlineCompletionProviderRef.current.dispose()
      inlineCompletionProviderRef.current = null
    }

    // Clear current suggestion reference
    currentSuggestionRef.current = null

    // Register new provider if we have a suggestion
    if (suggestion && suggestionPosition) {
      console.log("Registering new inline completion provider")

      const language = getEditorLanguage(activeFile?.fileExtension || "")
      const provider = createInlineCompletionProvider(monaco)

      inlineCompletionProviderRef.current = monaco.languages.registerInlineCompletionsProvider(language, provider)

      // Small delay to ensure editor is ready, then trigger suggestions
      setTimeout(() => {
        if (editorRef.current && !isAcceptingSuggestionRef.current && !suggestionAcceptedRef.current) {
          console.log("Triggering inline suggestions")
          editor.trigger("ai", "editor.action.inlineSuggest.trigger", null)
        }
      }, 50)
    }

    return () => {
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose()
        inlineCompletionProviderRef.current = null
      }
    }
  }, [suggestion, suggestionPosition, activeFile, createInlineCompletionProvider])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    console.log("Editor instance mounted:", !!editorRef.current)

    editor.updateOptions({
      ...defaultEditorOptions,
      // Enable inline suggestions but with specific settings to prevent conflicts
      inlineSuggest: {
        enabled: true,
        mode: "prefix",
        suppressSuggestions: false,
      },
      // Disable some conflicting suggest features
      suggest: {
        preview: false, // Disable preview to avoid conflicts
        showInlineDetails: false,
        insertMode: "replace",
      },
      // Quick suggestions
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      // Smooth cursor
      cursorSmoothCaretAnimation: "on",
    })

    configureMonaco(monaco)

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      console.log("Ctrl+Space pressed, triggering suggestion")
      onTriggerSuggestion("completion", editor)
    })

    // CRITICAL: Override Tab key with high priority and prevent default Monaco behavior
    if (tabCommandRef.current) {
      tabCommandRef.current.dispose()
    }

    tabCommandRef.current = editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        console.log("TAB PRESSED", {
          hasSuggestion: !!currentSuggestionRef.current,
          hasActiveSuggestion: hasActiveSuggestionAtPosition(),
          isAccepting: isAcceptingSuggestionRef.current,
          suggestionAccepted: suggestionAcceptedRef.current,
        })

        // CRITICAL: Block if already processing
        if (isAcceptingSuggestionRef.current) {
          console.log("BLOCKED: Already in the process of accepting, ignoring Tab")
          return
        }

        // CRITICAL: Block if just accepted
        if (suggestionAcceptedRef.current) {
          console.log("BLOCKED: Suggestion was just accepted, using default tab")
          editor.trigger("keyboard", "tab", null)
          return
        }

        // If we have any active suggestion, try to accept it (don't be too strict about position)
        if (currentSuggestionRef.current) {
          console.log("ATTEMPTING to accept suggestion with Tab", {
            suggestionText: currentSuggestionRef.current.text.substring(0, 50) + "..."
          })
          const accepted = acceptCurrentSuggestion()
          if (accepted) {
            console.log("SUCCESS: Suggestion accepted via Tab, preventing default behavior")
            return // CRITICAL: Return here to prevent default tab behavior
          }
          console.log("FAILED: Suggestion acceptance failed, falling through to default")
        }

        // Default tab behavior (indentation)
        console.log("DEFAULT: Using default tab behavior")
        editor.trigger("keyboard", "tab", null)
      },
      // CRITICAL: Use specific context to override Monaco's built-in Tab handling
      "editorTextFocus && !editorReadonly && !suggestWidgetVisible",
    )

    // Escape to reject
    editor.addCommand(monaco.KeyCode.Escape, () => {
      console.log("Escape pressed")
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor)
        clearCurrentSuggestion()
      }
    })

    // Listen for cursor position changes to hide suggestions when moving away
    editor.onDidChangeCursorPosition((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      const newPosition = e.position

      // Clear existing suggestion if cursor moved away
      if (currentSuggestionRef.current && !suggestionAcceptedRef.current && suggestionPosition) {
        // If cursor moved away from suggestion position, clear it
        if (
          newPosition.lineNumber !== suggestionPosition.line ||
          newPosition.column < suggestionPosition.column ||
          newPosition.column > suggestionPosition.column + 10
        ) {
          console.log("Cursor moved away from suggestion, clearing")
          clearCurrentSuggestion()
          onRejectSuggestion(editor)
        }
      }

      // Trigger new suggestion if appropriate (simplified)
      if (!currentSuggestionRef.current && !suggestionLoading) {
        // Clear any existing timeout
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current)
        }

        // Trigger suggestion with a delay
        suggestionTimeoutRef.current = setTimeout(() => {
          onTriggerSuggestion("completion", editor)
        }, 300)
      }
    })

    // Listen for content changes to detect manual typing over suggestions
    editor.onDidChangeModelContent((e: any) => {
      if (isAcceptingSuggestionRef.current) return

      // If user types while there's a suggestion, clear it (unless it's our insertion)
      if (currentSuggestionRef.current && e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0]

        // Check if this is our own suggestion insertion
        if (
          change.text === currentSuggestionRef.current.text ||
          change.text === currentSuggestionRef.current.text.replace(/\r/g, "")
        ) {
          console.log("Our suggestion was inserted, not clearing")
          return
        }

        // User typed something else, clear the suggestion
        console.log("User typed while suggestion active, clearing")
        clearCurrentSuggestion()
      }

      // Trigger context-aware suggestions on certain typing patterns
      if (e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0]

        // Trigger suggestions after specific characters
        if (
          change.text === "\n" || // New line
          change.text === "{" || // Opening brace
          change.text === "." || // Dot notation
          change.text === "=" || // Assignment
          change.text === "(" || // Function call
          change.text === "," || // Parameter separator
          change.text === ":" || // Object property
          change.text === ";" // Statement end
        ) {
          setTimeout(() => {
            if (editorRef.current && !currentSuggestionRef.current && !suggestionLoading) {
              onTriggerSuggestion("completion", editor)
            }
          }, 100) // Small delay to let the change settle
        }
      }
    })

    updateEditorLanguage()
  }

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(model, language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
  }

  useEffect(() => {
    updateEditorLanguage()
  }, [activeFile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose()
        inlineCompletionProviderRef.current = null
      }
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose()
        tabCommandRef.current = null
      }
    }
  }, [])

  return (
    <div className="h-full relative">
      {/* Loading indicator */}
      {suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          AI thinking...
        </div>
      )}

      {/* Active suggestion indicator */}
      {currentSuggestionRef.current && !suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Press Tab to accept
        </div>
      )}

      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
        options={defaultEditorOptions}
      />
    </div>
  )
}