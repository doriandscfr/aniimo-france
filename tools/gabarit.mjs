/**
 * gabarit.mjs — Fabrique de pages statiques pour aniimo-france.fr
 *
 * Ce module ne sert qu'à PRODUIRE des fichiers HTML complets et autonomes.
 * Une fois générés, les fichiers sont modifiables à la main comme n'importe
 * quelle page du site : rien ne dépend de ce script à l'exécution.
 *
 * Il garantit que chaque page possède le même socle SEO :
 * title / description / canonical / hreflang / Open Graph / Twitter /
 * JSON-LD / fil d'Ariane / maillage interne / footer.
 */

export const SITE = 'https://aniimo-france.fr';
export const DISCORD = 'https://discord.gg/aniimofr';
export const OG_IMAGE = SITE + '/assets/og/banniere.jpg';

const SVG_DISCORD = '<svg viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>';

/**
 * Chemin de remontée vers la racine depuis une URL canonique.
 * Le nombre de « / » donne directement la profondeur du dossier :
 *   ''                     → './'      (racine)
 *   '404.html'             → './'
 *   'guides/'              → '../'
 *   'guides/bien-debuter/' → '../../'
 */
const racine = (url) => '../'.repeat((url.match(/\//g) || []).length) || './';

/** Barre de navigation, avec l'onglet courant marqué. */
function nav(r, actif) {
  const liens = [
    ['', 'Accueil', 'accueil'],
    ['aniimo/', 'Le jeu', 'jeu'],
    ['guides/', 'Guides', 'guides'],
    ['codes/', 'Codes', 'codes'],
    ['patch-notes/', 'Patch notes', 'patch'],
    ['aniimopedia/', 'Aniimopédia', 'pedia'],
  ];
  const items = liens.map(([href, texte, cle]) => {
    const classe = cle === actif ? ' class="actif" aria-current="page"' : '';
    return `        <a href="${r}${href}"${classe}>${texte}</a>`;
  }).join('\n');
  return `  <header class="nav">
    <div class="nav-inner">
      <a class="marque" href="${r}">
        <img src="${r}favicon.png" alt="Logo Aniimo France" width="38" height="38">
        <span>Aniimo <span class="fr">France</span></span>
      </a>
      <nav class="nav-liens" aria-label="Navigation principale">
${items}
        <a class="nav-cta" href="${DISCORD}" rel="noopener">Rejoindre</a>
      </nav>
    </div>
  </header>`;
}

/** Fil d'Ariane visible + JSON-LD correspondant. */
function filAriane(r, chemin) {
  const items = chemin.map((e, i) => {
    const dernier = i === chemin.length - 1;
    return dernier
      ? `      <li><span aria-current="page">${e.nom}</span></li>`
      : `      <li><a href="${r}${e.href}">${e.nom}</a></li>`;
  }).join('\n');
  return `  <nav class="fil-ariane" aria-label="Fil d'Ariane">
    <ol>
      <li><a href="${r}">Accueil</a></li>
${items}
    </ol>
  </nav>`;
}

function filArianeLd(chemin, url) {
  const liste = [{ nom: 'Accueil', href: '' }, ...chemin];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: liste.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nom,
      item: SITE + '/' + (i === liste.length - 1 ? url : e.href),
    })),
  };
}

function pied(r) {
  return `  <footer>
    <div class="footer-grille">
      <div class="footer-col">
        <div class="titre-col">Le jeu</div>
        <ul>
          <li><a href="${r}aniimo/">Fiche Aniimo</a></li>
          <li><a href="${r}aniimo/mobile/">Aniimo mobile</a></li>
          <li><a href="${r}aniimopedia/">Aniimopédia FR</a></li>
          <li><a href="${r}patch-notes/">Patch notes FR</a></li>
          <li><a href="${r}codes/">Codes Aniimo</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="titre-col">Guides</div>
        <ul>
          <li><a href="${r}guides/">Tous les guides</a></li>
          <li><a href="${r}guides/bien-debuter/">Bien débuter</a></li>
          <li><a href="${r}guides/types-et-faiblesses/">Types et faiblesses</a></li>
          <li><a href="${r}guides/capture-anipod/">Capturer un Aniimo</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="titre-col">Communauté</div>
        <ul>
          <li><a href="${DISCORD}" rel="noopener">Discord Aniimo France</a></li>
          <li><a href="${r}a-propos/">À propos</a></li>
          <li><a href="${r}mentions-legales/">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <p class="mention">Aniimo France est un serveur communautaire non officiel, créé par des fans. Il n'est affilié ni à Pawprint Studio, ni à Kingsglory. «&nbsp;Aniimo&nbsp;» est une marque de ses ayants droit respectifs.</p>
    <p>© 2026 Aniimo France · <a href="${DISCORD}" rel="noopener">Rejoindre le Discord</a></p>
  </footer>`;
}

export function ctaDiscord(titre, texte) {
  return `      <div class="cta-article">
        <h2>${titre}</h2>
        <p>${texte}</p>
        <a class="bouton-discord" href="${DISCORD}" rel="noopener">
          ${SVG_DISCORD}
          Rejoindre discord.gg/aniimofr
        </a>
      </div>`;
}

/**
 * Construit une page complète.
 * @param {object} p
 * @param {string} p.url        chemin canonique sans slash initial, ex. "guides/bien-debuter/"
 * @param {string} p.titre      <title>
 * @param {string} p.h1         titre visible
 * @param {string} p.description meta description
 * @param {string} [p.motsCles] meta keywords
 * @param {string} p.chapo      paragraphe d'introduction (HTML autorisé)
 * @param {Array}  p.fil        fil d'Ariane [{nom, href}]
 * @param {string} p.actif      onglet de nav actif
 * @param {Array}  [p.sommaire] [{id, nom}]
 * @param {string} p.corps      HTML du corps de l'article
 * @param {Array}  [p.ld]       objets JSON-LD supplémentaires
 * @param {string} [p.maj]      date ISO de dernière mise à jour
 * @param {string} [p.styles]   CSS additionnel propre à la page
 */
export function page(p) {
  const r = racine(p.url);
  const canonique = SITE + '/' + p.url;
  const maj = p.maj || '2026-09-17';
  const majFr = new Date(maj + 'T12:00:00Z').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

  const graphe = [filArianeLd(p.fil, p.url), ...(p.ld || [])];
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graphe }, null, 2)
    .split('\n').map((l) => '  ' + l).join('\n');

  const sommaire = p.sommaire ? `      <div class="sommaire">
        <div class="titre">Sommaire</div>
        <ol>
${p.sommaire.map((s) => `          <li><a href="#${s.id}">${s.nom}</a></li>`).join('\n')}
        </ol>
      </div>
` : '';

  const police = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${p.titre}</title>
  <meta name="description" content="${p.description}">${p.motsCles ? `\n  <meta name="keywords" content="${p.motsCles}">` : ''}
  <link rel="canonical" href="${canonique}">
  <link rel="alternate" hreflang="fr" href="${canonique}">
  <link rel="alternate" hreflang="x-default" href="${canonique}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="theme-color" content="#0B1230">
  <meta name="author" content="Aniimo France">

  <meta property="og:type" content="article">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Aniimo France">
  <meta property="og:title" content="${p.h1.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')}">
  <meta property="og:description" content="${p.description}">
  <meta property="og:url" content="${canonique}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Aniimo France — la communauté française du jeu Aniimo">
  <meta property="article:modified_time" content="${maj}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${p.h1.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')}">
  <meta name="twitter:description" content="${p.description}">
  <meta name="twitter:image" content="${OG_IMAGE}">

  <script type="application/ld+json">
${ld}
  </script>

  <link rel="icon" type="image/png" href="${r}favicon.png">
  <link rel="apple-touch-icon" href="${r}apple-touch-icon.png">
  <link rel="manifest" href="${r}site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${r}assets/site.css">
  <link rel="stylesheet" href="${police}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${police}"></noscript>${p.styles ? `\n\n  <style>\n${p.styles}\n  </style>` : ''}
</head>
<body>
  <a class="saut-contenu" href="#contenu">Aller au contenu</a>
  <div class="lueur lueur-bleue" aria-hidden="true"></div>
  <div class="lueur lueur-rouge" aria-hidden="true"></div>

${nav(r, p.actif)}

${filAriane(r, p.fil)}

  <main id="contenu">
    <article class="article">
      <header class="entete-page" style="text-align:left;padding:26px 0 30px">
        <span class="maj"><span class="point" aria-hidden="true"></span>Mis à jour le <time datetime="${maj}">${majFr}</time></span>
        <h1>${p.h1}</h1>
        <p class="chapo" style="max-width:none;margin:22px 0 0">${p.chapo}</p>
      </header>

${sommaire}${p.corps}
    </article>
  </main>

${pied(r)}
</body>
</html>
`;
}
