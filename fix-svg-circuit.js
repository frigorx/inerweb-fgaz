const fs = require('fs');
let html = fs.readFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html','utf8');

// Lire le vrai SVG Inkscape du circuit frigo
let svgContent = fs.readFileSync('C:/Users/henni/OneDrive/Bureau/cycle frigo croixpng.svg','utf8');

// Nettoyer le SVG pour l'intégration inline
// Supprimer le prologue XML
svgContent = svgContent.replace(/<\?xml[^?]*\?>\s*/g, '');
// Supprimer les commentaires
svgContent = svgContent.replace(/<!--[\s\S]*?-->\s*/g, '');
// Ajouter width="100%" et limiter la hauteur pour s'intégrer dans la fiche
svgContent = svgContent.replace(/<svg/, '<svg style="max-width:100%;height:auto;max-height:400px"');
// Supprimer les dimensions fixes width/height qui pourraient casser le layout
svgContent = svgContent.replace(/\s+width="1893"/, '');
svgContent = svgContent.replace(/\s+height="1371"/, '');

// Trouver et remplacer le SVG généré du circuit frigo (dans la fiche circuit)
// Le SVG généré commence par <svg width="100%" height="340" viewBox="0 0 600 340">
// et finit par </svg> suivi du div de fermeture
const oldSvgPattern = /<svg width="100%" height="340" viewBox="0 0 600 340">[\s\S]*?<\/svg>/;
const match = html.match(oldSvgPattern);
if(match) {
  html = html.replace(oldSvgPattern, svgContent);
  console.log('SVG circuit frigo remplacé par le vrai SVG Inkscape');
} else {
  console.log('ATTENTION: SVG circuit frigo non trouvé dans le fichier');
}

// Vérifier
console.log('Taille:', (html.length/1024).toFixed(0), 'Ko');
console.log('Contient viewBox="0 0 1893 1371":', html.includes('viewBox="0 0 1893 1371"'));

fs.writeFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html', html, 'utf8');
console.log('OK');
