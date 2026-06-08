const fs = require('fs');
const path = require('path');

const dirs = ['src/components', 'src/pages'];

const replacements = [
  { regex: /rgba\(15,\s*23,\s*42,\s*[0-9.]+\)/g, replacement: 'var(--bg-card)' },
  { regex: /rgba\(30,\s*41,\s*59,\s*[0-9.]+\)/g, replacement: 'var(--glass-bg)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.0[0-9]+\)/g, replacement: 'var(--glass-border)' },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.1[0-9]*\)/g, replacement: 'var(--glass-border)' },
  { regex: /color:\s*'#94a3b8'/g, replacement: "color: 'var(--text-dim)'" },
  { regex: /color:\s*'white'/g, replacement: "color: 'var(--text-main)'" },
  { regex: /color:\s*'#fff'/g, replacement: "color: 'var(--text-main)'" },
  { regex: /color:\s*'#f1f5f9'/g, replacement: "color: 'var(--text-main)'" }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const rule of replacements) {
        if (rule.regex.test(content)) {
          content = content.replace(rule.regex, rule.replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
console.log('Done replacing colors.');
