const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Lineas que solo contienen comentarios JSX
  content = content.replace(/^[ \t]*\{\/\*[\s\S]*?\*\/\}[ \t]*\r?\n/gm, '');
  // 2. Comentarios JSX inline
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  
  // 3. Lineas que solo contienen block comments
  content = content.replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\r?\n/gm, '');
  // 4. Block comments inline
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 5. Lineas que solo contienen single line comments //
  content = content.replace(/^[ \t]*\/\/.*?\r?\n/gm, '');
  
  // 6. Limpiar lineas en blanco multiples (dejar maximo 1 vacia)
  content = content.replace(/(\r?\n){3,}/g, '\n\n');
  
  fs.writeFileSync(file, content);
});

console.log('Comentarios eliminados en ' + files.length + ' archivos.');
