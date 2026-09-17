/**
 * pages.mjs — Contenu des pages statiques générées par le gabarit.
 *
 * `node tools/pages.mjs` (ré)écrit les pages listées en bas de fichier.
 * Les fichiers produits sont autonomes : on peut ensuite les modifier
 * directement à la main. Relancer le script écrase ces modifications —
 * il sert d'atelier d'écriture, pas de dépendance du site.
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
   Tableau des types — établi à partir des relevés communautaires
   du 17 septembre 2026. Multiplicateurs : 1.6 / 1 / 0.625.
   ============================================================ */
const ELEMENTS = ['Feu', 'Eau', 'Plante', 'Foudre', 'Glace', 'Terre', 'Vent', 'Lumière', 'Ténèbres'];
const CLASSE = {
  Feu: 'feu', Eau: 'eau', Plante: 'plante', Foudre: 'foudre', Glace: 'glace',
  Terre: 'terre', Vent: 'vent', Lumière: 'lumiere', Ténèbres: 'tenebres',
};
const TABLE = {
  Feu:      { fort: ['Plante'],                     resiste: ['Feu', 'Eau', 'Terre'] },
  Eau:      { fort: ['Feu', 'Terre'],               resiste: ['Eau', 'Plante'] },
  Plante:   { fort: ['Eau', 'Terre'],               resiste: ['Feu', 'Plante', 'Vent'] },
  Foudre:   { fort: ['Vent', 'Eau'],                resiste: ['Foudre', 'Terre'] },
  Glace:    { fort: ['Foudre', 'Eau'],              resiste: ['Glace', 'Feu', 'Terre'] },
  Terre:    { fort: ['Glace', 'Feu'],               resiste: ['Eau', 'Plante'] },
  Vent:     { fort: ['Ténèbres', 'Plante'],         resiste: ['Vent', 'Foudre'] },
  Lumière:  { fort: ['Ténèbres', 'Vent'],           resiste: ['Lumière', 'Foudre'] },
  Ténèbres: { fort: ['Lumière', 'Foudre', 'Plante'], resiste: ['Vent', 'Eau'] },
};

const badge = (e) => `<span class="type type-${CLASSE[e]}">${e}</span>`;
const badges = (l) => (l.length ? l.map(badge).join(' ') : '<span style="color:var(--texte-doux)">—</span>');

/** Qui frappe fort contre cet élément ? (vue défensive, déduite) */
const menaces = (cible) => ELEMENTS.filter((a) => TABLE[a].fort.includes(cible));

const ligneTable = (e) => `            <tr>
              <th scope="row">${badge(e)}</th>
              <td>${badges(TABLE[e].fort)}</td>
              <td>${badges(TABLE[e].resiste)}</td>
              <td>${badges(menaces(e))}</td>
            </tr>`;

/* ============================================================
   1. Hub des guides
   ============================================================ */
const GUIDES = [
  {
    href: 'bien-debuter/', emoji: '🚀', titre: 'Bien débuter sur Aniimo',
    desc: 'Vos dix premières heures à Idyll : équipe, capture, ressources et les erreurs qui coûtent cher.',
  },
  {
    href: 'types-et-faiblesses/', emoji: '⚔️', titre: 'Types et faiblesses : le tableau complet',
    desc: 'Les neuf éléments, leurs multiplicateurs de dégâts et le système de contres spatiaux.',
  },
  {
    href: 'capture-anipod/', emoji: '🎯', titre: 'Capturer un Aniimo : la méthode',
    desc: 'Les quatre types d\'Anipods, la jauge de Rupture et la façon de ne plus rater une capture.',
  },
];

ecrire('guides/index.html', page({
  url: 'guides/', actif: 'guides',
  titre: 'Guides Aniimo en français — astuces, types et capture',
  description: 'Tous les guides Aniimo en français : bien débuter, tableau des types et faiblesses, capture des créatures. Rédigés et vérifiés par la communauté Aniimo France.',
  motsCles: 'guide aniimo, aniimo guide français, astuces aniimo, aniimo fr guide, tuto aniimo',
  h1: 'Guides Aniimo en français',
  chapo: 'Des guides clairs, vérifiés et tenus à jour par la communauté francophone. Pas de traduction automatique : tout est rédigé en français par des joueurs.',
  fil: [{ nom: 'Guides', href: 'guides/' }],
  ld: [{
    '@type': 'CollectionPage',
    name: 'Guides Aniimo en français',
    description: 'La collection des guides Aniimo rédigés en français par la communauté Aniimo France.',
    inLanguage: 'fr-FR',
    url: SITE + '/guides/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: GUIDES.map((g, i) => ({
        '@type': 'ListItem', position: i + 1, name: g.titre, url: SITE + '/guides/' + g.href,
      })),
    },
  }],
  corps: `      <h2 id="tous">Tous les guides</h2>
      <div class="grille-liens">
${GUIDES.map((g) => `        <a class="carte-lien" href="${g.href}">
          <h3>${g.emoji} ${g.titre}</h3>
          <p>${g.desc}</p>
          <span class="fleche">Lire le guide →</span>
        </a>`).join('\n')}
      </div>

      <h2 id="a-venir">Guides en préparation</h2>
      <p>La communauté écrit en ce moment les guides suivants. Vous voulez en rédiger un, ou relire une première version&nbsp;? Le salon dédié vous attend sur le Discord.</p>
      <ul>
        <li>Les meilleures équipes de départ selon votre style de jeu&nbsp;;</li>
        <li>Le Foyer (campervan)&nbsp;: construction, production et tâches hors ligne&nbsp;;</li>
        <li>Farmer efficacement les Gemmes d'expérience et les Fleurs de croissance&nbsp;;</li>
        <li>Guide de l'évolution&nbsp;: quelles créatures faire évoluer en priorité.</li>
      </ul>

      <h2 id="ailleurs">Ailleurs sur le site</h2>
      <div class="grille-liens">
        <a class="carte-lien" href="../aniimo/">
          <h3>🎮 La fiche du jeu</h3>
          <p>Date de sortie, plateformes, prix, crossplay et configuration PC requise.</p>
          <span class="fleche">Tout savoir →</span>
        </a>
        <a class="carte-lien" href="../codes/">
          <h3>🎁 Codes Aniimo</h3>
          <p>Les codes cadeaux actifs et la procédure pour les échanger.</p>
          <span class="fleche">Voir les codes →</span>
        </a>
        <a class="carte-lien" href="../aniimopedia/">
          <h3>📖 Aniimopédia FR</h3>
          <p>La base de données des créatures : types, rôles et statistiques.</p>
          <span class="fleche">Explorer →</span>
        </a>
        <a class="carte-lien" href="../patch-notes/">
          <h3>📋 Patch notes FR</h3>
          <p>Chaque mise à jour d'Aniimo traduite et résumée en français.</p>
          <span class="fleche">Lire les notes →</span>
        </a>
      </div>

${ctaDiscord('Une question sur le jeu&nbsp;?', 'Le plus rapide reste de demander directement aux joueurs francophones. Le serveur est gratuit et ouvert à tous.')}`,
}));

/* ============================================================
   2. Guide : types et faiblesses
   ============================================================ */
ecrire('guides/types-et-faiblesses/index.html', page({
  url: 'guides/types-et-faiblesses/', actif: 'guides',
  titre: 'Aniimo : tableau des types et faiblesses des 9 éléments (2026)',
  description: 'Le tableau complet des types d\'Aniimo : les 9 éléments, leurs forces, leurs résistances et les multiplicateurs 1.6x et 0.625x. Plus le système de contres spatiaux.',
  motsCles: 'aniimo types, aniimo faiblesses, tableau des types aniimo, aniimo elements, aniimo type chart français, aniimo forces faiblesses',
  h1: 'Aniimo&nbsp;: le tableau des types et des faiblesses',
  chapo: 'Les combats d\'Aniimo reposent sur <strong>neuf éléments</strong> et un second système de contres basé sur la position. Bien lire ces deux tableaux, c\'est diviser par deux la durée de la plupart des combats.',
  fil: [{ nom: 'Guides', href: 'guides/' }, { nom: 'Types et faiblesses', href: 'guides/types-et-faiblesses/' }],
  sommaire: [
    { id: 'multiplicateurs', nom: 'Les multiplicateurs' },
    { id: 'tableau', nom: 'Le tableau des 9 éléments' },
    { id: 'lecture', nom: 'Comment lire le tableau' },
    { id: 'spatial', nom: 'Les contres spatiaux' },
    { id: 'pratique', nom: 'En pratique' },
    { id: 'faq', nom: 'Questions fréquentes' },
  ],
  ld: [
    {
      '@type': 'Article',
      headline: 'Aniimo : tableau des types et faiblesses des 9 éléments',
      description: 'Tableau complet des types d\'Aniimo, multiplicateurs de dégâts et système de contres spatiaux.',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-17', dateModified: '2026-09-17',
      author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organisation' },
      mainEntityOfPage: SITE + '/guides/types-et-faiblesses/',
      about: { '@type': 'VideoGame', name: 'Aniimo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Combien y a-t-il d\'éléments dans Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Aniimo compte neuf éléments : Feu, Eau, Plante, Foudre, Glace, Terre, Vent, Lumière et Ténèbres.' } },
        { '@type': 'Question', name: 'Quels sont les multiplicateurs de dégâts dans Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Un coup super efficace inflige 1,6 fois les dégâts. Un coup résisté n\'en inflige que 0,625 fois. Les autres matchups sont neutres, à 1 fois les dégâts. Il n\'existe aucune immunité totale.' } },
        { '@type': 'Question', name: 'Qu\'est-ce que les contres spatiaux dans Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'En plus des éléments, Aniimo utilise un système de contres basé sur la position de la créature : Distance bat Vol, Vol bat Frappe, Frappe bat Fouissement, et Fouissement bat Distance. Ce cycle est indépendant de l\'élément.' } },
        { '@type': 'Question', name: 'Existe-t-il des immunités élémentaires dans Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Non. Contrairement à d\'autres jeux de capture, aucun élément n\'est totalement immunisé contre un autre. Le pire cas reste une réduction à 0,625 fois les dégâts.' } },
      ],
    },
  ],
  corps: `      <h2 id="multiplicateurs">Les multiplicateurs de dégâts</h2>
      <p>Aniimo utilise trois valeurs seulement, ce qui rend le système facile à mémoriser&nbsp;:</p>
      <div class="fiche-rapide">
        <div class="item"><div class="k">Super efficace</div><div class="v" style="color:var(--vert)">×1,6 dégâts</div></div>
        <div class="item"><div class="k">Neutre</div><div class="v">×1 dégâts</div></div>
        <div class="item"><div class="k">Résisté</div><div class="v" style="color:var(--rouge-fr)">×0,625 dégâts</div></div>
      </div>
      <div class="encadre succes">
        <span class="etiq">Bonne nouvelle</span>
        <p><strong>Il n'y a aucune immunité dans Aniimo.</strong> Aucun élément n'annule totalement un autre&nbsp;: au pire, vous tombez à ×0,625. Vous n'êtes donc jamais bloqué face à un boss, seulement ralenti.</p>
      </div>

      <h2 id="tableau">Le tableau des neuf éléments</h2>
      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Forces et faiblesses des neuf éléments d'Aniimo</caption>
          <thead>
            <tr>
              <th scope="col">Élément</th>
              <th scope="col">Fort contre (×1,6)</th>
              <th scope="col">Résisté par (×0,625)</th>
              <th scope="col">Vulnérable à (×1,6 subis)</th>
            </tr>
          </thead>
          <tbody>
${ELEMENTS.map(ligneTable).join('\n')}
          </tbody>
        </table>
      </div>
      <div class="encadre alerte">
        <span class="etiq">Tableau communautaire</span>
        <p>Ce tableau est établi à partir des relevés de la communauté au lendemain du lancement. Si vous constatez un écart en jeu, signalez-le sur le <a href="${DISCORD}" rel="noopener">Discord Aniimo France</a>&nbsp;: la page est corrigée dans la foulée, avec la date de mise à jour.</p>
      </div>

      <h2 id="lecture">Comment lire le tableau</h2>
      <p>Les trois colonnes ne disent pas la même chose, et c'est la source d'erreur la plus fréquente&nbsp;:</p>
      <ul>
        <li><strong>Fort contre</strong> — ce que <em>vos</em> attaques de cet élément écrasent&nbsp;;</li>
        <li><strong>Résisté par</strong> — les cibles qui encaissent mal vos coups… pardon, qui les encaissent <em>bien</em>&nbsp;: vos dégâts y tombent à ×0,625&nbsp;;</li>
        <li><strong>Vulnérable à</strong> — les éléments qui font mal à <em>votre</em> créature. C'est la colonne à regarder avant d'envoyer un Aniimo au front.</li>
      </ul>
      <p>Une particularité d'Aniimo à retenir&nbsp;: le jeu <strong>ne recopie pas les tableaux classiques</strong> du genre. Le Vent ne bat pas la Terre, la Glace frappe fort sur la Foudre. Fiez-vous au tableau, pas à vos réflexes d'autres jeux.</p>

      <h2 id="spatial">Le second système&nbsp;: les contres spatiaux</h2>
      <p>En parallèle des éléments, chaque Aniimo possède un <strong>mode de déplacement au combat</strong>. Ce second cycle fonctionne indépendamment de l'élément&nbsp;:</p>
      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Le cycle des contres spatiaux</caption>
          <thead><tr><th scope="col">Position</th><th scope="col">Bat</th></tr></thead>
          <tbody>
            <tr><td><strong>Distance</strong> <span style="color:var(--texte-doux)">(Ranged)</span></td><td>Vol</td></tr>
            <tr><td><strong>Vol</strong> <span style="color:var(--texte-doux)">(Fly)</span></td><td>Frappe</td></tr>
            <tr><td><strong>Frappe</strong> <span style="color:var(--texte-doux)">(Pound)</span></td><td>Fouissement</td></tr>
            <tr><td><strong>Fouissement</strong> <span style="color:var(--texte-doux)">(Tunnel)</span></td><td>Distance</td></tr>
          </tbody>
        </table>
      </div>
      <p>Autrement dit&nbsp;: un pierre-feuille-ciseaux à quatre branches, superposé au tableau élémentaire. Une créature qui cumule l'avantage élémentaire <em>et</em> l'avantage spatial démolit son adversaire.</p>

      <h2 id="pratique">En pratique&nbsp;: quoi en faire</h2>
      <h3>Construisez une équipe couvrante, pas une équipe optimale</h3>
      <p>Comme il n'y a pas d'immunité, inutile de chercher le contre parfait pour chaque combat. Visez plutôt <strong>trois ou quatre éléments différents</strong> dans votre équipe active&nbsp;: vous aurez toujours une réponse correcte sous la main.</p>

      <h3>Regardez la colonne «&nbsp;Vulnérable à&nbsp;» avant d'envoyer une créature</h3>
      <p>Prendre ×1,6 fait bien plus mal que d'en infliger ×0,625 ne fait du bien. En pratique, <strong>éviter de subir</strong> compte davantage que maximiser vos dégâts.</p>

      <h3>Les éléments les plus polyvalents</h3>
      <p>Les <strong>Ténèbres</strong> se distinguent&nbsp;: c'est le seul élément fort contre trois éléments (Lumière, Foudre, Plante) et résisté par deux seulement. À l'inverse, <strong>le Feu</strong> est le plus situationnel du lot&nbsp;: une seule cible privilégiée et trois éléments qui l'encaissent.</p>

      <h2 id="faq">Questions fréquentes</h2>
      <div class="bloc-faq">
        <details>
          <summary>Combien y a-t-il d'éléments dans Aniimo&nbsp;?</summary>
          <p>Neuf&nbsp;: Feu, Eau, Plante, Foudre, Glace, Terre, Vent, Lumière et Ténèbres.</p>
        </details>
        <details>
          <summary>Y a-t-il des immunités&nbsp;?</summary>
          <p>Non. Le pire cas est une réduction à ×0,625. Aucun élément n'est totalement neutralisé par un autre.</p>
        </details>
        <details>
          <summary>Les contres spatiaux remplacent-ils les éléments&nbsp;?</summary>
          <p>Non, ils s'ajoutent. Un Aniimo a un élément <em>et</em> une position. Les deux avantages se cumulent.</p>
        </details>
        <details>
          <summary>Le tableau d'Aniimo est-il le même que dans les autres jeux de capture&nbsp;?</summary>
          <p>Non, et c'est un piège classique. Plusieurs matchups s'écartent des conventions du genre&nbsp;: le Vent n'a pas d'avantage sur la Terre, et la Glace frappe fort sur la Foudre.</p>
        </details>
      </div>

${ctaDiscord('Un matchup qui vous surprend&nbsp;?', 'Venez le confronter aux relevés des autres joueurs FR. Le tableau de cette page est corrigé au fil des retours de la communauté.')}

      <div class="grille-liens">
        <a class="carte-lien" href="../capture-anipod/">
          <h3>🎯 Capturer un Aniimo</h3>
          <p>La jauge de Rupture, les quatre Anipods et la méthode pour ne plus rater une capture.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
        <a class="carte-lien" href="../bien-debuter/">
          <h3>🚀 Bien débuter</h3>
          <p>Vos dix premières heures à Idyll, sans perdre de temps.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
      </div>`,
}));

/* ============================================================
   3. Guide : capture
   ============================================================ */
ecrire('guides/capture-anipod/index.html', page({
  url: 'guides/capture-anipod/', actif: 'guides',
  titre: 'Aniimo : comment capturer une créature (guide Anipod)',
  description: 'Comment capturer un Aniimo : les quatre types d\'Anipods, le rôle de la jauge de Rupture, l\'approche furtive et les erreurs qui font rater une capture.',
  motsCles: 'aniimo capture, anipod, capturer aniimo, aniimo jauge de rupture, comment attraper aniimo',
  h1: 'Comment capturer un Aniimo',
  chapo: 'Lancer un Anipod au hasard sur une créature, c\'est le meilleur moyen de gâcher ses ressources. La capture dans Aniimo repose sur une préparation simple mais obligatoire&nbsp;: <strong>affaiblir, briser, puis lancer</strong>.',
  fil: [{ nom: 'Guides', href: 'guides/' }, { nom: 'Capturer un Aniimo', href: 'guides/capture-anipod/' }],
  sommaire: [
    { id: 'anipods', nom: 'Les quatre Anipods' },
    { id: 'methode', nom: 'La méthode en 4 étapes' },
    { id: 'rupture', nom: 'La jauge de Rupture' },
    { id: 'erreurs', nom: 'Les erreurs à éviter' },
    { id: 'faq', nom: 'Questions fréquentes' },
  ],
  ld: [
    {
      '@type': 'HowTo',
      name: 'Comment capturer un Aniimo',
      inLanguage: 'fr-FR',
      description: 'Méthode en quatre étapes pour capturer une créature dans Aniimo.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Approcher discrètement', text: 'Approchez la créature accroupi, ou visez un Aniimo endormi. Une créature qui ne vous a pas repéré est plus simple à gérer.' },
        { '@type': 'HowToStep', position: 2, name: 'Affaiblir la créature', text: 'Réduisez les points de vie de la créature sans la vaincre, en utilisant de préférence un élément qu\'elle ne résiste pas.' },
        { '@type': 'HowToStep', position: 3, name: 'Briser la jauge de Rupture', text: 'Videz la jauge de Rupture pour étourdir la créature. C\'est l\'étape qui augmente le plus le taux de capture.' },
        { '@type': 'HowToStep', position: 4, name: 'Lancer l\'Anipod', text: 'Pendant l\'étourdissement, lancez votre Anipod. Utilisez un Anipod amélioré : il revient automatiquement en cas d\'échec.' },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Aniimo : comment capturer une créature',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-17', dateModified: '2026-09-17',
      author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organisation' },
      mainEntityOfPage: SITE + '/guides/capture-anipod/',
      about: { '@type': 'VideoGame', name: 'Aniimo' },
    },
  ],
  corps: `      <h2 id="anipods">Les quatre types d'Anipods</h2>
      <p>Les <strong>Anipods</strong> sont les objets qui piègent les créatures. Il en existe quatre qualités, de la plus basique à la plus fiable&nbsp;:</p>
      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Les qualités d'Anipods dans Aniimo</caption>
          <thead><tr><th scope="col">Anipod</th><th scope="col">Particularité</th></tr></thead>
          <tbody>
            <tr><td><strong>Anipod</strong> standard</td><td>Le modèle de base. Perdu en cas d'échec.</td></tr>
            <tr><td><strong>Anipod Pro</strong></td><td>Meilleur taux. <strong>Revient automatiquement</strong> si la capture échoue.</td></tr>
            <tr><td><strong>Anipod Mega</strong></td><td>Taux supérieur, revient également en cas d'échec.</td></tr>
            <tr><td><strong>Anipod Ultra</strong></td><td>Le meilleur taux du jeu. À réserver aux créatures rares.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="encadre succes">
        <span class="etiq">À retenir</span>
        <p>Les Anipods améliorés <strong>reviennent tout seuls quand la capture rate</strong>. Autrement dit, un Anipod Pro n'est jamais vraiment gaspillé — contrairement à l'Anipod standard. Gardez les standards pour les créatures communes.</p>
      </div>

      <h2 id="methode">La méthode en quatre étapes</h2>
      <h3>1. Approchez discrètement</h3>
      <p>Une créature qui ne vous a pas repéré vous laisse le temps de placer vos coups. Approchez accroupi, et privilégiez les <strong>Aniimo endormis</strong> quand vous en croisez&nbsp;: ils vous offrent une ouverture gratuite.</p>

      <h3>2. Affaiblissez sans achever</h3>
      <p>Faites baisser les points de vie de la cible, mais <strong>ne la vainquez pas</strong> — une créature vaincue ne se capture plus. Utilisez un élément qu'elle ne résiste pas&nbsp;: consultez le <a href="../types-et-faiblesses/">tableau des types</a> pour choisir.</p>

      <h3>3. Brisez la jauge de Rupture</h3>
      <p>C'est l'étape que les débutants sautent, et c'est la plus rentable. Videz la <strong>jauge de Rupture</strong> de la créature pour l'étourdir&nbsp;: le taux de capture grimpe nettement pendant l'étourdissement.</p>

      <h3>4. Lancez pendant l'étourdissement</h3>
      <p>Fenêtre ouverte, Anipod lancé. Si vous avez bien affaibli et brisé la cible, la capture passe dans la grande majorité des cas.</p>

      <h2 id="rupture">Pourquoi la jauge de Rupture change tout</h2>
      <p>La jauge de Rupture (<em>Break</em>) est une barre de posture distincte des points de vie. La vider étourdit la créature&nbsp;: elle cesse d'agir pendant quelques secondes, et <strong>son taux de capture augmente significativement</strong>.</p>
      <p>C'est pour cette raison qu'une équipe équilibrée inclut au moins un Aniimo de <strong>rôle Rupture</strong>, dont la spécialité est précisément de casser cette jauge. Sans lui, vous videz la barre de vie bien plus vite que la barre de posture — et vous finissez par tuer la créature que vous vouliez attraper.</p>

      <h2 id="erreurs">Les erreurs qui font rater une capture</h2>
      <ul>
        <li><strong>Lancer l'Anipod à pleine vie</strong> — le taux est au plus bas, vous gaspillez l'objet&nbsp;;</li>
        <li><strong>Frapper avec un élément résisté</strong> — vous mettez trois fois plus de temps, et la créature vous punit&nbsp;;</li>
        <li><strong>Achever la cible</strong> — l'erreur la plus frustrante, surtout sur une créature rare&nbsp;;</li>
        <li><strong>Ignorer la jauge de Rupture</strong> — vous vous privez du plus gros bonus de capture du jeu&nbsp;;</li>
        <li><strong>Brûler vos Anipods Ultra sur des communes</strong> — gardez-les pour ce qui le mérite.</li>
      </ul>

      <h2 id="faq">Questions fréquentes</h2>
      <div class="bloc-faq">
        <details>
          <summary>Que se passe-t-il si je rate une capture&nbsp;?</summary>
          <p>Avec un Anipod standard, l'objet est perdu. Avec un Anipod amélioré (Pro, Mega, Ultra), il revient automatiquement à vous.</p>
        </details>
        <details>
          <summary>Peut-on capturer une créature vaincue&nbsp;?</summary>
          <p>Non. Une fois la créature vaincue, la capture n'est plus possible. Surveillez sa barre de vie.</p>
        </details>
        <details>
          <summary>Faut-il un rôle Rupture dans son équipe&nbsp;?</summary>
          <p>Fortement recommandé. C'est ce rôle qui vide la jauge de Rupture, et donc qui débloque le meilleur bonus de capture.</p>
        </details>
        <details>
          <summary>Les Anipods s'achètent-ils&nbsp;?</summary>
          <p>Oui, ils s'obtiennent par la progression, l'exploration et les boutiques en jeu. Les <a href="../../codes/">codes cadeaux</a> en offrent également.</p>
        </details>
      </div>

${ctaDiscord('Une créature vous résiste&nbsp;?', 'Demandez la méthode aux joueurs FR sur le Discord : quelqu\'un l\'a probablement déjà capturée.')}`,
}));

/* ============================================================
   4. Guide : bien débuter
   ============================================================ */
ecrire('guides/bien-debuter/index.html', page({
  url: 'guides/bien-debuter/', actif: 'guides',
  titre: 'Bien débuter sur Aniimo : le guide du débutant en français (2026)',
  description: 'Guide du débutant Aniimo : première équipe, capture, ressources, Tissage et Foyer. Les erreurs à éviter dès vos premières heures à Idyll.',
  motsCles: 'aniimo débutant, bien débuter aniimo, guide débutant aniimo, aniimo astuces débutant, aniimo commencer',
  h1: 'Bien débuter sur Aniimo',
  chapo: 'Idyll est vaste et le jeu explique peu de choses. Voici ce qu\'il faut comprendre dès vos premières heures pour ne pas avoir à tout recommencer plus tard.',
  fil: [{ nom: 'Guides', href: 'guides/' }, { nom: 'Bien débuter', href: 'guides/bien-debuter/' }],
  sommaire: [
    { id: 'serveur', nom: 'Choisir son serveur' },
    { id: 'equipe', nom: 'Composer son équipe' },
    { id: 'capture', nom: 'Capturer efficacement' },
    { id: 'twining', nom: 'Le Tissage' },
    { id: 'foyer', nom: 'Le Foyer' },
    { id: 'ressources', nom: 'Ressources et progression' },
    { id: 'erreurs', nom: 'Les erreurs de débutant' },
  ],
  ld: [{
    '@type': 'Article',
    headline: 'Bien débuter sur Aniimo : le guide du débutant en français',
    description: 'Les bases à maîtriser dans les premières heures d\'Aniimo : serveur, équipe, capture, Tissage, Foyer et ressources.',
    inLanguage: 'fr-FR',
    datePublished: '2026-09-17', dateModified: '2026-09-17',
    author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
    publisher: { '@id': SITE + '/#organisation' },
    mainEntityOfPage: SITE + '/guides/bien-debuter/',
    about: { '@type': 'VideoGame', name: 'Aniimo' },
  }],
  corps: `      <div class="encadre alerte">
        <span class="etiq">À faire avant tout le reste</span>
        <p><strong>Choisissez bien votre serveur régional&nbsp;: c'est irréversible.</strong> Votre progression y est rattachée, et changer de serveur ne transfère pas votre personnage. Demandez sur le <a href="${DISCORD}" rel="noopener">Discord Aniimo France</a> quel serveur la communauté francophone utilise avant de créer votre compte.</p>
      </div>

      <h2 id="serveur">1. Choisir son serveur (et son compte)</h2>
      <p>Toute votre progression est rattachée à votre <strong>Aniimo Pass</strong>, un compte basé sur une adresse e-mail. Steam, PSN, Microsoft et les boutiques mobiles ne sont que des portes d'entrée vers ce compte.</p>
      <p>Conséquence pratique&nbsp;: vous pouvez passer du PC au téléphone sans rien perdre, <strong>tant que vous restez sur le même serveur</strong>. Liez votre compte dès le départ — c'est aussi votre seule sécurité en cas de perte d'accès à une plateforme.</p>

      <h2 id="equipe">2. Composer son équipe&nbsp;: les rôles avant les statistiques</h2>
      <p>La tentation du débutant est de garder les créatures les plus impressionnantes. C'est une erreur&nbsp;: dans Aniimo, <strong>les rôles comptent plus que les statistiques brutes</strong>.</p>
      <p>Visez ces trois rôles en priorité&nbsp;:</p>
      <ul>
        <li><strong>DPS</strong> — celui qui inflige les dégâts&nbsp;;</li>
        <li><strong>Rupture</strong> — celui qui casse la jauge de posture adverse. Indispensable pour capturer&nbsp;;</li>
        <li><strong>Soigneur</strong> — celui qui vous maintient en vie sur les combats longs.</li>
      </ul>
      <p>Les rôles <strong>Support</strong> et <strong>Régénération</strong> viennent compléter ce noyau une fois qu'il tourne.</p>
      <p>Côté éléments, cherchez la couverture plutôt que la perfection&nbsp;: trois ou quatre éléments différents suffisent à répondre à presque tout. Le <a href="../types-et-faiblesses/">tableau des types</a> vous dit lesquels.</p>

      <h2 id="capture">3. Capturer efficacement dès le début</h2>
      <p>La capture obéit à une séquence simple&nbsp;: <strong>approcher discrètement → affaiblir → briser la jauge de Rupture → lancer l'Anipod</strong>. Sauter l'étape de Rupture, c'est diviser ses chances par plusieurs.</p>
      <p>Deux réflexes à prendre tout de suite&nbsp;:</p>
      <ul>
        <li>Visez les créatures <strong>endormies</strong> quand vous en croisez&nbsp;: elles offrent une ouverture gratuite&nbsp;;</li>
        <li>Utilisez des <strong>Anipods améliorés</strong> (Pro et au-delà)&nbsp;: ils reviennent tout seuls en cas d'échec, donc ils ne sont jamais gaspillés.</li>
      </ul>
      <p>Le détail complet est dans notre <a href="../capture-anipod/">guide de la capture</a>.</p>

      <h2 id="twining">4. Le Tissage&nbsp;: votre vrai moyen de transport</h2>
      <p>Le <strong>Tissage</strong> (<em>Twining</em>) vous permet de fusionner avec une créature capturée et de prendre sa forme. C'est la mécanique signature du jeu, et les débutants la sous-utilisent largement.</p>
      <p>Elle sert à trois choses&nbsp;:</p>
      <ul>
        <li><strong>Se déplacer</strong> — planer, nager, creuser selon la créature. Bien plus rapide que la marche&nbsp;;</li>
        <li><strong>Atteindre l'inaccessible</strong> — certains coffres et passages exigent une capacité précise&nbsp;;</li>
        <li><strong>Combattre</strong> — basculer sur la forme adaptée à l'élément adverse en plein affrontement.</li>
      </ul>
      <p>Gardez en permanence dans votre équipe <strong>une créature volante et une créature aquatique</strong>, même faibles en combat&nbsp;: elles vous feront gagner des heures d'exploration.</p>

      <h2 id="foyer">5. Le Foyer&nbsp;: à lancer tôt, il travaille pour vous</h2>
      <p>Le Foyer est votre base mobile — un campervan que vous déplacez entre les quatre régions du monde. Il repose sur trois mécaniques&nbsp;:</p>
      <ul>
        <li><strong>Agrandir</strong> l'espace de vie&nbsp;;</li>
        <li><strong>Construire</strong> des bâtiments qui produisent des ressources&nbsp;;</li>
        <li><strong>Assigner des Aniimo</strong> à des tâches qui tournent <em>hors ligne</em>.</li>
      </ul>
      <p>C'est ce dernier point qui compte&nbsp;: les créatures assignées produisent pendant que vous ne jouez pas. Installez vos premiers bâtiments et assignez vos créatures inutilisées le plus tôt possible — chaque jour de retard est de la production perdue.</p>

      <h2 id="ressources">6. Ressources et progression</h2>
      <div class="fiche-rapide">
        <div class="item"><div class="k">Gemmes d'expérience</div><div class="v">Montent le niveau de vos Aniimo. Trouvées dans les coffres.</div></div>
        <div class="item"><div class="k">Fleurs de croissance</div><div class="v">Ressource de progression des créatures.</div></div>
        <div class="item"><div class="k">Crédits</div><div class="v">La monnaie courante du jeu.</div></div>
        <div class="item"><div class="k">Glimmer</div><div class="v">Monnaie d'achat chez les marchands.</div></div>
      </div>
      <p><strong>Ouvrez tous les coffres que vous croisez.</strong> Les Gemmes d'expérience qu'ils contiennent sont le nerf de la guerre pour monter vos créatures, et l'exploration reste la source la plus rentable du jeu.</p>
      <p>Pensez aussi à récupérer les <a href="../../codes/">codes cadeaux actifs</a>&nbsp;: ils offrent du Glimmer, des Crédits, des Fleurs de croissance et des Anipods Pro gratuitement, en une minute.</p>

      <h2 id="erreurs">7. Les erreurs de débutant à éviter</h2>
      <ul>
        <li><strong>Choisir son serveur à la légère</strong> — c'est définitif&nbsp;;</li>
        <li><strong>Négliger le rôle Rupture</strong> — sans lui, vous ratez vos captures et traînez sur les boss&nbsp;;</li>
        <li><strong>Monter une seule créature</strong> — sans couverture élémentaire, vous bloquez tôt ou tard&nbsp;;</li>
        <li><strong>Laisser le Foyer en friche</strong> — c'est de la production gratuite que vous jetez&nbsp;;</li>
        <li><strong>Oublier le Tissage hors combat</strong> — vous explorez à pied un monde conçu pour être survolé&nbsp;;</li>
        <li><strong>Ignorer les coffres</strong> — l'expérience ne vient pas toute seule.</li>
      </ul>

${ctaDiscord('Vous débutez&nbsp;? Ne débutez pas seul.', 'Sur le Discord Aniimo France, des joueurs répondent aux questions de débutants tous les jours — en français.')}

      <div class="grille-liens">
        <a class="carte-lien" href="../types-et-faiblesses/">
          <h3>⚔️ Types et faiblesses</h3>
          <p>Le tableau des neuf éléments et le système de contres spatiaux.</p>
          <span class="fleche">Voir le tableau →</span>
        </a>
        <a class="carte-lien" href="../capture-anipod/">
          <h3>🎯 Capturer un Aniimo</h3>
          <p>Anipods, jauge de Rupture et méthode complète.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
        <a class="carte-lien" href="../../aniimopedia/">
          <h3>📖 Aniimopédia FR</h3>
          <p>Les créatures classées par type et par rôle.</p>
          <span class="fleche">Explorer →</span>
        </a>
        <a class="carte-lien" href="../../aniimo/">
          <h3>🎮 La fiche du jeu</h3>
          <p>Plateformes, prix, crossplay et configuration PC.</p>
          <span class="fleche">Tout savoir →</span>
        </a>
      </div>`,
}));

/* ============================================================
   5. À propos (signal E-E-A-T)
   ============================================================ */
ecrire('a-propos/index.html', page({
  url: 'a-propos/', actif: 'accueil',
  titre: 'À propos d\'Aniimo France — qui sommes-nous ? | Aniimo France',
  description: 'Aniimo France est la communauté francophone non officielle du jeu Aniimo : qui rédige le site, comment les informations sont vérifiées et comment contribuer.',
  h1: 'À propos d\'Aniimo France',
  chapo: 'Aniimo France est une communauté de joueurs francophones. Ce site est écrit, vérifié et corrigé par ses membres — voici comment.',
  fil: [{ nom: 'À propos', href: 'a-propos/' }],
  ld: [{
    '@type': 'AboutPage',
    name: 'À propos d\'Aniimo France',
    inLanguage: 'fr-FR',
    url: SITE + '/a-propos/',
    mainEntity: { '@id': SITE + '/#organisation' },
  }],
  corps: `      <h2 id="qui">Qui sommes-nous&nbsp;?</h2>
      <p><strong>Aniimo France</strong> est un serveur Discord communautaire et un site consacrés au jeu <a href="../aniimo/">Aniimo</a>, à destination des joueurs francophones. Le projet est né avant la sortie du jeu, pour rassembler au même endroit une communauté FR jusque-là éparpillée.</p>
      <p>Nous ne sommes affiliés ni à Pawprint Studio, ni à Kingsglory, ni à aucun éditeur. Le site est indépendant, gratuit, sans publicité.</p>

      <h2 id="contenu">Comment le contenu est produit</h2>
      <p>Chaque page de ce site suit les mêmes règles&nbsp;:</p>
      <ul>
        <li><strong>Rédaction en français</strong>, par des joueurs francophones. Pas de traduction automatique&nbsp;;</li>
        <li><strong>Vérification en jeu</strong> ou recoupement de plusieurs sources avant publication&nbsp;;</li>
        <li><strong>Date de mise à jour visible</strong> en haut de chaque page&nbsp;;</li>
        <li><strong>Correction ouverte</strong>&nbsp;: toute erreur signalée sur le Discord est corrigée, et la date mise à jour.</li>
      </ul>
      <div class="encadre">
        <span class="etiq">Une erreur&nbsp;?</span>
        <p>Les jeux-services évoluent vite, et une information juste aujourd'hui peut être fausse après un patch. Si vous constatez un écart entre une page et le jeu, signalez-le sur le <a href="${DISCORD}" rel="noopener">Discord Aniimo France</a>&nbsp;: c'est la façon la plus rapide de faire corriger la page.</p>
      </div>

      <h2 id="sections">Ce que vous trouverez ici</h2>
      <div class="grille-liens">
        <a class="carte-lien" href="../aniimo/">
          <h3>🎮 La fiche du jeu</h3>
          <p>Date de sortie, plateformes, prix, crossplay, configuration PC.</p>
          <span class="fleche">Consulter →</span>
        </a>
        <a class="carte-lien" href="../guides/">
          <h3>📚 Les guides</h3>
          <p>Débuter, comprendre les types, capturer efficacement.</p>
          <span class="fleche">Consulter →</span>
        </a>
        <a class="carte-lien" href="../aniimopedia/">
          <h3>📖 L'Aniimopédia</h3>
          <p>La base de données des créatures en français.</p>
          <span class="fleche">Consulter →</span>
        </a>
        <a class="carte-lien" href="../patch-notes/">
          <h3>📋 Les patch notes</h3>
          <p>Chaque mise à jour traduite et résumée en français.</p>
          <span class="fleche">Consulter →</span>
        </a>
      </div>

      <h2 id="contribuer">Contribuer</h2>
      <p>Le site grandit avec la communauté. Vous pouvez aider en&nbsp;:</p>
      <ul>
        <li>signalant une information erronée ou périmée&nbsp;;</li>
        <li>relevant des données en jeu (statistiques, matchups, emplacements)&nbsp;;</li>
        <li>rédigeant ou relisant un guide&nbsp;;</li>
        <li>traduisant les annonces officielles.</li>
      </ul>
      <p>Tout se passe sur le Discord, dans les salons dédiés.</p>

${ctaDiscord('Rejoindre la communauté', 'Le serveur est gratuit et ouvert à tous les joueurs francophones d\'Aniimo.')}`,
}));

/* ============================================================
   6. Mentions légales
   ============================================================ */
ecrire('mentions-legales/index.html', page({
  url: 'mentions-legales/', actif: 'accueil',
  titre: 'Mentions légales — Aniimo France',
  description: 'Mentions légales du site aniimo-france.fr : éditeur, hébergeur, propriété intellectuelle, données personnelles et contact.',
  h1: 'Mentions légales',
  chapo: 'Informations légales relatives au site aniimo-france.fr.',
  fil: [{ nom: 'Mentions légales', href: 'mentions-legales/' }],
  ld: [{ '@type': 'WebPage', name: 'Mentions légales', inLanguage: 'fr-FR', url: SITE + '/mentions-legales/' }],
  corps: `      <h2 id="editeur">Éditeur du site</h2>
      <p>Le site <strong>aniimo-france.fr</strong> est édité à titre non professionnel et non lucratif par la communauté Aniimo France.</p>
      <p>Contact&nbsp;: via le serveur Discord <a href="${DISCORD}" rel="noopener">discord.gg/aniimofr</a>.</p>
      <div class="encadre alerte">
        <span class="etiq">À compléter</span>
        <p>Le droit français impose au directeur de publication d'un site non professionnel d'indiquer au minimum un nom ou pseudonyme et un moyen de contact&nbsp;; les coordonnées complètes peuvent rester chez l'hébergeur. Remplacez ce bloc par les informations que vous souhaitez rendre publiques.</p>
      </div>

      <h2 id="hebergeur">Hébergeur</h2>
      <p>Le site est hébergé par <strong>GitHub Pages</strong> — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>

      <h2 id="pi">Propriété intellectuelle et marques</h2>
      <p><strong>Aniimo France est un site communautaire non officiel</strong>, sans aucun lien avec les ayants droit du jeu.</p>
      <p>«&nbsp;Aniimo&nbsp;», les noms des créatures, les visuels et l'ensemble des éléments issus du jeu restent la propriété de <strong>Pawprint Studio</strong> et de leurs ayants droit respectifs. Ils sont utilisés ici à des fins d'information et de commentaire, dans le cadre d'une démarche communautaire sans but lucratif.</p>
      <p>Les textes rédigés par la communauté Aniimo France (guides, résumés, traductions) restent la propriété de leurs auteurs. Toute reprise doit mentionner la source et un lien vers la page d'origine.</p>
      <p>Si vous êtes titulaire de droits et souhaitez le retrait d'un contenu, contactez-nous via le Discord&nbsp;: la demande sera traitée sans délai.</p>

      <h2 id="donnees">Données personnelles</h2>
      <p>Ce site est <strong>entièrement statique</strong>. Il ne comporte ni formulaire, ni compte utilisateur, ni base de données.</p>
      <ul>
        <li><strong>Aucun cookie</strong> n'est déposé par le site&nbsp;;</li>
        <li><strong>Aucune donnée personnelle</strong> n'est collectée ni transmise à un tiers&nbsp;;</li>
        <li>Les polices de caractères sont chargées depuis Google Fonts, ce qui transmet votre adresse IP à Google pour la seule fourniture du fichier&nbsp;;</li>
        <li>L'hébergeur GitHub Pages conserve des journaux de connexion techniques.</li>
      </ul>
      <p>Aucun suivi publicitaire, aucune revente de données, aucun profilage.</p>

      <h2 id="liens">Liens externes</h2>
      <p>Le site renvoie vers des ressources externes (Discord, boutiques, sites d'actualité). Nous n'exerçons aucun contrôle sur leur contenu et déclinons toute responsabilité à leur égard.</p>

      <h2 id="responsabilite">Limitation de responsabilité</h2>
      <p>Les informations publiées ici sont fournies à titre indicatif et concernent un jeu-service en évolution constante. Malgré nos vérifications, des données peuvent devenir inexactes après une mise à jour. Signalez toute erreur sur le Discord&nbsp;: elle sera corrigée.</p>`,
}));

/* ============================================================
   7. Page 404 (non indexée)
   ============================================================ */
const p404 = page({
  url: '404.html', actif: 'accueil',
  titre: 'Page introuvable (404) — Aniimo France',
  description: 'Cette page n\'existe pas ou a été déplacée. Retrouvez les guides, l\'Aniimopédia et les patch notes d\'Aniimo France.',
  h1: 'Cette page s\'est perdue dans Idyll',
  chapo: 'L\'adresse demandée n\'existe pas ou a été déplacée. Voici par où reprendre.',
  fil: [{ nom: 'Page introuvable', href: '404.html' }],
  corps: `      <div class="grille-liens">
        <a class="carte-lien" href="/">
          <h3>🏠 Accueil</h3>
          <p>Le Discord de la communauté française d'Aniimo.</p>
          <span class="fleche">Y aller →</span>
        </a>
        <a class="carte-lien" href="/aniimo/">
          <h3>🎮 La fiche du jeu</h3>
          <p>Date de sortie, plateformes, prix, configuration PC.</p>
          <span class="fleche">Y aller →</span>
        </a>
        <a class="carte-lien" href="/guides/">
          <h3>📚 Les guides</h3>
          <p>Débuter, types et faiblesses, capture.</p>
          <span class="fleche">Y aller →</span>
        </a>
        <a class="carte-lien" href="/aniimopedia/">
          <h3>📖 L'Aniimopédia</h3>
          <p>La base de données des créatures en français.</p>
          <span class="fleche">Y aller →</span>
        </a>
        <a class="carte-lien" href="/codes/">
          <h3>🎁 Les codes</h3>
          <p>Les codes cadeaux actifs et comment les utiliser.</p>
          <span class="fleche">Y aller →</span>
        </a>
        <a class="carte-lien" href="/patch-notes/">
          <h3>📋 Les patch notes</h3>
          <p>Les mises à jour traduites en français.</p>
          <span class="fleche">Y aller →</span>
        </a>
      </div>

${ctaDiscord('Vous cherchiez autre chose&nbsp;?', 'Demandez sur le Discord : quelqu\'un saura vous orienter.')}`,
})
  // La 404 ne doit jamais être indexée, et n'a pas de canonique propre.
  .replace('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
           '<meta name="robots" content="noindex, follow">')
  .replace(/  <link rel="canonical"[^>]*>\n/, '')
  .replace(/  <link rel="alternate" hreflang="[^"]*"[^>]*>\n/g, '')
  // Chemins absolus : la 404 est servie depuis n'importe quel niveau d'URL.
  .replace(/(href|src)="\.\/(?!\/)/g, '$1="/')
  .replace(/(href|src)="(?!https?:|\/|#|mailto:)/g, '$1="/');

ecrire('404.html', p404);

console.log('\nPages générées.');
