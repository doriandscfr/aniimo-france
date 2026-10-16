/**
 * pages-elements.mjs — Une fiche par élément d'Aniimo.
 *
 *   node tools/pages-elements.mjs
 *
 * POURQUOI CES PAGES
 * La Search Console du 16 octobre 2026 montre que 8 des 9 requêtes qui
 * amènent du trafic portent sur les faiblesses élémentaires :
 *   faiblesse aniimo (32 clics) · aniimo faiblesse (18) ·
 *   aniimo faiblesse elementaire (14) · aniimo contre (14) ·
 *   tableau type aniimo (13) · tableau element aniimo (11) ·
 *   tableau faiblesse aniimo (10) · aniimo tableau élémentaire (10)
 * Soit 122 clics contre 23 pour le Discord.
 *
 * Le tableau général capte le générique ; ces neuf fiches visent la longue
 * traîne (« faiblesse feu aniimo », « contre ténèbres aniimo »…) sans se
 * cannibaliser, puisque chacune traite un élément et un seul.
 *
 * Toutes les données viennent de tools/elements.mjs. Rien n'est saisi ici.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { page, ctaDiscord, SITE } from './gabarit.mjs';
import { ELEMENTS, TABLE, PROFILS, slug, badge, badges, menaces, neutres, encaisse } from './elements.mjs';

const ecrire = (chemin, html) => {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, html, 'utf8');
  console.log('  ✓ ' + chemin);
};

const MAJ = '2026-10-16';

/** Article défini, pour écrire « du Feu », « de l'Eau », « des Ténèbres ». */
const ARTICLE = {
  Feu: 'du Feu', Eau: "de l'Eau", Plante: 'de la Plante', Foudre: 'de la Foudre',
  Glace: 'de la Glace', Terre: 'de la Terre', Vent: 'du Vent',
  Lumière: 'de la Lumière', 'Ténèbres': 'des Ténèbres',
};
/** Forme utilisée après « un Aniimo … ». */
const DE = {
  Feu: 'de Feu', Eau: "d'Eau", Plante: 'de Plante', Foudre: 'de Foudre',
  Glace: 'de Glace', Terre: 'de Terre', Vent: 'de Vent',
  Lumière: 'de Lumière', 'Ténèbres': 'de Ténèbres',
};

/** Multiplicateur appliqué quand `att` frappe `def`. */
const mult = (att, def) => (TABLE[att].fort.includes(def) ? '1,6'
  : TABLE[att].resiste.includes(def) ? '0,625' : '1');

const teinte = (m) => (m === '1,6' ? 'var(--vert)' : m === '0,625' ? 'var(--rouge-fr)' : 'var(--texte-doux)');

/** Tableau des neuf affrontements de l'élément, en attaque et en défense. */
function tableauDuel(e) {
  const lignes = ELEMENTS.map((adv) => {
    const att = mult(e, adv);
    const def = mult(adv, e);
    return `            <tr>
              <th scope="row">${badge(adv)}</th>
              <td style="color:${teinte(att)};font-weight:800">×${att}</td>
              <td style="color:${teinte(def)};font-weight:800">×${def}</td>
            </tr>`;
  }).join('\n');

  return `      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Tous les affrontements ${ARTICLE[e]} — dégâts infligés et subis</caption>
          <thead>
            <tr>
              <th scope="col">Adversaire</th>
              <th scope="col">${e} inflige</th>
              <th scope="col">${e} subit</th>
            </tr>
          </thead>
          <tbody>
${lignes}
          </tbody>
        </table>
      </div>`;
}

/* ============================================================
   Génération des neuf fiches
   ============================================================ */
for (const e of ELEMENTS) {
  const p = PROFILS[e];
  const s = slug(e);
  const url = `guides/types-et-faiblesses/${s}/`;
  const vulnerable = menaces(e);
  const resistePar = TABLE[e].resiste;
  const solide = encaisse(e);
  const neutre = neutres(e);

  // Les autres éléments, pour le maillage en bas de page.
  const autres = ELEMENTS.filter((x) => x !== e);

  ecrire(`${url}index.html`, page({
    url, actif: 'guides',
    titre: `Faiblesse ${ARTICLE[e]} dans Aniimo : tableau et contres`,
    description: `Quelles sont les faiblesses ${ARTICLE[e]} dans Aniimo ? Les éléments qui le battent, ceux qu'il écrase, et le tableau complet des dégâts infligés et subis.`,
    motsCles: `faiblesse ${s} aniimo, aniimo ${s} faiblesse, contre ${s} aniimo, aniimo ${s} counter, tableau ${s} aniimo, battre aniimo ${s}`,
    h1: `Faiblesses ${ARTICLE[e]} dans Aniimo`,
    chapo: `${p.emoji} ${p.accroche} Voici ce qui bat un Aniimo ${DE[e]}, ce qu'il bat en retour, et le détail des neuf affrontements.`,
    fil: [
      { nom: 'Guides', href: 'guides/' },
      { nom: 'Types et faiblesses', href: 'guides/types-et-faiblesses/' },
      { nom: e, href: url },
    ],
    maj: MAJ,
    sommaire: [
      { id: 'resume', nom: 'En bref' },
      { id: 'battre', nom: `Battre un Aniimo ${DE[e]}` },
      { id: 'attaque', nom: `${e} en attaque` },
      { id: 'tableau', nom: 'Les neuf affrontements' },
      { id: 'faq', nom: 'Questions fréquentes' },
    ],
    ld: [
      {
        '@type': 'Article',
        headline: `Faiblesse ${ARTICLE[e]} dans Aniimo : tableau et contres`,
        description: `Les faiblesses et les forces de l'élément ${e} dans Aniimo, avec le détail des multiplicateurs de dégâts.`,
        inLanguage: 'fr-FR',
        datePublished: MAJ, dateModified: MAJ,
        image: SITE + '/assets/og/banniere.jpg',
        author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
        publisher: { '@id': SITE + '/#organisation' },
        mainEntityOfPage: `${SITE}/${url}`,
        about: { '@id': SITE + '/#jeu' },
        isPartOf: { '@id': `${SITE}/guides/types-et-faiblesses/#page` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Quelle est la faiblesse ${ARTICLE[e]} dans Aniimo ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: vulnerable.length
                ? `L'élément ${e} subit 1,6 fois les dégâts des attaques de type ${vulnerable.join(' et ')}. Ce sont ses seules véritables faiblesses : tous les autres éléments lui infligent des dégâts normaux ou réduits.`
                : `L'élément ${e} n'a aucune faiblesse élémentaire : aucun élément ne lui inflige de dégâts augmentés.`,
            },
          },
          {
            '@type': 'Question',
            name: `Contre quoi l'élément ${e} est-il fort dans Aniimo ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${e} inflige 1,6 fois les dégâts aux Aniimo de type ${TABLE[e].fort.join(' et ')}. En revanche, ses attaques sont réduites à 0,625 contre ${resistePar.join(', ')}.`,
            },
          },
          {
            '@type': 'Question',
            name: `Comment battre un Aniimo ${DE[e]} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: vulnerable.length
                ? `Attaquez avec un Aniimo de type ${vulnerable.join(' ou ')} pour infliger 1,6 fois les dégâts. Évitez ${TABLE[e].fort.join(' et ')}, que ${e} écrase. Pensez aussi à briser la jauge de Rupture pour l'étourdir.`
                : `Aucun élément n'inflige de dégâts augmentés contre ${e}. Privilégiez un matchup neutre et jouez sur la jauge de Rupture plutôt que sur l'avantage élémentaire.`,
            },
          },
        ],
      },
    ],
    corps: `      <h2 id="resume">En bref</h2>
      <div class="fiche-rapide">
        <div class="item">
          <div class="k">Vulnérable à (×1,6 subis)</div>
          <div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(vulnerable)}</div>
        </div>
        <div class="item">
          <div class="k">Fort contre (×1,6 infligés)</div>
          <div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(TABLE[e].fort)}</div>
        </div>
        <div class="item">
          <div class="k">Ses coups sont encaissés par</div>
          <div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(resistePar)}</div>
        </div>
        <div class="item">
          <div class="k">Encaisse bien les coups de</div>
          <div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(solide)}</div>
        </div>
      </div>

      <h2 id="battre">Comment battre un Aniimo ${DE[e]}</h2>
      ${vulnerable.length ? `<p>Deux éléments seulement — ou presque — font vraiment mal ${ARTICLE[e]}&nbsp;: ${badges(vulnerable)}. Leurs attaques infligent <strong>1,6 fois les dégâts</strong>.</p>
      <p><strong>Ce qu'il faut éviter&nbsp;:</strong> envoyer un Aniimo de type ${TABLE[e].fort.map((x) => badge(x)).join(' ou ')} au front. ${e} les écrase, et vous perdrez l'échange.</p>`
    : `<p>Particularité ${ARTICLE[e]}&nbsp;: <strong>aucun élément ne lui inflige de dégâts augmentés</strong>. Vous ne gagnerez pas ce combat par l'avantage élémentaire.</p>
      <p><strong>Ce qu'il faut éviter&nbsp;:</strong> envoyer un Aniimo de type ${TABLE[e].fort.map((x) => badge(x)).join(' ou ')}, que ${e} écrase.</p>`}
      <div class="encadre succes">
        <span class="etiq">Le réflexe qui change tout</span>
        <p>L'avantage élémentaire ne fait pas tout. <strong>Briser la jauge de Rupture</strong> étourdit la cible et ouvre une fenêtre bien plus décisive qu'un simple ×1,6. Un rôle <strong>BREAK</strong> dans l'équipe vaut souvent mieux qu'un contre parfait — voir notre <a href="../../capture-anipod/">guide de la capture</a>.</p>
      </div>

      <h2 id="attaque">${e} en attaque&nbsp;: ce qu'il vaut</h2>
      <p>${e} inflige 1,6 fois les dégâts contre ${badges(TABLE[e].fort)}.</p>
      <p>En revanche, ses attaques tombent à 0,625 contre ${badges(resistePar)}. ${p.conseil}</p>
      ${neutre.length ? `<p>Face à ${badges(neutre)}, les dégâts sont neutres&nbsp;: ni bonus, ni malus.</p>` : ''}

      <h2 id="tableau">Les neuf affrontements ${ARTICLE[e]}</h2>
      <p>Colonne de gauche&nbsp;: ce que <strong>${e} inflige</strong> à l'adversaire. Colonne de droite&nbsp;: ce que <strong>${e} subit</strong> de sa part.</p>
${tableauDuel(e)}
      <p style="font-size:.86rem;color:var(--texte-doux);font-weight:600">Rappel&nbsp;: ×1,6 en super efficace, ×1 en neutre, ×0,625 en résisté. Il n'existe aucune immunité dans Aniimo.</p>

      <h2 id="faq">Questions fréquentes</h2>
      <div class="bloc-faq">
        <details>
          <summary>Quelle est la faiblesse ${ARTICLE[e]}&nbsp;?</summary>
          <p>${vulnerable.length
            ? `${e} subit 1,6 fois les dégâts de ${vulnerable.join(' et ')}. Ce sont ses seules faiblesses élémentaires.`
            : `Aucune. Aucun élément n'inflige de dégâts augmentés contre ${e}.`}</p>
        </details>
        <details>
          <summary>Contre quoi ${e} est-il fort&nbsp;?</summary>
          <p>Contre ${TABLE[e].fort.join(' et ')}, avec 1,6 fois les dégâts.</p>
        </details>
        <details>
          <summary>Pourquoi mes attaques ${ARTICLE[e]} font-elles si peu de dégâts&nbsp;?</summary>
          <p>Probablement parce que la cible est de type ${resistePar.join(', ')}&nbsp;: ces éléments réduisent les dégâts ${ARTICLE[e]} à 0,625. Changez de créature plutôt que d'insister.</p>
        </details>
        <details>
          <summary>Y a-t-il des immunités dans Aniimo&nbsp;?</summary>
          <p>Non. Le pire cas reste ×0,625. Vous n'êtes jamais totalement bloqué, seulement ralenti.</p>
        </details>
      </div>

      <h2 id="autres">Les autres éléments</h2>
      <div class="grille-liens">
        <a class="carte-lien" href="../">
          <h3>📊 Le tableau complet des 9 éléments</h3>
          <p>Toutes les interactions sur une seule page, plus les contres spatiaux.</p>
          <span class="fleche">Voir le tableau →</span>
        </a>
${autres.map((x) => `        <a class="carte-lien" href="../${slug(x)}/">
          <h3>${PROFILS[x].emoji} Faiblesses ${ARTICLE[x]}</h3>
          <p>${PROFILS[x].accroche}</p>
          <span class="fleche">Consulter →</span>
        </a>`).join('\n')}
      </div>

${ctaDiscord('Un matchup vous surprend&nbsp;?', 'Confrontez vos relevés à ceux des autres joueurs FR sur le Discord. Ce tableau est corrigé au fil de leurs retours.')}`,
  }));
}

console.log(`\n${ELEMENTS.length} fiches d'élément générées.`);
