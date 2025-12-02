
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ZoomIn, ZoomOut, Maximize, AlertTriangle } from 'lucide-react';

interface PreviewProps {
  content: string;
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  const [scale, setScale] = useState(100);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 10, 50));
  const handleFit = () => setScale(100);

  // Split content by \newpage for visual pagination
  const pages = useMemo(() => {
    // Basic pre-processing similar to before
    let md = content;

    // Strip Preamble
    if (md.includes('\\begin{document}')) {
      md = md.split('\\begin{document}')[1];
    }
    if (md.includes('\\end{document}')) {
      md = md.split('\\end{document}')[0];
    }

    // Common replacements
    md = md.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, '$$$1$$');
    md = md.replace(/\\begin\{equation\*\}([\s\S]*?)\\end\{equation\*\}/g, '$$$1$$');
    md = md.replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, '$$ \\begin{aligned}$1\\end{aligned} $$');
    md = md.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, '$$ \\begin{aligned}$1\\end{aligned} $$');
    md = md.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');
    md = md.replace(/\\section\*?\{([^}]+)\}/g, '# $1');
    md = md.replace(/\\subsection\*?\{([^}]+)\}/g, '## $1');
    md = md.replace(/\\subsubsection\*?\{([^}]+)\}/g, '### $1');
    md = md.replace(/\\paragraph\*?\{([^}]+)\}/g, '#### $1');
    
    md = md.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
    md = md.replace(/\\textit\{([^}]+)\}/g, '*$1*');
    md = md.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    md = md.replace(/\\emph\{([^}]+)\}/g, '*$1*');
    md = md.replace(/\\texttt\{([^}]+)\}/g, '`$1`');
    md = md.replace(/\\dots/g, '...');
    md = md.replace(/\\ /g, '&nbsp;');
    md = md.replace(/\\textcolor\{([^}]+)\}\{([^}]+)\}/g, '<span style="color:$1">$2</span>');
    md = md.replace(/\\url\{([^}]+)\}/g, '[$1]($1)');
    md = md.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '[$2]($1)');

    md = md.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '<div class="text-center">$1</div>');
    md = md.replace(/\\begin\{itemize\}/g, '');
    md = md.replace(/\\end\{itemize\}/g, '');
    md = md.replace(/\\begin\{enumerate\}/g, '');
    md = md.replace(/\\end\{enumerate\}/g, '');
    md = md.replace(/\\item\s*/g, '- ');

    md = md.replace(/\\cite\{([^}]+)\}/g, '[[1]](#)');
    md = md.replace(/\\ref\{([^}]+)\}/g, '[1](#)');

    md = md.replace(/\\begin\{figure\}(?:\[.*?\])?/g, '');
    md = md.replace(/\\end\{figure\}/g, '');
    md = md.replace(/\\centering/g, '');
    md = md.replace(/\\caption\{([^}]+)\}/g, '*Figure: $1*');
    md = md.replace(/\\includegraphics(?:\[.*?\])?\{([^}]+)\}/g, (match, filename) => {
      const name = filename.replace(/^[./]+/, '');
      return `\n![${name}](https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(name)})\n`;
    });

    md = md.replace(/\\begin\{tabular\}\{[^}]+\}([\s\S]*?)\\end\{tabular\}/g, (match, tableContent) => {
      const rows = tableContent.trim().split('\\\\');
      let htmlTable = '<div class="my-6 overflow-x-auto"><table class="min-w-full border-collapse border border-gray-900 text-sm">';
      rows.forEach((row: string) => {
        let cleanRow = row.trim();
        if (!cleanRow) return;
        cleanRow = cleanRow.replace(/\\hline/g, '');
        if (!cleanRow.trim()) return;
        htmlTable += '<tr>';
        cleanRow.split('&').forEach((cell: string) => {
          htmlTable += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
        });
        htmlTable += '</tr>';
      });
      htmlTable += '</table></div>';
      return htmlTable;
    });

    md = md.replace(/([^\\])%.*$/gm, '$1'); 
    md = md.replace(/\\\\/g, '\n\n');
    md = md.replace(/\\maketitle/g, '<div class="text-center mb-12 pb-4 border-b border-gray-200"><h1 class="text-4xl font-bold mb-4">The Theory of Relativity</h1><div class="text-lg mb-1">Albert Einstein</div><div class="text-gray-500 font-serif">October 26, 2023</div></div>');

    // SPLIT BY \newpage
    // We use a regex to split, but keep the content
    return md.split(/\\newpage/g);
  }, [content]);

  return (
    <div className="h-full bg-[#dce1e6] flex flex-col shadow-inner overflow-hidden relative">
      {/* Toolbar */}
      <div className="bg-[#f4f5f6] border-b border-gray-300 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center z-10 shrink-0 h-10 no-print">
        <span className="flex items-center gap-2">
          PDF Preview
          <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-normal normal-case">Live</span>
        </span>
        <div className="flex items-center gap-1">
           <button onClick={handleZoomOut} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
           <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 min-w-[50px] text-center font-mono">{scale}%</span>
           <button onClick={handleZoomIn} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
           <div className="w-px h-3 bg-gray-300 mx-1"></div>
           <button onClick={handleFit} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Fit to Width"><Maximize className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center bg-[#dce1e6] relative no-print-scroll">
        
        {pages.length === 0 || (pages.length === 1 && !pages[0].trim()) ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-gray-300 select-none">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xl font-medium">Empty Document</p>
          </div>
        ) : (
          pages.map((pageContent, index) => (
            <article 
              key={index}
              className="print-content bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] w-[21cm] p-[2.5cm] text-justify transition-transform duration-200 ease-out origin-top break-words overflow-visible mb-8"
              style={{ 
                fontFamily: '"Noto Serif", serif',
                transform: `scale(${scale / 100})`,
                minHeight: '29.7cm', // Allows growth if content is long
                height: 'auto'
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({...props}) => <h1 className="text-3xl font-bold mb-6 mt-4 leading-tight text-gray-900 border-b-2 border-transparent" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold mb-4 mt-8 text-gray-900 border-b border-gray-300 pb-1" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-bold mb-3 mt-6 text-gray-800" {...props} />,
                  h4: ({...props}) => <h4 className="text-base font-bold mb-2 mt-4 text-gray-800 uppercase tracking-wide" {...props} />,
                  p: ({...props}) => <p className="mb-4 leading-relaxed text-gray-800 text-[11pt]" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-8 mb-4 space-y-1 marker:text-gray-500" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-8 mb-4 space-y-1 marker:text-gray-500" {...props} />,
                  li: ({...props}) => <li className="pl-1" {...props} />,
                  blockquote: ({...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4 bg-gray-50 py-2 pr-2" {...props} />,
                  a: ({...props}) => <a className="text-blue-700 underline decoration-blue-300 underline-offset-2" {...props} />,
                  code: ({className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto my-4 border border-gray-200">
                        <code className={className} {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-700" {...props}>{children}</code>
                    )
                  },
                  img: ({...props}) => (
                    <div className="flex flex-col items-center my-8 break-inside-avoid">
                      <div className="p-1 border border-gray-200 bg-white shadow-sm">
                         <img {...props} className="max-w-full h-auto max-h-[500px]" />
                      </div>
                      {props.alt && !props.alt.startsWith('Figure') && <span className="text-sm text-gray-600 mt-3 font-serif italic text-center block w-full">Figure: {props.alt}</span>}
                    </div>
                  ),
                  div: ({className, children, ...props}) => {
                     if (className?.includes('math-display')) {
                       return <div className="my-6 overflow-x-auto text-center" {...props}>{children}</div>
                     }
                     if (className === 'page-break') {
                        // In screen view, we already split pages manually, so this is just a fallback for internal breaks
                        return <div className="w-full h-8 border-t-2 border-dashed border-gray-200 my-8"></div>
                     }
                     return <div className={className} {...props}>{children}</div>
                  }
                }}
              >
                {pageContent}
              </ReactMarkdown>
              
              {/* Page Number (Visual only) */}
              <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none no-print">
                {index + 1}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
