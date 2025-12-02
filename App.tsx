import React, { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/Button';
import { QuickInsert } from './components/QuickInsert';
import { FindReplace } from './components/FindReplace';
import { CompileLog } from './components/CompileLog';
import { checkGrammar } from './services/geminiService';
import { GrammarSuggestion, SidebarView, ProjectFile } from './types';
import { FileText, Wand2, MessageSquare, Download, Menu, Share2, Folder, ChevronDown, ChevronRight, Image as ImageIcon, RefreshCw, Home, X, User, Lock, Mail, Users, Link, History as HistoryIcon, Clock, Hash, Search, Moon, Sun, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// --- INITIAL DATA ---

const INITIAL_DOC = `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\title{The Theory of Relativity}
\\author{Albert Einstein}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This paper explores the fundamental concepts of special and general relativity, providing a unified framework for understanding space, time, and gravity.
\\end{abstract}

\\section{Introduction}
Special relativity was originally proposed by Albert Einstein in a paper published on 26 September 1905 titled "On the Electrodynamics of Moving Bodies". It fundamentally changed our understanding of time and space.

\\section{Mass-Energy Equivalence}
The most famous equation in the world is probably:

\\begin{equation}
  E = mc^2
\\end{equation}

Where:
\\begin{itemize}
  \\item $E$ is energy
  \\item $m$ is mass
  \\item $c$ is the speed of light
\\end{itemize}

\\section{The Field Equations}
General relativity generalizes special relativity and refines Newton's law of universal gravitation. It describes gravity not as a force, but as a consequence of the curvature of spacetime caused by the uneven distribution of mass/energy.

\\begin{align}
  R_{\\mu\\nu} - \\frac{1}{2}Rg_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}
\\end{align}

\\newpage

\\section{Experimental Data}
Below is a table showing the deflection of light by the sun, which was the first major test of the theory.

\\begin{center}
\\begin{tabular}{|c|c|c|}
  \\hline
  \\textbf{Year} & \\textbf{Observer} & \\textbf{Deflection} \\\\
  \\hline
  1919 & Eddington & 1.61 \\\\
  1919 & Crommelin & 1.98 \\\\
  1922 & Campbell & 1.72 \\\\
  \\hline
\\end{tabular}
\\end{center}

\\section{Conclusion}
The theory has had a major impact on physics. It implies that mass and energy are interchangeable. The implications for cosmology are profound, predicting phenomena such as black holes and gravitational waves.

\\subsection{Visual Evidence}
\\includegraphics[width=0.5\\textwidth]{spacetime_diagram.png}
\\caption{A visual representation of spacetime curvature.}

\\end{document}
`;

const INITIAL_BIB = `@article{einstein1905,
  title={On the electrodynamics of moving bodies},
  author={Einstein, Albert},
  journal={Annalen der Physik},
  volume={17},
  number={10},
  pages={891--921},
  year={1905},
  publisher={Wiley Online Library}
}
`;

const INITIAL_FILES: ProjectFile[] = [
  { name: 'main.tex', type: 'tex', content: INITIAL_DOC },
  { name: 'references.bib', type: 'bib', content: INITIAL_BIB },
  { name: 'spacetime.png', type: 'img', content: '' },
];

const MOCK_PROJECTS = [
  { id: 1, name: 'The Theory of Relativity', date: '2 mins ago', owner: 'You' },
  { id: 2, name: 'Quantum Mechanics Lab Report', date: '2 days ago', owner: 'You' },
  { id: 3, name: 'Thesis Final Draft', date: '1 week ago', owner: 'You' },
  { id: 4, name: 'Resume', date: '1 month ago', owner: 'You' },
];

export default function App() {
  const [view, setView] = useState<'editor' | 'home'>('editor');
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [activeFileName, setActiveFileName] = useState<string>('main.tex');
  const [activeSidebar, setActiveSidebar] = useState<SidebarView | null>(null);
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[] | null>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [isRecompiling, setIsRecompiling] = useState(false);
  
  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  // New Features
  const [showQuickInsert, setShowQuickInsert] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCompileLog, setShowCompileLog] = useState(false);
  const [compileHasErrors, setCompileHasErrors] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);

  // Derived active file
  const activeFile = files.find(f => f.name === activeFileName) || files[0];
  const mainTexFile = files.find(f => f.name === 'main.tex') || files[0];

  const handleRunGrammarCheck = async () => {
    setActiveSidebar(SidebarView.GRAMMAR);
    setIsChecking(true);
    setGrammarSuggestions([]); 
    
    try {
      const suggestions = await checkGrammar(activeFile.content);
      setGrammarSuggestions(suggestions);
    } catch (e) {
      setGrammarSuggestions(null); // Explicit error state
    }
    
    setIsChecking(false);
  };

  const handleApplySuggestion = (original: string, suggestion: string) => {
    setFiles(prev => prev.map(f => {
      if (f.name === activeFileName) {
        return { ...f, content: f.content.replace(original, suggestion) };
      }
      return f;
    }));
    setGrammarSuggestions(prev => prev ? prev.filter(s => s.original !== original) : null);
  };

  const handleCodeChange = (newContent: string) => {
    setFiles(prev => prev.map(f => {
      if (f.name === activeFileName) {
        return { ...f, content: newContent };
      }
      return f;
    }));
  };

  const handleRecompile = () => {
    setIsRecompiling(true);
    setShowCompileLog(true);
    setCompileHasErrors(false);
    setCompileLogs([]);
    setTimeout(() => {
      setIsRecompiling(false);
      // Simulate compile success
      setCompileLogs([
        'This is pdfTeX, Version 3.14159265-2.6-1.40.21',
        'entering extended mode',
        '(./main.tex',
        'LaTeX2e <2020-10-01>',
        'Output written on main.pdf (1 page, 12345 bytes).',
        'Transcript written on main.log.'
      ]);
    }, 800);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name: 'John Doe', email: 'john@example.com' });
    setShowLoginModal(false);
  };

  const handleQuickInsert = (text: string) => {
    setFiles(prev => prev.map(f => {
      if (f.name === activeFileName) {
        return { ...f, content: f.content + text };
      }
      return f;
    }));
  };

  const handleFindNext = (position: number) => {
    // Scroll to position in editor
    console.log('Find next at position:', position);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F: Find & Replace
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(prev => !prev);
      }
      // Esc: Close modals
      else if (e.key === 'Escape') {
        setShowQuickInsert(false);
        setShowFindReplace(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- UI RENDERERS ---

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <header className="bg-[#003f2d] text-white h-16 flex items-center justify-between px-6 shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold text-lg">O</div>
             <span className="font-bold text-xl tracking-tight">Overleaf AI</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-500">
                    {user.name.charAt(0)}
                 </div>
               </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="text-sm font-medium hover:text-white/80">Log In</button>
            )}
          </div>
        </header>

        <div className="flex-1 max-w-5xl mx-auto w-full p-8">
           <div className="flex items-center justify-between mb-8">
             <h1 className="text-2xl font-bold text-gray-800">All Projects</h1>
             <Button onClick={() => setView('editor')} className="bg-[#3b8c2e] hover:bg-[#2e7d22]">New Project</Button>
           </div>

           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             {MOCK_PROJECTS.map((project) => (
               <div key={project.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setView('editor')}>
                  <div className="flex items-center gap-4">
                     <FileText className="w-8 h-8 text-[#3b8c2e] fill-emerald-50" />
                     <div>
                       <div className="font-medium text-gray-800 group-hover:text-[#3b8c2e]">{project.name}</div>
                       <div className="text-xs text-gray-500">Owner: {project.owner} • Last modified: {project.date}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button size="sm" variant="ghost">Open</Button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden text-sm font-sans antialiased ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header - Overleaf style - HIDDEN ON PRINT */}
      <header className={`h-[52px] text-white flex items-center justify-between px-3 shadow-sm z-20 shrink-0 no-print ${darkMode ? 'bg-gray-800' : 'bg-[#003f2d]'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
             <Menu className="w-5 h-5" />
             <span className="font-bold hidden sm:inline text-base tracking-tight">Menu</span>
          </button>
          
          <div className="h-6 w-px bg-white/20 mx-1" />

          <button onClick={() => setView('home')} className="opacity-80 hover:opacity-100 transition-opacity" title="Back to Projects">
            <Home className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center bg-black/20 rounded px-3 py-1.5 cursor-pointer hover:bg-black/30 transition-colors border border-white/10 min-w-[200px]">
             <span className="text-sm font-medium truncate">The Theory of Relativity</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
             variant="secondary" 
             size="sm"
             className="bg-emerald-800/50 text-emerald-50 hover:bg-emerald-700/50 border-0 hidden sm:flex ring-0 focus:ring-0"
             onClick={() => setActiveSidebar(SidebarView.CHAT)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:bg-white/10 hover:text-white"
            onClick={handleRunGrammarCheck}
            disabled={activeFile.type !== 'tex'}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Grammar
          </Button>

          <button
            onClick={() => setShowQuickInsert(true)}
            className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10"
            title="Quick Insert (Symbols & Templates)"
          >
            <Hash className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFindReplace(prev => !prev)}
            className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10"
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={() => setShowHistoryModal(true)} className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10" title="History">
            <HistoryIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
             <Button size="sm" className="bg-[#3b8c2e] hover:bg-[#2e7d22] text-white border-none h-8" onClick={() => setShowShareModal(true)}>
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share
             </Button>

             {user ? (
                <div className="h-8 w-8 rounded-full bg-emerald-900 border border-emerald-500/50 flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 ring-emerald-400 transition-all ml-2">
                  {user.name.charAt(0)}
                </div>
             ) : (
                <button onClick={() => setShowLoginModal(true)} className="text-xs font-bold hover:underline ml-2">Log In</button>
             )}
          </div>
        </div>
      </header>

      {/* Toolbar / Subheader - HIDDEN ON PRINT */}
      <div className="h-11 bg-[#f4f5f6] border-b border-gray-300 flex items-center px-2 gap-2 shrink-0 z-10 justify-between no-print">
         <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-gray-700 text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">
              {activeFile.type === 'tex' && <FileText className="w-3.5 h-3.5 text-emerald-600" />}
              {activeFile.type === 'bib' && <FileText className="w-3.5 h-3.5 text-orange-500" />}
              {activeFile.type === 'img' && <ImageIcon className="w-3.5 h-3.5 text-purple-500" />}
              <span>{activeFileName}</span>
            </div>
         </div>

         <div className="flex items-center gap-3">
             <div className="flex items-center bg-white border border-[#3b8c2e] rounded overflow-hidden shadow-sm h-7">
                <button 
                  onClick={handleRecompile}
                  className="px-3 bg-[#3b8c2e] hover:bg-[#2e7d22] text-white text-xs font-bold flex items-center gap-2 transition-colors h-full"
                >
                  <RefreshCw className={clsx("w-3 h-3", isRecompiling && "animate-spin")} />
                  {isRecompiling ? "Compiling..." : "Recompile"}
                </button>
                <button className="px-2 bg-[#3b8c2e] hover:bg-[#2e7d22] border-l border-[#2e7d22] text-white h-full">
                  <ChevronDown className="w-3 h-3" />
                </button>
             </div>

             <div className="h-4 w-px bg-gray-300" />

             <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 rounded text-gray-600 text-xs font-medium transition-colors"
             >
                <Download className="w-4 h-4" />
                PDF
             </button>

             <button
                onClick={() => setShowCompileLog(!showCompileLog)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  showCompileLog ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-200 text-gray-600",
                  compileHasErrors && "text-red-600 hover:bg-red-50"
                )}
             >
                {compileHasErrors ? <AlertCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                Logs {compileHasErrors && <span className="bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">!</span>}
             </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* File Tree Side Panel - HIDDEN ON PRINT */}
        <div className="hidden md:flex w-60 bg-gray-50 border-r border-gray-200 flex-col shrink-0 select-none no-print">
          <div className="p-3 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-4">
            <span>Project Files</span>
            <div className="flex gap-1">
              {/* <button className="hover:bg-gray-200 p-1 rounded" title="New File"><FilePlus className="w-3.5 h-3.5" /></button> */}
              <Folder className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-1">
            <div className="mb-1">
              <div 
                className="flex items-center gap-1 px-2 py-1.5 text-gray-700 hover:bg-gray-200 rounded cursor-pointer transition-colors group"
                onClick={() => setIsFolderOpen(!isFolderOpen)}
              >
                {isFolderOpen ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                <Folder className="w-4 h-4 text-sky-500 fill-sky-100" />
                <span className="text-sm font-medium ml-1 truncate">Theory of Relativity</span>
              </div>
              
              {isFolderOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-1">
                  {files.map(file => (
                    <div 
                      key={file.name}
                      onClick={() => setActiveFileName(file.name)}
                      className={clsx(
                        "flex items-center gap-2 px-2 py-1.5 rounded-r cursor-pointer border-l-2 transition-colors",
                        activeFileName === file.name 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-600 font-medium" 
                          : "text-gray-600 hover:bg-gray-100 border-transparent"
                      )}
                    >
                      {file.type === 'tex' && <FileText className={clsx("w-3.5 h-3.5", activeFileName === file.name ? "text-emerald-600" : "opacity-70")} />}
                      {file.type === 'bib' && <FileText className={clsx("w-3.5 h-3.5", activeFileName === file.name ? "text-orange-600" : "opacity-70")} />}
                      {file.type === 'img' && <ImageIcon className={clsx("w-3.5 h-3.5", activeFileName === file.name ? "text-purple-600" : "opacity-70")} />}
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
             <div className="text-xs font-semibold text-gray-600 mb-2">Outline</div>
             <div className="space-y-1 pl-2">
                {mainTexFile.content.match(/\\section\{([^}]+)\}/g)?.map((match, i) => (
                  <div key={i} className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer truncate pl-2 border-l border-gray-200 hover:border-emerald-500 py-0.5">
                    {match.replace(/\\section\{|\}/g, '')}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Editor Pane - HIDDEN ON PRINT */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 no-print ${activeSidebar ? 'w-[40%]' : 'w-1/2'}`}>
          {activeFile.type === 'img' ? (
             <div className="flex-1 bg-gray-100 flex items-center justify-center flex-col gap-4 text-gray-400">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <p>Image Viewer Placeholder</p>
             </div>
          ) : (
            <Editor value={activeFile.content} onChange={handleCodeChange} />
          )}
        </div>

        {/* Resizer Mock - HIDDEN ON PRINT */}
        <div className="w-1 bg-gray-200 hover:bg-emerald-500 cursor-col-resize transition-colors hidden md:block z-10 shadow-sm no-print" />

        {/* Preview Pane - FULL SCREEN ON PRINT */}
        <div className={`hidden md:flex flex-col min-w-0 bg-gray-100 transition-all duration-300 relative ${activeSidebar ? 'w-[40%]' : 'w-1/2'}`}>
          <Preview content={mainTexFile.content} />

          {/* Compile Log Panel */}
          <CompileLog
            isOpen={showCompileLog}
            onClose={() => setShowCompileLog(false)}
            hasErrors={compileHasErrors}
            logs={compileLogs}
          />
        </div>

        {/* Right Sidebar (AI/Grammar) - HIDDEN ON PRINT */}
        {activeSidebar && (
          <div className="w-80 absolute right-0 top-0 bottom-0 z-30 md:relative md:w-80 shrink-0 border-l border-gray-200 shadow-2xl md:shadow-none no-print">
            <Sidebar 
              view={activeSidebar} 
              onClose={() => setActiveSidebar(null)}
              grammarSuggestions={grammarSuggestions}
              isCheckingGrammar={isChecking}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 text-lg">Log In</h3>
               <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={handleLogin} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input type="email" required className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" placeholder="you@example.com" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input type="password" required className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" placeholder="••••••••" />
                  </div>
               </div>
               <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md transition-colors">
                 Log In
               </button>
               <div className="text-center text-xs text-gray-500 mt-4">
                 Don't have an account? <span className="text-emerald-600 font-bold cursor-pointer hover:underline">Sign up</span>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Share2 className="w-5 h-5 text-emerald-600" /> Share Project</h3>
               <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-6 space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Invite Collaborators</label>
                 <div className="flex gap-2">
                    <input type="email" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" placeholder="colleague@university.edu" />
                    <Button>Share</Button>
                 </div>
               </div>
               
               <div className="border-t border-gray-100 pt-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Link Sharing</label>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <Link className="w-4 h-4 text-gray-400 shrink-0" />
                       <span className="text-sm text-gray-600 truncate">https://www.overleaf.com/read/xkqjvz...</span>
                    </div>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline shrink-0 ml-2">Copy</button>
                 </div>
                 <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-emerald-700 border-2 border-white flex items-center justify-center text-white text-xs">JD</div>
                       <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs">AK</div>
                    </div>
                    <span className="text-xs text-gray-500">+ 1 other editing</span>
                 </div>
               </div>
             </div>
             <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
               <Button variant="secondary" onClick={() => setShowShareModal(false)}>Done</Button>
             </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[80vh] flex flex-col">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
               <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-gray-600" /> Project History</h3>
               <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
             </div>
             <div className="flex-1 overflow-auto p-0">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                     <tr>
                        <th className="px-6 py-3">Version</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {[1,2,3,4,5].map(i => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">v1.{5-i}</td>
                           <td className="px-6 py-4 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">JD</div>
                              John Doe
                           </td>
                           <td className="px-6 py-4 text-gray-500">
                              <div className="flex items-center gap-1.5">
                                 <Clock className="w-3.5 h-3.5" />
                                 {i === 1 ? 'Just now' : `${i} hours ago`}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">View</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {/* Quick Insert Panel */}
      {showQuickInsert && (
        <QuickInsert
          onInsert={handleQuickInsert}
          onClose={() => setShowQuickInsert(false)}
        />
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <FindReplace
          content={activeFile.content}
          onClose={() => setShowFindReplace(false)}
          onReplace={handleCodeChange}
          onFindNext={handleFindNext}
        />
      )}
    </div>
  );
}