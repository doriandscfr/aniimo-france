/**
 * aniimopedia.mjs — Rend l'Aniimopédia lisible par les moteurs de recherche.
 *
 *   node tools/aniimopedia.mjs
 *
 * La page construisait toute sa grille en JavaScript : un robot qui n'exécute
 * pas de JS n'y voyait qu'un <div> vide, et aucune créature n'était indexable.
 *
 * Ce script :
 *   1. lit le tableau CREATURES directement dans la page (source unique) ;
 *   2. recopie ces données dans data/creatures.json, pour les autres outils ;
 *   3. écrit la grille en HTML statique dans la page — le JS la réaffiche
 *      ensuite à l'identique, filtres compris ;
 *   4. injecte les données structurées CollectionPage + ItemList ;
 *   5. active la recherche par paramètre d'URL (?q=), déclarée dans le
 *      SearchAction de la page d'accueil.
 *
 * Idempotent : relancer le script réécrit simplement la grille à jour.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const FICHIER = 'aniimopedia/index.html';
const SITE = 'https://aniimo-france.fr';
let s = readFileSync(FICHIER, 'utf8');

/* ---------- 1. Lecture du tableau CREATURES ---------- */
const bloc = s.match(/const CREATURES = (\[[\s\S]*?\n {2}\]);/);
if (!bloc) throw new Error('Tableau CREATURES introuvable dans ' + FICHIER);
const CREATURES = eval(bloc[1]); // source de confiance : notre propre page

/* ---------- 2. Export des données ----------
   Une base vide n'écrase jamais l'archive : les exemples retirés le
   22 septembre 2026 doivent rester consultables tant que les vraies
   valeurs n'ont pas été relevées. */
if (CREATURES.length) {
  mkdirSync('data', { recursive: true });
  writeFileSync('data/creatures.json', JSON.stringify({
    _lisezMoi: 'Export automatique depuis aniimopedia/index.html par tools/aniimopedia.mjs. '
      + 'La source de vérité reste le tableau CREATURES de la page.',
    donneesVerifiees: false,
    miseAJour: new Date().toISOString().slice(0, 10),
    creatures: CREATURES,
  }, null, 2) + '\n', 'utf8');
} else {
  console.log('  · base vide : data/creatures.json laissé intact');
}

/* ---------- 3. Grille statique (mêmes classes que le rendu JS) ---------- */
const classeType = (t) => 'type-' + t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ACCENTS = {
  'Feu': 'var(--type-feu)', 'Eau': 'var(--type-eau)', 'Plante': 'var(--type-plante)',
  'Terre': 'var(--type-terre)', 'Glace': 'var(--type-glace)', 'Vent': 'var(--type-vent)',
  'Foudre': 'var(--type-foudre)', 'Ténèbres': 'var(--type-tenebres)', 'Lumière': 'var(--type-lumiere)',
};
const echap = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const carte = (c) => `      <article class="crea" style="--accent:${ACCENTS[c.types[0]] || 'var(--bleu-fr)'}">
        <div class="avatar">${c.image ? `<img src="images/${c.image}" alt="${echap(c.nom)}, Aniimo de type ${c.types.join(' et ')}" loading="lazy" width="96" height="96">` : c.emoji}</div>
        <h3>${echap(c.nom)}</h3>
        <div class="badges">
          ${c.types.map((t) => `<span class="type ${classeType(t)}">${t}</span>`).join('')}
          ${c.roles.map((r) => `<span class="role">${r}</span>`).join('')}
        </div>
        <p class="description-seo">${echap(c.description)}</p>
        <p class="stats-seo">${Object.entries(c.stats).map(([k, v]) => `${k} ${v}`).join(' · ')}</p>
      </article>`;

// Un <h2> sépare le <h1> de la page des <h3> des créatures : sans lui, la
// hiérarchie saute un niveau (erreur d'accessibilité, et signal de structure
// dégradé pour les moteurs). Tant que la base est vide, ni titre ni grille :
// afficher une section « Toutes les créatures » sans créature serait trompeur.
const grille = CREATURES.length
  ? `<h2 class="titre-grille">Toutes les créatures d'Aniimo</h2>

    <div class="grille-crea" id="grille">
${CREATURES.map(carte).join('\n')}
    </div>`
  : `<div class="grille-crea" id="grille"></div>`;

// Le motif absorbe un <h2 class="titre-grille"> déjà posé : le script reste
// rejouable sans empiler les titres.
s = s.replace(
  /(?:<h2 class="titre-grille">[\s\S]*?<\/h2>\s*)?<div class="grille-crea" id="grille">[\s\S]*?<\/div>\n {2}<\/main>/,
  grille + '\n  </main>'
);

/* ---------- 4. Styles du contenu statique ---------- */
// Descriptions et statistiques : présentes pour les robots, masquées à l'écran
// (le clic sur une carte ouvre la fiche complète, comme avant).
if (!s.includes('.description-seo')) {
  s = s.replace('  </style>', `
    /* Contenu textuel présent dans le HTML pour l'indexation ;
       l'affichage reste assuré par la fiche détaillée au clic. */
    .crea .description-seo,.crea .stats-seo{
      position:absolute;width:1px;height:1px;overflow:hidden;
      clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;
    }

    /* Titre de la grille : rétablit la hiérarchie h1 → h2 → h3 */
    .titre-grille{
      position:relative;z-index:1;
      max-width:1120px;margin:0 auto 18px;padding:0 24px;
      font-size:1.15rem;font-weight:600;color:var(--texte-doux);
    }
  </style>`);
}

/* ---------- 5. Données structurées ---------- */
if (!s.includes('application/ld+json')) {
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': SITE + '/aniimopedia/#page',
        name: 'Aniimopédia — base de données des créatures d\'Aniimo en français',
        description: 'La base de données communautaire des créatures du jeu Aniimo, en français : types, rôles et statistiques.',
        url: SITE + '/aniimopedia/',
        inLanguage: 'fr-FR',
        isPartOf: { '@id': SITE + '/#site' },
        about: { '@id': SITE + '/#jeu' },
        publisher: { '@id': SITE + '/#organisation' },
        primaryImageOfPage: SITE + '/assets/og/banniere.jpg',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Créatures d\'Aniimo',
          numberOfItems: CREATURES.length,
          itemListOrder: 'https://schema.org/ItemListUnordered',
          itemListElement: CREATURES.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Thing',
              name: c.nom,
              description: c.description,
              additionalProperty: [
                { '@type': 'PropertyValue', name: 'Élément', value: c.types.join(', ') },
                { '@type': 'PropertyValue', name: 'Rôle', value: c.roles.join(', ') },
                ...Object.entries(c.stats).map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: String(v) })),
              ],
            },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Aniimopédia', item: SITE + '/aniimopedia/' },
        ],
      },
    ],
  };
  s = s.replace(
    /(  <link rel="icon")/,
    '  <script type="application/ld+json">\n'
    + JSON.stringify(ld, null, 2).split('\n').map((l) => '  ' + l).join('\n')
    + '\n  </script>\n\n$1'
  );
}

/* ---------- 6. Recherche par paramètre d'URL (?q=) ---------- */
if (!s.includes('URLSearchParams')) {
  s = s.replace('  rendre();\n  </script>', `  // Recherche pré-remplie depuis l'URL : /aniimopedia/?q=nom
  // C'est la cible déclarée par le SearchAction de la page d'accueil.
  const parametreRecherche = new URLSearchParams(location.search).get("q");
  if (parametreRecherche){
    etat.recherche = parametreRecherche.trim().toLowerCase();
    document.getElementById("recherche").value = parametreRecherche;
  }

  rendre();
  </script>`);
}

writeFileSync(FICHIER, s, 'utf8');
console.log(`  ✓ ${CREATURES.length} créatures rendues en HTML statique`);
console.log(CREATURES.length ? '  ✓ data/creatures.json mis à jour' : '  · data/creatures.json inchangé (archive préservée)');
console.log('  ✓ JSON-LD CollectionPage + ItemList injecté');
console.log('  ✓ recherche ?q= activée');
