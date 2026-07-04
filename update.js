const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function updateFiles(dir) {
  walkDir(dir, function(filePath) {
    if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) {
      let content = fs.readFileSync(filePath, "utf8");
      let original = content;

      // Update basic cards
      content = content.split("bg-slate-800/15").join("bg-slate-900/15");
      
      // Update hover effect
      content = content.split("hover:bg-slate-800/25").join("hover:bg-slate-900/25");
      
      // Update Grid opacity in DashboardLayout.js
      if (filePath.includes("DashboardLayout")) {
        content = content.replace(/backgroundSize: '60px 60px',/g, "backgroundSize: isDark ? '60px 60px' : '40px 40px',");
        content = content.replace(/opacity: isDark \? 0\.04 : 0\.8,/g, "opacity: isDark ? 0.04 : 1,");
        content = content.replace(/rgba\(15,23,42,0\.4\)/g, "rgba(15,23,42,0.08)");
      }

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log("Updated", filePath);
      }
    }
  });
}

updateFiles("app");
updateFiles("components");
