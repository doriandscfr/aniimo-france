/**
 * pages-mobile.mjs — Les pages consacrées à Aniimo sur mobile.
 *
 *   node tools/pages-mobile.mjs
 *
 * Module séparé de pages.mjs : le sujet mobile bouge vite (horaires de
 * lancement, appareils compatibles, correctifs de performance) et sera
 * modifié bien plus souvent que les guides de fond.
 *
 * SOURCES des données ci-dessous, à revérifier avant toute modification :
 *   • Annonce officielle du pré-téléchargement — aniimo.com/newslist/detail/100130
 *     (horaires par région, 18 Go, 60 IPS, cross-progression, tablette)
 *   • Configurations iOS et Android relayées par la presse FR
 *     (iPhone 11/A13 mini, iPhone 14 Pro/A16 conseillé ; Snapdragon 855 /
 *      Dimensity 1000 mini, Snapdragon 8 Gen 2 / Dimensity 9200 conseillé)
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { page, ctaDiscord, SITE, DISCORD } from './gabarit.mjs';

const ecrire = (chemin, html) => {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, html, 'utf8');
  console.log('  ✓ ' + chemin);
};

/* ============================================================
   Données de référence
   ============================================================ */

// Lancement mobile : 23 septembre 2026, 02:00 UTC pour l'Europe.
// La France est en CEST (UTC+2) en septembre → 04:00 heure de Paris.
const LANCEMENT_UTC = '2026-09-23T02:00:00Z';

const HORAIRES = [
  ['Europe (France)', '23 septembre', '04:00', 'heure de Paris — 02:00 UTC'],
  ['Amériques', '22 septembre', '22:00', 'heure de l\'Est (UTC−4)'],
  ['Asie-Pacifique', '23 septembre', '10:00', 'UTC+8'],
];

const SPECS_IOS = [
  ['Appareil', 'iPhone 11 (puce A13)', 'iPhone 14 Pro (A16) ou plus récent'],
  ['Système', 'iOS 16', 'iOS 16 ou supérieur'],
  ['Mémoire vive', '4 Go', '6 Go ou plus'],
  ['Stockage libre', '18 Go', '18 Go'],
];

const SPECS_ANDROID = [
  ['Processeur', 'Snapdragon 855 ou Dimensity 1000', 'Snapdragon 8 Gen 2, Dimensity 9200 ou mieux'],
  ['Système', 'Android 10', 'Android 10 ou supérieur'],
  ['Mémoire vive', '6 Go', '8 Go ou plus'],
  ['Graphismes', 'Vulkan 1.1', 'Vulkan 1.1 ou supérieur'],
  ['Stockage libre', '18 Go', '18 Go'],
];

/* Appareils, classés par puce. Le verdict découle des configurations
   officielles ci-dessus, pas d'un test individuel de chaque modèle. */
const IPHONES = [
  { nom: 'iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max', puce: 'A18', verdict: 'ideal' },
  { nom: 'iPhone 15 Pro / 15 Pro Max', puce: 'A17 Pro', verdict: 'ideal' },
  { nom: 'iPhone 15 / 15 Plus', puce: 'A16', verdict: 'recommande' },
  { nom: 'iPhone 14 Pro / 14 Pro Max', puce: 'A16', verdict: 'recommande' },
  { nom: 'iPhone 14 / 14 Plus', puce: 'A15', verdict: 'jouable' },
  { nom: 'iPhone 13 / 13 mini / 13 Pro / 13 Pro Max', puce: 'A15', verdict: 'jouable' },
  { nom: 'iPhone SE (3ᵉ génération, 2022)', puce: 'A15', verdict: 'jouable' },
  { nom: 'iPhone 12 / 12 mini / 12 Pro / 12 Pro Max', puce: 'A14', verdict: 'jouable' },
  { nom: 'iPhone 11 / 11 Pro / 11 Pro Max', puce: 'A13', verdict: 'minimum' },
  { nom: 'iPhone SE (2ᵉ génération, 2020)', puce: 'A13', verdict: 'minimum' },
  { nom: 'iPhone XS / XS Max / XR et antérieurs', puce: 'A12 ou moins', verdict: 'incompatible' },
];

const PUCES_ANDROID = [
  { nom: 'Snapdragon 8 Elite / 8 Gen 3', puce: 'Qualcomm', verdict: 'ideal' },
  { nom: 'Dimensity 9300 / 9400', puce: 'MediaTek', verdict: 'ideal' },
  { nom: 'Snapdragon 8 Gen 2', puce: 'Qualcomm', verdict: 'recommande' },
  { nom: 'Dimensity 9200', puce: 'MediaTek', verdict: 'recommande' },
  { nom: 'Snapdragon 8 Gen 1 / 888', puce: 'Qualcomm', verdict: 'jouable' },
  { nom: 'Dimensity 8200 / 8100', puce: 'MediaTek', verdict: 'jouable' },
  { nom: 'Exynos 2200 / 2100', puce: 'Samsung', verdict: 'jouable' },
  { nom: 'Snapdragon 870 / 865', puce: 'Qualcomm', verdict: 'jouable' },
  { nom: 'Snapdragon 855 / 855+', puce: 'Qualcomm', verdict: 'minimum' },
  { nom: 'Dimensity 1000 / 1100', puce: 'MediaTek', verdict: 'minimum' },
  { nom: 'Snapdragon 845 / 8xx antérieurs, séries 7 et 6', puce: 'Qualcomm', verdict: 'incompatible' },
  { nom: 'Helio G / Dimensity 700-900', puce: 'MediaTek', verdict: 'incompatible' },
];

const VERDICTS = {
  ideal: { libelle: 'Confort maximal', couleur: 'var(--vert)', chip: 'chip-buff' },
  recommande: { libelle: 'Configuration recommandée', couleur: 'var(--vert)', chip: 'chip-buff' },
  jouable: { libelle: 'Jouable', couleur: 'var(--or)', chip: 'chip-ajuste' },
  minimum: { libelle: 'Minimum requis', couleur: 'var(--or)', chip: 'chip-ajuste' },
  incompatible: { libelle: 'Non compatible', couleur: 'var(--rouge-fr)', chip: 'chip-nerf' },
};

const tableSpecs = (legende, lignes) => `      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>${legende}</caption>
          <thead><tr><th scope="col">Composant</th><th scope="col">Minimum</th><th scope="col">Recommandé</th></tr></thead>
          <tbody>
${lignes.map(([c, m, r]) => `            <tr><td><strong>${c}</strong></td><td>${m}</td><td>${r}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>`;

/* ============================================================
   1. /aniimo/mobile/ — la page de référence
   ============================================================ */
ecrire('aniimo/mobile/index.html', page({
  url: 'aniimo/mobile/', actif: 'jeu',
  titre: 'Aniimo mobile : date de sortie, config et téléchargement',
  description: 'Aniimo sort sur iOS et Android le 23 septembre 2026, à 4 h du matin en France. Horaires par région, configuration requise, 18 Go et cross-progression.',
  motsCles: 'aniimo mobile, aniimo android, aniimo ios, aniimo telephone, aniimo mobile date de sortie, aniimo apk, aniimo play store, aniimo app store, aniimo mobile configuration',
  h1: 'Aniimo mobile&nbsp;: date de sortie, configuration et téléchargement',
  chapo: 'Aniimo arrive sur <strong>iOS et Android le 23 septembre 2026</strong>. Pour la France, c\'est à <strong>4&nbsp;h du matin</strong> — et le pré-téléchargement est <strong>déjà ouvert</strong>, ce qui vous évitera d\'attendre 18&nbsp;Go au réveil.',
  fil: [{ nom: 'Le jeu Aniimo', href: 'aniimo/' }, { nom: 'Aniimo mobile', href: 'aniimo/mobile/' }],
  maj: '2026-09-22',
  sommaire: [
    { id: 'quand', nom: 'Quand exactement ?' },
    { id: 'pre-telechargement', nom: 'Le pré-téléchargement' },
    { id: 'config', nom: 'Configuration requise' },
    { id: 'espace', nom: 'Espace et connexion' },
    { id: 'progression', nom: 'Retrouver sa partie PC' },
    { id: 'qualite', nom: 'Ce que vaut la version mobile' },
    { id: 'apk', nom: 'Attention aux APK' },
    { id: 'faq', nom: 'Questions fréquentes' },
  ],
  styles: `    .compte-a-rebours{
      background:linear-gradient(135deg,var(--carte),var(--encre));
      border:1px solid rgba(77,124,255,.4);border-radius:var(--radius);
      padding:26px 24px;margin:24px 0;text-align:center;
    }
    .compte-a-rebours .etiq{
      font-family:'Fredoka',sans-serif;font-size:.74rem;font-weight:600;
      letter-spacing:.1em;text-transform:uppercase;color:var(--bleu-fr);margin-bottom:14px;
    }
    .cadrans{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
    .cadran{min-width:74px}
    .cadran .n{
      font-family:'Fredoka',sans-serif;font-size:2rem;font-weight:700;color:var(--blanc);
      line-height:1;font-variant-numeric:tabular-nums;
    }
    .cadran .l{
      font-size:.72rem;font-weight:800;letter-spacing:.08em;
      text-transform:uppercase;color:var(--texte-doux);margin-top:6px;
    }
    .boutiques{display:flex;gap:14px;flex-wrap:wrap;margin:22px 0}
    .boutique{
      flex:1;min-width:200px;display:block;text-decoration:none;
      background:var(--carte);border:1px solid var(--bordure);border-radius:16px;
      padding:18px 22px;transition:transform .15s ease,border-color .15s ease;
    }
    .boutique:hover{transform:translateY(-3px);border-color:var(--bleu-fr)}
    .boutique .n{font-family:'Fredoka',sans-serif;font-weight:600;color:var(--blanc);font-size:1.05rem}
    .boutique .d{font-size:.85rem;color:var(--texte-doux);font-weight:700;margin-top:4px}`,
  ld: [
    {
      '@type': 'Article',
      headline: 'Aniimo mobile : date de sortie, configuration requise et téléchargement',
      description: 'Tout sur la version mobile d\'Aniimo : horaires de lancement par région, configuration iOS et Android, pré-téléchargement et cross-progression.',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-22', dateModified: '2026-09-22',
      image: SITE + '/assets/og/banniere.jpg',
      author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organisation' },
      mainEntityOfPage: SITE + '/aniimo/mobile/',
      about: { '@id': SITE + '/#jeu' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Aniimo',
      applicationCategory: 'GameApplication',
      operatingSystem: 'iOS 16, Android 10',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-23',
      fileSize: '18 GB',
      softwareRequirements: 'iOS : iPhone 11 (A13) minimum, 4 Go de RAM. Android : Snapdragon 855 ou Dimensity 1000 minimum, 6 Go de RAM, Vulkan 1.1. 18 Go d\'espace libre.',
      offers: {
        '@type': 'Offer', price: '0', priceCurrency: 'EUR',
        availability: 'https://schema.org/PreOrder', category: 'Free-to-play',
      },
      author: { '@type': 'Organization', name: 'Pawprint Studio' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Quand sort Aniimo sur mobile ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Aniimo sort sur iOS et Android le 23 septembre 2026. Pour l\'Europe, le lancement a lieu à 2 h UTC, soit 4 h du matin heure de Paris. Les Amériques y ont accès dès le 22 septembre à 22 h heure de l\'Est, et l\'Asie-Pacifique le 23 septembre à 10 h UTC+8.' } },
        { '@type': 'Question', name: 'Peut-on pré-télécharger Aniimo sur mobile ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Oui. Le pré-téléchargement est ouvert depuis le 22 septembre 2026 à 00 h UTC+8, soit le 21 septembre au soir en France. Il suffit de chercher Aniimo sur le Google Play Store ou l\'App Store et de lancer le téléchargement pour pouvoir jouer dès l\'ouverture des serveurs.' } },
        { '@type': 'Question', name: 'Quelle configuration faut-il pour jouer à Aniimo sur téléphone ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sur iOS : un iPhone 11 (puce A13) minimum sous iOS 16 avec 4 Go de RAM ; un iPhone 14 Pro (A16) ou plus récent avec 6 Go de RAM est recommandé. Sur Android : un Snapdragon 855 ou Dimensity 1000 minimum sous Android 10 avec 6 Go de RAM et Vulkan 1.1 ; un Snapdragon 8 Gen 2 ou Dimensity 9200 avec 8 Go de RAM est recommandé. Dans tous les cas, 18 Go d\'espace libre.' } },
        { '@type': 'Question', name: 'Combien d\'espace prend Aniimo sur mobile ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Il faut au moins 18 Go d\'espace de stockage libre pour installer Aniimo sur mobile, et une connexion Wi-Fi stable pour le téléchargement.' } },
        { '@type': 'Question', name: 'Peut-on continuer sa partie PC sur mobile ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Oui. La cross-progression est complète entre PC, consoles et mobile, à condition de rester sur le même serveur régional. La progression est rattachée au compte Aniimo Pass, auquel se rattachent les connexions Steam, PSN, Microsoft et mobiles.' } },
        { '@type': 'Question', name: 'Aniimo mobile est-il gratuit ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Oui, Aniimo est free-to-play sur mobile comme sur PC et consoles. Le téléchargement et la campagne complète sont gratuits, seuls les cosmétiques et les passes sont payants. Ce n\'est pas un gacha.' } },
        { '@type': 'Question', name: 'Faut-il télécharger un APK pour jouer à Aniimo sur Android ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Non, et c\'est fortement déconseillé. Aniimo est distribué sur le Google Play Store et l\'App Store. Les APK trouvés sur des sites tiers sont souvent modifiés, peuvent contenir des logiciels malveillants et exposent à un bannissement du compte.' } },
      ],
    },
  ],
  corps: `      <div class="compte-a-rebours" id="rebours" hidden>
        <div class="etiq">Sortie mobile en Europe</div>
        <div class="cadrans">
          <div class="cadran"><div class="n" id="r-j">–</div><div class="l">jours</div></div>
          <div class="cadran"><div class="n" id="r-h">–</div><div class="l">heures</div></div>
          <div class="cadran"><div class="n" id="r-m">–</div><div class="l">minutes</div></div>
          <div class="cadran"><div class="n" id="r-s">–</div><div class="l">secondes</div></div>
        </div>
      </div>

      <h2 id="quand">Quand exactement&nbsp;?</h2>
      <p>Le lancement est <strong>échelonné par région</strong>, et c'est une source de confusion : beaucoup de sites annoncent «&nbsp;le 23 septembre&nbsp;» sans préciser l'heure. Voici les horaires réels&nbsp;:</p>
      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Horaires de lancement d'Aniimo mobile par région</caption>
          <thead><tr><th scope="col">Région</th><th scope="col">Date</th><th scope="col">Heure</th><th scope="col">Fuseau</th></tr></thead>
          <tbody>
${HORAIRES.map(([r, d, h, f], i) => `            <tr${i === 0 ? ' style="background:rgba(77,124,255,.08)"' : ''}><td><strong>${r}</strong></td><td>${d}</td><td><strong>${h}</strong></td><td>${f}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>
      <div class="encadre">
        <span class="etiq">Pour la France</span>
        <p>Rendez-vous le <strong>23 septembre à 4&nbsp;h du matin</strong>. Autant dire que la plupart d'entre nous découvriront le jeu au réveil — d'où l'intérêt de pré-télécharger dès ce soir.</p>
      </div>

      <h2 id="pre-telechargement">Le pré-téléchargement est déjà ouvert</h2>
      <p>Inutile d'attendre l'ouverture des serveurs pour lancer les 18&nbsp;Go. Le pré-téléchargement est accessible <strong>depuis le 21 septembre au soir</strong> en France&nbsp;:</p>
      <div class="boutiques">
        <a class="boutique" href="https://play.google.com/store/search?q=aniimo&c=apps" rel="noopener nofollow">
          <div class="n">Google Play</div>
          <div class="d">Android — chercher «&nbsp;Aniimo&nbsp;»</div>
        </a>
        <a class="boutique" href="https://www.apple.com/fr/search/aniimo" rel="noopener nofollow">
          <div class="n">App Store</div>
          <div class="d">iOS — chercher «&nbsp;Aniimo&nbsp;»</div>
        </a>
      </div>
      <p>Une fois le téléchargement terminé, l'application reste en attente jusqu'à l'ouverture des serveurs. Vous pourrez jouer immédiatement, sans file d'attente de téléchargement au moment où tout le monde se connecte.</p>

      <h2 id="config">Configuration requise</h2>
      <h3>Sur iPhone et iPad</h3>
${tableSpecs('Configuration iOS pour Aniimo', SPECS_IOS)}
      <h3>Sur Android</h3>
${tableSpecs('Configuration Android pour Aniimo', SPECS_ANDROID)}
      <p>Pas sûr que votre téléphone tienne la route&nbsp;? Notre <a href="../../guides/aniimo-mobile-compatibilite/">guide de compatibilité</a> liste les modèles d'iPhone et les puces Android un par un, avec un vérificateur.</p>

      <h2 id="espace">Espace de stockage et connexion</h2>
      <div class="fiche-rapide">
        <div class="item"><div class="k">Espace libre requis</div><div class="v">18 Go</div></div>
        <div class="item"><div class="k">Connexion</div><div class="v">Wi-Fi stable conseillé</div></div>
        <div class="item"><div class="k">Prix</div><div class="v">Gratuit</div></div>
      </div>
      <p><strong>18&nbsp;Go, c'est beaucoup</strong> pour un téléphone de 64&nbsp;Go déjà bien rempli. Faites le ménage avant, pas pendant&nbsp;: une installation interrompue par manque de place vous oblige à tout recommencer.</p>
      <p>Évitez aussi la 4G/5G&nbsp;: 18&nbsp;Go suffisent à faire sauter la plupart des forfaits.</p>

      <h2 id="progression">Retrouver sa partie PC sur mobile</h2>
      <p>La <strong>cross-progression est complète</strong> entre PC, consoles et mobile. Votre progression est rattachée à votre compte <strong>Aniimo Pass</strong>&nbsp;: Steam, PSN, Microsoft et les boutiques mobiles ne sont que des portes d'entrée vers ce même compte.</p>
      <p>Concrètement, si vous jouez sur PC depuis le 16 septembre, connectez-vous simplement avec le même Aniimo Pass sur mobile&nbsp;: vous reprenez où vous en étiez.</p>
      <div class="encadre alerte">
        <span class="etiq">La seule limite</span>
        <p>La progression est <strong>liée au serveur régional</strong>. Changer de serveur ne transfère pas votre personnage. Vérifiez bien que vous vous connectez au même serveur que sur PC.</p>
      </div>
      <p>À noter également&nbsp;: l'association du compte Steam permet de récupérer les récompenses obtenues pendant les phases de test.</p>

      <h2 id="qualite">Ce que vaut la version mobile</h2>
      <p>Ce n'est pas un portage au rabais. Les éléments confirmés par l'éditeur&nbsp;:</p>
      <ul>
        <li><strong>60 images par seconde</strong> pris en charge sur la majorité des appareils&nbsp;;</li>
        <li><strong>Optimisation tablette et grands écrans</strong>, et pas un simple agrandissement de l'interface téléphone&nbsp;;</li>
        <li><strong>Le même contenu que sur PC</strong>&nbsp;: même monde, mêmes créatures, mêmes mises à jour.</li>
      </ul>
      <p>Les exigences pouvant évoluer avec les optimisations à venir, un appareil aujourd'hui limite pourrait mieux s'en sortir dans quelques mois.</p>
      <div class="encadre">
        <span class="etiq">Manette sur mobile</span>
        <p>La manette est officiellement prise en charge <strong>sur PC</strong>. Pour le mobile, rien n'a été confirmé officiellement à ce jour&nbsp;: nous mettrons cette page à jour dès que ce sera tranché, plutôt que de recopier les suppositions qui circulent.</p>
      </div>

      <h2 id="apk">Attention aux APK non officiels</h2>
      <p>La recherche «&nbsp;Aniimo APK&nbsp;» ramène quantité de sites proposant le jeu en téléchargement direct. <strong>N'y touchez pas.</strong></p>
      <ul>
        <li>Ces fichiers sont <strong>modifiés</strong> et contiennent fréquemment des logiciels malveillants&nbsp;;</li>
        <li>Ils donnent accès à vos données et à vos comptes&nbsp;;</li>
        <li>Utiliser un client modifié expose à un <strong>bannissement définitif</strong> du compte&nbsp;;</li>
        <li>Le jeu étant <strong>gratuit</strong> sur les boutiques officielles, ces sites n'apportent strictement rien.</li>
      </ul>
      <p>Les seules sources légitimes sont le <strong>Google Play Store</strong> et l'<strong>App Store</strong>.</p>

      <h2 id="faq">Questions fréquentes</h2>
      <div class="bloc-faq">
        <details>
          <summary>Quand sort Aniimo sur mobile en France&nbsp;?</summary>
          <p>Le 23 septembre 2026 à 4&nbsp;h du matin (2&nbsp;h UTC). Le pré-téléchargement est déjà ouvert.</p>
        </details>
        <details>
          <summary>Mon iPhone est-il compatible&nbsp;?</summary>
          <p>À partir de l'iPhone&nbsp;11 (puce A13) sous iOS&nbsp;16. Les iPhone XS, XR et antérieurs ne sont pas compatibles. Le détail modèle par modèle est dans notre <a href="../../guides/aniimo-mobile-compatibilite/">guide de compatibilité</a>.</p>
        </details>
        <details>
          <summary>Combien d'espace faut-il&nbsp;?</summary>
          <p>18&nbsp;Go d'espace libre, et un Wi-Fi stable pour le téléchargement.</p>
        </details>
        <details>
          <summary>Puis-je reprendre ma partie PC&nbsp;?</summary>
          <p>Oui, la cross-progression est complète via le compte Aniimo Pass, tant que vous restez sur le même serveur régional.</p>
        </details>
        <details>
          <summary>Aniimo mobile est-il gratuit&nbsp;?</summary>
          <p>Oui, free-to-play, exactement comme sur PC. Ce n'est pas un gacha&nbsp;: les créatures se capturent dans le monde ouvert.</p>
        </details>
        <details>
          <summary>Faut-il un APK&nbsp;?</summary>
          <p>Non. Le jeu est sur Google Play et l'App Store. Les APK tiers sont dangereux et exposent à un bannissement.</p>
        </details>
        <details>
          <summary>La manette fonctionne-t-elle sur mobile&nbsp;?</summary>
          <p>Non confirmé officiellement. Elle est prise en charge sur PC. Nous mettrons la page à jour dès que l'information sera certaine.</p>
        </details>
      </div>

${ctaDiscord('Vous jouez sur mobile&nbsp;?', 'Retrouvez les joueurs FR sur le Discord : performances par appareil, réglages et entraide pour bien démarrer.')}

      <div class="grille-liens">
        <a class="carte-lien" href="../../guides/aniimo-mobile-compatibilite/">
          <h3>📱 Mon téléphone est-il compatible&nbsp;?</h3>
          <p>La liste des iPhone et des puces Android, avec un vérificateur.</p>
          <span class="fleche">Vérifier →</span>
        </a>
        <a class="carte-lien" href="../">
          <h3>🎮 La fiche complète du jeu</h3>
          <p>Dates PC et consoles, prix, crossplay et configuration PC.</p>
          <span class="fleche">Tout savoir →</span>
        </a>
        <a class="carte-lien" href="../../guides/bien-debuter/">
          <h3>🚀 Bien débuter</h3>
          <p>Vos premières heures à Idyll, sans perdre de temps.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
        <a class="carte-lien" href="../../codes/">
          <h3>🎁 Codes Aniimo</h3>
          <p>Les codes cadeaux actifs, valables aussi sur mobile.</p>
          <span class="fleche">Voir les codes →</span>
        </a>
      </div>

      <script>
      (function(){
        // Compte à rebours jusqu'à l'ouverture européenne. Masqué une fois
        // l'échéance passée : mieux vaut aucun compteur qu'un compteur faux.
        var cible = new Date('${LANCEMENT_UTC}').getTime();
        var bloc = document.getElementById('rebours');
        var champs = {
          j: document.getElementById('r-j'), h: document.getElementById('r-h'),
          m: document.getElementById('r-m'), s: document.getElementById('r-s')
        };
        function battre(){
          var reste = cible - Date.now();
          if (reste <= 0){ bloc.hidden = true; return; }
          bloc.hidden = false;
          var s = Math.floor(reste / 1000);
          champs.j.textContent = Math.floor(s / 86400);
          champs.h.textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
          champs.m.textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
          champs.s.textContent = String(s % 60).padStart(2, '0');
          setTimeout(battre, 1000);
        }
        battre();
      })();
      </script>`,
}));

/* ============================================================
   2. /guides/aniimo-mobile-compatibilite/ — le vérificateur
   ============================================================ */
const listeAppareils = (titre, items) => `      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>${titre}</caption>
          <thead><tr><th scope="col">Appareil</th><th scope="col">Puce</th><th scope="col">Verdict</th></tr></thead>
          <tbody>
${items.map((a) => `            <tr><td><strong>${a.nom}</strong></td><td>${a.puce}</td><td><span class="chip ${VERDICTS[a.verdict].chip}">${VERDICTS[a.verdict].libelle}</span></td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>`;

ecrire('guides/aniimo-mobile-compatibilite/index.html', page({
  url: 'guides/aniimo-mobile-compatibilite/', actif: 'guides',
  titre: 'Aniimo mobile : quels téléphones sont compatibles ?',
  description: 'Votre téléphone fait-il tourner Aniimo ? La liste des iPhone et des puces Android compatibles, du minimum au confort maximal, et un vérificateur immédiat.',
  motsCles: 'aniimo compatibilité, aniimo telephone compatible, aniimo iphone, aniimo android compatible, aniimo configuration mobile, aniimo puce compatible',
  h1: 'Quels téléphones font tourner Aniimo&nbsp;?',
  chapo: 'Aniimo demande <strong>18&nbsp;Go d\'espace</strong> et une puce assez récente. Voici, modèle par modèle, ce qui passe et ce qui ne passe pas — avec un vérificateur pour trancher en deux clics.',
  fil: [{ nom: 'Guides', href: 'guides/' }, { nom: 'Compatibilité mobile', href: 'guides/aniimo-mobile-compatibilite/' }],
  maj: '2026-09-22',
  sommaire: [
    { id: 'verificateur', nom: 'Le vérificateur' },
    { id: 'iphone', nom: 'iPhone compatibles' },
    { id: 'android', nom: 'Puces Android' },
    { id: 'trop-juste', nom: 'Si c\'est trop juste' },
    { id: 'faq', nom: 'Questions fréquentes' },
  ],
  styles: `    .verif{
      background:var(--carte);border:1px solid var(--bordure);border-radius:var(--radius);
      padding:26px 26px;margin:24px 0;
    }
    .verif label{
      display:block;font-family:'Fredoka',sans-serif;font-size:.74rem;font-weight:600;
      letter-spacing:.08em;text-transform:uppercase;color:var(--texte-doux);margin-bottom:8px;
    }
    .verif select{
      width:100%;background:var(--encre);border:1px solid var(--bordure);border-radius:12px;
      padding:13px 16px;color:var(--texte);font-family:'Nunito',sans-serif;
      font-weight:700;font-size:.95rem;margin-bottom:18px;cursor:pointer;
    }
    .verif select:focus{outline:none;border-color:var(--bleu-fr)}
    .resultat{
      border-radius:14px;padding:20px 22px;margin-top:6px;
      border:1px solid var(--bordure);background:var(--encre);
    }
    .resultat .verdict{
      font-family:'Fredoka',sans-serif;font-size:1.15rem;font-weight:600;margin-bottom:6px;
    }
    .resultat .detail{font-size:.92rem;color:var(--texte-doux);font-weight:600}
    .resultat.vide{color:var(--texte-doux);font-weight:600;font-size:.92rem;text-align:center}`,
  ld: [
    {
      '@type': 'Article',
      headline: 'Aniimo mobile : quels téléphones sont compatibles ?',
      description: 'Liste des iPhone et des puces Android capables de faire tourner Aniimo, avec les configurations minimale et recommandée.',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-22', dateModified: '2026-09-22',
      image: SITE + '/assets/og/banniere.jpg',
      author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organisation' },
      mainEntityOfPage: SITE + '/guides/aniimo-mobile-compatibilite/',
      about: { '@id': SITE + '/#jeu' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Quel iPhone minimum pour Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'L\'iPhone 11 (puce A13) sous iOS 16 est le minimum, tout comme l\'iPhone SE de 2e génération. Les iPhone XS, XS Max, XR et modèles antérieurs, équipés d\'une puce A12 ou plus ancienne, ne sont pas compatibles.' } },
        { '@type': 'Question', name: 'Quelle puce Android faut-il pour Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Un Snapdragon 855 ou un Dimensity 1000 au minimum, sous Android 10, avec 6 Go de RAM et la prise en charge de Vulkan 1.1. Pour du confort, visez un Snapdragon 8 Gen 2 ou un Dimensity 9200 avec 8 Go de RAM.' } },
        { '@type': 'Question', name: 'Aniimo fonctionne-t-il sur tablette ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Oui. L\'éditeur indique une optimisation spécifique pour les tablettes et les grands écrans, au-delà d\'un simple agrandissement de l\'interface téléphone. Les exigences de puce et de mémoire restent les mêmes que sur téléphone.' } },
        { '@type': 'Question', name: 'Que faire si mon téléphone est trop juste pour Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Baissez la qualité graphique et la limite d\'images par seconde dans les options, libérez de la mémoire en fermant les applications en arrière-plan, et jouez branché sur secteur. Vous pouvez aussi jouer sur PC : la progression est partagée entre les plateformes via le compte Aniimo Pass.' } },
      ],
    },
  ],
  corps: `      <h2 id="verificateur">Le vérificateur</h2>
      <div class="verif">
        <label for="famille">1. Votre appareil</label>
        <select id="famille">
          <option value="">— Choisissez —</option>
          <option value="ios">iPhone ou iPad</option>
          <option value="android">Android</option>
        </select>

        <div id="bloc-modele" hidden>
          <label for="modele">2. Votre modèle ou votre puce</label>
          <select id="modele"><option value="">— Choisissez —</option></select>
        </div>

        <div class="resultat vide" id="resultat">Sélectionnez votre appareil pour connaître le verdict.</div>
      </div>
      <p style="font-size:.86rem;color:var(--texte-doux);font-weight:600">Ces verdicts découlent des configurations officielles publiées par l'éditeur, et non d'un test individuel de chaque modèle. Un appareil classé «&nbsp;minimum&nbsp;» fera tourner le jeu, mais avec des graphismes réduits.</p>

      <h2 id="iphone">Les iPhone compatibles</h2>
      <p>La règle est simple&nbsp;: <strong>à partir de l'iPhone&nbsp;11</strong> (fin 2019). Tout ce qui est antérieur, puce A12 ou moins, est hors jeu.</p>
${listeAppareils('Compatibilité des iPhone avec Aniimo', IPHONES)}
      <p>Les iPad suivent la même logique&nbsp;: une puce A13 ou supérieure, et l'éditeur annonce une optimisation spécifique pour les grands écrans.</p>

      <h2 id="android">Les puces Android</h2>
      <p>Sur Android, c'est la <strong>puce</strong> qui décide, pas la marque. Un téléphone récent d'entrée de gamme peut très bien être moins capable qu'un haut de gamme de 2020.</p>
      <p>Trois conditions cumulatives&nbsp;: <strong>Android 10</strong> minimum, <strong>6&nbsp;Go de RAM</strong> et la prise en charge de <strong>Vulkan 1.1</strong>.</p>
${listeAppareils('Compatibilité des puces Android avec Aniimo', PUCES_ANDROID)}
      <div class="encadre">
        <span class="etiq">Comment connaître sa puce</span>
        <p>Android ne l'affiche pas directement. Le plus simple&nbsp;: <strong>Paramètres → À propos du téléphone</strong>, puis cherchez «&nbsp;Processeur&nbsp;» ou «&nbsp;Chipset&nbsp;». Sinon, cherchez le nom exact de votre modèle suivi de «&nbsp;fiche technique&nbsp;».</p>
      </div>

      <h2 id="trop-juste">Si votre téléphone est trop juste</h2>
      <p>Un appareil classé «&nbsp;minimum&nbsp;» ou «&nbsp;jouable&nbsp;» fera tourner le jeu, mais demandera quelques précautions&nbsp;:</p>
      <ul>
        <li><strong>Baissez la qualité graphique</strong> et limitez à 30&nbsp;images par seconde&nbsp;: mieux vaut 30 stables que 60 en dents de scie&nbsp;;</li>
        <li><strong>Fermez les applications en arrière-plan</strong> — c'est la mémoire vive qui manque le plus souvent&nbsp;;</li>
        <li><strong>Jouez branché</strong>&nbsp;: un jeu en monde ouvert vide une batterie très vite, et beaucoup de téléphones bride leurs performances sous 20&nbsp;%&nbsp;;</li>
        <li><strong>Retirez la coque</strong> sur les sessions longues&nbsp;: la surchauffe déclenche un bridage automatique.</li>
      </ul>
      <p>Et si vraiment ça ne passe pas&nbsp;: <strong>jouez sur PC</strong>. La progression étant partagée via le compte Aniimo Pass, vous ne perdez rien. Les configurations PC sont dans notre <a href="../../aniimo/">fiche du jeu</a>.</p>

      <h2 id="faq">Questions fréquentes</h2>
      <div class="bloc-faq">
        <details>
          <summary>Quel est l'iPhone minimum&nbsp;?</summary>
          <p>L'iPhone&nbsp;11 (puce A13) sous iOS&nbsp;16, ou l'iPhone SE de 2ᵉ génération. Les iPhone XS, XR et antérieurs ne sont pas compatibles.</p>
        </details>
        <details>
          <summary>Quelle puce Android faut-il&nbsp;?</summary>
          <p>Snapdragon&nbsp;855 ou Dimensity&nbsp;1000 au minimum, avec Android&nbsp;10, 6&nbsp;Go de RAM et Vulkan&nbsp;1.1. Pour le confort&nbsp;: Snapdragon&nbsp;8&nbsp;Gen&nbsp;2 ou Dimensity&nbsp;9200 avec 8&nbsp;Go.</p>
        </details>
        <details>
          <summary>Aniimo marche-t-il sur tablette&nbsp;?</summary>
          <p>Oui, avec une optimisation spécifique aux grands écrans annoncée par l'éditeur. Les exigences de puce et de mémoire restent identiques.</p>
        </details>
        <details>
          <summary>Faut-il vraiment 18&nbsp;Go&nbsp;?</summary>
          <p>Oui, d'espace <em>libre</em>. Faites le ménage avant d'installer&nbsp;: une installation interrompue faute de place oblige à tout recommencer.</p>
        </details>
        <details>
          <summary>Les exigences vont-elles baisser&nbsp;?</summary>
          <p>Possible&nbsp;: l'éditeur indique que les configurations peuvent évoluer avec les optimisations. Un appareil aujourd'hui limite pourrait mieux s'en sortir dans quelques mois.</p>
        </details>
      </div>

${ctaDiscord('Votre modèle n\'est pas dans la liste&nbsp;?', 'Demandez sur le Discord : d\'autres joueurs FR ont probablement le même téléphone et pourront vous dire ce que ça donne.')}

      <div class="grille-liens">
        <a class="carte-lien" href="../../aniimo/mobile/">
          <h3>📱 Aniimo mobile</h3>
          <p>Date de sortie heure par heure, pré-téléchargement et cross-progression.</p>
          <span class="fleche">Tout savoir →</span>
        </a>
        <a class="carte-lien" href="../bien-debuter/">
          <h3>🚀 Bien débuter</h3>
          <p>Vos premières heures à Idyll, sans perdre de temps.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
      </div>

      <script>
      (function(){
        var DONNEES = {
          ios: ${JSON.stringify(IPHONES)},
          android: ${JSON.stringify(PUCES_ANDROID)}
        };
        var VERDICTS = ${JSON.stringify(VERDICTS)};
        var EXPLICATIONS = {
          ideal: "Largement au-dessus du recommandé. Qualité maximale et 60 images par seconde sans souci.",
          recommande: "C'est la configuration recommandée par l'éditeur. Vous pouvez jouer en qualité élevée.",
          jouable: "Au-dessus du minimum, sous le recommandé. Le jeu tourne, en qualité moyenne. Visez 30 images par seconde stables.",
          minimum: "Tout juste le minimum requis. Le jeu se lance, mais en qualité réduite et avec des ralentissements possibles.",
          incompatible: "Cet appareil est sous le minimum requis. Le jeu ne se lancera pas, ou sera injouable. Vous pouvez jouer sur PC : la progression est partagée."
        };

        var famille = document.getElementById('famille');
        var blocModele = document.getElementById('bloc-modele');
        var modele = document.getElementById('modele');
        var resultat = document.getElementById('resultat');

        famille.addEventListener('change', function(){
          var liste = DONNEES[famille.value];
          if (!liste){ blocModele.hidden = true; reinitialiser(); return; }
          modele.innerHTML = '<option value="">— Choisissez —</option>' +
            liste.map(function(a, i){ return '<option value="' + i + '">' + a.nom + '</option>'; }).join('');
          blocModele.hidden = false;
          reinitialiser();
        });

        modele.addEventListener('change', function(){
          var a = DONNEES[famille.value][modele.value];
          if (!a){ reinitialiser(); return; }
          var v = VERDICTS[a.verdict];
          resultat.className = 'resultat';
          resultat.style.borderColor = v.couleur;
          resultat.innerHTML =
            '<div class="verdict" style="color:' + v.couleur + '">' + v.libelle + '</div>' +
            '<div class="detail">' + EXPLICATIONS[a.verdict] + '</div>';
        });

        function reinitialiser(){
          resultat.className = 'resultat vide';
          resultat.style.borderColor = '';
          resultat.textContent = 'Sélectionnez votre appareil pour connaître le verdict.';
        }
      })();
      </script>`,
}));

console.log('\nPages mobile générées.');
