'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CogIcon, CheckCircleIcon, ExclamationCircleIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // For rendering HTML within Markdown if needed

interface StreamCompletionData {
  finalContent: string;
  thoughts?: string[];
  toolStatus?: Record<string, string>;
}

interface AIChatResponseRendererProps {
  messageId: string;
  responseStream?: string[]; // Raw SSE lines: "data: PREFIX:content"
  isActive?: boolean;
  onStreamComplete?: (messageId: string, completionData: StreamCompletionData) => void;
  initialContent?: string;
  persistedThoughts?: string[]; // Already split into an array of strings
  persistedToolStatus?: Record<string, string>;
}

export default function AIChatResponseRenderer({
  messageId,
  responseStream,
  isActive = false,
  onStreamComplete,
  initialContent,
  persistedThoughts,
  persistedToolStatus,
}: AIChatResponseRendererProps) {
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [thoughtPhases, setThoughtPhases] = useState<string[]>([]);
  const [currentThoughtPhase, setCurrentThoughtPhase] = useState('');
  const [toolStatus, setToolStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [showThoughts, setShowThoughts] = useState(false);
  const [isStreamProcessingComplete, setIsStreamProcessingComplete] = useState(false);

  const charBuffer = useRef('');
  const processedLinesCount = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const isInsideThinkBlockRef = useRef(false);
  const finalAccumulatedTextRef = useRef(''); // For final content callback

  const startNewThoughtPhase = useCallback(() => {
    if (currentThoughtPhase.trim()) {
      setThoughtPhases(prev => [...prev, currentThoughtPhase.trim()]);
    }
    setCurrentThoughtPhase('');
  }, [currentThoughtPhase]);

  const addThoughts = useCallback((content: string) => {
    if (content && content.trim()) {
      setCurrentThoughtPhase(prev => prev + content);
    }
  }, []);

  useEffect(() => {
    // Reset state when messageId or isActive changes
    charBuffer.current = '';
    processedLinesCount.current = 0;
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    isInsideThinkBlockRef.current = false;
    finalAccumulatedTextRef.current = '';
    setError(null);
    setShowThoughts(false);
    setIsStreamProcessingComplete(false);

    if (isActive) {
      setDisplayedResponse('');
      setThoughtPhases([]);
      setCurrentThoughtPhase('');
      setToolStatus({});
    } else {
      setDisplayedResponse(initialContent || '');
      setThoughtPhases(persistedThoughts || []);
      setCurrentThoughtPhase('');
      setToolStatus(persistedToolStatus || {});
      setIsStreamProcessingComplete(true); // Historical messages are complete
    }
  }, [messageId, isActive, initialContent, persistedThoughts, persistedToolStatus]);

  const processCharBuffer = useCallback(() => {
    animationFrameId.current = null;
    if (charBuffer.current) {
      setDisplayedResponse(prev => prev + charBuffer.current);
      charBuffer.current = '';
    }
  }, []);

  const scheduleCharBufferProcessing = useCallback(() => {
    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(processCharBuffer);
    }
  }, [processCharBuffer]);

  useEffect(() => {
    if (!isActive || !responseStream || responseStream.length === 0 || processedLinesCount.current >= responseStream.length) {
      return;
    }

    const newLines = responseStream.slice(processedLinesCount.current);
    let shouldUpdateResponseBuffer = false;

    newLines.forEach((eventBlock) => { // Renamed 'line' to 'eventBlock' for clarity
      processedLinesCount.current += 1;
      if (!eventBlock || eventBlock.startsWith(':heartbeat')) {
        return;
      }

      let prefix = '';
      let content = '';
      let eventType = null;

      // Parse the eventBlock which might be multi-line (e.g., event: type\ndata: content)
      // or single-line (e.g., data: content)
      const linesInBlock = eventBlock.split('\n');
      let dataLine = '';

      for (const currentLine of linesInBlock) {
        if (currentLine.startsWith('event:')) {
          eventType = currentLine.substring('event:'.length).trim();
        } else if (currentLine.startsWith('data:')) {
          dataLine = currentLine.substring('data:'.length).trim();
        }
      }
      
      if (!dataLine && !eventType) { // If nothing useful was parsed from the block
          // This might happen if an empty eventBlock was passed, or malformed.
          // console.log("[AIChatResponseRenderer] Skipping empty or malformed event block:", eventBlock);
          return;
      }
      
      // If we have an eventType, it might inform the prefix, otherwise parse from dataLine
      if (eventType === 'conversation_info') {
        // This event is usually handled by AIChatInterface, but good to acknowledge
        // console.log("[AIChatResponseRenderer] Received conversation_info event, data:", dataLine);
        // No direct rendering for this, usually.
        return; 
      }

      // Process dataLine
      if (dataLine) {
        const separatorIndex = dataLine.indexOf(':');
        if (separatorIndex !== -1) {
          prefix = dataLine.substring(0, separatorIndex);
          content = dataLine.substring(separatorIndex + 1);
        } else {
          // If no prefix in dataLine (e.g. just "DONE"), it might be a signal
          if (dataLine === "DONE") {
            prefix = "DONE";
            content = "";
          } else {
            prefix = 'TEXT'; // Default to TEXT if dataLine has content but no prefix
            content = dataLine;
          }
        }
      } else if (eventType) {
        // If there was an eventType but no dataLine, it might be an error or an unhandled event.
        // console.log(`[AIChatResponseRenderer] Event type ${eventType} received without data.`);
        return;
      }


      // content might still have escaped newlines from the backend, e.g. TEXT:Hello\\nWorld
      // The replace(/\\n/g, '\n') for TEXT case handles this.
      // For THOUGHT, it's done directly.

      switch (prefix) {
        case 'THOUGHT': // This case might be less used if thoughts are in <think> tags
          if (content) {
            startNewThoughtPhase();
            addThoughts(content.replace(/\\n/g, '\n') + '\\n\\n'); // Actual newlines for thoughts
          }
          break;
        case 'TEXT':
          if (content) {
            let currentChunk = content.replace(/\\n/g, '\n'); // Convert to actual newlines for processing
            
            while (currentChunk.length > 0) {
              const thinkStartIdx = currentChunk.indexOf('<think>');
              const thinkEndIdx = currentChunk.indexOf('</think>');

              if (isInsideThinkBlockRef.current) {
                if (thinkEndIdx !== -1) {
                  addThoughts(currentChunk.substring(0, thinkEndIdx));
                  currentChunk = currentChunk.substring(thinkEndIdx + 8); // Past </think>
                  isInsideThinkBlockRef.current = false;
                  startNewThoughtPhase();
                } else {
                  addThoughts(currentChunk);
                  currentChunk = '';
                }
              } else {
                if (thinkStartIdx !== -1) {
                  const textForResponse = currentChunk.substring(0, thinkStartIdx);
                  if (textForResponse) {
                    charBuffer.current += textForResponse;
                    finalAccumulatedTextRef.current += textForResponse;
                    shouldUpdateResponseBuffer = true;
                  }
                  currentChunk = currentChunk.substring(thinkStartIdx + 7); // Past <think>
                  isInsideThinkBlockRef.current = true;
                } else {
                  if (currentChunk) {
                    charBuffer.current += currentChunk;
                    finalAccumulatedTextRef.current += currentChunk;
                    shouldUpdateResponseBuffer = true;
                  }
                  currentChunk = '';
                }
              }
            }
          }
          break;
        case 'TOOL':
          startNewThoughtPhase();
          const [toolName, statusValue = 'unknown'] = content.split(':');
          if (toolName) {
            setToolStatus(prev => ({ ...prev, [toolName]: statusValue }));
          }
          break;
        case 'ERROR':
          startNewThoughtPhase();
          setError(content.replace(/\\n/g, '\n') || 'Unknown error from stream');
          break;
        case 'DONE':
          startNewThoughtPhase(); // Commit any final thoughts
          setIsStreamProcessingComplete(true);
          break;
        default:
          // console.warn(`[AIChatResponseRenderer] Unknown prefix: ${prefix}`);
          break;
      }
    });

    if (shouldUpdateResponseBuffer) {
      scheduleCharBufferProcessing();
    }
  }, [isActive, responseStream, scheduleCharBufferProcessing, addThoughts, startNewThoughtPhase]);

  useEffect(() => {
    if (isActive && isStreamProcessingComplete && onStreamComplete) {
      // Ensure final thought phase is captured
      let finalThoughts = [...thoughtPhases];
      if (currentThoughtPhase.trim()) {
        finalThoughts.push(currentThoughtPhase.trim());
      }
      
      onStreamComplete(messageId, {
        finalContent: finalAccumulatedTextRef.current,
        thoughts: finalThoughts,
        toolStatus: toolStatus,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isStreamProcessingComplete, messageId, onStreamComplete]);
  // Note: thoughtPhases, currentThoughtPhase, toolStatus are intentionally omitted from deps
  // to prevent multiple calls if their state updates slightly after isStreamProcessingComplete.
  // The values are read directly when onStreamComplete is invoked.

  const hasAnyThoughts = thoughtPhases.length > 0 || (isActive && currentThoughtPhase.trim().length > 0);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:before:content-none prose-p:after:content-none">
      {error && (
        <div className="my-2 p-2 rounded-md bg-red-800/30 text-red-300 border border-red-700/50 flex items-center gap-2 text-xs">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {Object.entries(toolStatus).length > 0 && (
        <div className="my-2 space-y-1">
          {Object.entries(toolStatus).map(([name, status]) => (
            <div
              key={name}
              className={`flex items-center gap-1.5 p-1.5 rounded-md text-xs border ${
                status === 'running' ? 'bg-blue-800/20 text-blue-300 border-blue-700/50' :
                status === 'completed' ? 'bg-green-800/20 text-green-300 border-green-700/50' :
                status === 'failed' ? 'bg-red-800/20 text-red-300 border-red-700/50' :
                'bg-yellow-800/20 text-yellow-300 border-yellow-700/50' // Default for unknown
              }`}
            >
              {status === 'running' ? <CogIcon className="h-3.5 w-3.5 animate-spin" /> :
               status === 'completed' ? <CheckCircleIcon className="h-3.5 w-3.5" /> :
               status === 'failed' ? <XCircleIcon className="h-3.5 w-3.5" /> :
               <ExclamationCircleIcon className="h-3.5 w-3.5" />}
              <span className="font-medium">{name}:</span>
              <span>{status}</span>
            </div>
          ))}
        </div>
      )}

      {hasAnyThoughts && (
        <div className="my-2">
          <div className="text-right mb-1">
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="text-xs bg-yellow-800/30 hover:bg-yellow-800/40 text-yellow-200 px-2 py-0.5 rounded-md flex items-center gap-1 ml-auto transition-colors"
            >
              <SparklesIcon className="h-3 w-3" />
              {showThoughts ? 'Hide' : 'Show'} Thoughts
            </button>
          </div>
          
          {showThoughts && (
            <div className="space-y-1.5">
              {thoughtPhases.map((phase, index) => (
                <div key={`phase-${index}`} className="bg-yellow-800/10 border border-yellow-700/30 rounded-md p-2 text-xs">
                  <h4 className="font-semibold text-yellow-300 flex items-center gap-1 mb-1">
                    <SparklesIcon className="h-3.5 w-3.5"/> Phase {index + 1}:
                  </h4>
                  {/* Removed className from ReactMarkdown, parent prose class will handle styling */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {phase}
                  </ReactMarkdown>
                </div>
              ))}
              {isActive && currentThoughtPhase.trim().length > 0 && (
                 <div className="bg-yellow-800/10 border border-yellow-700/30 rounded-md p-2 text-xs opacity-70">
                  <h4 className="font-semibold text-yellow-300 flex items-center gap-1 mb-1">
                    <SparklesIcon className="h-3.5 w-3.5 animate-pulse"/> Current:
                  </h4>
                  {/* Removed className from ReactMarkdown */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {currentThoughtPhase}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {displayedResponse}
      </ReactMarkdown>
      {isActive && !isStreamProcessingComplete && <span className="animate-pulse">▋</span>}
    </div>
  );
}
