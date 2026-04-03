const fs = require('fs');
let html = fs.readFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html','utf8');

// ═══════════════════════════════════════════════════
// 1. INTÉGRER LE COLLECTEUR UNIVERSEL DANS LE JS
// ═══════════════════════════════════════════════════

// Ajouter le collecteur juste après le chargement des données (après updateTopbar())
const collecteurCode = `
// ============================================================
// COLLECTEUR UNIVERSEL inerWeb — envoi résultats Google Sheet
// ============================================================
const INERWEB_SHEET_URL='https://script.google.com/macros/s/AKfycbz5Bkn1tacs98bJezjnnYt38Yuy6QiHh7qWuEk1KRxS4UMIjl0yFOA0FVakLwCAJhZ5/exec';
const INERWEB_STORAGE_KEY='inerweb-results';

function inerwebSend(data){
  data.timestamp=data.timestamp||new Date().toISOString();
  if(data.note20==null&&data.score!=null) data.note20=Math.round(data.score/100*20*2)/2;
  // Toujours sauvegarder en local
  try{const r=JSON.parse(localStorage.getItem(INERWEB_STORAGE_KEY)||'[]');r.push(data);localStorage.setItem(INERWEB_STORAGE_KEY,JSON.stringify(r))}catch(e){}
  // Envoyer au Sheet
  return fetch(INERWEB_SHEET_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(()=>{console.log('[inerWeb] Résultat envoyé');return{status:'sent'}})
    .catch(err=>{console.warn('[inerWeb] Envoi échoué, sauvegardé localement',err);return{status:'local_only'}});
}

// Demander nom/prénom/classe si pas déjà fait
function getEleve(){
  let e=JSON.parse(localStorage.getItem('fgaz_eleve')||'null');
  if(!e){
    const nom=prompt('Votre NOM :');if(!nom)return null;
    const prenom=prompt('Votre PRÉNOM :');if(!prenom)return null;
    const classe=prompt('Votre CLASSE (ex: 2TNE) :');if(!classe)return null;
    e={nom:nom.trim().toUpperCase(),prenom:prenom.trim(),classe:classe.trim().toUpperCase()};
    localStorage.setItem('fgaz_eleve',JSON.stringify(e));
    // Afficher le badge utilisateur
    document.getElementById('userName').textContent=e.prenom;
    document.getElementById('userBadge').style.display='';
  }
  return e;
}

// Envoyer résultat quiz/évaluation
function sendFgazResult(type,zone,score,total,pct){
  const eleve=getEleve();
  if(!eleve)return;
  const zoneName=(CONFIG.zones||CONFIG.chapitres||{})[zone]||zone;
  inerwebSend({
    module:'F-GAZ V6 — '+type,
    nom:eleve.nom,
    prenom:eleve.prenom,
    classe:eleve.classe,
    note20:Math.round(pct/100*20*2)/2,
    score:pct,
    detail:score+'/'+total+' ('+zoneName+')'
  });
}
`;

// Insérer après updateTopbar();
html = html.replace('updateTopbar();\n', 'updateTopbar();\n' + collecteurCode + '\n');

// ═══════════════════════════════════════════════════
// 2. BRANCHER L'ENVOI À LA FIN DES QUIZ ET ÉVALUATIONS
// ═══════════════════════════════════════════════════

// Dans showQResults() — après que les résultats soient affichés
// Chercher la fin de showQResults et ajouter l'envoi
html = html.replace(
  /function showQResults\(\)\{[\s\S]*?quiz\.boucleMode=false;/,
  function(match) {
    return match + '\n  const _t=quiz.questions.length,_pct=Math.round(quiz.good/_t*100);sendFgazResult("Quiz",quiz.zone,quiz.good,_t,_pct);';
  }
);

// Dans showEResults() — après que les résultats d'évaluation soient affichés
html = html.replace(
  /function showEResults\(\)\{[\s\S]*?document\.getElementById\('evalPlay'\)\.style\.display='none';/,
  function(match) {
    return match + '\n  const _te=evl.questions.length,_pcte=Math.round(evl.good/_te*100);sendFgazResult("Évaluation","all",evl.good,_te,_pcte);';
  }
);

// ═══════════════════════════════════════════════════
// 3. INITIALISER L'AFFICHAGE DU NOM ÉLÈVE AU CHARGEMENT
// ═══════════════════════════════════════════════════

// Ajouter au chargement initial (après buildGlossaire();renderLB();)
html = html.replace(
  'buildGlossaire();renderLB();',
  `buildGlossaire();renderLB();
// Afficher nom élève si déjà enregistré
(function(){const e=JSON.parse(localStorage.getItem('fgaz_eleve')||'null');if(e){document.getElementById('userName').textContent=e.prenom;document.getElementById('userBadge').style.display=''}})();`
);

// Vérification
console.log('Contient inerwebSend:', html.includes('inerwebSend'));
console.log('Contient sendFgazResult:', html.includes('sendFgazResult'));
console.log('Contient SHEET_URL:', html.includes('AKfycbz5Bkn1tacs98bJezjnnYt38Yuy6QiHh7qWuEk1KRxS4UMIjl0yFOA0FVakLwCAJhZ5'));
console.log('Taille:', (html.length/1024).toFixed(0), 'Ko');

fs.writeFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html', html, 'utf8');
console.log('OK — Collecteur universel intégré');
