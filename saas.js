const fs = require('fs');

const polishDashboard = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Table row improvements
  content = content.replace(/className=\{`border-b border-gray-[^]+`\}/g, 'className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"');
  
  // Table headers typography
  content = content.replace(/font-extrabold text-cpuNavy/g, 'font-semibold text-gray-500 text-xs tracking-wider uppercase');
  
  // Table cell padding and weight
  content = content.replace(/py-3 px-3/g, 'py-4 px-4');
  content = content.replace(/font-semibold text-gray-700/g, 'text-gray-600 font-medium');
  content = content.replace(/font-extrabold text-cpuNavy/g, 'font-semibold text-cpuNavy'); // For total column
  content = content.replace(/font-bold text-cpuNavy/g, 'font-medium text-gray-900'); // For month label
  
  // Edit button
  content = content.replace(/bg-gray-100 hover:bg-gray-200 text-cpuNavy font-bold text-xs py-1.5 px-3 rounded-lg transition-colors/g, 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs py-2 px-4 rounded-md transition-colors');
  content = content.replace(/bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs py-1.5 px-3 rounded-lg transition-colors/g, 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs py-2 px-4 rounded-md transition-colors');

  // Modal styling (softer backdrop, cleaner card)
  content = content.replace(/bg-black\/50 backdrop-blur-sm flex/g, 'bg-gray-900/40 backdrop-blur-sm flex');
  content = content.replace(/shadow-2xl w-full max-w-md p-6 border-t-4 border-cpuGold/g, 'shadow-2xl w-full max-w-md p-8 border border-gray-100');
  
  // Titles and Tabs
  content = content.replace(/text-3xl font-extrabold text-cpuNavy/g, 'text-2xl font-bold text-gray-900 tracking-tight');
  content = content.replace(/text-xl font-extrabold text-cpuNavy/g, 'text-lg font-bold text-gray-900');
  content = content.replace(/font-extrabold text-cpuNavy mb-1/g, 'font-bold text-gray-900 mb-2');

  // Tab buttons
  content = content.replace(/bg-cpuNavy text-white shadow border border-cpuGold/g, 'bg-cpuNavy text-white shadow-sm font-medium');
  content = content.replace(/bg-white text-cpuNavy border-2 border-gray-200 hover:border-cpuGold/g, 'bg-white text-gray-600 border border-transparent hover:text-cpuNavy font-medium opacity-80 hover:opacity-100');
  content = content.replace(/py-2 px-5 rounded-xl font-bold text-sm transition-all/g, 'py-2 px-5 rounded-lg text-sm transition-all');

  // Card wrapper for table
  content = content.replace(/className="card overflow-x-auto"/g, 'className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto p-1"');

  // Remove `text-center font-extrabold text-cpuNavy` from Th
  content = content.replace(/Th>Total<\/Th/g, 'Th>Total</Th'); 

  fs.writeFileSync(filePath, content);
};

polishDashboard('src/app/dashboard/page.tsx');
