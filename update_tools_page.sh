#!/bin/bash
sed -i 's/className="flex flex-wrap items-center gap-3 mb-4"/className="flex flex-wrap items-center gap-3 mb-4 absolute top-6 right-6"/g' src/app/tools/\[id\]/page.tsx
sed -i 's/style={{ ...glassStyle, ...stellarGlowStyle }}/style={{ ...glassStyle, ...stellarGlowStyle, backgroundColor: "rgba(10, 10, 15, 0.7)" }}/g' src/app/tools/\[id\]/page.tsx
sed -i 's/style={glassStyle}/style={{ ...glassStyle, backgroundColor: "rgba(10, 10, 15, 0.7)" }}/g' src/app/tools/\[id\]/page.tsx
