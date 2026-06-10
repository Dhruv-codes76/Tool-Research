const fs = require('fs');
const content = fs.readFileSync('src/components/layout/TopNavBar.tsx', 'utf8');

let newContent = content.replace(
  'className="animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 origin-top-right bg-surface-container/40 backdrop-blur-3xl border border-white/10"',
  'className="animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 origin-top-right bg-surface-container/60 backdrop-blur-3xl border border-white/10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"'
);

newContent = newContent.replace(
  /className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-gradient-to-r hover:from-white\/10 hover:to-transparent hover:text-white transition-all duration-300"/g,
  'className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100"'
);

fs.writeFileSync('src/components/layout/TopNavBar.tsx', newContent);
