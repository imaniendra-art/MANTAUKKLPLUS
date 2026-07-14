const fs = require('fs');

// 1. CLEAN GLOBALS.CSS
let css = fs.readFileSync('app/globals.css', 'utf8');
css = css.replace(/\/\* ═══════════════════════ GRID PATTERN BACKGROUNDS ═══════════════════════ \*\/[\s\S]*?\/\* ═══════════════════════ CUSTOM SCROLLBAR/g, '/* ═══════════════════════ CUSTOM SCROLLBAR');
fs.writeFileSync('app/globals.css', css);

// 2. REWRITE DASHBOARDOAYOUT.JS to use robust SVG grids
let layout = fs.readFileSync('components/DashboardLayout.js', 'utf8');

// Replace GridBackground component
const newGridBg = `// ═══════════════════════ GRID BACKGROUND ═══════════════════════
function GridBackground({ isDark }) {
  // Menggunakan SVG Pattern murni untuk menghindari cache CSS & konflik background-image
  const strokeColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)';
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mainGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={strokeColor} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mainGrid)" />
    </svg>
  );
}`;

layout = layout.replace(/\/\/ ═══════════════════════ GRID BACKGROUND ═══════════════════════[\s\S]*?return \([\s\S]*?<div className="absolute inset-0[\s\S]*?\} \/>[\s\S]*?\);[\s\S]*?\}/, newGridBg);

// Hero Grid replacement
const heroGridRegex = /\{\/\* Hero grid overlay \*\/\}(.|\n)*?<div className="absolute inset-0 opacity-\[.*?\] pointer-events-none rounded-\[2rem\]" style=\{\{((.|\n)*?)\}\} \/>/g;
const heroSVG = `{/* Hero grid overlay (SVG) */}
          <div className="absolute inset-0 pointer-events-none rounded-[2rem] overflow-hidden opacity-100">
             <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
               <defs>
                 <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)'} strokeWidth="1" />
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#heroGrid)" />
             </svg>
          </div>`;
layout = layout.replace(heroGridRegex, heroSVG);

// Since my previous replace changed the hero div className to use dynamic literals, let's use a simpler replace strategy:
// It looks like this: <div className={`absolute inset-0 pointer-events-none rounded-[2rem] ${isDark ? 'opacity-[0.08]' : 'opacity-[0.15]'}`} style={{ ... }} />
const heroGridDynamicRegex = /\{\/\* Hero grid overlay \*\/\}(.|\n)*?<div className=\{`absolute inset-0 pointer-events-none rounded-\[2rem\] \$\{isDark \? 'opacity-\[.*?\]' : 'opacity-\[.*?\]'\}`\} style=\{\{((.|\n)*?)\}\} \/>/g;
layout = layout.replace(heroGridDynamicRegex, heroSVG);


// Menu Grid Hover replacement
const menuGridRegex = /\{\/\* Menu card grid overlay \*\/\}(.|\n)*?<div className=\{`absolute inset-0 opacity-0 pointer-events-none rounded-2xl transition-opacity duration-500 \$\{isDark \? 'group-hover:opacity-\[.*?\]' : 'group-hover:opacity-\[.*?\]'\}`\} style=\{\{((.|\n)*?)\}\} \/>/g;
const menuSVG = `{/* Menu card grid overlay (SVG) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-opacity duration-500 overflow-hidden">
                 <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                   <defs>
                     <pattern id="menuGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                       <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)'} strokeWidth="1" />
                     </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#menuGrid)" />
                 </svg>
              </div>`;
layout = layout.replace(menuGridRegex, menuSVG);

fs.writeFileSync('components/DashboardLayout.js', layout);
console.log('Successfully refactored grids to pure SVG');
