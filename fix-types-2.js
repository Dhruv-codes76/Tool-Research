const fs = require('fs');
const files = ['src/app/privacy/page.tsx', 'src/app/terms/page.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // replace .map((item, i) => with .map((item: any, i: number) =>
  content = content.replace(/\.map\(\(([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\) =>/g, '.map(($1: any, $2: number) =>');

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
