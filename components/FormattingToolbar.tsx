import React from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Image, Table, Code, Hash, Pi, Type, Link2, Quote, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface FormattingToolbarProps {
  onInsert: (text: string, wrapper?: boolean) => void;
}

interface ToolButton {
  icon: any;
  label: string;
  latex: string;
  wrapper?: boolean;
  shortcut?: string;
}

const TOOLS: ToolButton[] = [
  { icon: Bold, label: 'Bold', latex: '\\textbf{', wrapper: true, shortcut: 'Ctrl+B' },
  { icon: Italic, label: 'Italic', latex: '\\textit{', wrapper: true, shortcut: 'Ctrl+I' },
  { icon: Underline, label: 'Underline', latex: '\\underline{', wrapper: true, shortcut: 'Ctrl+U' },
  { icon: Code, label: 'Code', latex: '\\texttt{', wrapper: true },
  { icon: Type, label: 'Emphasis', latex: '\\emph{', wrapper: true },
  { icon: Quote, label: 'Quote', latex: '\\begin{quote}\n\t\n\\end{quote}' },
  { icon: List, label: 'Bullet List', latex: '\\begin{itemize}\n\t\\item \n\\end{itemize}' },
  { icon: ListOrdered, label: 'Numbered List', latex: '\\begin{enumerate}\n\t\\item \n\\end{enumerate}' },
  { icon: Table, label: 'Table', latex: '\\begin{table}[h]\n\t\\centering\n\t\\begin{tabular}{|c|c|}\n\t\t\\hline\n\t\tHeader 1 & Header 2 \\\\\n\t\t\\hline\n\t\tData 1 & Data 2 \\\\\n\t\t\\hline\n\t\\end{tabular}\n\t\\caption{Table caption}\n\\end{table}' },
  { icon: Image, label: 'Image', latex: '\\begin{figure}[h]\n\t\\centering\n\t\\includegraphics[width=0.8\\textwidth]{filename}\n\t\\caption{Caption}\n\\end{figure}' },
  { icon: Link2, label: 'Hyperlink', latex: '\\href{url}{text}' },
  { icon: Hash, label: 'Section', latex: '\\section{' , wrapper: true },
  { icon: Pi, label: 'Equation', latex: '\\begin{equation}\n\t\n\\end{equation}' },
];

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onInsert }) => {
  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-2 gap-1 overflow-x-auto no-print">
      {TOOLS.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <button
            key={index}
            onClick={() => onInsert(tool.latex, tool.wrapper)}
            className="flex items-center justify-center min-w-[32px] h-8 px-2 hover:bg-gray-100 rounded transition-colors group relative"
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {tool.label}
              {tool.shortcut && (
                <div className="text-[10px] text-gray-400 mt-0.5">{tool.shortcut}</div>
              )}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        );
      })}

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Alignment Buttons */}
      <button
        onClick={() => onInsert('\\begin{flushleft}\n\t\n\\end{flushleft}')}
        className="flex items-center justify-center min-w-[32px] h-8 px-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => onInsert('\\begin{center}\n\t\n\\end{center}')}
        className="flex items-center justify-center min-w-[32px] h-8 px-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => onInsert('\\begin{flushright}\n\t\n\\end{flushright}')}
        className="flex items-center justify-center min-w-[32px] h-8 px-2 hover:bg-gray-100 rounded transition-colors"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};
