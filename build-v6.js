#!/usr/bin/env node
/**
 * FGAZ V6 Builder — Assemble le fichier FGAZ-COMPLETE-V6.html
 * Node.js script
 */
const fs = require('fs');
const path = require('path');

const BASE = 'C:/Users/henni';
const BUILD = path.join(BASE, 'fgaz-v6-build');
const OUT = path.join(BUILD, 'FGAZ-COMPLETE-V6.html');

// ===== LOAD SOURCE FILES =====
console.log('Chargement des fichiers sources...');

const questionsV5 = JSON.parse(fs.readFileSync(path.join(BASE, 'fgaz-v6-questions-uniques.json'), 'utf8'));
const configV5 = JSON.parse(fs.readFileSync(path.join(BASE, 'fgaz-v6-config.json'), 'utf8'));

// Images base64
const imgCircuitNum = fs.readFileSync(path.join(BASE, 'fgaz-img-circuit-numerote.b64'), 'utf8').trim();
const imgCircuitSym = fs.readFileSync(path.join(BASE, 'fgaz-img-circuit-symboles.b64'), 'utf8').trim();
const imgMollier = fs.readFileSync(path.join(BASE, 'fgaz-img-mollier.b64'), 'utf8').trim();

// SVG symbols data (from V5 line 830)
const v5html = fs.readFileSync(path.join(BASE, 'Downloads/FGAZ-COMPLETE-V5.html'), 'utf8');
const symMatch = v5html.match(/<script id="symbolsData" type="application\/json">([\s\S]*?)<\/script>/);
const symbolsJSON = symMatch ? symMatch[1] : '[]';

console.log(`Questions V5 chargées: ${questionsV5.length}`);

// ===== ZONE → CHAPTER MAPPING =====
const ZONE_TO_CH = {
  'zone1': 'ch1',   // Réglementation → split en ch1 (Environnement) + ch2 (Réglementation) + ch3 (Attestations)
  'zone2': 'ch4',   // Fluides → ch4
  'zone3': 'ch7',   // Manipulation → ch7
  'zone4': 'ch8',   // Contrôle → ch8 (Détection) + ch9 (Traçabilité)
  'zone5': 'ch10',  // Récupération → ch10
  'zone6': 'ch5',   // Technologie → ch5 (Cycle) + ch6 (Composants)
  'zone7': 'ch4',   // Fluides Techno → ch4
  'zone8': 'ch6',   // Circuit Huile → ch6
  'zone9': 'ch11',  // Fluides Naturels → ch11
  'zone10': 'ch12'  // Sécurité → ch12
};

// More granular mapping based on categories
function mapQuestion(q) {
  const zone = q.zone;
  const cat = (q.categorie || '').toLowerCase();

  if (zone === 'zone1') {
    if (cat.includes('environnement') || cat.includes('effet de serre')) return 'ch1';
    if (cat.includes('calcul') || cat.includes('tco2')) return 'ch1'; // tCO2e = concept environnemental
    if (cat.includes('seuil') || cat.includes('contrôle')) return 'ch8'; // seuils → contrôle/détection
    if (cat.includes('attestation') || cat.includes('habilit')) return 'ch3';
    if (cat.includes('sanction')) return 'ch2';
    if (cat.includes('interdiction')) return 'ch2';
    if (cat.includes('documentation') || cat.includes('registre') || cat.includes('maintenance')) return 'ch9';
    return 'ch2'; // Default: réglementation
  }
  if (zone === 'zone2' || zone === 'zone7') return 'ch4';
  if (zone === 'zone3') {
    if (cat.includes('epi') || cat.includes('sécurité')) return 'ch12';
    return 'ch7';
  }
  if (zone === 'zone4') {
    if (cat.includes('détection') || cat.includes('fuite')) return 'ch8';
    if (cat.includes('registre') || cat.includes('traçabilité') || cat.includes('fiche')) return 'ch9';
    return 'ch8';
  }
  if (zone === 'zone5') return 'ch10';
  if (zone === 'zone6') {
    if (cat.includes('accessoire')) return 'ch6';
    return 'ch5';
  }
  if (zone === 'zone8') return 'ch6';
  if (zone === 'zone9') return 'ch11';
  if (zone === 'zone10') return 'ch12';
  return ZONE_TO_CH[zone] || 'ch1';
}

// ===== REDISTRIBUTE EXISTING QUESTIONS =====
const chapterQuestions = {};
for (let i = 1; i <= 12; i++) chapterQuestions['ch' + i] = [];

questionsV5.forEach(q => {
  const ch = mapQuestion(q);
  const nq = { ...q, zone: ch };
  chapterQuestions[ch].push(nq);
});

console.log('Redistribution des questions existantes:');
for (let i = 1; i <= 12; i++) {
  console.log(`  ch${i}: ${chapterQuestions['ch'+i].length} questions`);
}

// ===== GENERATE NEW QUESTIONS =====
// We need ~50 per chapter, ~600 total
// Load the new questions from a generated file
const newQuestions = require('./new-questions-v6.js');

// Merge
let nextId = questionsV5.length + 1;
newQuestions.forEach(q => {
  q.id = nextId++;
  chapterQuestions[q.zone].push(q);
});

// Build final question array
const allQuestions = [];
for (let i = 1; i <= 12; i++) {
  chapterQuestions['ch'+i].forEach(q => allQuestions.push(q));
}

console.log(`\nTotal final: ${allQuestions.length} questions`);
for (let i = 1; i <= 12; i++) {
  console.log(`  ch${i}: ${chapterQuestions['ch'+i].length}`);
}

// ===== BUILD CONFIG =====
const newConfig = {
  mission: {
    titre: "Mission F-GAZ - Certification Fluides Frigorigènes",
    version: "6.0 - Édition Complète Enrichie",
    auteur: "inerWeb Édu - F. Henninot",
    contact: "inerweb.fr",
    date: "Avril 2026"
  },
  zones: {
    ch1: "Environnement & Effet de serre",
    ch2: "Réglementation européenne",
    ch3: "Attestations & Habilitations",
    ch4: "Les fluides frigorigènes",
    ch5: "Cycle frigorifique",
    ch6: "Composants & Accessoires",
    ch7: "Manipulation des fluides",
    ch8: "Contrôle & Détection de fuites",
    ch9: "Traçabilité & Documentation",
    ch10: "Récupération & Fin de vie",
    ch11: "Fluides naturels & A2L",
    ch12: "Sécurité des interventions"
  },
  categories: {
    ch1: ["Effet de serre", "Couche d'ozone", "Protocoles internationaux", "Impact climatique", "GWP & tCO2e"],
    ch2: ["Règlement UE 2024/573", "Arrêté 21/11/2025", "Interdictions & Quotas", "Phase-down HFC", "Sanctions"],
    ch3: ["Attestation d'aptitude", "Attestation de capacité", "Catégories I-IV", "Remise à niveau", "Organismes certificateurs"],
    ch4: ["Familles CFC/HCFC/HFC/HFO", "Nomenclature", "GWP & PRG", "Classification sécurité", "Propriétés physiques", "Substitution"],
    ch5: ["Les 4 organes", "Cycle frigorifique", "Diagramme Mollier", "États du fluide", "Surchauffe & Sous-refroidissement"],
    ch6: ["Détendeurs", "Filtres & Déshydrateurs", "Voyants", "Pressostats", "Vannes", "Circuit d'huile"],
    ch7: ["Tirage au vide", "Charge en fluide", "Récupération", "Brasage sous azote", "Raccordements"],
    ch8: ["Méthodes de détection", "Seuils de contrôle", "Appareillage", "Fréquences", "Réparation fuites"],
    ch9: ["Registre d'équipement", "CERFA & BSD", "FDS", "Déclarations ADEME", "Fiche intervention"],
    ch10: ["Obligations récupération", "Recyclage", "Régénération", "DEEE", "Démantèlement"],
    ch11: ["CO2 transcritique", "Ammoniac NH3", "Hydrocarbures", "Fluides A2L", "Norme EN 378"],
    ch12: ["EPI", "Premiers secours", "Risques électriques", "ATEX", "Consignation"]
  },
  niveaux: {
    initiation: "Niveau 1 - Connaissances de base",
    pratique: "Niveau 2 - Application pratique",
    expertise: "Niveau 3 - Maîtrise technique"
  },
  conformite: {
    reglement_principal: "UE 2024/573",
    arrete_formation: "21 novembre 2025",
    cerfa_intervention: "15497*04",
    mise_a_jour: "Avril 2026"
  }
};

// ===== BUILD GLOSSAIRE (60+ terms) =====
const GLOSSAIRE = require('./glossaire-v6.js');

// ===== BUILD FLASHCARDS (60+ cards) =====
const FLASHCARDS = require('./flashcards-v6.js');

// ===== BUILD RESOURCES PER CHAPTER =====
const RESOURCES = require('./resources-v6.js');

// ===== ASSEMBLE HTML =====
console.log('\nAssemblage du fichier HTML...');

const dataJSON = JSON.stringify({ config: newConfig, questions: allQuestions });

// Build the resource panel HTML with chapter-specific content
function buildResourcePanelHTML() {
  return RESOURCES.buildHTML(imgCircuitNum, imgCircuitSym, imgMollier);
}

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mission F-GAZ Complete V6 | inerWeb Édu</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="F-GAZ">
<meta name="theme-color" content="#1b3a63">
<link rel="manifest" href="data:application/json;base64,ewogICJuYW1lIjogIk1pc3Npb24gRi1HQVogfCBpbmVyV2ViIMOJZHUiLAogICJzaG9ydF9uYW1lIjogIkYtR0FaIiwKICAic3RhcnRfdXJsIjogIi4iLAogICJkaXNwbGF5IjogInN0YW5kYWxvbmUiLAogICJiYWNrZ3JvdW5kX2NvbG9yIjogIiNmMGY1ZmEiLAogICJ0aGVtZV9jb2xvciI6ICIjMWIzYTYzIiwKICAiaWNvbnMiOiBbXQp9">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bleu:#1b3a63;--bleu2:#2a5298;--bleu3:#e8f0ff;
  --orange:#ff6b35;--orange2:#e85d2c;--orange3:#fff5f0;
  --vert:#27ae60;--vert2:#e8f8ef;
  --rouge:#e74c3c;--rouge2:#fde8e6;
  --gris:#f4f6f8;--gris2:#e8ecf0;--gris3:#d0d5dc;
  --txt:#2c3e50;--txt2:#666;--txt3:#999;
  --radius:12px;--shadow:0 2px 12px rgba(27,58,99,.08);
  --shadow2:0 4px 20px rgba(27,58,99,.12);
}
body{font-family:Calibri,'Segoe UI',Tahoma,sans-serif;font-size:16px;background:var(--gris);color:var(--txt);min-height:100vh}
.app{max-width:960px;margin:0 auto;padding:.5rem}
.topbar{background:#fff;padding:.8rem 1rem;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:.8rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;border-left:4px solid var(--orange)}
.logo{display:flex;align-items:center;gap:.4rem}
.logo-text{font-size:1.2rem;font-weight:700;color:var(--bleu)}
.logo-badge{background:var(--orange);color:#fff;padding:2px 8px;border-radius:6px;font-size:.7rem;font-weight:700}
.topbar-stats{display:flex;gap:.6rem;font-size:.8rem}
.topbar-stats span{background:var(--gris);padding:3px 8px;border-radius:15px;color:var(--txt2)}
.topbar-stats .hi{color:var(--vert);font-weight:600}
.tabs{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.8rem;background:#fff;padding:.4rem;border-radius:var(--radius);box-shadow:var(--shadow)}
.tab{padding:.5rem .8rem;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:600;color:var(--txt2);transition:all .2s;white-space:nowrap}
.tab:hover{background:var(--gris);color:var(--bleu)}
.tab.active{background:var(--bleu);color:#fff}
.tab .tbadge{font-size:.65rem;opacity:.7;margin-left:2px}
.scr{display:none;animation:fadeUp .25s ease}
.scr.active{display:block}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.card{background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.2rem;margin-bottom:.8rem}
.card h2{color:var(--bleu);font-size:1.1rem;margin-bottom:.8rem}
.card h3{color:var(--bleu);font-size:1rem;margin-bottom:.5rem}
.zone-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.8rem}
.zone-card{background:#fff;border-radius:var(--radius);padding:1rem;box-shadow:var(--shadow);cursor:pointer;transition:all .2s;border:2px solid transparent;position:relative;overflow:hidden}
.zone-card:hover{transform:translateY(-2px);box-shadow:var(--shadow2);border-color:var(--bleu2)}
.zone-card .znum{font-size:.7rem;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.zone-card .ztitle{font-size:.9rem;font-weight:700;color:var(--bleu);margin:.3rem 0}
.zone-card .zcount{font-size:.75rem;color:var(--txt2)}
.zone-card .zprog{height:4px;background:var(--gris2);border-radius:2px;margin-top:.5rem;overflow:hidden}
.zone-card .zprog-fill{height:100%;background:linear-gradient(90deg,var(--bleu),var(--bleu2));border-radius:2px;transition:width .4s}
.zone-card .zpct{position:absolute;top:.6rem;right:.8rem;font-size:.7rem;font-weight:700;color:var(--vert)}
.quiz-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:.8rem}
.quiz-bar .qinfo{display:flex;align-items:center;gap:.8rem;font-size:.85rem}
.pbar{width:140px;height:6px;background:var(--gris2);border-radius:3px;overflow:hidden}
.pbar-fill{height:100%;background:linear-gradient(90deg,var(--bleu),var(--vert));border-radius:3px;transition:width .3s}
.quiz-bar .qscore span{font-weight:600}
.quiz-bar .qscore .g{color:var(--vert)}.quiz-bar .qscore .b{color:var(--rouge)}
.q-zone-tag{font-size:.7rem;padding:2px 8px;background:var(--bleu3);color:var(--bleu);border-radius:10px;font-weight:600}
.q-cat{font-size:.75rem;color:var(--txt3);margin-bottom:.3rem}
.q-text{font-size:1.05rem;line-height:1.5;margin-bottom:1rem;color:var(--txt)}
.q-props{display:grid;gap:.5rem}
.q-prop{padding:.7rem 1rem;border:2px solid var(--gris2);background:#fff;border-radius:var(--radius);cursor:pointer;transition:all .2s;font-size:.9rem;text-align:left}
.q-prop:hover:not(.locked){border-color:var(--bleu2);background:var(--bleu3)}
.q-prop.correct{border-color:var(--vert);background:var(--vert2)}
.q-prop.wrong{border-color:var(--rouge);background:var(--rouge2)}
.q-prop.reveal{border-color:var(--vert);background:var(--vert2)}
.q-prop.locked{cursor:default}
.q-prop .letter{display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:var(--gris2);font-size:.75rem;font-weight:700;margin-right:.5rem;color:var(--txt2)}
.q-prop.correct .letter{background:var(--vert);color:#fff}
.q-prop.wrong .letter{background:var(--rouge);color:#fff}
.q-feedback{padding:.8rem 1rem;border-radius:var(--radius);margin-top:.8rem;font-size:.85rem;line-height:1.5;display:none}
.q-feedback.show{display:block}
.q-feedback.ok{background:var(--vert2);border:1px solid #a3e4bc;color:#1a7a42}
.q-feedback.ok-aide{background:#fff7ed;border:1px solid #ffd9b3;color:#7a4510}
.q-feedback.ko{background:var(--rouge2);border:1px solid #f5b7b1;color:#c0392b}
.q-hint{padding:.5rem .8rem;background:#fffde7;border:1px solid #fff9c4;border-radius:8px;font-size:.8rem;color:#856404;margin-top:.5rem;display:none}
.q-hint.show{display:block}
.q-actions{display:flex;gap:.5rem;margin-top:.8rem;flex-wrap:wrap}
.btn{padding:.5rem 1.2rem;border:none;border-radius:var(--radius);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:var(--bleu);color:#fff}.btn-primary:hover{background:var(--bleu2)}
.btn-orange{background:var(--orange);color:#fff}.btn-orange:hover{background:var(--orange2)}
.btn-green{background:var(--vert);color:#fff}
.btn-ghost{background:none;border:2px solid var(--gris2);color:var(--txt2)}.btn-ghost:hover{border-color:var(--bleu);color:var(--bleu)}
.btn-sm{padding:.3rem .8rem;font-size:.8rem}
.timer{font-size:1rem;font-weight:700;color:var(--bleu)}
.timer.warn{color:var(--rouge);animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.domain-filters{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.5rem}
.cat-filters{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.8rem}
.fbtn{padding:.3rem .7rem;border:1px solid var(--gris2);background:#fff;border-radius:15px;cursor:pointer;font-size:.75rem;color:var(--txt2);transition:all .15s}
.fbtn:hover,.fbtn.active{background:var(--bleu);color:#fff;border-color:var(--bleu)}
.fbtn.dom{font-weight:700;font-size:.8rem}
.search-input{width:100%;padding:.5rem .8rem;border:2px solid var(--gris2);border-radius:var(--radius);font-size:.9rem;margin-bottom:.6rem;outline:none}
.search-input:focus{border-color:var(--bleu2)}
.sym-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.6rem}
.sym-card{background:#fff;border-radius:var(--radius);padding:.6rem;box-shadow:var(--shadow);text-align:center;cursor:pointer;transition:all .2s;border:2px solid transparent}
.sym-card:hover{border-color:var(--bleu2);transform:translateY(-2px)}
.sym-card .svgbox{height:80px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:.3rem}
.sym-card .svgbox svg{max-width:100%;max-height:75px}
.sym-card .sname{font-size:.72rem;font-weight:500;line-height:1.2;color:var(--txt)}
.sym-card .scat{font-size:.6rem;color:var(--txt3);margin-top:.15rem}
.sq-display{text-align:center;padding:1.2rem;background:var(--gris);border-radius:8px;margin-bottom:1rem}
.sq-display svg{max-width:180px;max-height:140px}
.sq-name-display{text-align:center;padding:1rem;background:var(--gris);border-radius:8px;margin-bottom:1rem;font-size:1.2rem;font-weight:700;color:var(--bleu)}
.sq-opts{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.sq-opt{padding:.6rem;border:2px solid var(--gris2);background:#fff;border-radius:var(--radius);cursor:pointer;transition:all .2s;text-align:center;font-size:.85rem}
.sq-opt:hover:not(.locked){border-color:var(--bleu2);background:var(--bleu3)}
.sq-opt.correct{border-color:var(--vert);background:var(--vert2)}
.sq-opt.wrong{border-color:var(--rouge);background:var(--rouge2)}
.sq-opt.locked{cursor:default;opacity:.7}
.sq-opt.reveal{border-color:var(--vert);background:var(--vert2);opacity:1}
.sq-opt .optsvg{height:70px;display:flex;align-items:center;justify-content:center}
.sq-opt .optsvg svg{max-width:100%;max-height:65px}
.match-area{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
.match-col h3{text-align:center;color:var(--bleu);margin-bottom:.5rem;font-size:.85rem}
.match-item{padding:.5rem;border:2px solid var(--gris2);border-radius:var(--radius);margin-bottom:.4rem;cursor:pointer;transition:all .2s;background:#fff;text-align:center}
.match-item:hover:not(.matched){border-color:var(--bleu2)}
.match-item.selected{border-color:var(--orange);background:var(--orange3);box-shadow:0 0 0 2px rgba(255,107,53,.2)}
.match-item.matched{border-color:var(--vert);background:var(--vert2);cursor:default}
.match-item.wrong-flash{animation:shake .4s}
.match-item .msvg{height:50px;display:flex;align-items:center;justify-content:center}
.match-item .msvg svg{max-width:100%;max-height:45px}
.match-item .mlabel{font-size:.8rem;font-weight:500}
@keyframes shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.elec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.6rem}
.elec-card{background:#fff;border-radius:var(--radius);padding:.8rem;box-shadow:var(--shadow);text-align:center;border-left:3px solid var(--orange)}
.elec-card .ename{font-size:.85rem;font-weight:700;color:var(--bleu);margin-bottom:.3rem}
.elec-card .edesc{font-size:.72rem;color:var(--txt2);line-height:1.3}
.elec-card .ecat{font-size:.65rem;color:var(--txt3);margin-top:.3rem}
.results-card{text-align:center;padding:2rem}
.results-card .big{font-size:3rem;font-weight:800;margin:.5rem 0}
.results-card .big.great{color:var(--vert)}.results-card .big.ok{color:var(--orange)}.results-card .big.bad{color:var(--rouge)}
.results-card .sub{color:var(--txt2);margin-bottom:1rem}
.results-actions{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap}
.modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.45);z-index:100;display:none;align-items:center;justify-content:center;padding:1rem}
.modal-bg.show{display:flex}
.modal{background:#fff;border-radius:var(--radius);padding:1.5rem;max-width:460px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.2);position:relative;animation:modalPop .2s ease}
@keyframes modalPop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.modal-x{position:absolute;top:.5rem;right:.8rem;font-size:1.3rem;cursor:pointer;color:var(--txt3);background:none;border:none}
.modal .msvg-lg{text-align:center;padding:1rem;background:var(--gris);border-radius:8px;margin-bottom:.8rem}
.modal .msvg-lg svg{max-width:100%;max-height:180px}
.calc-widget{position:fixed;bottom:80px;right:16px;width:220px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.25);z-index:98;display:none;overflow:hidden;border:2px solid var(--bleu)}
.calc-widget.open{display:block}
.calc-widget.blocked{opacity:.5;pointer-events:none}
.calc-header{background:var(--bleu);color:#fff;padding:.4rem .6rem;display:flex;justify-content:space-between;align-items:center;font-size:.8rem;font-weight:700}
.calc-header button{background:none;border:none;color:#fff;font-size:1rem;cursor:pointer}
.calc-screen{background:#1e1e2e;color:#0f0;font-family:'Courier New',monospace;font-size:1.4rem;text-align:right;padding:.5rem .6rem;min-height:2.2rem;word-break:break-all}
.calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:3px;background:var(--gris)}
.calc-btn{padding:.55rem;border:none;font-size:1rem;font-weight:700;cursor:pointer;background:#fff;color:var(--bleu);border-radius:4px;transition:background .1s}
.calc-btn:hover{background:var(--bleu3)}
.calc-btn:active{background:var(--bleu);color:#fff}
.calc-btn.op{background:var(--orange);color:#fff}
.calc-btn.op:hover{background:var(--orange2)}
.calc-btn.clear{background:#e74c3c;color:#fff}
.calc-btn.eq{background:var(--vert);color:#fff}
.calc-blocked-msg{display:none;padding:.8rem;text-align:center;font-size:.85rem;color:#e74c3c;font-weight:700;background:#fde8e6;border-radius:0 0 10px 10px}
.calc-blocked .calc-grid,.calc-blocked .calc-screen{filter:blur(3px);pointer-events:none}
.calc-blocked .calc-blocked-msg{display:block}
.calc-toggle{position:fixed;bottom:24px;right:16px;width:48px;height:48px;border-radius:50%;background:var(--bleu);color:#fff;border:none;font-size:1.3rem;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.2);z-index:97;display:none;transition:all .2s}
.calc-toggle:hover{transform:scale(1.1)}
.calc-toggle.blocked{background:#ccc;cursor:not-allowed}
.res-panel{position:fixed;top:0;right:0;bottom:0;width:360px;background:#fff;box-shadow:-4px 0 20px rgba(0,0,0,.15);z-index:99;transform:translateX(100%);transition:transform .3s ease;overflow-y:auto;padding:1rem}
.res-panel.open{transform:translateX(0)}
.res-panel h3{color:var(--bleu);margin-bottom:.5rem;font-size:1rem}
.res-tabs{display:flex;border-bottom:2px solid var(--gris2);margin-bottom:.8rem}
.res-tab{flex:1;padding:.5rem;background:none;border:none;cursor:pointer;font-weight:600;color:var(--txt2);font-size:.8rem}
.res-tab.active{color:var(--bleu);border-bottom:2px solid var(--bleu)}
.res-content{display:none;font-size:.85rem;line-height:1.5}.res-content.active{display:block}
.res-content table{width:100%;border-collapse:collapse;margin:.5rem 0;font-size:.8rem}
.res-content th{background:var(--gris);color:var(--bleu);padding:.4rem;text-align:left;font-size:.75rem}
.res-content td{padding:.3rem .4rem;border-bottom:1px solid var(--gris2);font-size:.8rem}
.res-hl{background:#fff7ed;border-left:3px solid var(--orange);padding:.5rem .8rem;margin:.5rem 0;border-radius:4px;font-size:.8rem}
.badge-a1{background:#dcfce7;color:#166534;padding:1px 5px;border-radius:4px;font-size:.7rem;font-weight:700}
.badge-a2l{background:#fef9c3;color:#854d0e;padding:1px 5px;border-radius:4px;font-size:.7rem;font-weight:700}
@media(max-width:600px){.res-panel{width:100%}}
.fiche-panel{display:none}.fiche-panel.active{display:block}
.ftable{width:100%;border-collapse:collapse;margin:.6rem 0;font-size:.85rem}
.ftable th{background:var(--bleu);color:#fff;padding:.5rem .6rem;text-align:left;font-size:.8rem}
.ftable td{padding:.4rem .6rem;border-bottom:1px solid var(--gris2)}
.ftable tr:nth-child(even){background:var(--gris)}
.formula-box{background:#f0f7fa;border-left:4px solid var(--bleu);padding:.6rem .8rem;border-radius:6px;margin:.4rem 0;font-family:'Courier New',monospace;font-size:.9rem}
.gloss-item{background:#fff;padding:.8rem;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:.5rem;border-left:4px solid var(--bleu)}
.gloss-item .gterm{font-size:1rem;font-weight:700;color:var(--bleu)}
.gloss-item .gcat{display:inline-block;background:var(--orange);color:#fff;padding:1px 6px;border-radius:10px;font-size:.65rem;margin-left:.3rem;vertical-align:middle}
.gloss-item .gdef{font-size:.85rem;color:var(--txt);line-height:1.4;margin-top:.3rem}
.flash-front{background:var(--gris);color:var(--bleu)}
.flash-back{background:linear-gradient(135deg,var(--bleu),var(--bleu2));color:#fff}
.lb-row{display:flex;align-items:center;gap:.6rem;padding:.5rem .8rem;border-radius:8px;margin-bottom:.3rem;background:var(--gris)}
.lb-row:nth-child(1){background:#fff9e6;border:1px solid #ffc107}
.lb-row:nth-child(2){background:#f5f5f5;border:1px solid #ccc}
.lb-row:nth-child(3){background:#fef0e8;border:1px solid #e8a87c}
.lb-rank{font-size:1.1rem;font-weight:800;width:35px;text-align:center}
.lb-name{flex:1;font-weight:600}
.lb-score{font-weight:700;color:var(--bleu)}
.lb-pct{font-size:.8rem;color:var(--txt2)}
.res-chapter{display:none}.res-chapter.active{display:block}
.res-img{max-width:100%;border-radius:8px;margin:.5rem 0}
@media(max-width:600px){
  .app{padding:.3rem}
  .zone-grid{grid-template-columns:1fr 1fr}
  .sym-grid{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}
  .sq-opts{grid-template-columns:1fr}
  .match-area{grid-template-columns:1fr}
  .tab{padding:.4rem .5rem;font-size:.75rem}
}
</style>
</head>
<body>
<div class="app">
  <!-- TOP BAR -->
  <div class="topbar">
    <div class="logo">
      <span class="logo-text">❄️ inerWeb</span>
      <span class="logo-badge">Édu</span>
      <span style="font-size:.65rem;color:var(--txt3);margin-left:.3rem">v6.0</span>
    </div>
    <div class="topbar-stats">
      <span id="userBadge" style="display:none;background:var(--bleu3);color:var(--bleu);font-weight:600">👤 <span id="userName"></span></span>
      <span>📝 <span class="hi" id="gTotal">0</span> questions</span>
      <span>🏆 <span class="hi" id="gPct">0%</span></span>
    </div>
  </div>

  <!-- TABS -->
  <div class="tabs" id="mainTabs">
    <button class="tab active" data-s="home">🏠 Accueil</button>
    <button class="tab" data-s="quiz">📝 Quiz <span class="tbadge">${allQuestions.length}</span></button>
    <button class="tab" data-s="eval">🎯 Évaluation</button>
    <button class="tab" data-s="symbols">🔧 Symboles</button>
    <button class="tab" data-s="elec">⚡ Électro</button>
    <button class="tab" data-s="fiches">📋 Fiches</button>
    <button class="tab" data-s="simu">🧮 Calculs</button>
    <button class="tab" data-s="glossaire">📖 Glossaire</button>
    <button class="tab" data-s="flash">🎯 Flash</button>
    <button class="tab" data-s="classement">🏆 Scores</button>
    <button class="tab" data-s="stats">📊 Stats</button>
  </div>

  <!-- ========== HOME ========== -->
  <div class="scr active" id="s-home">
    <div class="card"><h2>🎯 Chapitres F-GAZ — ${allQuestions.length} questions</h2>
      <div class="zone-grid" id="zoneGrid"></div>
    </div>
    <div class="card" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.6rem">
      <div style="text-align:center;cursor:pointer" onclick="go('symbols')">
        <div style="font-size:2rem">🔧</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Symboles</div>
        <div style="font-size:.7rem;color:var(--txt2)">76 SVG</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('elec')">
        <div style="font-size:2rem">⚡</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Électro</div>
        <div style="font-size:.7rem;color:var(--txt2)">33 composants</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('fiches')">
        <div style="font-size:2rem">📋</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Fiches Mémo</div>
        <div style="font-size:.7rem;color:var(--txt2)">5 fiches</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('simu')">
        <div style="font-size:2rem">🧮</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Calculs</div>
        <div style="font-size:.7rem;color:var(--txt2)">tCO₂e</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('glossaire')">
        <div style="font-size:2rem">📖</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Glossaire</div>
        <div style="font-size:.7rem;color:var(--txt2)">${GLOSSAIRE.length} termes</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('flash')">
        <div style="font-size:2rem">🎯</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Flash</div>
        <div style="font-size:.7rem;color:var(--txt2)">${FLASHCARDS.length} cartes</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('eval')">
        <div style="font-size:2rem">🎓</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Évaluation</div>
        <div style="font-size:.7rem;color:var(--txt2)">Examen</div>
      </div>
      <div style="text-align:center;cursor:pointer" onclick="go('classement')">
        <div style="font-size:2rem">🏆</div>
        <div style="font-size:.8rem;font-weight:600;color:var(--bleu)">Classement</div>
        <div style="font-size:.7rem;color:var(--txt2)">Scores</div>
      </div>
    </div>
  </div>

  <!-- ========== QUIZ ========== -->
  <div class="scr" id="s-quiz">
    <div id="quizSelect">
      <div class="card"><h2>📝 Choisir un chapitre</h2>
        <div class="zone-grid" id="quizZoneGrid"></div>
      </div>
    </div>
    <div id="quizPlay" style="display:none">
      <div class="card">
        <div class="quiz-bar">
          <div class="qinfo">
            <span class="q-zone-tag" id="qZoneTag"></span>
            <span id="qNum">1/30</span>
            <div class="pbar"><div class="pbar-fill" id="qPbar"></div></div>
          </div>
          <div class="qscore"><span class="g" id="qGood">0✓</span> · <span class="b" id="qBad">0✗</span> · <span style="color:var(--bleu);font-weight:700" id="qScore">0pts</span></div>
        </div>
        <div id="qCat" class="q-cat"></div>
        <div id="qText" class="q-text"></div>
        <div id="qEssais" style="display:none;text-align:center;font-size:.8rem;color:var(--txt2);margin-bottom:.3rem"></div>
        <div id="qProps" class="q-props"></div>
        <div id="qFeedback" class="q-feedback"></div>
        <div id="qHint" class="q-hint"></div>
        <div class="q-actions">
          <button class="btn btn-ghost btn-sm" onclick="toggleHint()">💡 Indice</button>
          <button class="btn btn-ghost btn-sm" onclick="toggleRes()">📚 Ressources</button>
          <button class="btn btn-ghost btn-sm" onclick="quizBack()">← Retour chapitres</button>
          <button class="btn btn-primary" id="qNext" style="display:none" onclick="qNextQ()">Suivante →</button>
        </div>
      </div>
    </div>
    <div id="quizResults" style="display:none">
      <div class="card results-card" id="qResults"></div>
    </div>
  </div>

  <!-- ========== EVALUATION ========== -->
  <div class="scr" id="s-eval">
    <div id="evalConfig">
      <div class="card">
        <h2>🎯 Mode Évaluation</h2>
        <p style="color:var(--txt2);margin-bottom:1rem;font-size:.9rem">Questions aléatoires, chrono, conditions d'examen F-GAZ</p>
        <div style="margin-bottom:.8rem">
          <label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Nombre de questions</label>
          <div style="display:flex;gap:.3rem" id="evalCount">
            <span class="fbtn" data-v="20">20</span>
            <span class="fbtn active" data-v="40">40</span>
            <span class="fbtn" data-v="60">60</span>
          </div>
        </div>
        <div style="margin-bottom:.8rem">
          <label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Chrono par question</label>
          <div style="display:flex;gap:.3rem" id="evalTimer">
            <span class="fbtn" data-v="0">Sans limite</span>
            <span class="fbtn active" data-v="60">60 sec</span>
            <span class="fbtn" data-v="45">45 sec</span>
            <span class="fbtn" data-v="30">30 sec</span>
          </div>
        </div>
        <div style="margin-bottom:1rem">
          <label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Chapitres</label>
          <div style="display:flex;gap:.3rem;flex-wrap:wrap" id="evalZones">
            <span class="fbtn active" data-v="all">Tous</span>
          </div>
        </div>
        <button class="btn btn-orange" onclick="startEval()">🚀 Lancer l'évaluation</button>
      </div>
    </div>
    <div id="evalPlay" style="display:none">
      <div class="card">
        <div class="quiz-bar">
          <div class="qinfo">
            <span class="q-zone-tag" id="eZoneTag">ÉVAL</span>
            <span id="eNum">1/40</span>
            <div class="pbar"><div class="pbar-fill" id="ePbar"></div></div>
          </div>
          <div class="qscore">
            <span class="timer" id="eTimer"></span>
            <span class="g" id="eGood">0✓</span> · <span class="b" id="eBad">0✗</span>
          </div>
        </div>
        <div id="eCat" class="q-cat"></div>
        <div id="eText" class="q-text"></div>
        <div id="eProps" class="q-props"></div>
        <div id="eFeedback" class="q-feedback"></div>
        <div class="q-actions">
          <button class="btn btn-primary" id="eNext" style="display:none" onclick="eNextQ()">Suivante →</button>
        </div>
      </div>
    </div>
    <div id="evalResults" style="display:none">
      <div class="card results-card" id="eResults"></div>
    </div>
  </div>

  <!-- ========== SYMBOLS FROID ========== -->
  <div class="scr" id="s-symbols">
    <div class="card" style="padding:.6rem .8rem;display:flex;gap:.3rem;flex-wrap:wrap">
      <button class="btn btn-sm btn-primary" data-ss="sym-cat" onclick="symSub('sym-cat')">📖 Catalogue</button>
      <button class="btn btn-sm btn-ghost" data-ss="sym-identify" onclick="startSymQuiz('identify')">🔍 Identifie</button>
      <button class="btn btn-sm btn-ghost" data-ss="sym-find" onclick="startSymQuiz('find')">🎯 Trouve</button>
      <button class="btn btn-sm btn-ghost" data-ss="sym-match" onclick="startSymMatch()">🔗 Association</button>
      <button class="btn btn-sm btn-ghost" data-ss="sym-speed" onclick="startSymQuiz('speed')">⚡ Chrono</button>
    </div>
    <div id="sym-cat">
      <input type="text" class="search-input" placeholder="🔍 Rechercher..." id="symSearch" oninput="filterSymbols()">
      <div class="cat-filters" id="symCatFilters"></div>
      <div class="sym-grid" id="symGrid"></div>
    </div>
    <div id="sym-quiz" style="display:none">
      <div class="card">
        <div class="quiz-bar">
          <div class="qinfo"><span id="sqNum">1/10</span><div class="pbar"><div class="pbar-fill" id="sqPbar"></div></div></div>
          <div class="qscore"><span class="g" id="sqGood">0✓</span> · <span class="b" id="sqBad">0✗</span>
            <span class="timer" id="sqTimer" style="display:none"></span>
          </div>
        </div>
        <div id="sqArea"></div>
        <div id="sqFb" class="q-feedback"></div>
        <div class="q-actions">
          <button class="btn btn-ghost btn-sm" onclick="symSub('sym-cat')">← Catalogue</button>
          <button class="btn btn-primary" id="sqNext" style="display:none" onclick="sqNextQ()">Suivante →</button>
        </div>
      </div>
    </div>
    <div id="sym-match" style="display:none">
      <div class="card">
        <div class="quiz-bar">
          <span id="smStatus">0/5 trouvés</span>
          <span id="smErrors">0 erreurs</span>
        </div>
        <h3 style="text-align:center;margin-bottom:.5rem">Relie symbole ↔ nom</h3>
        <div class="match-area" id="smArea"></div>
        <div class="q-actions" style="margin-top:.5rem">
          <button class="btn btn-ghost btn-sm" onclick="symSub('sym-cat')">← Catalogue</button>
        </div>
      </div>
    </div>
    <div id="sym-results" style="display:none">
      <div class="card results-card" id="sqResults"></div>
    </div>
  </div>

  <!-- ========== ELECTRO ========== -->
  <div class="scr" id="s-elec">
    <div class="card">
      <h2>⚡ Symboles Électrotechniques</h2>
      <p style="color:var(--txt2);font-size:.85rem;margin-bottom:1rem">Symboles normés IEC pour schémas électriques — froid & climatisation</p>
      <div class="cat-filters" id="elecCatFilters"></div>
      <div class="elec-grid" id="elecGrid"></div>
    </div>
    <div class="card" style="padding:.6rem .8rem;display:flex;gap:.3rem;flex-wrap:wrap">
      <button class="btn btn-sm btn-orange" onclick="startElecQuiz()">🎯 Quiz Électro (texte)</button>
    </div>
    <div id="elec-quiz" style="display:none">
      <div class="card">
        <div class="quiz-bar">
          <div class="qinfo"><span id="eqNum">1/10</span><div class="pbar"><div class="pbar-fill" id="eqPbar"></div></div></div>
          <div class="qscore"><span class="g" id="eqGood">0✓</span> · <span class="b" id="eqBad">0✗</span></div>
        </div>
        <div id="eqArea"></div>
        <div id="eqFb" class="q-feedback"></div>
        <div class="q-actions">
          <button class="btn btn-ghost btn-sm" onclick="hideElecQuiz()">← Retour</button>
          <button class="btn btn-primary" id="eqNext" style="display:none" onclick="eqNextQ()">Suivante →</button>
        </div>
      </div>
    </div>
    <div id="elec-results" style="display:none">
      <div class="card results-card" id="eqResults"></div>
    </div>
  </div>

  <!-- ========== FICHES MEMO ========== -->
  <div class="scr" id="s-fiches">
    <div class="card" style="padding:.5rem .8rem;display:flex;gap:.3rem;flex-wrap:wrap">
      <button class="fbtn dom active" onclick="showFiche('seuils')">🎯 Seuils</button>
      <button class="fbtn dom" onclick="showFiche('circuit')">❄️ Circuit Frigo</button>
      <button class="fbtn dom" onclick="showFiche('formules')">🧮 Formules</button>
      <button class="fbtn dom" onclick="showFiche('fluides')">🧪 Fluides</button>
      <button class="fbtn dom" onclick="showFiche('delais')">⏱️ Délais</button>
    </div>
    <div class="fiche-panel active" id="fiche-seuils">
      <div class="card">
        <h3>🎯 Seuils tCO₂e — Obligations de contrôle</h3>
        <div style="text-align:center;padding:.5rem;background:var(--gris);border-radius:8px;margin:.8rem 0">
          <svg width="100%" height="200" viewBox="0 0 800 200">
            <defs><linearGradient id="g1" x1="0%" x2="100%"><stop offset="0%" style="stop-color:#28a745"/><stop offset="33%" style="stop-color:#ffc107"/><stop offset="66%" style="stop-color:#ff6b35"/><stop offset="100%" style="stop-color:#dc3545"/></linearGradient></defs>
            <rect x="50" y="60" width="700" height="60" fill="url(#g1)" rx="8"/>
            <line x1="100" y1="45" x2="100" y2="140" stroke="#333" stroke-width="2.5"/>
            <text x="100" y="38" text-anchor="middle" font-size="18" font-weight="bold" fill="#28a745">5</text>
            <text x="100" y="160" text-anchor="middle" font-size="12" fill="#333">Annuel</text>
            <line x1="350" y1="45" x2="350" y2="140" stroke="#333" stroke-width="2.5"/>
            <text x="350" y="38" text-anchor="middle" font-size="18" font-weight="bold" fill="#ff6b35">50</text>
            <text x="350" y="160" text-anchor="middle" font-size="12" fill="#333">Semestriel</text>
            <line x1="650" y1="45" x2="650" y2="140" stroke="#333" stroke-width="2.5"/>
            <text x="650" y="38" text-anchor="middle" font-size="18" font-weight="bold" fill="#dc3545">500</text>
            <text x="650" y="160" text-anchor="middle" font-size="12" fill="#333">Détection auto</text>
            <text x="400" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--bleu)">Échelle des seuils tCO₂e</text>
          </svg>
        </div>
        <table class="ftable"><thead><tr><th>Seuil (tCO₂e)</th><th>Obligation</th><th>Fréquence</th></tr></thead><tbody>
          <tr><td><b>≥ 5</b></td><td>Contrôle d'étanchéité</td><td>Annuel (12 mois)</td></tr>
          <tr><td><b>≥ 50</b></td><td>Contrôle d'étanchéité</td><td>Semestriel (6 mois)</td></tr>
          <tr><td><b>≥ 500</b></td><td>Détection automatique + contrôle</td><td>Trimestriel (3 mois)</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="fiche-panel" id="fiche-circuit">
      <div class="card">
        <h3>❄️ Circuit Frigorifique — Les 4 Organes</h3>
        <div style="text-align:center;padding:.5rem;background:var(--gris);border-radius:8px;margin:.8rem 0">
          <svg width="100%" height="340" viewBox="0 0 600 340">
            <circle cx="100" cy="170" r="40" fill="var(--bleu)"/><text x="100" y="175" text-anchor="middle" font-size="22" fill="#fff">⚙️</text>
            <text x="100" y="230" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--bleu)">COMPRESSEUR</text>
            <text x="100" y="245" text-anchor="middle" font-size="10" fill="#666">Gaz BP → Gaz HP</text>
            <rect x="260" y="40" width="80" height="70" fill="var(--orange)" rx="5"/><text x="300" y="82" text-anchor="middle" font-size="22" fill="#fff">🔥</text>
            <text x="300" y="135" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--bleu)">CONDENSEUR</text>
            <text x="300" y="150" text-anchor="middle" font-size="10" fill="#666">Gaz HP → Liq. HP</text>
            <polygon points="500,155 520,140 520,170" fill="#6f42c1"/><circle cx="500" cy="170" r="25" fill="#6f42c1" opacity=".3"/>
            <text x="500" y="215" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--bleu)">DÉTENDEUR</text>
            <text x="500" y="230" text-anchor="middle" font-size="10" fill="#666">Liq. HP → BP</text>
            <rect x="260" y="260" width="80" height="50" fill="#17a2b8" rx="5"/><text x="300" y="290" text-anchor="middle" font-size="18" fill="#fff">❄️</text>
            <text x="300" y="330" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--bleu)">ÉVAPORATEUR</text>
            <path d="M 140 155 Q 200 70, 260 75" stroke="#dc3545" stroke-width="3" fill="none" marker-end="url(#arr)"/>
            <path d="M 340 75 Q 430 70, 475 155" stroke="#dc3545" stroke-width="3" fill="none"/>
            <path d="M 475 190 Q 430 270, 340 285" stroke="#17a2b8" stroke-width="3" fill="none"/>
            <path d="M 260 285 Q 200 280, 140 190" stroke="#17a2b8" stroke-width="3" fill="none"/>
            <text x="200" y="55" font-size="9" fill="#dc3545" font-weight="bold">HP Gaz chaud</text>
            <text x="200" y="310" font-size="9" fill="#17a2b8" font-weight="bold">BP Gaz froid</text>
          </svg>
        </div>
        <div style="background:#fffde7;padding:.8rem;border-radius:8px;border-left:3px solid #ffc107">
          <b>💡 Moyen mnémotechnique :</b> <b>Co</b>mpresseur → <b>Co</b>ndenseur → <b>Dé</b>tendeur → <b>É</b>vaporateur (la croix du frigoriste)
        </div>
      </div>
    </div>
    <div class="fiche-panel" id="fiche-formules">
      <div class="card">
        <h3>🧮 Formules essentielles</h3>
        <div class="formula-box"><b>tCO₂e</b> = (Charge kg × GWP) / 1000</div>
        <div class="formula-box"><b>Surchauffe</b> = T° aspiration − T° évaporation saturée</div>
        <div class="formula-box"><b>Sous-refroidissement</b> = T° condensation saturée − T° liquide sortie condenseur</div>
        <div class="formula-box"><b>COP</b> = Puissance frigorifique / Puissance électrique</div>
        <div class="formula-box"><b>EER</b> = Pfroid (W) / Pélec (W)</div>
        <div style="background:#fffde7;padding:.8rem;border-radius:8px;border-left:3px solid #ffc107;margin-top:.8rem">
          <b>💡 Exemple :</b> 10 kg de R410A (GWP 2088) → tCO₂e = (10 × 2088) / 1000 = <b>20,88 tCO₂e</b> → Contrôle annuel
        </div>
      </div>
    </div>
    <div class="fiche-panel" id="fiche-fluides">
      <div class="card">
        <h3>🧪 Tableau des fluides courants</h3>
        <table class="ftable"><thead><tr><th>Fluide</th><th>Type</th><th>GWP</th><th>Statut</th></tr></thead><tbody>
          <tr style="background:#d4edda"><td>R744 (CO₂)</td><td>Naturel</td><td>1</td><td>✅ Excellent</td></tr>
          <tr style="background:#d4edda"><td>R290 (Propane)</td><td>Naturel</td><td>3</td><td>✅ Excellent (A3)</td></tr>
          <tr style="background:#d4edda"><td>R717 (NH₃)</td><td>Naturel</td><td>&lt;1</td><td>✅ Toxique (B2L)</td></tr>
          <tr style="background:#fffde7"><td>R32</td><td>HFC pur</td><td>675</td><td>✅ Faible GWP (A2L)</td></tr>
          <tr style="background:#fff3cd"><td>R134a</td><td>HFC pur</td><td>1430</td><td>⚠️ Quotas UE</td></tr>
          <tr style="background:#fff3cd"><td>R407C</td><td>HFC mélange</td><td>1774</td><td>⚠️ Zéotrope</td></tr>
          <tr style="background:#fde8e6"><td>R410A</td><td>HFC mélange</td><td>2088</td><td>⚠️ Quotas UE</td></tr>
          <tr style="background:#fde8e6"><td>R404A</td><td>HFC mélange</td><td>3922</td><td>❌ Interdit vierge</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="fiche-panel" id="fiche-delais">
      <div class="card">
        <h3>⏱️ Délais réglementaires</h3>
        <div style="text-align:center;padding:.5rem;background:var(--gris);border-radius:8px;margin:.8rem 0">
          <svg width="100%" height="170" viewBox="0 0 700 170">
            <text x="350" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--bleu)">⏰ Frise chronologique</text>
            <line x1="80" y1="80" x2="620" y2="80" stroke="var(--bleu)" stroke-width="3"/>
            <circle cx="120" cy="80" r="6" fill="#dc3545"/><text x="120" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="#dc3545">14j</text><text x="120" y="110" text-anchor="middle" font-size="10" fill="#333">Réparation fuite</text>
            <circle cx="260" cy="80" r="6" fill="var(--orange)"/><text x="260" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--orange)">30j</text><text x="260" y="110" text-anchor="middle" font-size="10" fill="#333">Déclaration install.</text>
            <circle cx="430" cy="80" r="6" fill="#17a2b8"/><text x="430" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="#17a2b8">5 ans</text><text x="430" y="110" text-anchor="middle" font-size="10" fill="#333">Conservation registre</text>
            <circle cx="580" cy="80" r="6" fill="#6f42c1"/><text x="580" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="#6f42c1">7 ans</text><text x="580" y="110" text-anchor="middle" font-size="10" fill="#333">Remise à niveau</text>
            <text x="80" y="145" font-size="10" fill="#999">Court terme</text><text x="580" y="145" font-size="10" fill="#999">Long terme</text>
          </svg>
        </div>
        <table class="ftable"><thead><tr><th>Action</th><th>Délai</th><th>Référence</th></tr></thead><tbody>
          <tr><td>Réparation fuite</td><td><b>14 jours</b></td><td>Art. 9 UE 2024/573</td></tr>
          <tr><td>Documentation contrôle</td><td><b>1 mois</b></td><td>Art. 10 UE 2024/573</td></tr>
          <tr><td>Conservation registre</td><td><b>5 ans</b></td><td>Art. 10 UE 2024/573</td></tr>
          <tr><td>Remise à niveau attestation</td><td><b>7 ans</b> (dès 2027)</td><td>Arrêté 21/11/2025</td></tr>
          <tr><td>Déclaration installation</td><td><b>30 jours</b></td><td>Art. 10 UE 2024/573</td></tr>
        </tbody></table>
        <div style="background:#d4edda;padding:.8rem;border-radius:8px;border-left:3px solid #28a745;margin-top:.8rem">
          <b>✅ Moyen mnémotechnique :</b> 2 semaines (réparer) → 1 mois (déclarer) → 5 ans (conserver) → 7 ans (reformer)
        </div>
      </div>
    </div>
  </div>

  <!-- ========== SIMULATEURS ========== -->
  <div class="scr" id="s-simu">
    <div class="card">
      <h2>📊 Calcul Teq CO₂</h2>
      <p style="color:var(--txt2);font-size:.85rem;margin-bottom:1rem">Calculez l'équivalent CO₂ d'une installation</p>
      <div style="margin-bottom:1rem">
        <label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Fluide frigorigène</label>
        <select id="simFluide" onchange="simUpdateGWP()" style="width:100%;padding:.5rem;border:2px solid var(--gris2);border-radius:8px;font-size:.9rem">
          <option value="">-- Sélectionnez --</option>
          <option value="1430">R134a (GWP 1430)</option>
          <option value="2088">R410A (GWP 2088)</option>
          <option value="3922">R404A (GWP 3922)</option>
          <option value="1774">R407C (GWP 1774)</option>
          <option value="675">R32 (GWP 675)</option>
          <option value="3">R290 Propane (GWP 3)</option>
          <option value="1">R744 CO₂ (GWP 1)</option>
          <option value="custom">Autre (saisir GWP)</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:1rem">
        <div><label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">GWP</label>
          <input type="number" id="simGWP" placeholder="Ex: 1430" style="width:100%;padding:.5rem;border:2px solid var(--gris2);border-radius:8px" readonly></div>
        <div><label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Charge (kg)</label>
          <input type="number" id="simCharge" placeholder="Ex: 10" step="0.1" style="width:100%;padding:.5rem;border:2px solid var(--gris2);border-radius:8px"></div>
      </div>
      <button class="btn btn-orange" onclick="simCalc()" style="width:100%">🧮 Calculer</button>
      <div id="simResult" style="display:none;margin-top:1rem;padding:1rem;border-radius:8px"></div>
    </div>
    <div class="card">
      <h2>⏱️ Fréquence des contrôles</h2>
      <div style="margin-bottom:1rem"><label style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Teq CO₂ de l'installation</label>
        <input type="number" id="simTCO2" placeholder="Ex: 20" step="0.1" style="width:100%;padding:.5rem;border:2px solid var(--gris2);border-radius:8px"></div>
      <button class="btn btn-primary" onclick="simFreq()" style="width:100%">🔍 Déterminer</button>
      <div id="freqResult" style="display:none;margin-top:1rem;padding:1rem;border-radius:8px"></div>
    </div>
    <div class="card">
      <h2>❄️ Référence fluides courants</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.5rem" id="fluideRef"></div>
    </div>
  </div>

  <!-- ========== GLOSSAIRE ========== -->
  <div class="scr" id="s-glossaire">
    <div class="card">
      <h2>📖 Glossaire F-GAZ</h2>
      <input type="text" class="search-input" placeholder="🔍 Rechercher un terme..." id="glossSearch" oninput="filterGloss()">
      <div class="cat-filters" id="glossLetters" style="margin-bottom:.8rem"></div>
      <div id="glossList"></div>
    </div>
  </div>

  <!-- ========== REVISION FLASH ========== -->
  <div class="scr" id="s-flash">
    <div id="flashStart" class="card" style="text-align:center;padding:2rem">
      <h2>🎯 Révision Flash</h2>
      <p style="color:var(--txt2);margin:1rem 0">Cartes recto/verso — cliquez pour retourner</p>
      <button class="btn btn-orange" onclick="startFlash()" style="font-size:1.1rem;padding:.8rem 2rem">🚀 Commencer (${FLASHCARDS.length} cartes)</button>
    </div>
    <div id="flashPlay" style="display:none">
      <div class="card" style="text-align:center">
        <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;font-size:.85rem">
          <span id="flashNum">1/${FLASHCARDS.length}</span>
          <span>✅ <span id="flashKnown">0</span> · ❌ <span id="flashReview">0</span></span>
        </div>
        <div class="pbar" style="width:100%;margin-bottom:.8rem"><div class="pbar-fill" id="flashPbar"></div></div>
        <div id="flashCard" onclick="flipFlash()" style="cursor:pointer;padding:2.5rem 1.5rem;border-radius:var(--radius);min-height:120px;display:flex;align-items:center;justify-content:center;background:var(--gris);color:var(--bleu);transition:all .3s">
          <div id="flashContent" style="font-size:1.3rem;font-weight:700"></div>
        </div>
        <div id="flashHintText" style="font-size:.75rem;color:var(--txt3);margin-top:.3rem">Cliquez pour voir la réponse</div>
        <div style="display:flex;gap:.5rem;justify-content:center;margin-top:1rem">
          <button class="btn btn-green btn-sm" onclick="markFlash(true)">✅ Je connais</button>
          <button class="btn btn-ghost btn-sm" onclick="markFlash(false)">❌ À revoir</button>
        </div>
      </div>
    </div>
    <div id="flashResults" style="display:none">
      <div class="card results-card" id="flashRes"></div>
    </div>
  </div>

  <!-- ========== CLASSEMENT ========== -->
  <div class="scr" id="s-classement">
    <div class="card">
      <h2>🏆 Classement</h2>
      <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:.5rem;margin-bottom:1rem;align-items:end">
        <div><label style="font-size:.8rem;font-weight:600">Nom</label><input type="text" id="lbName" placeholder="Prénom" style="width:100%;padding:.4rem .6rem;border:2px solid var(--gris2);border-radius:8px"></div>
        <div><label style="font-size:.8rem;font-weight:600">Note /20</label><input type="number" id="lbScore" min="0" max="20" step="0.5" placeholder="15" style="width:100%;padding:.4rem .6rem;border:2px solid var(--gris2);border-radius:8px"></div>
        <button class="btn btn-orange btn-sm" onclick="addLBScore()">Ajouter</button>
      </div>
      <div id="lbList"></div>
    </div>
    <div class="card">
      <h2>📤 Export résultats</h2>
      <p style="color:var(--txt2);font-size:.85rem;margin-bottom:.8rem">Téléchargez vos stats en CSV</p>
      <button class="btn btn-primary" onclick="exportCSV()">📥 Exporter CSV</button>
    </div>
  </div>

  <!-- ========== STATS ========== -->
  <div class="scr" id="s-stats">
    <div class="card"><h2>📊 Statistiques globales</h2><div id="statsContent"></div></div>
  </div>
</div>

<!-- CALCULATOR WIDGET -->
<button class="calc-toggle" id="calcToggle" onclick="toggleCalc()" title="Calculatrice">🧮</button>
<div class="calc-widget" id="calcWidget">
  <div class="calc-header"><span>🧮 Calculatrice</span><button onclick="toggleCalc()">✕</button></div>
  <div class="calc-screen" id="calcScreen">0</div>
  <div class="calc-grid">
    <button class="calc-btn clear" onclick="calcPress('C')">C</button>
    <button class="calc-btn" onclick="calcPress('±')">±</button>
    <button class="calc-btn" onclick="calcPress('%')">%</button>
    <button class="calc-btn op" onclick="calcPress('÷')">÷</button>
    <button class="calc-btn" onclick="calcPress('7')">7</button>
    <button class="calc-btn" onclick="calcPress('8')">8</button>
    <button class="calc-btn" onclick="calcPress('9')">9</button>
    <button class="calc-btn op" onclick="calcPress('×')">×</button>
    <button class="calc-btn" onclick="calcPress('4')">4</button>
    <button class="calc-btn" onclick="calcPress('5')">5</button>
    <button class="calc-btn" onclick="calcPress('6')">6</button>
    <button class="calc-btn op" onclick="calcPress('-')">−</button>
    <button class="calc-btn" onclick="calcPress('1')">1</button>
    <button class="calc-btn" onclick="calcPress('2')">2</button>
    <button class="calc-btn" onclick="calcPress('3')">3</button>
    <button class="calc-btn op" onclick="calcPress('+')">+</button>
    <button class="calc-btn" onclick="calcPress('0')" style="grid-column:span 2">0</button>
    <button class="calc-btn" onclick="calcPress('.')">.</button>
    <button class="calc-btn eq" onclick="calcPress('=')">=</button>
  </div>
  <div class="calc-blocked-msg" id="calcBlocked">🚫 Calculez de tête !<br><span style="font-size:.75rem;font-weight:400">Cette question teste votre capacité à appliquer la formule</span></div>
</div>

<!-- RESOURCE SIDE PANEL -->
${buildResourcePanelHTML()}

<!-- MODAL -->
<div class="modal-bg" id="modalBg" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <button class="modal-x" onclick="closeModal()">✕</button>
    <div class="msvg-lg" id="mSvg"></div>
    <h3 id="mName"></h3>
    <p style="color:var(--txt2);font-size:.85rem;margin:.3rem 0" id="mDesc"></p>
    <div style="font-size:.75rem;color:var(--txt3)" id="mMeta"></div>
  </div>
</div>

<!-- ==================== DATA ==================== -->
<script id="questionsData" type="application/json">${dataJSON}</script>
<script id="symbolsData" type="application/json">${symbolsJSON}</script>

<!-- ==================== APP ENGINE ==================== -->
<script>
// ============================================================
// DATA LOADING
// ============================================================
let QUESTIONS=[], CONFIG={zones:{}};
try{const d=JSON.parse(document.getElementById('questionsData').textContent);QUESTIONS=d.questions;CONFIG=d.config;}catch(e){console.error('Q parse',e)}

let SYMBOLS=[];
try{SYMBOLS=JSON.parse(document.getElementById('symbolsData').textContent)}catch(e){console.error('S parse',e)}

const CAT_LABELS={compresseurs:'Compresseurs',echangeurs:'Échangeurs',detendeurs:'Détendeurs',vannes:'Vannes & Robinetterie',controles:'Contrôles & Régulation',accessoires:'Accessoires circuit',reservoirs:'Réservoirs & Bouteilles',ventilation:'Ventilation & Pompes',climatisation:'Climatisation & CVC',securite:'Sécurité'};
const CAT_ICONS={compresseurs:'⚙️',echangeurs:'🔄',detendeurs:'🔽',vannes:'🔧',controles:'📡',accessoires:'🔩',reservoirs:'🪣',ventilation:'💨',climatisation:'❄️',securite:'🛡️'};

const ELEC_SYMS=[
  {id:'e_fusible',n:'Fusible',d:'Protège contre les surintensités par fusion',c:'protection'},
  {id:'e_sectionneur',n:'Sectionneur',d:'Isoler un circuit sans charge',c:'protection'},
  {id:'e_disjoncteur',n:'Disjoncteur magnétothermique',d:'Protection surcharge + court-circuit',c:'protection'},
  {id:'e_disj_moteur',n:'Disjoncteur moteur',d:'Protection magnétothermique réglable pour moteur',c:'protection'},
  {id:'e_relais_th',n:'Relais thermique',d:'Protection du moteur contre les surcharges (bilame)',c:'protection'},
  {id:'e_inter_diff',n:'Interrupteur différentiel',d:'Protection des personnes (30mA)',c:'protection'},
  {id:'e_disj_diff',n:'Disjoncteur différentiel',d:'Protection combinée : surcharge + différentiel',c:'protection'},
  {id:'e_contacteur',n:'Contacteur (bobine KM)',d:'Appareil de commande à distance par bobine électromagnétique',c:'commande'},
  {id:'e_contact_no',n:'Contact NO (normalement ouvert)',d:'Se ferme quand la bobine est excitée',c:'commande'},
  {id:'e_contact_nf',n:'Contact NF (normalement fermé)',d:"S'ouvre quand la bobine est excitée",c:'commande'},
  {id:'e_bp_marche',n:'Bouton poussoir Marche (NO)',d:'Contact momentané normalement ouvert — S1',c:'commande'},
  {id:'e_bp_arret',n:'Bouton poussoir Arrêt (NF)',d:'Contact momentané normalement fermé — S0',c:'commande'},
  {id:'e_selecteur',n:'Sélecteur 2 positions',d:'Commutateur rotatif Auto/Manu',c:'commande'},
  {id:'e_tempo_travail',n:'Contact temporisé au travail',d:'Fermeture retardée après excitation',c:'commande'},
  {id:'e_tempo_repos',n:'Contact temporisé au repos',d:'Ouverture retardée après désexcitation',c:'commande'},
  {id:'e_arret_urgence',n:"Arrêt d'urgence (AU)",d:"Bouton coup de poing à accrochage — coupe tout",c:'commande'},
  {id:'e_moteur_tri',n:'Moteur asynchrone triphasé',d:'Moteur principal — couplage étoile ou triangle',c:'moteurs'},
  {id:'e_moteur_mono',n:'Moteur monophasé',d:'Avec condensateur de démarrage ou permanent',c:'moteurs'},
  {id:'e_motocomp',n:'Motocompresseur hermétique',d:'Moteur + compresseur en carter scellé',c:'moteurs'},
  {id:'e_motovent',n:'Motoventilateur',d:'Moteur entraînant ventilateur condenseur/évaporateur',c:'moteurs'},
  {id:'e_transfo',n:'Transformateur',d:'Alimentation circuit de commande (400V→24V)',c:'appareillage'},
  {id:'e_variateur',n:'Variateur de fréquence',d:'Fait varier la vitesse du moteur (ex: ATV)',c:'appareillage'},
  {id:'e_resistance',n:'Résistance chauffante',d:'Réchauffeur carter compresseur ou dégivrage',c:'appareillage'},
  {id:'e_condensateur',n:'Condensateur',d:'Démarrage ou permanent — moteur monophasé',c:'appareillage'},
  {id:'e_voyant',n:'Voyant lumineux',d:'Signale un état : marche (vert), défaut (rouge)',c:'signalisation'},
  {id:'e_buzzer',n:'Avertisseur sonore',d:'Alarme sonore sur défaut',c:'signalisation'},
  {id:'e_pressostat_c',n:'Pressostat (contact)',d:'Contact commandé par la pression HP ou BP',c:'capteurs'},
  {id:'e_thermostat_c',n:'Thermostat (contact)',d:'Contact commandé par la température',c:'capteurs'},
  {id:'e_sonde_t',n:'Sonde de température',d:'Capteur analogique NTC, PTC ou PT1000',c:'capteurs'},
  {id:'e_terre',n:'Mise à la terre (PE)',d:'Conducteur de protection — sécurité personnes',c:'cablage'},
  {id:'e_borne',n:'Borne de connexion',d:'Point de raccordement sur bornier',c:'cablage'},
  {id:'e_liaison',n:'Point de connexion',d:'Deux fils connectés au croisement (point noir)',c:'cablage'},
  {id:'e_croisement',n:'Croisement sans connexion',d:'Deux fils se croisent sans contact',c:'cablage'},
];
const ELEC_CATS={protection:'🔌 Protection',commande:'🎛️ Commande',moteurs:'🔋 Moteurs',appareillage:'🏭 Appareillage',signalisation:'💡 Signalisation',capteurs:'📏 Capteurs',cablage:'🔗 Câblage'};

const CHAP_ICONS={ch1:'🌍',ch2:'📋',ch3:'🎓',ch4:'🧪',ch5:'❄️',ch6:'🔧',ch7:'🛠️',ch8:'🔍',ch9:'📝',ch10:'♻️',ch11:'🌿',ch12:'🛡️'};

// ============================================================
// STATS (localStorage)
// ============================================================
let ST=JSON.parse(localStorage.getItem('fgazV6')||'{"qz":{},"sym":{},"elec":{},"total":0,"correct":0}');
function saveST(){localStorage.setItem('fgazV6',JSON.stringify(ST))}
function updateTopbar(){
  const pct=ST.total>0?Math.round(ST.correct/ST.total*100):0;
  document.getElementById('gTotal').textContent=ST.total;
  document.getElementById('gPct').textContent=pct+'%';
}
updateTopbar();

// ============================================================
// NAVIGATION
// ============================================================
function go(id){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('active'));
  document.getElementById('s-'+id).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.s===id));
  if(id==='home')buildHome();
  if(id==='symbols')buildSymCatalogue();
  if(id==='elec')buildElecCatalogue();
  if(id==='stats')buildStats();
  if(id==='quiz')buildQuizSelect();
  if(id==='glossaire')buildGlossaire();
  if(id==='classement')renderLB();
  const calcBtn=document.getElementById('calcToggle');
  const calcW=document.getElementById('calcWidget');
  if(calcBtn){calcBtn.style.display=(id==='quiz'||id==='eval')?'block':'none'}
  if(calcW&&id!=='quiz'&&id!=='eval'){calcW.classList.remove('open')}
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>go(t.dataset.s)));

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// ============================================================
// HOME
// ============================================================
function buildHome(){
  const grid=document.getElementById('zoneGrid');
  const zones=CONFIG.zones||{};
  grid.innerHTML=Object.entries(zones).map(([zid,zname])=>{
    const qs=QUESTIONS.filter(q=>q.zone===zid);
    const done=ST.qz[zid]||{total:0,ok:0};
    const pct=done.total>0?Math.round(done.ok/done.total*100):0;
    return \`<div class="zone-card" onclick="startZoneQuiz('\${zid}')">
      <div class="znum">\${CHAP_ICONS[zid]||'📁'} \${zid.replace('ch','Chapitre ')}</div>
      <div class="ztitle">\${zname}</div>
      <div class="zcount">\${qs.length} questions</div>
      <div class="zprog"><div class="zprog-fill" style="width:\${pct}%"></div></div>
      \${pct>0?\`<div class="zpct">\${pct}%</div>\`:''}
    </div>\`;
  }).join('');
}
buildHome();

// ============================================================
// QUIZ ENGINE
// ============================================================
let quiz={questions:[],idx:0,good:0,bad:0,zone:'',timerVal:0,timerID:null};

function buildQuizSelect(){
  document.getElementById('quizSelect').style.display='';
  document.getElementById('quizPlay').style.display='none';
  document.getElementById('quizResults').style.display='none';
  const grid=document.getElementById('quizZoneGrid');
  const zones=CONFIG.zones||{};
  grid.innerHTML=Object.entries(zones).map(([zid,zname])=>{
    const qs=QUESTIONS.filter(q=>q.zone===zid);
    return \`<div class="zone-card" onclick="startZoneQuiz('\${zid}')">
      <div class="znum">\${CHAP_ICONS[zid]||''} \${zid.replace('ch','Chapitre ')}</div>
      <div class="ztitle">\${zname}</div>
      <div class="zcount">\${qs.length} questions</div>
    </div>\`;
  }).join('');
  grid.innerHTML+=\`<div class="zone-card" style="border-color:var(--orange)" onclick="startZoneQuiz('all')">
    <div class="znum">🌐 Tous</div><div class="ztitle">Tous les chapitres</div><div class="zcount">\${QUESTIONS.length} questions</div>
  </div>\`;
}

function startZoneQuiz(zid){
  go('quiz');
  const qs=zid==='all'?shuffle([...QUESTIONS]):shuffle(QUESTIONS.filter(q=>q.zone===zid));
  if(!qs.length){alert('Aucune question');return}
  quiz={
    questions:qs,idx:0,good:0,bad:0,score:0,zone:zid,
    hintUsed:false,essais:0,maxEssais:3,answered:false,
    questionsRatees:[],boucleMode:false,boucleIdx:0,boucleQuestions:[]
  };
  document.getElementById('quizSelect').style.display='none';
  document.getElementById('quizPlay').style.display='';
  document.getElementById('quizResults').style.display='none';
  document.getElementById('qZoneTag').textContent=zid==='all'?'TOUS':(CONFIG.zones[zid]||zid);
  // Update resource panel for this chapter
  updateResPanel(zid);
  renderQ();
}

function renderQ(){
  if(quiz.boucleMode){renderQBoucle();return}
  if(quiz.idx>=quiz.questions.length){checkBoucle();return}
  const q=quiz.questions[quiz.idx];
  const t=quiz.questions.length;
  quiz.essais=0;quiz.answered=false;quiz.hintUsed=false;
  document.getElementById('qNum').textContent=\`\${quiz.idx+1}/\${t}\`;
  document.getElementById('qPbar').style.width=\`\${(quiz.idx/t)*100}%\`;
  document.getElementById('qGood').textContent=quiz.good+'✓';
  document.getElementById('qBad').textContent=quiz.bad+'✗';
  document.getElementById('qScore').textContent=quiz.score.toFixed(1)+'pts';
  document.getElementById('qCat').textContent=(q.categorie||'')+' — '+(CONFIG.zones[q.zone]||q.zone);
  document.getElementById('qText').textContent=q.question;
  document.getElementById('qFeedback').className='q-feedback';
  document.getElementById('qFeedback').style.display='none';
  document.getElementById('qHint').className='q-hint';
  document.getElementById('qHint').textContent=q.aide||'';
  document.getElementById('qNext').style.display='none';
  document.getElementById('qEssais').style.display='';
  document.getElementById('qEssais').textContent='3 essais disponibles';
  const letters='ABCD';
  document.getElementById('qProps').innerHTML=q.propositions.map((p,i)=>
    \`<div class="q-prop" onclick="answerQ(\${i},\${q.reponse})"><span class="letter">\${letters[i]}</span>\${p}</div>\`
  ).join('');
  // Update resource panel for current question's chapter
  updateResPanel(q.zone);
  updateCalcVisibility(q.question);
}

function answerQ(sel,correct){
  if(quiz.answered)return;
  quiz.essais++;
  const ok=sel===correct;
  const q=quiz.questions[quiz.boucleMode?quiz.boucleQuestions[quiz.boucleIdx]._origIdx:quiz.idx];

  if(ok){
    quiz.answered=true;
    let pts=0;
    if(quiz.essais===1&&!quiz.hintUsed) pts=2.0;
    else if(quiz.essais===1&&quiz.hintUsed) pts=1.5;
    else if(quiz.essais===2) pts=1.0;
    else if(quiz.essais===3) pts=0.5;
    quiz.score+=pts;
    quiz.good++;

    document.querySelectorAll('#qProps .q-prop').forEach((el,i)=>{
      el.classList.add('locked');
      if(i===correct)el.classList.add('correct');
    });

    const fb=document.getElementById('qFeedback');fb.style.display='block';
    const cls=quiz.hintUsed?'q-feedback show ok-aide':'q-feedback show ok';
    const icon=quiz.hintUsed?'🟠':'✅';
    const title=quiz.hintUsed?'Bonne réponse (avec aide)':'Bonne réponse !';
    fb.className=cls;
    fb.innerHTML=\`<b>\${icon} \${title}</b> (+\${pts} pt\${pts>1?'s':''})\`+
      (quiz.essais>1?\`<br><span style="font-size:.8rem;color:var(--txt2)">Réussi en \${quiz.essais} essai(s)</span>\`:'')+
      \`<br><span style="font-size:.8rem">\${(q.remediation||'').replace(/\\\\n/g,'<br>')}</span>\`;
    document.getElementById('qNext').style.display='';
    document.getElementById('qEssais').style.display='none';

    ST.total++;ST.correct++;
    const zs=ST.qz[q.zone]||{total:0,ok:0};zs.total++;zs.ok++;ST.qz[q.zone]=zs;
    saveST();updateTopbar();

  } else if(quiz.essais>=quiz.maxEssais){
    quiz.answered=true;
    quiz.bad++;
    if(!quiz.boucleMode) quiz.questionsRatees.push(quiz.idx);

    document.querySelectorAll('#qProps .q-prop').forEach((el,i)=>{
      el.classList.add('locked');
      if(i===correct)el.classList.add('correct');
      if(i===sel)el.classList.add('wrong');
    });

    const fb=document.getElementById('qFeedback');fb.style.display='block';
    fb.className='q-feedback show ko';
    fb.innerHTML=\`<b>❌ Échec après 3 essais</b><br><b>Bonne réponse :</b> \${q.propositions[correct]}<br>\`+
      \`<span style="font-size:.8rem">\${(q.remediation||'').replace(/\\\\n/g,'<br>')}</span>\`+
      (!quiz.boucleMode?'<br><span style="font-size:.8rem;color:var(--orange)">⚠️ Cette question sera reposée en fin de chapitre</span>':'');
    document.getElementById('qNext').style.display='';
    document.getElementById('qEssais').style.display='none';

    ST.total++;
    const zs=ST.qz[q.zone]||{total:0,ok:0};zs.total++;ST.qz[q.zone]=zs;
    saveST();updateTopbar();

  } else {
    const reste=quiz.maxEssais-quiz.essais;
    document.querySelectorAll('#qProps .q-prop')[sel].classList.add('wrong','locked');
    document.querySelectorAll('#qProps .q-prop')[sel].onclick=null;

    const fb=document.getElementById('qFeedback');fb.style.display='block';
    fb.className='q-feedback show ko';
    fb.innerHTML=\`<b>❌ Réponse incorrecte</b><br>\`+
      (quiz.essais===1?'Réfléchissez bien, il vous reste 2 essais.':"⚠️ Dernier essai ! Utilisez l'aide si nécessaire.")+
      \`<br><b>Essais restants : \${reste}</b>\`;
    document.getElementById('qEssais').textContent=\`\${reste} essai\${reste>1?'s':''} restant\${reste>1?'s':''}\`;
  }
  document.getElementById('qGood').textContent=quiz.good+'✓';
  document.getElementById('qBad').textContent=quiz.bad+'✗';
  document.getElementById('qScore').textContent=quiz.score.toFixed(1)+'pts';
}

function toggleHint(){
  const h=document.getElementById('qHint');
  h.classList.toggle('show');
  if(h.classList.contains('show'))quiz.hintUsed=true;
}

function qNextQ(){
  if(quiz.boucleMode){quiz.boucleIdx++;renderQBoucle();return}
  quiz.idx++;renderQ();
}

// ============================================================
// BOUCLE DE REMÉDIATION
// ============================================================
function checkBoucle(){
  if(quiz.questionsRatees.length>0){
    const n=quiz.questionsRatees.length;
    if(confirm(\`⚠️ \${n} question\${n>1?'s':''} ratée\${n>1?'s':''}.\n\nPour valider votre compréhension, ces questions vont être reposées.\n\nVoulez-vous continuer ?\`)){
      quiz.boucleMode=true;
      quiz.boucleIdx=0;
      quiz.boucleQuestions=quiz.questionsRatees.map(idx=>({...quiz.questions[idx],_origIdx:idx}));
      shuffle(quiz.boucleQuestions);
      renderQBoucle();
    }else{
      showQResults();
    }
  }else{
    showQResults();
  }
}

function renderQBoucle(){
  if(quiz.boucleIdx>=quiz.boucleQuestions.length){
    showQResults();return;
  }
  const q=quiz.boucleQuestions[quiz.boucleIdx];
  const t=quiz.boucleQuestions.length;
  quiz.essais=0;quiz.answered=false;quiz.hintUsed=false;
  document.getElementById('qNum').textContent=\`🔄 Révision \${quiz.boucleIdx+1}/\${t}\`;
  document.getElementById('qPbar').style.width=\`\${(quiz.boucleIdx/t)*100}%\`;
  document.getElementById('qZoneTag').textContent='🔄 RÉVISION';
  document.getElementById('qCat').textContent=(q.categorie||'')+' — Révision';
  document.getElementById('qText').textContent=q.question;
  document.getElementById('qFeedback').className='q-feedback';
  document.getElementById('qFeedback').style.display='none';
  document.getElementById('qHint').className='q-hint';
  document.getElementById('qHint').textContent=q.aide||'';
  document.getElementById('qNext').style.display='none';
  document.getElementById('qEssais').style.display='';
  document.getElementById('qEssais').textContent='🔄 3 essais (mode révision)';
  const letters='ABCD';
  document.getElementById('qProps').innerHTML=q.propositions.map((p,i)=>
    \`<div class="q-prop" onclick="answerQ(\${i},\${q.reponse})"><span class="letter">\${letters[i]}</span>\${p}</div>\`
  ).join('');
  updateCalcVisibility(q.question);
}

function quizBack(){
  quiz.boucleMode=false;
  document.getElementById('quizSelect').style.display='';
  document.getElementById('quizPlay').style.display='none';
  buildQuizSelect();
}

function showQResults(){
  quiz.boucleMode=false;
  document.getElementById('quizPlay').style.display='none';
  document.getElementById('quizResults').style.display='';
  const t=quiz.questions.length;
  const maxPts=t*2;
  const pct=Math.round(quiz.score/maxPts*100);
  const pctSimple=Math.round(quiz.good/t*100);
  const cls=pctSimple>=80?'great':pctSimple>=50?'ok':'bad';
  const emoji=pctSimple>=80?'🏆':pctSimple>=50?'👍':'💪';
  const boucleMsg=quiz.questionsRatees.length>0?\`<div style="font-size:.85rem;color:var(--txt2);margin:.5rem 0">🔄 \${quiz.questionsRatees.length} question\${quiz.questionsRatees.length>1?'s':''} revue\${quiz.questionsRatees.length>1?'s':''} en remédiation</div>\`:'';
  document.getElementById('qResults').innerHTML=\`
    <h2>\${emoji} Chapitre terminé !</h2>
    <div class="big \${cls}">\${pctSimple}%</div>
    <div class="sub">\${quiz.good} bonnes sur \${t} · Score : \${quiz.score.toFixed(1)}/\${maxPts} pts</div>
    \${boucleMsg}
    <div class="results-actions">
      <button class="btn btn-ghost" onclick="quizBack()">← Chapitres</button>
      <button class="btn btn-orange" onclick="startZoneQuiz('\${quiz.zone}')">🔄 Recommencer</button>
      <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
    </div>\`;
}

// ============================================================
// EVALUATION MODE
// ============================================================
let evl={questions:[],idx:0,good:0,bad:0,timer:60,timerID:null};

function startEval(){
  const count=parseInt(getChip('evalCount'))||40;
  const timer=parseInt(getChip('evalTimer'))||0;
  let pool=[...QUESTIONS];
  shuffle(pool);
  pool=pool.slice(0,count);
  evl={questions:pool,idx:0,good:0,bad:0,timer,timerID:null};
  document.getElementById('evalConfig').style.display='none';
  document.getElementById('evalPlay').style.display='';
  document.getElementById('evalResults').style.display='none';
  renderE();
}

function renderE(){
  if(evl.idx>=evl.questions.length){showEResults();return}
  const q=evl.questions[evl.idx],t=evl.questions.length;
  document.getElementById('eNum').textContent=\`\${evl.idx+1}/\${t}\`;
  document.getElementById('ePbar').style.width=\`\${(evl.idx/t)*100}%\`;
  document.getElementById('eGood').textContent=evl.good+'✓';
  document.getElementById('eBad').textContent=evl.bad+'✗';
  document.getElementById('eZoneTag').textContent=CONFIG.zones[q.zone]||q.zone;
  document.getElementById('eCat').textContent=q.categorie||'';
  document.getElementById('eText').textContent=q.question;
  document.getElementById('eFeedback').className='q-feedback';document.getElementById('eFeedback').style.display='none';
  document.getElementById('eNext').style.display='none';
  const letters='ABCD';
  document.getElementById('eProps').innerHTML=q.propositions.map((p,i)=>
    \`<div class="q-prop" onclick="answerE(\${i},\${q.reponse})"><span class="letter">\${letters[i]}</span>\${p}</div>\`
  ).join('');
  if(evl.timer>0){
    let rem=evl.timer;
    const te=document.getElementById('eTimer');
    te.textContent='⏱ '+rem;te.className='timer';
    clearInterval(evl.timerID);
    evl.timerID=setInterval(()=>{
      rem--;te.textContent='⏱ '+rem;
      if(rem<=10)te.className='timer warn';
      if(rem<=0){clearInterval(evl.timerID);eTimeUp()}
    },1000);
  }else{document.getElementById('eTimer').textContent=''}
  updateCalcVisibility(q.question);
}

function answerE(sel,correct){
  clearInterval(evl.timerID);
  const ok=sel===correct;
  document.querySelectorAll('#eProps .q-prop').forEach((el,i)=>{
    el.classList.add('locked');if(i===correct)el.classList.add('correct');if(i===sel&&!ok)el.classList.add('wrong');
  });
  if(ok)evl.good++;else evl.bad++;
  const q=evl.questions[evl.idx];
  const fb=document.getElementById('eFeedback');
  fb.style.display='block';fb.className='q-feedback show '+(ok?'ok':'ko');
  fb.innerHTML=ok?'✅ Correct':'❌ Réponse : '+q.propositions[correct];
  document.getElementById('eNext').style.display='';
  document.getElementById('eGood').textContent=evl.good+'✓';document.getElementById('eBad').textContent=evl.bad+'✗';
  ST.total++;if(ok)ST.correct++;const zs=ST.qz[q.zone]||{total:0,ok:0};zs.total++;if(ok)zs.ok++;ST.qz[q.zone]=zs;
  saveST();updateTopbar();
}

function eTimeUp(){
  const q=evl.questions[evl.idx];evl.bad++;
  document.querySelectorAll('#eProps .q-prop').forEach((el,i)=>{el.classList.add('locked');if(i===q.reponse)el.classList.add('correct')});
  document.getElementById('eFeedback').style.display='block';
  document.getElementById('eFeedback').className='q-feedback show ko';
  document.getElementById('eFeedback').innerHTML='⏱ Temps écoulé — Réponse : '+q.propositions[q.reponse];
  document.getElementById('eNext').style.display='';
  ST.total++;saveST();updateTopbar();
}

function eNextQ(){evl.idx++;renderE()}

function showEResults(){
  document.getElementById('evalPlay').style.display='none';
  document.getElementById('evalResults').style.display='';
  const t=evl.questions.length,pct=Math.round(evl.good/t*100);
  const cls=pct>=80?'great':pct>=50?'ok':'bad';
  const pass=pct>=75;
  document.getElementById('eResults').innerHTML=\`
    <h2>\${pass?'🎓 Réussi !':'❌ Non validé'}</h2>
    <div class="big \${cls}">\${pct}%</div>
    <div class="sub">\${evl.good}/\${t} — seuil de réussite : 75%</div>
    <div class="results-actions">
      <button class="btn btn-ghost" onclick="document.getElementById('evalConfig').style.display='';document.getElementById('evalResults').style.display='none'">⚙️ Config</button>
      <button class="btn btn-orange" onclick="startEval()">🔄 Recommencer</button>
      <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
    </div>\`;
}

// ============================================================
// SYMBOLS - CATALOGUE
// ============================================================
let symCatFilter='all';

function buildSymCatalogue(){
  const cats={};SYMBOLS.forEach(s=>{cats[s.c]=(cats[s.c]||0)+1});
  let html='<button class="fbtn active" data-fc="all" onclick="symFilterCat(\\\'all\\\')">Tous '+SYMBOLS.length+'</button>';
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>{
    html+=\`<button class="fbtn" data-fc="\${c}" onclick="symFilterCat('\${c}')">\${CAT_ICONS[c]||''} \${CAT_LABELS[c]||c} \${n}</button>\`;
  });
  document.getElementById('symCatFilters').innerHTML=html;
  filterSymbols();
}

function symFilterCat(c){symCatFilter=c;document.querySelectorAll('#symCatFilters .fbtn').forEach(b=>b.classList.toggle('active',b.dataset.fc===c));filterSymbols()}

function filterSymbols(){
  const q=(document.getElementById('symSearch').value||'').toLowerCase();
  const grid=document.getElementById('symGrid');
  const filtered=SYMBOLS.filter(s=>{
    if(symCatFilter!=='all'&&s.c!==symCatFilter)return false;
    if(q&&!s.n.toLowerCase().includes(q)&&!s.d.toLowerCase().includes(q))return false;
    return true;
  });
  grid.innerHTML=filtered.map(s=>\`
    <div class="sym-card" onclick="showSymModal('\${s.id}')">
      <div class="svgbox">\${s.s}</div>
      <div class="sname">\${s.n}</div>
      <div class="scat">\${CAT_ICONS[s.c]||''} \${CAT_LABELS[s.c]||s.c}</div>
    </div>\`).join('');
}

function showSymModal(id){
  const s=SYMBOLS.find(x=>x.id===id);if(!s)return;
  document.getElementById('mSvg').innerHTML=s.s;
  document.getElementById('mName').textContent=s.n;
  document.getElementById('mDesc').textContent=s.d;
  document.getElementById('mMeta').textContent=(CAT_ICONS[s.c]||'')+' '+(CAT_LABELS[s.c]||s.c)+' — '+(s.t==='schema'?'📐 Schéma normé':'🎨 Dessin');
  document.getElementById('modalBg').classList.add('show');
}
function closeModal(){document.getElementById('modalBg').classList.remove('show')}

// ============================================================
// SYMBOLS - QUIZ
// ============================================================
let sq={questions:[],idx:0,good:0,bad:0,timer:0,timerID:null};

function symSub(id){
  ['sym-cat','sym-quiz','sym-match','sym-results'].forEach(x=>document.getElementById(x).style.display=x===id?'':'none');
  if(id==='sym-cat')buildSymCatalogue();
}

function startSymQuiz(mode){
  const isSpeed=mode==='speed';
  const pool=shuffle([...SYMBOLS]).slice(0,isSpeed?20:10);
  if(pool.length<4){alert('Pas assez de symboles');return}
  const questions=pool.map(correct=>{
    const sameCat=SYMBOLS.filter(s=>s.c===correct.c&&s.id!==correct.id);
    const other=SYMBOLS.filter(s=>s.c!==correct.c);
    let dist=shuffle(sameCat).slice(0,2);
    dist=dist.concat(shuffle(other).slice(0,3-dist.length));
    const qMode=mode==='speed'?(Math.random()>.5?'identify':'find'):mode;
    return{correct,dist:dist.slice(0,3),mode:qMode};
  });
  sq={questions,idx:0,good:0,bad:0,timer:isSpeed?15:0,timerID:null};
  symSub('sym-quiz');
  renderSQ();
}

function renderSQ(){
  if(sq.idx>=sq.questions.length){showSQResults();return}
  const q=sq.questions[sq.idx],t=sq.questions.length;
  document.getElementById('sqNum').textContent=\`\${sq.idx+1}/\${t}\`;
  document.getElementById('sqPbar').style.width=\`\${(sq.idx/t)*100}%\`;
  document.getElementById('sqGood').textContent=sq.good+'✓';
  document.getElementById('sqBad').textContent=sq.bad+'✗';
  document.getElementById('sqFb').className='q-feedback';document.getElementById('sqFb').style.display='none';
  document.getElementById('sqNext').style.display='none';
  const opts=shuffle([q.correct,...q.dist]);
  const area=document.getElementById('sqArea');
  if(q.mode==='identify'){
    area.innerHTML=\`<h3 style="text-align:center;margin-bottom:.5rem">Quel est ce composant ?</h3>
      <div class="sq-display">\${q.correct.s}</div>
      <div class="sq-opts">\${opts.map(o=>\`<div class="sq-opt" data-id="\${o.id}" onclick="answerSQ('\${o.id}','\${q.correct.id}',this)">\${o.n}</div>\`).join('')}</div>\`;
  }else{
    area.innerHTML=\`<h3 style="text-align:center;margin-bottom:.5rem">Trouve le symbole</h3>
      <div class="sq-name-display">\${q.correct.n}</div>
      <div class="sq-opts">\${opts.map(o=>\`<div class="sq-opt" data-id="\${o.id}" onclick="answerSQ('\${o.id}','\${q.correct.id}',this)"><div class="optsvg">\${o.s}</div></div>\`).join('')}</div>\`;
  }
  const te=document.getElementById('sqTimer');
  if(sq.timer>0){te.style.display='';let rem=sq.timer;te.textContent='⏱'+rem;te.className='timer';
    clearInterval(sq.timerID);sq.timerID=setInterval(()=>{rem--;te.textContent='⏱'+rem;if(rem<=5)te.className='timer warn';if(rem<=0){clearInterval(sq.timerID);sqTimeUp()}},1000);
  }else{te.style.display='none'}
}

function answerSQ(sel,correct,el){
  clearInterval(sq.timerID);const ok=sel===correct;
  document.querySelectorAll('#sqArea .sq-opt').forEach(b=>{b.classList.add('locked');if(b.dataset.id===correct)b.classList.add('correct');if(b.dataset.id===sel&&!ok)b.classList.add('wrong')});
  if(ok)sq.good++;else sq.bad++;
  const fb=document.getElementById('sqFb');fb.style.display='block';fb.className='q-feedback show '+(ok?'ok':'ko');
  fb.textContent=ok?'✅ Bravo !':'❌ C\\'était : '+SYMBOLS.find(s=>s.id===correct).n;
  document.getElementById('sqNext').style.display='';document.getElementById('sqGood').textContent=sq.good+'✓';document.getElementById('sqBad').textContent=sq.bad+'✗';
  ST.total++;if(ok)ST.correct++;saveST();updateTopbar();
}

function sqTimeUp(){const q=sq.questions[sq.idx];sq.bad++;
  document.querySelectorAll('#sqArea .sq-opt').forEach(b=>{b.classList.add('locked');if(b.dataset.id===q.correct.id)b.classList.add('correct')});
  document.getElementById('sqFb').style.display='block';document.getElementById('sqFb').className='q-feedback show ko';
  document.getElementById('sqFb').textContent='⏱ Temps écoulé — C\\'était : '+q.correct.n;
  document.getElementById('sqNext').style.display='';ST.total++;saveST();updateTopbar();
}
function sqNextQ(){sq.idx++;renderSQ()}

function showSQResults(){
  symSub('sym-results');
  const t=sq.questions.length,pct=Math.round(sq.good/t*100);
  const cls=pct>=80?'great':pct>=50?'ok':'bad';
  document.getElementById('sqResults').innerHTML=\`
    <h2>\${pct>=80?'🏆':'💪'} Symboles terminé !</h2>
    <div class="big \${cls}">\${pct}%</div>
    <div class="sub">\${sq.good}/\${t} bonnes réponses</div>
    <div class="results-actions">
      <button class="btn btn-ghost" onclick="symSub('sym-cat')">📖 Catalogue</button>
      <button class="btn btn-orange" onclick="startSymQuiz('identify')">🔄 Rejouer</button>
      <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
    </div>\`;
}

// ============================================================
// SYMBOLS - MATCHING
// ============================================================
let sm={pairs:[],sel:null,found:0,errors:0,total:5};

function startSymMatch(){
  const pairs=shuffle([...SYMBOLS]).slice(0,5);
  sm={pairs,sel:null,found:0,errors:0,total:5};
  symSub('sym-match');renderMatch();
}

function renderMatch(){
  const left=shuffle([...sm.pairs]),right=shuffle([...sm.pairs]);
  document.getElementById('smArea').innerHTML=\`
    <div class="match-col"><h3>Symboles</h3>\${left.map(s=>\`<div class="match-item" data-id="\${s.id}" data-side="l" onclick="mClick(this)"><div class="msvg">\${s.s}</div></div>\`).join('')}</div>
    <div class="match-col"><h3>Noms</h3>\${right.map(s=>\`<div class="match-item" data-id="\${s.id}" data-side="r" onclick="mClick(this)"><div class="mlabel">\${s.n}</div></div>\`).join('')}</div>\`;
  document.getElementById('smStatus').textContent=\`\${sm.found}/\${sm.total} trouvés\`;
  document.getElementById('smErrors').textContent=sm.errors+' erreur'+(sm.errors>1?'s':'');
}

function mClick(el){
  if(el.classList.contains('matched'))return;
  if(!sm.sel){sm.sel={id:el.dataset.id,side:el.dataset.side,el};el.classList.add('selected');return}
  if(el.dataset.side===sm.sel.side){sm.sel.el.classList.remove('selected');sm.sel={id:el.dataset.id,side:el.dataset.side,el};el.classList.add('selected');return}
  if(el.dataset.id===sm.sel.id){el.classList.add('matched');sm.sel.el.classList.add('matched');sm.sel.el.classList.remove('selected');sm.found++;
    ST.total++;ST.correct++;saveST();updateTopbar();
  }else{sm.errors++;el.classList.add('wrong-flash');sm.sel.el.classList.add('wrong-flash');
    setTimeout(()=>{el.classList.remove('wrong-flash');sm.sel.el.classList.remove('wrong-flash','selected');sm.sel=null},400);
    document.getElementById('smErrors').textContent=sm.errors+' erreur'+(sm.errors>1?'s':'');return;
  }
  sm.sel=null;document.getElementById('smStatus').textContent=\`\${sm.found}/\${sm.total} trouvés\`;
  if(sm.found===sm.total)setTimeout(()=>{
    symSub('sym-results');
    document.getElementById('sqResults').innerHTML=\`
      <h2>\${sm.errors===0?'🏆 Sans faute !':'👍 Bien joué !'}</h2>
      <div class="big \${sm.errors===0?'great':'ok'}">\${sm.total}/\${sm.total}</div>
      <div class="sub">\${sm.errors} erreur\${sm.errors>1?'s':''}</div>
      <div class="results-actions">
        <button class="btn btn-ghost" onclick="symSub('sym-cat')">📖 Catalogue</button>
        <button class="btn btn-orange" onclick="startSymMatch()">🔄 Rejouer</button>
        <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
      </div>\`;
  },500);
}

// ============================================================
// ELECTRICAL (text-only)
// ============================================================
let elecCatFilter='all';

function buildElecCatalogue(){
  const cats={};ELEC_SYMS.forEach(s=>{cats[s.c]=(cats[s.c]||0)+1});
  let html=\`<button class="fbtn active" data-ec="all" onclick="elecFilter('all')">Tous \${ELEC_SYMS.length}</button>\`;
  Object.entries(cats).forEach(([c,n])=>{html+=\`<button class="fbtn" data-ec="\${c}" onclick="elecFilter('\${c}')">\${ELEC_CATS[c]||c} \${n}</button>\`});
  document.getElementById('elecCatFilters').innerHTML=html;
  renderElec();
}

function elecFilter(c){elecCatFilter=c;document.querySelectorAll('#elecCatFilters .fbtn').forEach(b=>b.classList.toggle('active',b.dataset.ec===c));renderElec()}

function renderElec(){
  const filtered=elecCatFilter==='all'?ELEC_SYMS:ELEC_SYMS.filter(s=>s.c===elecCatFilter);
  document.getElementById('elecGrid').innerHTML=filtered.map(s=>\`
    <div class="elec-card"><div class="ename">\${s.n}</div><div class="edesc">\${s.d}</div><div class="ecat">\${ELEC_CATS[s.c]||s.c}</div></div>
  \`).join('');
}

let eq={questions:[],idx:0,good:0,bad:0};

function startElecQuiz(){
  const pool=shuffle([...ELEC_SYMS]).slice(0,Math.min(15,ELEC_SYMS.length));
  const questions=pool.map(correct=>{
    const dist=shuffle(ELEC_SYMS.filter(s=>s.id!==correct.id)).slice(0,3);
    const mode=Math.random()>.5?'name':'desc';
    return{correct,dist,mode};
  });
  eq={questions,idx:0,good:0,bad:0};
  document.getElementById('elec-quiz').style.display='';
  document.getElementById('elec-results').style.display='none';
  renderEQ();
}
function hideElecQuiz(){document.getElementById('elec-quiz').style.display='none';document.getElementById('elec-results').style.display='none'}

function renderEQ(){
  if(eq.idx>=eq.questions.length){showEQResults();return}
  const q=eq.questions[eq.idx],t=eq.questions.length;
  document.getElementById('eqNum').textContent=\`\${eq.idx+1}/\${t}\`;
  document.getElementById('eqPbar').style.width=\`\${(eq.idx/t)*100}%\`;
  document.getElementById('eqGood').textContent=eq.good+'✓';document.getElementById('eqBad').textContent=eq.bad+'✗';
  document.getElementById('eqFb').className='q-feedback';document.getElementById('eqFb').style.display='none';
  document.getElementById('eqNext').style.display='none';
  const opts=shuffle([q.correct,...q.dist]);
  const area=document.getElementById('eqArea');
  if(q.mode==='name'){
    area.innerHTML=\`<h3 style="margin-bottom:.5rem">Quelle est la fonction de ce composant ?</h3>
      <div class="sq-name-display">\${q.correct.n}</div>
      <div class="sq-opts">\${opts.map(o=>\`<div class="sq-opt" data-id="\${o.id}" onclick="answerEQ('\${o.id}','\${q.correct.id}',this)">\${o.d}</div>\`).join('')}</div>\`;
  }else{
    area.innerHTML=\`<h3 style="margin-bottom:.5rem">Quel composant correspond à cette description ?</h3>
      <div style="padding:.8rem;background:var(--gris);border-radius:8px;margin-bottom:.8rem;font-size:.9rem;text-align:center">\${q.correct.d}</div>
      <div class="sq-opts">\${opts.map(o=>\`<div class="sq-opt" data-id="\${o.id}" onclick="answerEQ('\${o.id}','\${q.correct.id}',this)">\${o.n}</div>\`).join('')}</div>\`;
  }
}

function answerEQ(sel,correct){
  const ok=sel===correct;
  document.querySelectorAll('#eqArea .sq-opt').forEach(b=>{b.classList.add('locked');if(b.dataset.id===correct)b.classList.add('correct');if(b.dataset.id===sel&&!ok)b.classList.add('wrong')});
  if(ok)eq.good++;else eq.bad++;
  const fb=document.getElementById('eqFb');fb.style.display='block';fb.className='q-feedback show '+(ok?'ok':'ko');
  fb.textContent=ok?'✅ Correct !':'❌ C\\'était : '+ELEC_SYMS.find(s=>s.id===correct).n;
  document.getElementById('eqNext').style.display='';document.getElementById('eqGood').textContent=eq.good+'✓';document.getElementById('eqBad').textContent=eq.bad+'✗';
  ST.total++;if(ok)ST.correct++;saveST();updateTopbar();
}
function eqNextQ(){eq.idx++;renderEQ()}

function showEQResults(){
  document.getElementById('elec-quiz').style.display='none';
  document.getElementById('elec-results').style.display='';
  const t=eq.questions.length,pct=Math.round(eq.good/t*100);
  const cls=pct>=80?'great':pct>=50?'ok':'bad';
  document.getElementById('eqResults').innerHTML=\`
    <h2>\${pct>=80?'🏆':'💪'} Quiz Électro terminé !</h2>
    <div class="big \${cls}">\${pct}%</div>
    <div class="sub">\${eq.good}/\${t} bonnes réponses</div>
    <div class="results-actions">
      <button class="btn btn-ghost" onclick="hideElecQuiz();document.getElementById('elec-results').style.display='none'">← Retour</button>
      <button class="btn btn-orange" onclick="startElecQuiz()">🔄 Rejouer</button>
      <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
    </div>\`;
}

// ============================================================
// STATS
// ============================================================
function buildStats(){
  const zones=CONFIG.zones||{};
  let html=\`<div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:1rem">
    <div style="text-align:center;padding:1rem;background:var(--gris);border-radius:8px">
      <div style="font-size:2rem;font-weight:800;color:var(--bleu)">\${ST.total}</div>
      <div style="font-size:.8rem;color:var(--txt2)">Questions répondues</div>
    </div>
    <div style="text-align:center;padding:1rem;background:var(--gris);border-radius:8px">
      <div style="font-size:2rem;font-weight:800;color:var(--vert)">\${ST.total>0?Math.round(ST.correct/ST.total*100):0}%</div>
      <div style="font-size:.8rem;color:var(--txt2)">Score global</div>
    </div>
  </div>\`;
  html+='<h3 style="margin-bottom:.5rem">Par chapitre</h3>';
  Object.entries(zones).forEach(([zid,zname])=>{
    const zs=ST.qz[zid]||{total:0,ok:0};
    const pct=zs.total>0?Math.round(zs.ok/zs.total*100):0;
    html+=\`<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
      <span style="font-size:.8rem;width:160px;color:var(--txt2)">\${CHAP_ICONS[zid]||''} \${zname.substring(0,22)}</span>
      <div style="flex:1;height:6px;background:var(--gris2);border-radius:3px;overflow:hidden"><div style="height:100%;width:\${pct}%;background:\${pct>=80?'var(--vert)':pct>=50?'var(--orange)':'var(--gris3)'};border-radius:3px"></div></div>
      <span style="font-size:.75rem;font-weight:600;width:35px;text-align:right">\${pct}%</span>
      <span style="font-size:.7rem;color:var(--txt3);width:40px">\${zs.total}q</span>
    </div>\`;
  });
  html+=\`<div style="margin-top:1rem;text-align:center"><button class="btn btn-ghost btn-sm" onclick="if(confirm('Effacer toutes les statistiques ?')){ST={qz:{},sym:{},elec:{},total:0,correct:0};saveST();updateTopbar();buildStats()}">🗑️ Réinitialiser</button></div>\`;
  document.getElementById('statsContent').innerHTML=html;
}

// ============================================================
// UTILS
// ============================================================
function getChip(containerId){
  const el=document.querySelector('#'+containerId+' .fbtn.active');
  return el?el.dataset.v:null;
}
document.querySelectorAll('#evalCount,#evalTimer').forEach(container=>{
  container.querySelectorAll('.fbtn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      container.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

(function(){
  const zones=CONFIG.zones||{};
  const c=document.getElementById('evalZones');
  let h='<span class="fbtn active" data-v="all">Tous</span>';
  Object.entries(zones).forEach(([zid,zname])=>{
    h+=\`<span class="fbtn" data-v="\${zid}">\${CHAP_ICONS[zid]||''} \${zid.replace('ch','Ch')}</span>\`;
  });
  c.innerHTML=h;
  c.querySelectorAll('.fbtn').forEach(btn=>{
    btn.addEventListener('click',()=>{c.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));btn.classList.add('active')});
  });
})();

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

// ============================================================
// CALCULATRICE
// ============================================================
let calcState={val:'0',op:null,prev:null,fresh:true};

function toggleCalc(){document.getElementById('calcWidget').classList.toggle('open')}

function calcPress(k){
  const scr=document.getElementById('calcScreen');
  if(k==='C'){calcState={val:'0',op:null,prev:null,fresh:true};scr.textContent='0';return}
  if(k==='±'){calcState.val=String(-parseFloat(calcState.val));scr.textContent=calcState.val;return}
  if(k==='%'){calcState.val=String(parseFloat(calcState.val)/100);scr.textContent=calcState.val;return}
  if('0123456789.'.includes(k)){
    if(calcState.fresh){calcState.val=k==='.'?'0.':k;calcState.fresh=false}
    else{if(k==='.'&&calcState.val.includes('.'))return;calcState.val+=k}
    scr.textContent=calcState.val;return
  }
  if('+-×÷'.includes(k)){
    if(calcState.op&&!calcState.fresh){calcExec()}
    calcState.prev=parseFloat(calcState.val);calcState.op=k;calcState.fresh=true;return
  }
  if(k==='='){calcExec();calcState.op=null}
}

function calcExec(){
  if(calcState.op===null||calcState.prev===null)return;
  const a=calcState.prev,b=parseFloat(calcState.val);
  let r=0;
  switch(calcState.op){
    case'+':r=a+b;break;case'-':r=a-b;break;
    case'×':r=a*b;break;case'÷':r=b!==0?a/b:0;break;
  }
  calcState.val=String(Math.round(r*10000)/10000);
  calcState.prev=r;calcState.fresh=true;
  document.getElementById('calcScreen').textContent=calcState.val;
}

function updateCalcVisibility(questionText){
  const btn=document.getElementById('calcToggle');
  const widget=document.getElementById('calcWidget');
  if(!btn)return;
  const inQuiz=document.getElementById('s-quiz')&&document.getElementById('s-quiz').classList.contains('active');
  const inEval=document.getElementById('s-eval')&&document.getElementById('s-eval').classList.contains('active');
  btn.style.display=(inQuiz||inEval)?'block':'none';
  const txt=(questionText||'').toLowerCase();
  const isCalcQ = (
    (txt.includes('kg') && /r\\d{2,3}/.test(txt) && (txt.includes('teq co2') || txt.includes('teq co₂') || txt.includes('quelle est sa'))) ||
    (txt.includes('charge') && txt.includes('gwp') && txt.includes('calcul'))
  );
  if(isCalcQ){
    widget.classList.add('calc-blocked');
    btn.classList.add('blocked');
    btn.title='🚫 Calculatrice bloquée — calculez de tête !';
  }else{
    widget.classList.remove('calc-blocked');
    btn.classList.remove('blocked');
    btn.title='Calculatrice';
  }
}

// ============================================================
// RESOURCE SIDE PANEL (chapter-aware)
// ============================================================
function toggleRes(){document.getElementById('resPanel').classList.toggle('open')}

function updateResPanel(chapterId){
  // Show/hide chapter-specific resources
  document.querySelectorAll('.res-chapter').forEach(el=>el.classList.remove('active'));
  const chEl=document.getElementById('res-'+chapterId);
  if(chEl) chEl.classList.add('active');
  // Fallback to general
  const genEl=document.getElementById('res-general');
  if(!chEl && genEl) genEl.classList.add('active');
}

function resTab(id,btn){
  document.querySelectorAll('.res-content').forEach(c=>c.classList.remove('active'));
  document.querySelectorAll('.res-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(btn)btn.classList.add('active');
}

// ============================================================
// FICHES MEMO
// ============================================================
function showFiche(id){
  document.querySelectorAll('.fiche-panel').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('fiche-'+id);if(el)el.classList.add('active');
  document.querySelectorAll('#s-fiches .fbtn.dom').forEach(b=>b.classList.remove('active'));
  if(event&&event.target)event.target.classList.add('active');
}

// ============================================================
// SIMULATEURS
// ============================================================
function simUpdateGWP(){
  const v=document.getElementById('simFluide').value;
  const inp=document.getElementById('simGWP');
  if(v==='custom'){inp.value='';inp.readOnly=false;inp.focus()}
  else if(v){inp.value=v;inp.readOnly=true}
  else{inp.value='';inp.readOnly=true}
}

function simCalc(){
  const gwp=parseFloat(document.getElementById('simGWP').value);
  const charge=parseFloat(document.getElementById('simCharge').value);
  if(!gwp||!charge){alert('⚠️ Remplissez tous les champs');return}
  const tco2=(charge*gwp)/1000;
  let oblig='',cls='';
  if(tco2<5){oblig='✅ Aucune obligation de contrôle';cls='background:var(--vert2);border:1px solid #a3e4bc'}
  else if(tco2<50){oblig='⏱️ Contrôle <b>ANNUEL</b> (12 mois)';cls='background:var(--vert2);border:1px solid #a3e4bc'}
  else if(tco2<500){oblig='⏱️ Contrôle <b>SEMESTRIEL</b> (6 mois)';cls='background:#fffde7;border:1px solid #fff9c4'}
  else{oblig='🚨 Contrôle <b>TRIMESTRIEL</b> + détection auto <b>OBLIGATOIRE</b>';cls='background:var(--rouge2);border:1px solid #f5b7b1'}
  const r=document.getElementById('simResult');
  r.style.display='block';r.style.cssText='display:block;margin-top:1rem;padding:1rem;border-radius:8px;'+cls;
  r.innerHTML=\`<div style="font-size:1.8rem;font-weight:800;color:var(--bleu);margin-bottom:.3rem">\${tco2.toFixed(2)} tCO₂e</div><div style="font-size:.9rem">\${oblig}</div>\`;
}

function simFreq(){
  const tco2=parseFloat(document.getElementById('simTCO2').value);
  if(!tco2&&tco2!==0){alert('⚠️ Saisissez une valeur');return}
  let html='',cls='';
  if(tco2<5){html='<b>✅ Aucune obligation</b><br>Installation &lt; 5 tCO₂e';cls='background:var(--vert2);border:1px solid #a3e4bc'}
  else if(tco2<50){html='<b>✅ Contrôle ANNUEL (12 mois)</b><br>Seuil: 5 ≤ tCO₂e &lt; 50<br><span style="font-size:.8rem;color:var(--txt2)">📋 Registre · 📝 Fiche intervention · ⏱️ Réparation fuite: 14j max</span>';cls='background:var(--vert2);border:1px solid #a3e4bc'}
  else if(tco2<500){html='<b>⚠️ Contrôle SEMESTRIEL (6 mois)</b><br>Seuil: 50 ≤ tCO₂e &lt; 500<br><span style="font-size:.8rem;color:var(--txt2)">📋 Registre · 📝 Fiche intervention · ⏱️ Réparation fuite: 14j · 🔍 Renforcé</span>';cls='background:#fffde7;border:1px solid #fff9c4'}
  else{html='<b>🚨 Contrôle TRIMESTRIEL (3 mois)</b><br>Seuil: tCO₂e ≥ 500<br><span style="font-size:.8rem;color:var(--txt2)">📋 Registre · 📝 Fiche · ⏱️ 14j · 🔍 <b>Détection auto OBLIGATOIRE</b></span>';cls='background:var(--rouge2);border:1px solid #f5b7b1'}
  const r=document.getElementById('freqResult');
  r.style.display='block';r.style.cssText='display:block;margin-top:1rem;padding:1rem;border-radius:8px;'+cls;
  r.innerHTML=html;
}

(function(){
  const fluides=[
    {n:'R134a',gwp:1430,c:'#ffe5d9'},{n:'R410A',gwp:2088,c:'#fde8e6'},{n:'R404A',gwp:3922,c:'#fde8e6'},
    {n:'R407C',gwp:1774,c:'#ffe5d9'},{n:'R32',gwp:675,c:'#fffde7'},{n:'R290',gwp:3,c:'#d4edda'},
    {n:'R744 (CO₂)',gwp:1,c:'#d4edda'},{n:'R717 (NH₃)',gwp:'<1',c:'#d4edda'}
  ];
  const el=document.getElementById('fluideRef');
  if(el)el.innerHTML=fluides.map(f=>\`<div style="padding:.6rem;background:\${f.c};border-radius:8px;text-align:center;border-left:3px solid var(--bleu)">
    <div style="font-weight:700;color:var(--bleu)">\${f.n}</div><div style="font-size:.8rem;color:var(--txt2)">GWP: \${f.gwp}</div></div>\`).join('');
})();

// ============================================================
// GLOSSAIRE
// ============================================================
const GLOSSAIRE=${JSON.stringify(GLOSSAIRE)};

let glossFilter='all';
function buildGlossaire(){
  const letters=new Set(GLOSSAIRE.map(g=>g.t[0].toUpperCase()));
  const lc=document.getElementById('glossLetters');
  if(lc)lc.innerHTML='<button class="fbtn active" onclick="glossFilterLetter(\\'all\\')">Tous</button>'+
    [...letters].sort().map(l=>\`<button class="fbtn" onclick="glossFilterLetter('\${l}')">\${l}</button>\`).join('');
  filterGloss();
}

function glossFilterLetter(l){
  glossFilter=l;
  document.querySelectorAll('#glossLetters .fbtn').forEach(b=>b.classList.toggle('active',
    (l==='all'&&b.textContent==='Tous')||b.textContent===l));
  filterGloss();
}

function filterGloss(){
  const q=(document.getElementById('glossSearch')||{}).value||'';
  const ql=q.toLowerCase();
  let items=GLOSSAIRE.filter(g=>{
    if(glossFilter!=='all'&&!g.t.toUpperCase().startsWith(glossFilter))return false;
    if(ql&&!g.t.toLowerCase().includes(ql)&&!g.d.toLowerCase().includes(ql))return false;
    return true;
  });
  items.sort((a,b)=>a.t.localeCompare(b.t));
  const el=document.getElementById('glossList');
  if(!el)return;
  if(!items.length){el.innerHTML='<div style="text-align:center;padding:2rem;color:var(--txt3)">🔍 Aucun résultat</div>';return}
  el.innerHTML=items.map(g=>\`<div class="gloss-item"><span class="gterm">\${g.t}</span><span class="gcat">\${g.c}</span><div class="gdef">\${g.d}</div></div>\`).join('');
}

// ============================================================
// REVISION FLASH
// ============================================================
const FLASHCARDS=${JSON.stringify(FLASHCARDS)};

let flash={cards:[],idx:0,known:0,review:0,flipped:false};

function startFlash(){
  flash={cards:shuffle([...FLASHCARDS]),idx:0,known:0,review:0,flipped:false};
  document.getElementById('flashStart').style.display='none';
  document.getElementById('flashPlay').style.display='';
  document.getElementById('flashResults').style.display='none';
  showFlashCard();
}

function showFlashCard(){
  if(flash.idx>=flash.cards.length){showFlashResults();return}
  const c=flash.cards[flash.idx];
  document.getElementById('flashNum').textContent=\`\${flash.idx+1}/\${flash.cards.length}\`;
  document.getElementById('flashKnown').textContent=flash.known;
  document.getElementById('flashReview').textContent=flash.review;
  document.getElementById('flashPbar').style.width=\`\${(flash.idx/flash.cards.length)*100}%\`;
  const card=document.getElementById('flashCard');
  card.style.background='var(--gris)';card.style.color='var(--bleu)';
  document.getElementById('flashContent').textContent=c.q;
  document.getElementById('flashHintText').textContent='Cliquez pour voir la réponse';
  flash.flipped=false;
}

function flipFlash(){
  const c=flash.cards[flash.idx];
  const card=document.getElementById('flashCard');
  flash.flipped=!flash.flipped;
  if(flash.flipped){
    card.style.background='linear-gradient(135deg,var(--bleu),var(--bleu2))';card.style.color='#fff';
    document.getElementById('flashContent').textContent=c.a;
    document.getElementById('flashHintText').textContent='Cliquez pour retourner';
  }else{
    card.style.background='var(--gris)';card.style.color='var(--bleu)';
    document.getElementById('flashContent').textContent=c.q;
    document.getElementById('flashHintText').textContent='Cliquez pour voir la réponse';
  }
}

function markFlash(known){if(known)flash.known++;else flash.review++;nextFlash()}
function nextFlash(){flash.idx++;showFlashCard()}

function showFlashResults(){
  document.getElementById('flashPlay').style.display='none';
  document.getElementById('flashResults').style.display='';
  const t=flash.cards.length,pct=Math.round(flash.known/t*100);
  const cls=pct>=80?'great':pct>=50?'ok':'bad';
  document.getElementById('flashRes').innerHTML=\`
    <h2>🎉 Révision terminée !</h2>
    <div class="big \${cls}">\${pct}%</div>
    <div class="sub">✅ \${flash.known} connues · ❌ \${flash.review} à revoir</div>
    <div class="results-actions">
      <button class="btn btn-orange" onclick="startFlash()">🔄 Recommencer</button>
      <button class="btn btn-primary" onclick="go('home')">🏠 Accueil</button>
    </div>\`;
}

// ============================================================
// CLASSEMENT / LEADERBOARD
// ============================================================
function getLB(){try{return JSON.parse(localStorage.getItem('fgaz_lb')||'[]')}catch(e){return[]}}
function saveLB(d){localStorage.setItem('fgaz_lb',JSON.stringify(d))}

function addLBScore(){
  const name=document.getElementById('lbName').value.trim();
  const score=parseFloat(document.getElementById('lbScore').value);
  if(!name||isNaN(score)||score<0||score>20){alert('⚠️ Nom + note valide (0-20)');return}
  const lb=getLB();lb.push({name,score,date:new Date().toISOString()});saveLB(lb);
  document.getElementById('lbName').value='';document.getElementById('lbScore').value='';
  renderLB();
}

function renderLB(){
  const lb=getLB().sort((a,b)=>b.score-a.score).slice(0,20);
  const el=document.getElementById('lbList');if(!el)return;
  if(!lb.length){el.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--txt3)">🏆 Aucun score enregistré</div>';return}
  el.innerHTML=lb.map((p,i)=>{
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    return \`<div class="lb-row"><div class="lb-rank">\${medal}</div><div class="lb-name">\${p.name}</div><div class="lb-score">\${p.score}/20</div><div class="lb-pct">\${Math.round(p.score/20*100)}%</div></div>\`;
  }).join('');
}

// ============================================================
// EXPORT CSV
// ============================================================
function exportCSV(){
  const zones=CONFIG.zones||{};
  let csv='Chapitre;Questions;Bonnes;Taux;\\n';
  Object.entries(zones).forEach(([zid,zname])=>{
    const zs=ST.qz[zid]||{total:0,ok:0};
    const pct=zs.total>0?Math.round(zs.ok/zs.total*100):0;
    csv+=\`\${zname};\${zs.total};\${zs.ok};\${pct}%\\n\`;
  });
  csv+=\`\\nTOTAL;\${ST.total};\${ST.correct};\${ST.total>0?Math.round(ST.correct/ST.total*100):0}%\\n\`;
  const blob=new Blob([csv.replace(/\\\\n/g,'\\n')],{type:'text/csv;charset=utf-8;'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);
  link.download='fgaz_v6_resultats_'+new Date().toISOString().split('T')[0]+'.csv';
  document.body.appendChild(link);link.click();document.body.removeChild(link);
}

// ============================================================
// INIT
// ============================================================
buildGlossaire();renderLB();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html, 'utf8');
const sizeMB = (Buffer.byteLength(html, 'utf8') / 1024 / 1024).toFixed(2);
console.log(`\n✅ Fichier écrit: ${OUT}`);
console.log(`   Taille: ${sizeMB} Mo`);
console.log(`   Questions: ${allQuestions.length}`);
console.log(`   Glossaire: ${GLOSSAIRE.length} termes`);
console.log(`   Flash cards: ${FLASHCARDS.length} cartes`);
