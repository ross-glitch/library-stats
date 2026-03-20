const fs = require('fs');

const replaceEmojisAndColors = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Emojis
  const emojis = ['📊', '📥', '➕', '✏️', '👤', '🌟', '📖', '🆕', '🔍', '🇵🇭', '🔄', '📅', '📋', '📭', '⏳', '💾', '✅', '⚠️'];
  emojis.forEach(e => {
    content = content.replaceAll(e + ' ', ''); 
    content = content.replaceAll(' ' + e, '');
    content = content.replaceAll(e, '');       
  });

  // Colors
  content = content.replaceAll('bg-amber-50/50', 'bg-gray-100/50');
  content = content.replaceAll('border-amber-50', 'border-gray-100');
  content = content.replaceAll('bg-amber-50', 'bg-gray-50');
  content = content.replaceAll('text-amber-900', 'text-cpuNavy');
  content = content.replaceAll('text-amber-800', 'text-cpuNavy');
  content = content.replaceAll('text-amber-700', 'text-cpuNavy');
  content = content.replaceAll('text-amber-600', 'text-cpuGoldDark');
  content = content.replaceAll('text-amber-500', 'text-cpuGold');
  content = content.replaceAll('text-amber-400', 'text-cpuGold');
  content = content.replaceAll('bg-amber-100', 'bg-gray-100');
  content = content.replaceAll('bg-amber-200', 'bg-gray-200');
  content = content.replaceAll('border-amber-100', 'border-gray-200');
  content = content.replaceAll('border-amber-200', 'border-gray-200');
  content = content.replaceAll('bg-amber-700', 'bg-cpuNavy');
  content = content.replaceAll('border-amber-400', 'border-cpuGold');

  fs.writeFileSync(filePath, content);
};

['src/app/dashboard/page.tsx', 'src/app/add-entry/page.tsx'].forEach(replaceEmojisAndColors);

// Also fix CATEGORIES in types/index.ts
let typesContent = fs.readFileSync('src/types/index.ts', 'utf-8');
typesContent = typesContent.replace(/color: 'bg-[a-z]+-100 text-[a-z]+-800'/g, "color: 'bg-cpuNavy text-white border border-cpuGold/30'");
fs.writeFileSync('src/types/index.ts', typesContent);
