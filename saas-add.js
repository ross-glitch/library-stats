const fs = require('fs');
let file = 'src/app/add-entry/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

c = c.replace(/text-3xl font-extrabold text-cpuNavy/g, 'text-2xl font-bold text-gray-900 tracking-tight');
c = c.replace(/text-cpuGoldDark font-semibold mt-1/g, 'text-gray-500 font-medium mt-1');
c = c.replace(/border-t-2 border-dashed border-gray-200 pt-2/g, 'border-t border-gray-100 pt-6 mt-2');
c = c.replace(/text-xs font-bold text-cpuGold uppercase tracking-wide mb-4/g, 'text-xs font-bold text-cpuNavy uppercase tracking-wider mb-5');
c = c.replace(/bg-gray-50 rounded-xl p-4 border-2 border-gray-200/g, 'bg-blue-50/50 rounded-xl p-5 border border-blue-100');
c = c.replace(/<span className="text-2xl w-8 text-center flex-shrink-0">\{field.emoji\}<\/span>/g, '<div className="w-2 h-2 rounded-full bg-cpuGold flex-shrink-0 mr-3"></div>');

fs.writeFileSync(file, c);
