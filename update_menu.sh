#!/bin/bash
sed -i 's/className="glass-panel animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black\/40 origin-top-right"/className="animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black\/40 origin-top-right bg-surface-container\/40 backdrop-blur-3xl border border-white\/10"/g' src/components/layout/TopNavBar.tsx

# Also adding some styling to make buttons "alive" - using some simple background transitions
sed -i 's/hover:bg-white\/5 transition-colors duration-150"/hover:bg-gradient-to-r hover:from-white\/10 hover:to-transparent hover:text-white transition-all duration-300"/g' src/components/layout/TopNavBar.tsx
