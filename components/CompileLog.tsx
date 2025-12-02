import React, { useState } from 'react';
import { AlertCircle, CheckCircle, X, ChevronDown, ChevronRight } from 'lucide-react';

interface CompileLogProps {
  isOpen: boolean;
  onClose: () => void;
  hasErrors: boolean;
  logs: string[];
}

export const CompileLog: React.FC<CompileLogProps> = ({ isOpen, onClose, hasErrors, logs }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-20" style={{ height: '200px' }}>
      {/* Header */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {hasErrors ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Compile Error</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Compiled successfully</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="h-[calc(100%-40px)] overflow-auto bg-gray-900 text-gray-100 p-4 font-mono text-xs">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${log.includes('Error') ? 'text-red-400' : log.includes('Warning') ? 'text-yellow-400' : 'text-gray-300'}`}>
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              {hasErrors ? (
                <>
                  <div className="text-red-400 mb-2">! LaTeX Error: Compilation failed</div>
                  <div>Check your LaTeX syntax and try again.</div>
                </>
              ) : (
                <>
                  <div className="text-green-400 mb-2">Recompiling...</div>
                  <div>This is pdfTeX, Version 3.14159265-2.6-1.40.21 (TeX Live 2020)</div>
                  <div>Output written on output.pdf (1 page, 45678 bytes)</div>
                  <div>Transcript written on output.log</div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
