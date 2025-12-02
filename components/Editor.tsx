
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { AutoComplete } from './AutoComplete';
import { FormattingToolbar } from './FormattingToolbar';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePos, setAutocompletePos] = useState({ top: 0, left: 0 });

  const lineCount = value.split('\n').length;

  // Track cursor position for autocomplete
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      const pos = textarea.selectionStart;
      setCursorPosition(pos);

      // Check if we should show autocomplete
      const textBefore = value.substring(0, pos);
      const shouldShow = /\\[a-zA-Z]*$/.test(textBefore);
      setShowAutocomplete(shouldShow);

      if (shouldShow) {
        // Calculate position for autocomplete popup
        const coords = getCursorCoordinates(textarea, pos);
        setAutocompletePos(coords);
      }
    };

    textarea.addEventListener('click', handleSelectionChange);
    textarea.addEventListener('keyup', handleSelectionChange);

    return () => {
      textarea.removeEventListener('click', handleSelectionChange);
      textarea.removeEventListener('keyup', handleSelectionChange);
    };
  }, [value]);

  // Get cursor coordinates for autocomplete positioning
  const getCursorCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = getComputedStyle(element);

    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'padding'].forEach(prop => {
      (div.style as any)[prop] = (style as any)[prop];
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    const text = element.value.substring(0, position);
    div.textContent = text;

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetTop: top, offsetLeft: left } = span;
    document.body.removeChild(div);

    return { top: top + 60, left: Math.min(left, window.innerWidth - 400) };
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = (completion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = cursorPosition;
    const textBefore = value.substring(0, pos);
    const textAfter = value.substring(pos);

    // Find the start of the current command
    const match = textBefore.match(/\\[a-zA-Z]*$/);
    if (!match) return;

    const commandStart = pos - match[0].length;
    const newValue = value.substring(0, commandStart) + match[0] + completion + textAfter;

    onChange(newValue);
    setShowAutocomplete(false);

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newPos = commandStart + match[0].length + completion.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;
      textarea.focus();
    }, 0);
  };

  // Handle formatting toolbar insertions
  const handleInsert = (text: string, wrapper?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = '';
    let cursorOffset = 0;

    if (wrapper && selectedText) {
      // Wrap selected text
      newText = text + selectedText + '}';
      cursorOffset = text.length + selectedText.length + 1;
    } else if (wrapper) {
      // Insert wrapper with cursor inside
      newText = text + '}';
      cursorOffset = text.length;
    } else {
      // Insert template
      newText = text;
      cursorOffset = text.length;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
      textarea.focus();
    }, 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: Bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        handleInsert('\\textbf{', true);
      }
      // Ctrl+I: Italic
      else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        handleInsert('\\textit{', true);
      }
      // Ctrl+U: Underline
      else if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        handleInsert('\\underline{', true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value]);

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
      {/* Formatting Toolbar */}
      <FormattingToolbar onInsert={handleInsert} />

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

          {/* Input Layer (Top) - z-10 */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm leading-6 bg-transparent border-none focus:ring-0 outline-none whitespace-pre-wrap break-words text-gray-800 caret-gray-900 selection:bg-blue-200 selection:text-gray-900 z-10 opacity-70"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="% Start typing your LaTeX code here..."
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              tabSize: 2,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              caretColor: '#1f2937'
            }}
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

      {/* AutoComplete Popup */}
      {showAutocomplete && (
        <AutoComplete
          value={value}
          cursorPosition={cursorPosition}
          onSelect={handleAutocompleteSelect}
          position={autocompletePos}
        />
      )}
    </div>
  );
};
