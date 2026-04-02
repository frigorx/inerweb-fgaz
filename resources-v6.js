// Resources panel V6 — chapter-specific content
module.exports = {
  buildHTML: function(imgCircuitNum, imgCircuitSym, imgMollier) {
    return `<div class="res-panel" id="resPanel">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
    <h3>📚 Ressources par chapitre</h3>
    <button onclick="toggleRes()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--txt3)">✕</button>
  </div>

  <!-- GENERAL (fallback) -->
  <div id="res-general" class="res-chapter active">
    <div class="res-tabs">
      <button class="res-tab active" onclick="resTab('res-regl',this)">📋 Règlement</button>
      <button class="res-tab" onclick="resTab('res-flu',this)">🧪 Fluides</button>
      <button class="res-tab" onclick="resTab('res-prat',this)">🔧 Pratiques</button>
    </div>
    <div id="res-regl" class="res-content active">
      <b>Seuils et Contrôles d'Étanchéité</b>
      <p>Règlement <b>UE 2024/573</b> — obligations selon charge tCO₂e.</p>
      <div class="res-hl"><b>Formule :</b> tCO₂e = (Charge kg × GWP) / 1000</div>
      <table><tr><th>Charge tCO₂e</th><th>Standard</th><th>Avec détecteur</th></tr>
        <tr><td>&lt; 5 t</td><td>Non obligatoire*</td><td>Non obligatoire</td></tr>
        <tr><td>5 à 50 t</td><td>12 mois</td><td>24 mois</td></tr>
        <tr><td>50 à 500 t</td><td>6 mois</td><td>12 mois</td></tr>
        <tr><td>&gt; 500 t</td><td>3 mois</td><td>6 mois</td></tr>
      </table>
      <p style="font-size:.75rem;color:var(--txt3)">*Sauf hermétiques : seuil 10 t</p>
      <div class="res-hl"><b>Délais :</b> Réparation fuite = 14j · Déclaration = 30j · Registre = 5 ans · Attestation = 7 ans</div>
    </div>
    <div id="res-flu" class="res-content">
      <b>Potentiel de Réchauffement Global (GWP)</b>
      <table><tr><th>Fluide</th><th>Famille</th><th>GWP</th><th>Sécu</th></tr>
        <tr><td><b>R744 (CO₂)</b></td><td>Naturel</td><td>1</td><td><span class="badge-a1">A1</span></td></tr>
        <tr><td><b>R290</b></td><td>HC</td><td>3</td><td>A3</td></tr>
        <tr><td><b>R32</b></td><td>HFC</td><td>675</td><td><span class="badge-a2l">A2L</span></td></tr>
        <tr><td><b>R134a</b></td><td>HFC</td><td>1430</td><td><span class="badge-a1">A1</span></td></tr>
        <tr><td><b>R407C</b></td><td>HFC</td><td>1774</td><td><span class="badge-a1">A1</span></td></tr>
        <tr><td><b>R410A</b></td><td>HFC</td><td>2088</td><td><span class="badge-a1">A1</span></td></tr>
        <tr><td><b>R404A</b></td><td>HFC</td><td>3922</td><td><span class="badge-a1">A1</span></td></tr>
        <tr><td><b>R717</b></td><td>Naturel</td><td>&lt;1</td><td>B2L</td></tr>
      </table>
      <div class="res-hl"><b>Zéotrope</b> (R407C) : glissement 7°C, charge liquide seule<br><b>Azéotrope</b> (R410A) : glissement &lt;0,2°C, charge liq ou gaz</div>
    </div>
    <div id="res-prat" class="res-content">
      <b>Bonnes Pratiques</b>
      <p><b>1. Tirage au vide</b><br>Niveau : 0,5 mbar (500 µ) · Test maintien : 30 min</p>
      <p><b>2. Brasage</b><br>Toujours sous flux d'azote · Métal : cuivre-phosphore ou argent</p>
      <p><b>3. Récupération</b><br>Bouteille grise collerette jaune · Remplissage max 80% · Interdiction mélanger fluides</p>
      <div class="res-hl"><b>Sanctions :</b><br>Dégazage volontaire : 1 500 €<br>Absence de registre : 750 €<br>Défaut d'habilitation : 7 500 €</div>
    </div>
  </div>

  <!-- CH1 - Environnement -->
  <div id="res-ch1" class="res-chapter">
    <h3>🌍 Ch.1 — Environnement & Effet de serre</h3>
    <div class="res-hl"><b>Effet de serre :</b> Phénomène naturel amplifié par les gaz fluorés. Les HFC sont des gaz à effet de serre puissants (GWP élevé).</div>
    <p><b>Couche d'ozone :</b> Protège des UV-B. Les CFC et HCFC la détruisent (ODP > 0). Les HFC ne l'affectent pas (ODP = 0).</p>
    <table><tr><th>Traité</th><th>Date</th><th>Objectif</th></tr>
      <tr><td>Montréal</td><td>1987</td><td>Éliminer substances ODP (CFC, HCFC)</td></tr>
      <tr><td>Kyoto</td><td>1997</td><td>Réduire les 6 GES dont HFC</td></tr>
      <tr><td>Kigali</td><td>2016</td><td>Phase-down mondial des HFC</td></tr>
      <tr><td>Paris (COP21)</td><td>2015</td><td>Limiter le réchauffement à +1,5°C</td></tr>
    </table>
    <div class="res-hl"><b>GWP :</b> Global Warming Potential. Pouvoir de réchauffement sur 100 ans par rapport au CO₂ (ref = 1).<br>
    <b>ODP :</b> Ozone Depletion Potential. Impact sur la couche d'ozone (CFC >> HCFC >> 0 pour HFC).</div>
  </div>

  <!-- CH2 - Réglementation -->
  <div id="res-ch2" class="res-chapter">
    <h3>📋 Ch.2 — Réglementation européenne</h3>
    <div class="res-hl"><b>Règlement UE 2024/573</b> (remplace UE 517/2014) — En vigueur depuis mars 2024.<br>
    <b>Arrêté du 21 novembre 2025</b> — Formation et certification des opérateurs.</div>
    <p><b>Phase-down HFC :</b></p>
    <table><tr><th>Année</th><th>Quota (%)</th><th>Interdictions clés</th></tr>
      <tr><td>2024</td><td>31%</td><td>Nouveau règlement F-Gas</td></tr>
      <tr><td>2025</td><td>24%</td><td>HFC vierge GWP≥2500 interdit maintenance</td></tr>
      <tr><td>2027</td><td>17%</td><td>Remise à niveau obligatoire (7 ans)</td></tr>
      <tr><td>2030</td><td>15%</td><td>Objectif -85% vs 2015</td></tr>
    </table>
    <div class="res-hl"><b>Sanctions :</b><br>
    • Émission volontaire : 1 500 €<br>
    • Absence registre : 750 €<br>
    • Défaut attestation : 7 500 €<br>
    • Obstacle contrôle : 15 000 €</div>
  </div>

  <!-- CH3 - Attestations -->
  <div id="res-ch3" class="res-chapter">
    <h3>🎓 Ch.3 — Attestations & Habilitations</h3>
    <table><tr><th>Catégorie</th><th>Opérations autorisées</th><th>Limite</th></tr>
      <tr><td><b>I</b></td><td>Toutes opérations</td><td>Aucune limite de charge</td></tr>
      <tr><td><b>II</b></td><td>Installation, maintenance, entretien, récupération</td><td>&lt; 2 kg (hermétiques &lt; 6 kg)</td></tr>
      <tr><td><b>III</b></td><td>Récupération uniquement</td><td>&lt; 3 kg (hermétiques &lt; 6 kg)</td></tr>
      <tr><td><b>IV</b></td><td>Contrôle d'étanchéité</td><td>Pas de manipulation de fluide</td></tr>
    </table>
    <div class="res-hl"><b>Attestation d'aptitude</b> = personne physique (technicien)<br>
    <b>Attestation de capacité</b> = personne morale (entreprise)<br>
    <b>Remise à niveau :</b> tous les 7 ans (obligatoire à partir de 2027)</div>
    <p><b>Organismes évaluateurs :</b> Certibat, Cemafroid, AFNOR Certification, Bureau Veritas, etc.</p>
  </div>

  <!-- CH4 - Fluides -->
  <div id="res-ch4" class="res-chapter">
    <h3>🧪 Ch.4 — Les fluides frigorigènes</h3>
    <table><tr><th>Famille</th><th>ODP</th><th>GWP</th><th>Statut</th></tr>
      <tr><td>CFC (R12, R11)</td><td>Élevé</td><td>Élevé</td><td>❌ Interdit (1995)</td></tr>
      <tr><td>HCFC (R22)</td><td>Faible</td><td>Moyen</td><td>❌ Interdit (2015)</td></tr>
      <tr><td>HFC (R134a, R410A)</td><td>0</td><td>Élevé</td><td>⚠️ Quotas + restrictions</td></tr>
      <tr><td>HFO (R1234yf)</td><td>0</td><td>Très bas</td><td>✅ Alternative</td></tr>
      <tr><td>Naturels (CO₂, NH₃, HC)</td><td>0</td><td>≤ 3</td><td>✅ Encouragés</td></tr>
    </table>
    <div class="res-hl"><b>Nomenclature :</b><br>
    • R + numéro : R = Refrigerant<br>
    • Chiffre des centaines : C − 1 (atomes de carbone)<br>
    • Chiffre des dizaines : H + 1 (atomes d'hydrogène)<br>
    • Chiffre des unités : F (atomes de fluor)</div>
    <p><b>Classification sécurité ISO 817 :</b> Lettre (A=faible toxicité, B=toxicité élevée) + Chiffre (1=non inflammable, 2L=légèrement, 2=inflammable, 3=très inflammable)</p>
  </div>

  <!-- CH5 - Cycle frigo (avec images) -->
  <div id="res-ch5" class="res-chapter">
    <h3>❄️ Ch.5 — Cycle frigorifique</h3>
    <p><b>Circuit frigorifique numéroté :</b></p>
    <img class="res-img" src="data:image/png;base64,${imgCircuitNum}" alt="Circuit frigorifique numéroté">
    <div class="res-hl"><b>Les 4 organes :</b><br>
    1. <b>Compresseur</b> → aspire gaz BP, refoule gaz HP<br>
    2. <b>Condenseur</b> → gaz HP → liquide HP (cède chaleur)<br>
    3. <b>Détendeur</b> → liquide HP → mélange BP (laminage)<br>
    4. <b>Évaporateur</b> → liquide BP → gaz BP (absorbe chaleur = froid)</div>
    <p><b>Diagramme de Mollier (log P/h) :</b></p>
    <img class="res-img" src="data:image/png;base64,${imgMollier}" alt="Diagramme de Mollier">
    <div class="res-hl"><b>Points clés du diagramme :</b><br>
    • Compression : 1→2 (isentropique)<br>
    • Condensation : 2→3 (isobare)<br>
    • Détente : 3→4 (isenthalpique)<br>
    • Évaporation : 4→1 (isobare)</div>
  </div>

  <!-- CH6 - Composants (avec images) -->
  <div id="res-ch6" class="res-chapter">
    <h3>🔧 Ch.6 — Composants & Accessoires</h3>
    <p><b>Circuit avec symboles :</b></p>
    <img class="res-img" src="data:image/png;base64,${imgCircuitSym}" alt="Circuit frigorifique avec symboles">
    <div class="res-hl"><b>Composants clés :</b><br>
    • <b>Détendeur thermostatique (TEV)</b> : régule la surchauffe<br>
    • <b>Détendeur électronique (EEV)</b> : piloté par régulateur<br>
    • <b>Filtre déshydrateur</b> : élimine humidité + particules<br>
    • <b>Voyant liquide</b> : bulle = manque de charge<br>
    • <b>Pressostat HP/BP</b> : sécurité + régulation<br>
    • <b>Vanne 4 voies</b> : inversion de cycle (PAC)</div>
    <p><b>Circuit d'huile :</b></p>
    <table><tr><th>Composant</th><th>Rôle</th></tr>
      <tr><td>Séparateur d'huile</td><td>Retenir l'huile au refoulement</td></tr>
      <tr><td>Piège à huile</td><td>Récupérer l'huile en bas de colonne montante</td></tr>
      <tr><td>Réchauffeur de carter</td><td>Éviter la migration de fluide dans l'huile à l'arrêt</td></tr>
    </table>
  </div>

  <!-- CH7 - Manipulation -->
  <div id="res-ch7" class="res-chapter">
    <h3>🛠️ Ch.7 — Manipulation des fluides</h3>
    <div class="res-hl"><b>Tirage au vide :</b><br>
    • Objectif : &lt; 500 µm (0,5 mbar)<br>
    • Durée : minimum 30 minutes<br>
    • Test de maintien : fermer la vanne, attendre 30 min, vérifier la stabilité<br>
    • Si remontée > 100 µm → fuite ou humidité résiduelle</div>
    <p><b>Charge en fluide :</b></p>
    <table><tr><th>Type de fluide</th><th>Mode de charge</th><th>Raison</th></tr>
      <tr><td>Corps pur (R134a, R32)</td><td>Liquide ou gaz</td><td>Pas de démixtion</td></tr>
      <tr><td>Azéotrope (R410A)</td><td>Liquide ou gaz</td><td>Glissement négligeable</td></tr>
      <tr><td>Zéotrope (R407C)</td><td>Liquide uniquement</td><td>Éviter la démixtion</td></tr>
    </table>
    <div class="res-hl"><b>Brasage :</b><br>
    • Toujours sous flux d'azote (éviter l'oxydation = calamine)<br>
    • Alliage cuivre-phosphore (Cu-Cu) ou argent (Cu-acier)<br>
    • T° fusion : ~700°C (phosphore), ~620°C (argent)</div>
    <p><b>Récupération :</b> bouteille grise/collerette jaune, max 80%, ne jamais mélanger.</p>
  </div>

  <!-- CH8 - Détection -->
  <div id="res-ch8" class="res-chapter">
    <h3>🔍 Ch.8 — Contrôle & Détection de fuites</h3>
    <table><tr><th>Seuil tCO₂e</th><th>Fréquence</th><th>Avec détecteur auto</th></tr>
      <tr><td>&lt; 5</td><td>Aucune obligation</td><td>—</td></tr>
      <tr><td>5 à 50</td><td>12 mois</td><td>24 mois</td></tr>
      <tr><td>50 à 500</td><td>6 mois</td><td>12 mois</td></tr>
      <tr><td>≥ 500</td><td>3 mois + détection auto</td><td>6 mois</td></tr>
    </table>
    <div class="res-hl"><b>Méthodes de détection :</b><br>
    1. <b>Directe</b> : détecteur électronique (sensibilité ≥ 5 g/an)<br>
    2. <b>Indirecte</b> : suivi des paramètres (pressions, températures, surchauffe)<br>
    3. <b>Bulle</b> : eau savonneuse (localisation grossière)<br>
    4. <b>UV</b> : traceur fluorescent + lampe UV<br>
    5. <b>Azote</b> : mise en pression + contrôle chute (non localisante)</div>
    <p><b>Réparation :</b> 14 jours max après détection. Contrôle de vérification dans le mois suivant.</p>
  </div>

  <!-- CH9 - Traçabilité -->
  <div id="res-ch9" class="res-chapter">
    <h3>📝 Ch.9 — Traçabilité & Documentation</h3>
    <div class="res-hl"><b>Registre d'équipement :</b> obligatoire ≥ 5 tCO₂e<br>
    • Nature et quantité de fluide<br>
    • Dates d'intervention<br>
    • Résultats des contrôles d'étanchéité<br>
    • Identité de l'opérateur + attestation<br>
    • Conservation : <b>5 ans</b> après mise hors service</div>
    <table><tr><th>Document</th><th>Délai</th><th>Contenu</th></tr>
      <tr><td>Fiche intervention (CERFA 15497*04)</td><td>Immédiat</td><td>Fluide, quantités, opérations</td></tr>
      <tr><td>Registre</td><td>5 ans</td><td>Historique complet interventions</td></tr>
      <tr><td>BSD (Bordereau Suivi Déchets)</td><td>5 ans</td><td>Transport/traitement fluides usagés</td></tr>
      <tr><td>FDS (Fiche Données Sécurité)</td><td>Disponible</td><td>16 rubriques, fournie par fabricant</td></tr>
      <tr><td>Déclaration ADEME</td><td>Annuelle</td><td>Quantités manipulées par l'entreprise</td></tr>
    </table>
  </div>

  <!-- CH10 - Fin de vie -->
  <div id="res-ch10" class="res-chapter">
    <h3>♻️ Ch.10 — Récupération & Fin de vie</h3>
    <div class="res-hl"><b>Obligation :</b> récupération OBLIGATOIRE de tout fluide avant démantèlement, même petites quantités.</div>
    <table><tr><th>Opération</th><th>Définition</th><th>Résultat</th></tr>
      <tr><td><b>Récupération</b></td><td>Extraction du circuit vers bouteille</td><td>Fluide usagé</td></tr>
      <tr><td><b>Recyclage</b></td><td>Nettoyage basique (filtrage, déshydratation)</td><td>Réutilisable même installation</td></tr>
      <tr><td><b>Régénération</b></td><td>Remise aux spécifications d'origine (labo agréé)</td><td>Comme neuf, toute installation</td></tr>
      <tr><td><b>Destruction</b></td><td>Incinération haute température (>1200°C)</td><td>Élimination définitive</td></tr>
    </table>
    <p><b>DEEE :</b> les équipements frigorifiques sont des DEEE. Filière spécifique de collecte et traitement.</p>
  </div>

  <!-- CH11 - Fluides naturels -->
  <div id="res-ch11" class="res-chapter">
    <h3>🌿 Ch.11 — Fluides naturels & A2L</h3>
    <table><tr><th>Fluide</th><th>Formule</th><th>GWP</th><th>Classe</th><th>Particularité</th></tr>
      <tr><td>R744</td><td>CO₂</td><td>1</td><td>A1</td><td>Très hautes pressions (&gt;100 bar)</td></tr>
      <tr><td>R717</td><td>NH₃</td><td>&lt;1</td><td>B2L</td><td>Toxique, odeur, détection obligatoire</td></tr>
      <tr><td>R290</td><td>C₃H₈</td><td>3</td><td>A3</td><td>Très inflammable, charges limitées</td></tr>
      <tr><td>R600a</td><td>C₄H₁₀</td><td>3</td><td>A3</td><td>Réfrigérateurs domestiques (50-150g)</td></tr>
      <tr><td>R1270</td><td>C₃H₆</td><td>2</td><td>A3</td><td>Propylène, usage industriel</td></tr>
    </table>
    <div class="res-hl"><b>Norme EN 378 :</b> définit les charges maximales selon :<br>
    • Classification du local (accès public, technique, plein air)<br>
    • Classe de sécurité du fluide (A1, A2L, A3…)<br>
    • Volume du local et ventilation</div>
    <p><b>CO₂ transcritique :</b> au-dessus de 31°C (point critique), le CO₂ ne se condense plus → refroidisseur de gaz au lieu de condenseur.</p>
  </div>

  <!-- CH12 - Sécurité -->
  <div id="res-ch12" class="res-chapter">
    <h3>🛡️ Ch.12 — Sécurité des interventions</h3>
    <div class="res-hl"><b>EPI obligatoires :</b><br>
    • Gants cryogéniques (protection froid)<br>
    • Lunettes de protection<br>
    • Chaussures de sécurité<br>
    • Selon fluide : masque respiratoire (NH₃), détecteur gaz</div>
    <p><b>Premiers secours :</b></p>
    <table><tr><th>Risque</th><th>Action</th></tr>
      <tr><td>Brûlure cryogénique</td><td>Rincer à l'eau tiède 15 min, ne pas frotter</td></tr>
      <tr><td>Inhalation (NH₃, HFC)</td><td>Évacuer, air frais, O₂ si disponible, appeler 15/112</td></tr>
      <tr><td>Projection yeux</td><td>Rincer 15 min, consulter ophtalmo</td></tr>
      <tr><td>Anoxie (CO₂, HFC)</td><td>Ventiler le local, évacuer, O₂</td></tr>
    </table>
    <div class="res-hl"><b>ATEX :</b> zones à atmosphère explosive. Concerne R290, R600a, R1270.<br>
    • Zone 0 : présence permanente<br>
    • Zone 1 : présence occasionnelle<br>
    • Zone 2 : présence accidentelle<br>
    Matériel ATEX obligatoire dans ces zones.</div>
    <p><b>Consignation :</b> Avant toute intervention :<br>
    1. Séparation (couper l'alimentation)<br>
    2. Condamnation (cadenas + pancarte)<br>
    3. Vérification d'absence de tension/pression<br>
    4. Mise à la terre si nécessaire</p>
  </div>

</div>`;
  }
};
