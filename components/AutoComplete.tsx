import React, { useEffect, useState } from 'react';
import { Command } from 'lucide-react';

interface AutoCompleteProps {
  value: string;
  cursorPosition: number;
  onSelect: (completion: string) => void;
  position: { top: number; left: number };
}

interface Suggestion {
  command: string;
  description: string;
  snippet?: string;
}

const LATEX_COMMANDS: Suggestion[] = [
  { command: '\\section', description: 'Section heading', snippet: '\\section{${1:title}}' },
  { command: '\\subsection', description: 'Subsection heading', snippet: '\\subsection{${1:title}}' },
  { command: '\\subsubsection', description: 'Subsubsection heading', snippet: '\\subsubsection{${1:title}}' },
  { command: '\\textbf', description: 'Bold text', snippet: '\\textbf{${1:text}}' },
  { command: '\\textit', description: 'Italic text', snippet: '\\textit{${1:text}}' },
  { command: '\\texttt', description: 'Monospace text', snippet: '\\texttt{${1:text}}' },
  { command: '\\emph', description: 'Emphasized text', snippet: '\\emph{${1:text}}' },
  { command: '\\underline', description: 'Underlined text', snippet: '\\underline{${1:text}}' },
  { command: '\\begin{equation}', description: 'Equation environment', snippet: '\\begin{equation}\n\t${1}\n\\end{equation}' },
  { command: '\\begin{align}', description: 'Align environment', snippet: '\\begin{align}\n\t${1}\n\\end{align}' },
  { command: '\\begin{itemize}', description: 'Itemized list', snippet: '\\begin{itemize}\n\t\\item ${1}\n\\end{itemize}' },
  { command: '\\begin{enumerate}', description: 'Enumerated list', snippet: '\\begin{enumerate}\n\t\\item ${1}\n\\end{enumerate}' },
  { command: '\\begin{figure}', description: 'Figure environment', snippet: '\\begin{figure}[h]\n\t\\centering\n\t\\includegraphics{${1:filename}}\n\t\\caption{${2:caption}}\n\t\\label{fig:${3:label}}\n\\end{figure}' },
  { command: '\\begin{table}', description: 'Table environment', snippet: '\\begin{table}[h]\n\t\\centering\n\t\\begin{tabular}{${1:c}}\n\t\t${2}\n\t\\end{tabular}\n\t\\caption{${3:caption}}\n\t\\label{tab:${4:label}}\n\\end{table}' },
  { command: '\\frac', description: 'Fraction', snippet: '\\frac{${1:numerator}}{${2:denominator}}' },
  { command: '\\sqrt', description: 'Square root', snippet: '\\sqrt{${1:x}}' },
  { command: '\\sum', description: 'Summation', snippet: '\\sum_{${1:i=1}}^{${2:n}}' },
  { command: '\\int', description: 'Integral', snippet: '\\int_{${1:a}}^{${2:b}}' },
  { command: '\\lim', description: 'Limit', snippet: '\\lim_{${1:x \\to \\infty}}' },
  { command: '\\alpha', description: 'Greek letter alpha', snippet: '\\alpha' },
  { command: '\\beta', description: 'Greek letter beta', snippet: '\\beta' },
  { command: '\\gamma', description: 'Greek letter gamma', snippet: '\\gamma' },
  { command: '\\delta', description: 'Greek letter delta', snippet: '\\delta' },
  { command: '\\epsilon', description: 'Greek letter epsilon', snippet: '\\epsilon' },
  { command: '\\theta', description: 'Greek letter theta', snippet: '\\theta' },
  { command: '\\lambda', description: 'Greek letter lambda', snippet: '\\lambda' },
  { command: '\\mu', description: 'Greek letter mu', snippet: '\\mu' },
  { command: '\\pi', description: 'Greek letter pi', snippet: '\\pi' },
  { command: '\\sigma', description: 'Greek letter sigma', snippet: '\\sigma' },
  { command: '\\omega', description: 'Greek letter omega', snippet: '\\omega' },
  { command: '\\cite', description: 'Citation', snippet: '\\cite{${1:key}}' },
  { command: '\\ref', description: 'Reference', snippet: '\\ref{${1:label}}' },
  { command: '\\label', description: 'Label', snippet: '\\label{${1:name}}' },
  { command: '\\includegraphics', description: 'Include graphics', snippet: '\\includegraphics[width=${1:0.8}\\textwidth]{${2:filename}}' },
  { command: '\\chapter', description: 'Chapter heading', snippet: '\\chapter{${1:title}}' },
  { command: '\\paragraph', description: 'Paragraph heading', snippet: '\\paragraph{${1:title}}' },
  { command: '\\footnote', description: 'Footnote', snippet: '\\footnote{${1:text}}' },
  { command: '\\url', description: 'URL', snippet: '\\url{${1:http://example.com}}' },
  { command: '\\href', description: 'Hyperlink', snippet: '\\href{${1:url}}{${2:text}}' },
];

export const AutoComplete: React.FC<AutoCompleteProps> = ({ value, cursorPosition, onSelect, position }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Find the word being typed (starting with \)
    const textBeforeCursor = value.substring(0, cursorPosition);
    const match = textBeforeCursor.match(/\\[a-zA-Z]*$/);

    if (match) {
      const currentQuery = match[0];
      setQuery(currentQuery);

      const filtered = LATEX_COMMANDS.filter(cmd =>
        cmd.command.toLowerCase().startsWith(currentQuery.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 10));
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
    }
  }, [value, cursorPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setSuggestions([]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex]);

  const handleSelect = (suggestion: Suggestion) => {
    const snippet = suggestion.snippet || suggestion.command;
    // Remove placeholders ${1:text} for now, just use the text
    const cleanSnippet = snippet.replace(/\$\{(\d+):?([^}]*)\}/g, '$2');
    onSelect(cleanSnippet.replace(query, ''));
  };

  if (suggestions.length === 0) return null;

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden"
      style={{
        top: position.top + 24,
        left: position.left,
        minWidth: '320px',
        maxWidth: '400px'
      }}
    >
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
        <Command className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-bold text-gray-600">AUTOCOMPLETE</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`px-3 py-2 cursor-pointer transition-colors ${
              index === selectedIndex
                ? 'bg-emerald-50 border-l-2 border-emerald-500'
                : 'hover:bg-gray-50 border-l-2 border-transparent'
            }`}
            onClick={() => handleSelect(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex items-center justify-between gap-3">
              <code className={`text-sm font-mono font-bold ${
                index === selectedIndex ? 'text-emerald-700' : 'text-gray-700'
              }`}>
                {suggestion.command}
              </code>
              {index === selectedIndex && (
                <span className="text-[10px] text-gray-400 font-medium">↵ Enter</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{suggestion.description}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 text-[10px] text-gray-500 flex items-center justify-between">
        <span>↑↓ Navigate • ↵ Select • Esc Close</span>
      </div>
    </div>
  );
};
