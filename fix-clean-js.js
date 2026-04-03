const fs = require('fs');
let html = fs.readFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html','utf8');

// Extraire le 3ème script (le moteur JS)
const allScripts = [];
let pos = 0;
while(true) {
  const i = html.indexOf('<script', pos);
  if(i === -1) break;
  const tagEnd = html.indexOf('>', i);
  const contentStart = tagEnd + 1;
  const contentEnd = html.indexOf('</script>', contentStart);
  const tag = html.substring(i, tagEnd + 1);
  allScripts.push({tag, start: i, contentStart, contentEnd, endTag: contentEnd + 9});
  pos = contentEnd + 1;
}

console.log('Scripts trouvés:', allScripts.length);
const engineScript = allScripts[2]; // Le 3ème script = moteur JS
let js = html.substring(engineScript.contentStart, engineScript.contentEnd);
const jsLines = js.split('\n');
console.log('Lignes JS avant nettoyage:', jsLines.length);

// Trouver le bloc ELECTRICAL et tout supprimer jusqu'à la prochaine section valide
const elecStart = jsLines.findIndex(l => l.includes('ELECTRICAL'));
if(elecStart > -1) {
  // Chercher la prochaine section === qui n'est pas ELECTRICAL
  let elecEnd = elecStart;
  for(let i = elecStart + 3; i < jsLines.length; i++) {
    const line = jsLines[i].trim();
    if(line.startsWith('// ====') && i+1 < jsLines.length) {
      const nextLine = jsLines[i+1].trim();
      if(nextLine.includes('STATS') || nextLine.includes('UTILS') || nextLine.includes('CALCUL') || nextLine.includes('RESOURCE') || nextLine.includes('buildStats')) {
        elecEnd = i;
        break;
      }
    }
  }
  console.log('Bloc ELECTRICAL: lignes', elecStart+1, 'à', elecEnd);
  jsLines.splice(elecStart, elecEnd - elecStart);
  console.log('Lignes après suppression bloc:', jsLines.length);
}

// Nettoyer les lignes orphelines restantes
const cleanLines = jsLines.filter(line => {
  const t = line.trim();
  // Lignes vides OK
  if(t === '' || t.startsWith('//')) return true;
  // Supprimer les fragments orphelins électro
  if(t.includes('ELEC_SYMS') || t.includes('ELEC_CATS') || t.includes('elecCatFilter')) return false;
  if(t.includes('elec-quiz') || t.includes('elec-results')) return false;
  if(t.includes('elecFilter') || t.includes('buildElecCatalogue') || t.includes('renderElec')) return false;
  if(t.match(/^\s*eq\.\w/) || t.includes('eq.questions') || t.includes('eq.idx')) return false;
  if(t.includes('eqNum') || t.includes('eqPbar') || t.includes('eqGood') || t.includes('eqBad')) return false;
  if(t.includes('eqFb') || t.includes('eqNext') || t.includes('eqArea')) return false;
  if(t.includes('answerEQ') || t.includes('renderEQ') || t.includes('startElecQuiz') || t.includes('hideElecQuiz')) return false;
  if(t.includes('showEQResults') || t.includes('eqNextQ') || t.includes('showElecModal')) return false;
  return true;
});

console.log('Lignes après nettoyage orphelins:', cleanLines.length);

// Vérifier les accolades
let depth = 0;
const finalLines = [];
for(let i = 0; i < cleanLines.length; i++) {
  const line = cleanLines[i];
  let lineDepthChange = 0;
  for(const c of line) {
    if(c === '{') lineDepthChange++;
    if(c === '}') lineDepthChange--;
  }
  const newDepth = depth + lineDepthChange;
  if(newDepth < 0) {
    console.log('Accolade orpheline ligne', i+1, '- supprimée:', line.trim().substring(0, 60));
    depth = 0; // Reset
    continue; // Skip this line
  }
  depth = newDepth;
  finalLines.push(line);
}
console.log('Profondeur finale accolades:', depth);
console.log('Lignes finales:', finalLines.length);

// Tester la syntaxe
const finalJs = finalLines.join('\n');
try {
  new Function(finalJs);
  console.log('✅ Syntaxe JS OK !');
} catch(e) {
  console.log('❌ Erreur:', e.message);
}

// Remplacer dans le HTML
html = html.substring(0, engineScript.contentStart) + '\n' + finalJs + '\n' + html.substring(engineScript.contentEnd);

console.log('Taille finale:', (html.length/1024).toFixed(0), 'Ko');
fs.writeFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html', html, 'utf8');
console.log('OK');
