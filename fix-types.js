const fs = require('fs');
const glob = require('glob'); // use standard node techniques if glob is not present

const { execSync } = require('child_process');
const files = execSync('find src -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // replace .map((x) => with .map((x: any) =>
  content = content.replace(/\.map\(\(([a-zA-Z0-9_]+)\) =>/g, '.map((arg$1: any) =>');
  
  // replace .map(x => with .map((x: any) =>
  content = content.replace(/\.map\(([a-zA-Z0-9_]+) =>/g, '.map((arg$1: any) =>');

  // Fix the temporary 'arg$1' back to the actual variable name
  content = content.replace(/\(arg([a-zA-Z0-9_]+): any\)/g, '($1: any)');

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
