const fs = require('fs');

function applyDarkTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Background and global replacements
  content = content.replace(/bg-blue-50\/50/g, 'bg-white/5');
  content = content.replace(/bg-blue-50/g, 'bg-cpuNavy');
  content = content.replace(/bg-white/g, 'bg-white/5');
  content = content.replace(/text-cpuNavy/g, 'text-white');
  
  // Grays to light Grays
  content = content.replace(/text-gray-900/g, 'text-white');
  content = content.replace(/text-gray-800/g, 'text-gray-100');
  content = content.replace(/text-gray-700/g, 'text-gray-200');
  content = content.replace(/text-gray-600/g, 'text-gray-300');
  content = content.replace(/text-gray-500/g, 'text-gray-400');
  
  // Background hover states
  content = content.replace(/hover:bg-gray-50/g, 'hover:bg-white/10');
  content = content.replace(/bg-gray-50/g, 'bg-white/5');
  
  // Borders
  content = content.replace(/border-gray-100/g, 'border-white/10');
  content = content.replace(/border-gray-200/g, 'border-white/20');
  content = content.replace(/border-gray-300/g, 'border-white/30');

  // Specific table/card tweaks
  content = content.replace(/hover:bg-blue-50\/50/g, 'hover:bg-white/10 transition-colors');
  content = content.replace(/shadow-sm/g, 'shadow-xl drop-shadow-sm');

  fs.writeFileSync(filePath, content);
}

// Convert all files natively bridging the dark theme layout 
applyDarkTheme('src/app/dashboard/page.tsx');
applyDarkTheme('src/components/Navbar.tsx');
applyDarkTheme('src/app/add-entry/page.tsx');

// Type category overlays
let types = fs.readFileSync('src/types/index.ts', 'utf-8');
types = types.replace(/hover:bg-green-50/g, 'hover:bg-green-500/20');
types = types.replace(/hover:bg-purple-50/g, 'hover:bg-purple-500/20');
types = types.replace(/hover:bg-blue-50/g, 'hover:bg-blue-500/20');
types = types.replace(/hover:bg-orange-50/g, 'hover:bg-orange-500/20');
types = types.replace(/hover:bg-red-50/g, 'hover:bg-red-500/20');
types = types.replace(/hover:bg-yellow-50/g, 'hover:bg-yellow-500/20');
fs.writeFileSync('src/types/index.ts', types);

// Global component globals
let css = fs.readFileSync('src/app/globals.css', 'utf-8');
css = css.replace(/bg-white/g, 'bg-white/5 backdrop-blur-md');
css = css.replace(/text-gray-900/g, 'text-white');
css = css.replace(/text-gray-700/g, 'text-gray-200');
css = css.replace(/border-gray-100/g, 'border-white/10');
css = css.replace(/border-gray-200/g, 'border-white/20');
css = css.replace(/hover:bg-gray-50/g, 'hover:bg-white/10');
fs.writeFileSync('src/app/globals.css', css);

console.log("Dark theme injected successfully!");
