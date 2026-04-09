const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const htmlFile = path.join(__dirname, 'index.html');

const replacements = [
  // Backgrounds
  [/bg-\[#0[aA]0[aA]0[fF]\]/g, 'bg-[#faf9f6]'],
  [/bg-\[#050508\]/g, 'bg-[#faf9f6]'],
  [/bg-\[#14141[fF]\]/g, 'bg-white'],
  [/bg-\[#1[aA]1[aA]2[eE]\]/g, 'bg-white'],
  [/bg-\[#0[dD]0[dD]12\]/g, 'bg-white'],
  [/bg-black\/30/g, 'bg-[#faf9f6]'],
  [/bg-black\/80/g, 'bg-[#faf9f6]/90'],
  
  // Translucents / Subtles
  [/bg-white\/\[0\.02\]/g, 'bg-[#f5f2ed]'],
  [/bg-white\/\[0\.03\]/g, 'bg-[#f5f2ed]'],
  [/bg-white\/\[0\.04\]/g, 'bg-[#f5f2ed]'],
  [/bg-white\/\[0\.06\]/g, 'bg-[#f5f2ed]'],
  [/bg-white\/\[0\.08\]/g, 'bg-[#f5f2ed]'],
  
  // Text
  [/\btext-white\b/g, 'text-[#333333]'],
  [/text-\[#a0a0b0\]/g, 'text-[#666666]'],
  // Make sure not to replace text-[#666] if we just leave it or change it to #888, let's leave #666/#888 as is for now since they look okay on light background too.
  
  // Borders
  [/border-\[#2[aA]2[aA]3[eE]\]/g, 'border-[#eae5df]'],
  [/border-white\/\[0\.06\]/g, 'border-[#eae5df]'],
  [/border-white\/\[0\.08\]/g, 'border-[#eae5df]'],
  [/border-\[#3[aA]3[aA]4[eE]\]/g, 'border-[#d0c9c0]'],
  
  // Gradients
  [/from-\[#[aA]78[bB][fF][aA]\]/g, 'from-[#e4d7c5]'],
  [/to-\[#7[cC]3[aA][eE][dD]\]/g, 'to-[#cba77d]'],
  [/from-\[#00[fF][fF]88\]/g, 'from-[#e4d7c5]'],
  [/to-\[#00[dD]4[fF][fF]\]/g, 'to-[#cba77d]'],
  [/from-\[#00[dD]4[fF][fF]\]\/10/g, 'from-[#cba77d]/10'],
  [/to-\[#[aA]78[bB][fF][aA]\]\/10/g, 'to-[#e4d7c5]/10'],
  
  // Accent texts
  [/text-\[#[aA]78[bB][fF][aA]\]/g, 'text-[#b0916a]'],
  [/text-\[#00[dD]4[fF][fF]\]/g, 'text-[#b0916a]'],
  [/text-\[#00[fF][fF]88\]/g, 'text-[#b0916a]'],
  [/text-\[#fbbf24\]/g, 'text-[#cba77d]'], // yellow
  [/text-\[#ff6b6b\]/g, 'text-[#e08b8b]'], // red
  
  // Accent Backgrounds/Borders (e.g. for badges)
  [/bg-\[#[aA]78[bB][fF][aA]\]\/10/g, 'bg-[#cba77d]/10'],
  [/bg-\[#00[dD]4[fF][fF]\]\/10/g, 'bg-[#cba77d]/10'],
  [/bg-\[#00[fF][fF]88\]\/10/g, 'bg-[#cba77d]/10'],
  [/bg-\[#00[dD]4[fF][fF]\]\/15/g, 'bg-[#cba77d]/15'],
  [/bg-\[#00[dD]4[fF][fF]\]\/5/g, 'bg-[#cba77d]/5'],
  
  [/bg-\[#[aA]78[bB][fF][aA]\]\/20/g, 'bg-[#cba77d]/20'],
  [/bg-\[#[aA]78[bB][fF][aA]\]\/30/g, 'bg-[#cba77d]/30'],
  [/bg-\[#00[fF][fF]88\]\/5/g, 'bg-[#cba77d]/5'],
  
  [/border-\[#[aA]78[bB][fF][aA]\]\/20/g, 'border-[#cba77d]/30'],
  [/border-\[#00[dD]4[fF][fF]\]\/20/g, 'border-[#cba77d]/30'],
  [/border-\[#00[fF][fF]88\]\/20/g, 'border-[#cba77d]/30'],
  [/border-\[#00[dD]4[fF][fF]\]\/40/g, 'border-[#cba77d]/50'],
  [/border-\[#[aA]78[bB][fF][aA]\]\/40/g, 'border-[#cba77d]/50'],
  [/border-\[#[aA]78[bB][fF][aA]\]\/30/g, 'border-[#cba77d]/40'],
  [/border-\[#fbbf24\]\/50/g, 'border-[#cba77d]/50'],
  [/border-\[#[aA]78[bB][fF][aA]\]/g, 'border-[#cba77d]'],
  
  [/hover:border-\[#00[dD]4[fF][fF]\]\/30/g, 'hover:border-[#cba77d]/40'],
  [/hover:border-\[#00[dD]4[fF][fF]\]\/40/g, 'hover:border-[#cba77d]/50'],
  [/hover:border-\[#00[dD]4[fF][fF]\]\/20/g, 'hover:border-[#cba77d]/30'],
  [/hover:border-\[#[aA]78[bB][fF][aA]\]\/30/g, 'hover:border-[#cba77d]/40'],
  [/hover:border-\[#[aA]78[bB][fF][aA]\]/g, 'hover:border-[#cba77d]'],
  
  [/hover:bg-\[#00[dD]4[fF][fF]\]\/15/g, 'hover:bg-[#cba77d]/15'],
  [/hover:bg-\[#00[dD]4[fF][fF]\]\/5/g, 'hover:bg-[#cba77d]/5'],
  [/hover:bg-\[#00[fF][fF]88\]\/10/g, 'hover:bg-[#cba77d]/10'],
  [/hover:bg-\[#00[fF][fF]88\]\/5/g, 'hover:bg-[#cba77d]/5'],
  [/hover:bg-\[#[aA]78[bB][fF][aA]\]\/5/g, 'hover:bg-[#cba77d]/5'],
  [/hover:bg-\[#[aA]78[bB][fF][aA]\]\/10/g, 'hover:bg-[#cba77d]/10'],
  
  // Shadows
  [/shadow-cyan-500\/10/g, 'shadow-[#b0916a]/10'],
  [/shadow-cyan-500\/20/g, 'shadow-[#b0916a]/20'],
  [/shadow-purple-500\/20/g, 'shadow-[#b0916a]/20'],
  [/shadow-purple-500\/30/g, 'shadow-[#b0916a]/30'],
  [/shadow-green-500\/20/g, 'shadow-[#b0916a]/20'],
  [/shadow-green-500\/40/g, 'shadow-[#b0916a]/30'],
  
  // Specific buttons / active states
  [/bg-\[#[aA]78[bB][fF][aA]\] text-white/g, 'bg-[#cba77d] text-white'],
  [/bg-\[#00[fF][fF]88\] text-white/g, 'bg-[#cba77d] text-white'],
  [/bg-\[#00[fF][fF]88\] text-black/g, 'bg-[#cba77d] text-white'],
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

processDirectory(srcDir);
processFile(htmlFile);

