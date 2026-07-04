const fs = require("fs");
let content = fs.readFileSync("components/DashboardLayout.js", "utf8");

// 1. GridBackground: make backgroundSize always 60px 60px
content = content.replace(/backgroundSize: isDark \? '60px 60px' : '40px 40px',/, "backgroundSize: '60px 60px',");

// 2. Hero Grid
const oldHeroGrid = `<div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[2rem]" style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,1) 1px, transparent 1px)'
          }} />`;

const newHeroGrid = `{/* Hero grid overlay */}
          <div className={\`absolute inset-0 pointer-events-none rounded-[2rem] \${isDark ? 'opacity-[0.08]' : 'opacity-[0.15]'}\`} style={{
            backgroundSize: '40px 40px',
            backgroundImage: isDark
              ? 'linear-gradient(to right, rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,1) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(15,23,42,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,1) 1px, transparent 1px)'
          }} />`;

content = content.replace(oldHeroGrid, newHeroGrid);

// 3. Menu Grid
const oldMenuGrid = `<div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none rounded-2xl transition-opacity duration-500" style={{
                backgroundSize: '20px 20px',
                backgroundImage: 'linear-gradient(to right, rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,1) 1px, transparent 1px)'
              }} />`;

const newMenuGrid = `<div className={\`absolute inset-0 opacity-0 pointer-events-none rounded-2xl transition-opacity duration-500 \${isDark ? 'group-hover:opacity-[0.1]' : 'group-hover:opacity-[0.15]'}\`} style={{
                backgroundSize: '20px 20px',
                backgroundImage: isDark
                  ? 'linear-gradient(to right, rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,1) 1px, transparent 1px)'
                  : 'linear-gradient(to right, rgba(15,23,42,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,1) 1px, transparent 1px)'
              }} />`;

content = content.replace(oldMenuGrid, newMenuGrid);

fs.writeFileSync("components/DashboardLayout.js", content);
console.log("DashboardLayout updated successfully");
