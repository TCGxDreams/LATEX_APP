
import React, { useRef, useMemo, useEffect } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  
  const lineCount = value.split('\n').length;

  // Optimized Scroll Sync
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  // Simple regex-based LaTeX syntax highlighter
  const highlightedCode = useMemo(() => {
    return value.split('\n').map((line, i) => {
      // Escape HTML
      let safeLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // 1. Comments
      const commentMatch = safeLine.match(/(%.*)$/);
      let commentPart = '';
      let codePart = safeLine;
      
      if (commentMatch) {
        commentPart = `<span class="text-gray-400 italic">${commentMatch[0]}</span>`;
        codePart = safeLine.substring(0, commentMatch.index);
      }

      // 2. Commands (Blue)
      codePart = codePart.replace(/(\\[a-zA-Z@]+)/g, '<span class="text-[#204a87] font-bold">$1</span>');
      
      // 3. Special Characters
      codePart = codePart
        .replace(/(\{)/g, '<span class="text-[#ce5c00] font-bold">{</span>')
        .replace(/(\})/g, '<span class="text-[#ce5c00] font-bold">}</span>')
        .replace(/(\[)/g, '<span class="text-[#5c3566] font-bold">[</span>')
        .replace(/(\])/g, '<span class="text-[#5c3566] font-bold">]</span>');

      // 4. Math Environment Markers
      codePart = codePart.replace(/(\$)/g, '<span class="text-[#4e9a06] font-bold">$1</span>');
      
      // 5. Section Arguments
      codePart = codePart.replace(/(\\section)(\{)([^}]+)(\})/g, '$1$2<span class="text-[#c4a000] font-bold">$3</span>$4');

      return codePart + commentPart;
    }).join('\n');
  }, [value]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div 
          ref={gutterRef}
          className="w-12 bg-[#f8f9fa] border-r border-gray-200 pt-4 pb-4 text-right pr-3 select-none text-gray-400 font-mono text-sm leading-6 shrink-0 hidden sm:block overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i} className="h-6">{i + 1}</div>
          ))}
        </div>

        {/* Editor Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Highlight Layer (Behind) - z-0 */}
          <pre
            ref={preRef}
            className="absolute inset-0 p-4 font-mono text-sm leading-6 pointer-events-none whitespace-pre-wrap break-words overflow-hidden z-0"
            style={{ fontFamily: '"JetBrains Mono", monospace', tabSize: 2, wordBreak: 'break-word', overflowWrap: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: highlightedCode + '<br/>' }}
          />

          {/* Input Layer (Top, Transparent) - z-10
              Critically: caret-black ensures cursor is visible, text-transparent hides raw text
              but selection:bg makes text selectable/visible on drag.
          */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm leading-6 bg-transparent border-none focus:ring-0 outline-none whitespace-pre-wrap break-words text-transparent caret-black selection:bg-[#b3d7ff]/50 selection:text-black/50 z-10"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="% Start typing your LaTeX code here..."
            style={{ fontFamily: '"JetBrains Mono", monospace', tabSize: 2, wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
        </div>
      </div>
      
      {/* Footer Status Bar */}
      <div className="h-7 bg-[#f4f5f6] border-t border-gray-200 text-gray-600 text-[10px] flex items-center px-4 justify-between select-none z-20">
        <div className="flex gap-4 font-medium">
           <span>Line {lineCount}</span>
           <span>UTF-8</span>
           <span>LaTeX</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="font-semibold text-gray-700">Online</span>
        </div>
      </div>
    </div>
  );
};
