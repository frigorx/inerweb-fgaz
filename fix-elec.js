const fs = require('fs');
let html = fs.readFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html','utf8');

// 1. Supprimer les champs s:'<svg...' des ELEC_SYMS
html = html.replace(/,s:'<svg[^']*>(?:[^']*)<\/svg>'/g, '');

// 2. Remettre la grille HTML en elec-grid
html = html.replace(/class="sym-grid" id="elecGrid"/g, 'class="elec-grid" id="elecGrid"');

// 3. Remettre renderElec en mode texte (chercher et remplacer)
const renderElecRegex = /function renderElec\(\)\{[\s\S]*?\n\}/;
const newRenderElec = `function renderElec(){
  const filtered=elecCatFilter==='all'?ELEC_SYMS:ELEC_SYMS.filter(s=>s.c===elecCatFilter);
  document.getElementById('elecGrid').innerHTML=filtered.map(s=>
    '<div class="elec-card"><div class="ename">'+s.n+'</div><div class="edesc">'+s.d+'</div><div class="ecat">'+(ELEC_CATS[s.c]||s.c)+'</div></div>'
  ).join('');
}`;
html = html.replace(renderElecRegex, newRenderElec);

// 4. Supprimer showElecModal
html = html.replace(/function showElecModal\([^)]*\)\{[^}]*\}/g, '');

// Vérifier
const svgInElec = (html.match(/id:'e_.*?s:'<svg/g) || []).length;
console.log('SVG restants dans ELEC_SYMS:', svgInElec);
console.log('Taille:', (html.length/1024).toFixed(0), 'Ko');

fs.writeFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html', html, 'utf8');
console.log('OK');
