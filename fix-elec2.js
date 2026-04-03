const fs = require('fs');
let html = fs.readFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html','utf8');

// 1. Supprimer l'onglet Électro des tabs
html = html.replace(/<button class="tab" data-s="elec">⚡ Électro<\/button>/g, '');

// 2. Supprimer le screen s-elec (trouver le bloc complet)
if(html.includes('id="s-elec"')) {
  const marker = '<div class="scr" id="s-elec">';
  const start = html.indexOf(marker);
  if(start > -1) {
    // Compter les div ouvertes/fermées pour trouver la fin
    let depth = 0;
    let i = start;
    for(; i < html.length; i++) {
      if(html.substr(i, 4) === '<div') depth++;
      if(html.substr(i, 6) === '</div>') {
        depth--;
        if(depth === 0) { i += 6; break; }
      }
    }
    html = html.substring(0, start) + html.substring(i);
    console.log('Section s-elec supprimée');
  }
}

// 3. Supprimer le raccourci Électro du dashboard
const elecDashPattern = /\s*<div style="text-align:center;cursor:pointer" onclick="go\('elec'\)">\s*<div[^>]*>⚡<\/div>\s*<div[^>]*>[^<]*Électro[^<]*<\/div>\s*<div[^>]*>[^<]*<\/div>\s*<\/div>/g;
html = html.replace(elecDashPattern, '');

// 4. Supprimer ELEC_SYMS, ELEC_CATS et variables
html = html.replace(/const ELEC_SYMS=\[[\s\S]*?\];\n?/m, '');
html = html.replace(/const ELEC_CATS=\{[^}]*\};\n?/g, '');
html = html.replace(/let elecCatFilter='all';\n?/g, '');
html = html.replace(/let eq=\{[^}]*\};\n?/g, '');

// 5. Supprimer les fonctions électro
const funcNames = ['buildElecCatalogue','elecFilter','renderElec','startElecQuiz','hideElecQuiz','renderEQ','answerEQ','eqNextQ','showEQResults','showElecModal'];
funcNames.forEach(fn => {
  // Supprimer function simple (une ligne)
  const simpleRe = new RegExp('function ' + fn + '\\([^)]*\\)\\{[^}]*\\}\\n?', 'g');
  html = html.replace(simpleRe, '');
});
// Supprimer les fonctions multi-lignes restantes
funcNames.forEach(fn => {
  const idx = html.indexOf('function ' + fn + '(');
  if(idx > -1) {
    let depth = 0;
    let i = html.indexOf('{', idx);
    let end = i;
    for(; end < html.length; end++) {
      if(html[end] === '{') depth++;
      if(html[end] === '}') { depth--; if(depth === 0) { end++; break; } }
    }
    html = html.substring(0, idx) + html.substring(end);
    console.log('Supprimé:', fn);
  }
});

// 6. Supprimer l'appel buildElecCatalogue dans go()
html = html.replace(/if\(id==='elec'\)buildElecCatalogue\(\);?\n?/g, '');

// 7. Ajouter 15 questions B0V au chapitre 12
const jsonMatch = html.match(/<script id="questionsData" type="application\/json">([\s\S]*?)<\/script>/);
if(jsonMatch) {
  const data = JSON.parse(jsonMatch[1]);

  const b0vQuestions = [
    {id:2001,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Que signifie l'habilitation B0V ?",propositions:["Exécutant non-électricien pouvant travailler au voisinage BT","Chargé de travaux haute tension","Responsable d'installation électrique","Technicien de maintenance électrique"],reponse:0,remediation:"B0V = habilitation pour personnel non-électricien (B0) pouvant travailler au voisinage (V) d'installations basse tension. C'est le niveau minimal pour un frigoriste intervenant près d'équipements électriques.",aide:"B = Basse tension, 0 = non-électricien, V = voisinage",niveau:"initiation"},
    {id:2002,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelle est la tension limite du domaine Basse Tension (BT) en courant alternatif ?",propositions:["1000 V","400 V","230 V","500 V"],reponse:0,remediation:"En courant alternatif, la Basse Tension va de 50 V à 1000 V (norme NF C 18-510). Au-delà de 1000 V AC, on entre dans le domaine Haute Tension (HTA/HTB).",aide:"3 domaines : TBT < 50 V, BT 50-1000 V, HT > 1000 V",niveau:"initiation"},
    {id:2003,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Qui délivre l'habilitation électrique ?",propositions:["L'employeur","L'organisme de formation","L'inspection du travail","Le fabricant du matériel"],reponse:0,remediation:"L'habilitation électrique est délivrée par l'EMPLOYEUR, sur la base d'une formation préalable. L'organisme de formation délivre une attestation de formation, mais c'est l'employeur qui habilite.",aide:"L'habilitation n'est pas un diplôme, c'est une reconnaissance par l'employeur",niveau:"initiation"},
    {id:2004,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelle est la distance limite de voisinage simple (DLVS) en basse tension ?",propositions:["3 mètres","0,30 mètre","1 mètre","5 mètres"],reponse:0,remediation:"La DLVS en BT est de 3 mètres. En deçà de cette distance, le personnel doit être habilité (au minimum B0V). La distance limite d'approche prudente (DLAP) est de 0,30 m en BT.",aide:"DLVS = zone 1 (voisinage simple), DLAP = zone 4 (voisinage renforcé)",niveau:"pratique"},
    {id:2005,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"En tant que titulaire B0V, avez-vous le droit d'ouvrir un coffret électrique sous tension ?",propositions:["Non, jamais","Oui, avec des gants isolants","Oui, si le disjoncteur est coupé","Oui, pour un simple contrôle visuel"],reponse:0,remediation:"Un B0V n'a JAMAIS le droit d'ouvrir un coffret électrique, même pour un contrôle visuel. L'ouverture d'une enveloppe de matériel électrique nécessite au minimum une habilitation BS ou BE Vérification.",aide:"B0V = NON-électricien, il ne peut PAS intervenir sur le matériel électrique",niveau:"initiation"},
    {id:2006,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quel est le premier geste face à une personne électrisée encore en contact avec un conducteur ?",propositions:["Couper l'alimentation électrique","Tirer la personne par les vêtements","Appeler les secours","Arroser la victime d'eau"],reponse:0,remediation:"Le PREMIER geste est de COUPER l'alimentation (disjoncteur, prise). Ne jamais toucher la victime tant qu'elle est en contact. Ensuite : protéger, alerter (15/18/112), secourir.",aide:"P.A.S. = Protéger (couper le courant), Alerter, Secourir",niveau:"initiation"},
    {id:2007,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quel courant traversant le corps est considéré comme potentiellement mortel ?",propositions:["30 mA pendant plus de 30 ms","100 mA","1 A","10 mA"],reponse:0,remediation:"Un courant de 30 mA traversant le corps pendant plus de 30 ms peut provoquer une fibrillation cardiaque mortelle. C'est pourquoi les DDR sont réglés à 30 mA pour la protection des personnes.",aide:"30 mA / 30 ms = seuil des différentiels de protection",niveau:"initiation"},
    {id:2008,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelles sont les 4 étapes de la consignation électrique ?",propositions:["Séparer, condamner, vérifier absence de tension, mise à la terre","Couper, vérifier, travailler, remettre en service","Prévenir, couper, réparer, tester","Identifier, isoler, signaler, intervenir"],reponse:0,remediation:"La consignation comprend 4 étapes : 1) Séparation (coupure visible), 2) Condamnation (cadenas + pancarte), 3) VAT — Vérification d'Absence de Tension, 4) Mise à la terre et en court-circuit (MALT/CC). Un B0V ne réalise PAS la consignation.",aide:"Séparer → Condamner → VAT → MALT/CC",niveau:"pratique"},
    {id:2009,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelle est la durée de validité recommandée d'une habilitation électrique ?",propositions:["3 ans","1 an","5 ans","Illimitée"],reponse:0,remediation:"La norme NF C 18-510 recommande un recyclage tous les 3 ans. L'employeur peut décider d'une durée plus courte. L'habilitation peut aussi être suspendue à tout moment.",aide:"Recyclage préconisé par la norme NF C 18-510",niveau:"initiation"},
    {id:2010,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Que doit faire un frigoriste B0V avant d'intervenir sur un groupe frigo alimenté en 400V triphasé ?",propositions:["Demander la consignation à un chargé de consignation habilité BC","Couper le disjoncteur et commencer","Travailler avec des gants isolants","Vérifier la tension avec un multimètre"],reponse:0,remediation:"Un B0V ne peut PAS consigner lui-même. Il doit demander la consignation à une personne habilitée BC (chargé de consignation), qui effectue les 4 étapes et remet une attestation de consignation.",aide:"B0V = non-électricien, BC = chargé de consignation",niveau:"pratique"},
    {id:2011,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quels sont les effets du courant électrique sur le corps humain ?",propositions:["Brûlures, tétanisation musculaire, fibrillation cardiaque, arrêt respiratoire","Uniquement des brûlures","Uniquement un choc sans gravité","Engourdissement temporaire"],reponse:0,remediation:"Le courant provoque : brûlures (arc jusqu'à 3000°C), tétanisation musculaire (impossibilité de lâcher), fibrillation ventriculaire (cœur), arrêt respiratoire (diaphragme). Gravité selon intensité, durée et trajet.",aide:"4 effets : thermique, musculaire, cardiaque, respiratoire",niveau:"initiation"},
    {id:2012,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Que signifie le pictogramme triangle jaune avec un éclair noir ?",propositions:["Danger électrique — risque d'électrocution","Haute tension uniquement","Présence d'un transformateur","Zone de recharge"],reponse:0,remediation:"Triangle jaune + éclair noir = avertissement danger électrique (norme ISO 7010 - W012). Il signale la présence de pièces sous tension. Obligatoire sur tous les tableaux et coffrets électriques.",aide:"Triangle = avertissement, éclair = électricité",niveau:"initiation"},
    {id:2013,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelle est la différence entre électrisation et électrocution ?",propositions:["L'électrisation est le passage du courant dans le corps, l'électrocution est mortelle","Ce sont des synonymes","L'électrocution est bénigne","L'électrisation concerne le DC, l'électrocution l'AC"],reponse:0,remediation:"Électrisation = passage du courant à travers le corps (peut être bénin ou grave). Électrocution = électrisation MORTELLE (décès). Toute électrisation peut devenir une électrocution.",aide:"ÉlectroCUTION = exéCUTION par l'électricité",niveau:"initiation"},
    {id:2014,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Un frigoriste B0V peut-il réarmer un disjoncteur qui a déclenché ?",propositions:["Seulement si c'est prévu dans son titre d'habilitation","Oui, c'est une opération simple","Non, jamais en aucun cas","Oui, si le disjoncteur est accessible sans outil"],reponse:0,remediation:"Le réarmement d'un dispositif de protection est une manœuvre. Un B0V peut effectuer certaines manœuvres si c'est prévu dans son titre d'habilitation. Mais il faut d'abord identifier la CAUSE du déclenchement.",aide:"Tout dépend du titre d'habilitation délivré par l'employeur",niveau:"expertise"},
    {id:2015,zone:"ch12",categorie:"Habilitation Électrique B0V",question:"Quelle norme régit les opérations sur les installations électriques en France ?",propositions:["NF C 18-510","NF C 15-100","NF EN 378","NF C 14-100"],reponse:0,remediation:"La NF C 18-510 est la norme de référence pour les opérations sur les installations électriques et dans leur voisinage. La NF C 15-100 concerne la conception des installations, pas les interventions.",aide:"18-510 = opérations/interventions, 15-100 = conception/installation",niveau:"pratique"}
  ];

  data.questions = data.questions.concat(b0vQuestions);

  if(data.config.categories && data.config.categories.ch12) {
    if(!data.config.categories.ch12.includes('Habilitation Électrique B0V')) {
      data.config.categories.ch12.push('Habilitation Électrique B0V');
    }
  }

  const newJson = JSON.stringify(data);
  html = html.replace(/<script id="questionsData" type="application\/json">[\s\S]*?<\/script>/,
    '<script id="questionsData" type="application/json">' + newJson + '<\/script>');

  console.log('Questions totales:', data.questions.length);
}

// 8. Mettre à jour le badge du nombre de questions dans l'onglet Quiz
html = html.replace(/📝 Quiz <span class="tbadge">\d+<\/span>/, function() {
  const m = html.match(/<script id="questionsData" type="application\/json">([\s\S]*?)<\/script>/);
  if(m) {
    const d = JSON.parse(m[1]);
    return '📝 Quiz <span class="tbadge">' + d.questions.length + '</span>';
  }
  return '📝 Quiz <span class="tbadge">558</span>';
});

console.log('Taille finale:', (html.length/1024).toFixed(0), 'Ko');
fs.writeFileSync('C:/Users/henni/fgaz-v6-build/FGAZ-COMPLETE-V6.html', html, 'utf8');
console.log('OK');
