const fs = require('fs');

// Resolve DashboardLayout.js
let dash = fs.readFileSync('components/DashboardLayout.js', 'utf8');
dash = dash.replace(/<<<<<<< HEAD\n\s*<div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-teal-600\/30">\n\s*<BackgroundScene isDark={isDark} \/>\n\s*<header className="sticky top-0 z-30 backdrop-blur-2xl bg-white\/10 dark:bg-slate-900\/10 border-b border-slate-200\/50 dark:border-slate-800\/50">\n=======\n\s*<div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-teal-600\/30 print:bg-white print:overflow-visible">\n\s*<div className="print:hidden">\n\s*<BackgroundScene isDark={isDark} \/>\n\s*<\/div>\n\s*<header className="sticky top-0 z-50 backdrop-blur-2xl bg-white\/10 dark:bg-slate-900\/10 border-b border-slate-200\/50 dark:border-slate-800\/50 print:hidden">\n>>>>>>> [a-f0-9]+ \(.*?\)/, 
`<div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-teal-600/30 print:bg-white print:overflow-visible">
        <div className="print:hidden">
          <BackgroundScene isDark={isDark} />
        </div>
        <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/10 dark:bg-slate-900/10 border-b border-slate-200/50 dark:border-slate-800/50 print:hidden">`);

dash = dash.replace(/<<<<<<< HEAD\n\s*<main className="relative w-full px-4 md:px-8 lg:px-12 xl:px-24 2xl:px-32 py-8">\n\s*<div className="w-full">\n=======\n\s*<main className="relative w-full px-4 md:px-8 lg:px-12 xl:px-24 2xl:px-32 py-8 print:p-0 print:m-0">\n\s*<div className="w-full print:p-0">\n>>>>>>> [a-f0-9]+ \(.*?\)/,
`<main className="relative w-full px-4 md:px-8 lg:px-12 xl:px-24 2xl:px-32 py-8 print:p-0 print:m-0">
          <div className="w-full print:p-0">`);

fs.writeFileSync('components/DashboardLayout.js', dash);
console.log('DashboardLayout resolved');

// Resolve package.json
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/<<<<<<< HEAD\n\s*"jsonwebtoken": "\^9.0.3",\n=======\n\s*"html2canvas": "\^1.4.1",\n\s*"jspdf": "\^4.2.1",\n>>>>>>> [a-f0-9]+ \(.*?\)/, 
`    "html2canvas": "^1.4.1",
    "jsonwebtoken": "^9.0.3",
    "jspdf": "^4.2.1",`);
// Also remove the next-auth conflict if any
pkg = pkg.replace(/<<<<<<< HEAD\n\s*"next-auth": "\^4.24.14",\n=======\n>>>>>>> [a-f0-9]+ \(.*?\)/, '');
fs.writeFileSync('package.json', pkg);
console.log('package.json resolved');

