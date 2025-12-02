import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Replace, ReplaceAll } from 'lucide-react';

interface FindReplaceProps {
  content: string;
  onClose: () => void;
  onReplace: (newContent: string) => void;
  onFindNext: (position: number) => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({ content, onClose, onReplace, onFindNext }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    if (!findText) {
      setMatches([]);
      return;
    }

    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, flags);
      const foundMatches: number[] = [];
      let match;

      while ((match = regex.exec(content)) !== null) {
        foundMatches.push(match.index);
        if (!useRegex) {
          regex.lastIndex = match.index + 1;
        }
      }

      setMatches(foundMatches);
      setCurrentMatchIndex(0);
    } catch (e) {
      setMatches([]);
    }
  }, [findText, content, caseSensitive, useRegex]);

  const handleFindNext = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    onFindNext(matches[nextIndex]);
  };

  const handleFindPrevious = () => {
    if (matches.length === 0) return;
    const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    onFindNext(matches[prevIndex]);
  };

  const handleReplace = () => {
    if (matches.length === 0 || currentMatchIndex >= matches.length) return;

    const matchPos = matches[currentMatchIndex];
    const matchLength = findText.length;
    const newContent = content.substring(0, matchPos) + replaceText + content.substring(matchPos + matchLength);

    onReplace(newContent);
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;

    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, flags);
      const newContent = content.replace(regex, replaceText);

      onReplace(newContent);
    } catch (e) {
      console.error('Replace all failed:', e);
    }
  };

  return (
    <div className="absolute top-0 right-0 m-4 bg-white border border-gray-300 rounded-lg shadow-xl z-40 w-96 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-600" />
          <h3 className="font-bold text-gray-800 text-sm">Find & Replace</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Find Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find..."
              className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">
                {matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0'}
              </span>
              <button
                onClick={handleFindPrevious}
                disabled={matches.length === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFindNext}
                disabled={matches.length === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Case sensitive</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Regex</span>
            </label>
          </div>
        </div>

        {/* Replace Input */}
        <div className="relative">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleReplace}
            disabled={matches.length === 0}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Replace className="w-3.5 h-3.5" />
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ReplaceAll className="w-3.5 h-3.5" />
            Replace All
          </button>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500">
        <span className="font-medium">Tip:</span> Use Ctrl+F to open Find & Replace
      </div>
    </div>
  );
};
