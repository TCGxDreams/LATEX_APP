import React, { useState } from 'react';
import { X, Hash, Pi, Sigma, Infinity, Subscript, Superscript, Divide, SquareRoot } from 'lucide-react';

interface QuickInsertProps {
  onInsert: (text: string) => void;
  onClose: () => void;
}

interface Symbol {
  symbol: string;
  latex: string;
  category: string;
}

const SYMBOLS: Symbol[] = [
  // Greek Letters
  { symbol: 'α', latex: '\\alpha', category: 'greek' },
  { symbol: 'β', latex: '\\beta', category: 'greek' },
  { symbol: 'γ', latex: '\\gamma', category: 'greek' },
  { symbol: 'δ', latex: '\\delta', category: 'greek' },
  { symbol: 'ε', latex: '\\epsilon', category: 'greek' },
  { symbol: 'ζ', latex: '\\zeta', category: 'greek' },
  { symbol: 'η', latex: '\\eta', category: 'greek' },
  { symbol: 'θ', latex: '\\theta', category: 'greek' },
  { symbol: 'λ', latex: '\\lambda', category: 'greek' },
  { symbol: 'μ', latex: '\\mu', category: 'greek' },
  { symbol: 'π', latex: '\\pi', category: 'greek' },
  { symbol: 'ρ', latex: '\\rho', category: 'greek' },
  { symbol: 'σ', latex: '\\sigma', category: 'greek' },
  { symbol: 'τ', latex: '\\tau', category: 'greek' },
  { symbol: 'φ', latex: '\\phi', category: 'greek' },
  { symbol: 'ω', latex: '\\omega', category: 'greek' },
  { symbol: 'Γ', latex: '\\Gamma', category: 'greek' },
  { symbol: 'Δ', latex: '\\Delta', category: 'greek' },
  { symbol: 'Θ', latex: '\\Theta', category: 'greek' },
  { symbol: 'Λ', latex: '\\Lambda', category: 'greek' },
  { symbol: 'Σ', latex: '\\Sigma', category: 'greek' },
  { symbol: 'Φ', latex: '\\Phi', category: 'greek' },
  { symbol: 'Ω', latex: '\\Omega', category: 'greek' },

  // Math Operators
  { symbol: '±', latex: '\\pm', category: 'operators' },
  { symbol: '∓', latex: '\\mp', category: 'operators' },
  { symbol: '×', latex: '\\times', category: 'operators' },
  { symbol: '÷', latex: '\\div', category: 'operators' },
  { symbol: '≠', latex: '\\neq', category: 'operators' },
  { symbol: '≤', latex: '\\leq', category: 'operators' },
  { symbol: '≥', latex: '\\geq', category: 'operators' },
  { symbol: '≈', latex: '\\approx', category: 'operators' },
  { symbol: '∞', latex: '\\infty', category: 'operators' },
  { symbol: '∂', latex: '\\partial', category: 'operators' },
  { symbol: '∇', latex: '\\nabla', category: 'operators' },
  { symbol: '∫', latex: '\\int', category: 'operators' },
  { symbol: '∑', latex: '\\sum', category: 'operators' },
  { symbol: '∏', latex: '\\prod', category: 'operators' },
  { symbol: '√', latex: '\\sqrt{}', category: 'operators' },

  // Arrows
  { symbol: '→', latex: '\\rightarrow', category: 'arrows' },
  { symbol: '←', latex: '\\leftarrow', category: 'arrows' },
  { symbol: '↔', latex: '\\leftrightarrow', category: 'arrows' },
  { symbol: '⇒', latex: '\\Rightarrow', category: 'arrows' },
  { symbol: '⇐', latex: '\\Leftarrow', category: 'arrows' },
  { symbol: '⇔', latex: '\\Leftrightarrow', category: 'arrows' },
  { symbol: '↑', latex: '\\uparrow', category: 'arrows' },
  { symbol: '↓', latex: '\\downarrow', category: 'arrows' },

  // Sets
  { symbol: '∈', latex: '\\in', category: 'sets' },
  { symbol: '∉', latex: '\\notin', category: 'sets' },
  { symbol: '⊂', latex: '\\subset', category: 'sets' },
  { symbol: '⊃', latex: '\\supset', category: 'sets' },
  { symbol: '⊆', latex: '\\subseteq', category: 'sets' },
  { symbol: '⊇', latex: '\\supseteq', category: 'sets' },
  { symbol: '∪', latex: '\\cup', category: 'sets' },
  { symbol: '∩', latex: '\\cap', category: 'sets' },
  { symbol: '∅', latex: '\\emptyset', category: 'sets' },
  { symbol: 'ℕ', latex: '\\mathbb{N}', category: 'sets' },
  { symbol: 'ℤ', latex: '\\mathbb{Z}', category: 'sets' },
  { symbol: 'ℚ', latex: '\\mathbb{Q}', category: 'sets' },
  { symbol: 'ℝ', latex: '\\mathbb{R}', category: 'sets' },
  { symbol: 'ℂ', latex: '\\mathbb{C}', category: 'sets' },

  // Logic
  { symbol: '∀', latex: '\\forall', category: 'logic' },
  { symbol: '∃', latex: '\\exists', category: 'logic' },
  { symbol: '¬', latex: '\\neg', category: 'logic' },
  { symbol: '∧', latex: '\\land', category: 'logic' },
  { symbol: '∨', latex: '\\lor', category: 'logic' },
  { symbol: '⊕', latex: '\\oplus', category: 'logic' },
  { symbol: '⊗', latex: '\\otimes', category: 'logic' },
];

const TEMPLATES = [
  { name: 'Fraction', latex: '\\frac{numerator}{denominator}', icon: Divide },
  { name: 'Square Root', latex: '\\sqrt{x}', icon: SquareRoot },
  { name: 'Subscript', latex: 'x_{subscript}', icon: Subscript },
  { name: 'Superscript', latex: 'x^{superscript}', icon: Superscript },
  { name: 'Summation', latex: '\\sum_{i=1}^{n}', icon: Sigma },
  { name: 'Integral', latex: '\\int_{a}^{b}', icon: Pi },
  { name: 'Matrix 2x2', latex: '\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}', icon: Hash },
  { name: 'Limit', latex: '\\lim_{x \\to \\infty}', icon: Infinity },
];

export const QuickInsert: React.FC<QuickInsertProps> = ({ onInsert, onClose }) => {
  const [activeTab, setActiveTab] = useState<'symbols' | 'templates'>('symbols');
  const [activeCategory, setActiveCategory] = useState<string>('greek');

  const categories = [
    { id: 'greek', name: 'Greek', icon: 'π' },
    { id: 'operators', name: 'Operators', icon: '±' },
    { id: 'arrows', name: 'Arrows', icon: '→' },
    { id: 'sets', name: 'Sets', icon: '∈' },
    { id: 'logic', name: 'Logic', icon: '∀' },
  ];

  const filteredSymbols = SYMBOLS.filter(s => s.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-blue-50">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-600" />
            Quick Insert
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('symbols')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'symbols'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Symbols
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'templates'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="p-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'symbols' ? (
            <div>
              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Symbols Grid */}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                {filteredSymbols.map((sym, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onInsert(sym.latex);
                      onClose();
                    }}
                    className="aspect-square flex flex-col items-center justify-center bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg transition-all hover:shadow-md group"
                    title={sym.latex}
                  >
                    <span className="text-2xl text-gray-700 group-hover:text-emerald-600">
                      {sym.symbol}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-1 font-mono truncate w-full text-center px-1">
                      {sym.latex.replace(/\\/g, '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {TEMPLATES.map((template, index) => {
                const Icon = template.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      onInsert(template.latex);
                      onClose();
                    }}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 rounded-lg transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-emerald-50 group-hover:bg-emerald-100 rounded-full transition-colors">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {template.name}
                    </div>
                    <code className="text-xs text-gray-500 font-mono break-all">
                      {template.latex}
                    </code>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>Click any item to insert into editor</span>
          <span className="font-medium">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
