/**
 * pages-creatures.mjs — Une page indexable par créature.
 *
 *   node tools/pages-creatures.mjs   (ou npm run creatures)
 *
 * Lit data/creatures.json et produit /aniimopedia/<nom>/ pour chacune.
 * Chaque fiche vise les recherches par nom (« scorchhowl aniimo »,
 * « aniimo irisal faiblesse ») et renvoie vers la fiche de son élément,
 * ce qui renforce le pôle « faiblesses » déjà porteur du site.
 *
 * Les faiblesses ne sont pas saisies : elles sont DÉDUITES de l'élément
 * via tools/elements.mjs. Corriger le tableau des éléments corrige donc
 * les 98 fiches d'un coup.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { page, ctaDiscord, SITE } from './gabarit.mjs';
import { ELEMENTS, TABLE, PROFILS, slug as slugElement, badge, badges, menaces } from './elements.mjs';

const base = JSON.parse(readFileSync('data/creatures.json', 'utf8'));
const CREATURES = base.creatures;
const MAJ = base.miseAJour || '2026-10-16';

const slugCrea = (nom) => nom.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ecrire = (chemin, html) => {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, html, 'utf8');
};

/* Ce que fait chaque rôle, pour donner du contenu utile à la fiche. */
const ROLES = {
  DPS:     { nom: 'DPS',     texte: 'inflige l\'essentiel des dégâts de l\'équipe. C\'est la créature qu\'on protège et qu\'on fait monter en priorité.' },
  BREAK:   { nom: 'BREAK',   texte: 'casse la jauge de Rupture adverse pour étourdir la cible. Indispensable pour capturer, et le rôle le plus sous-estimé des débutants.' },
  SUPPORT: { nom: 'SUPPORT', texte: 'renforce l\'équipe : buffs, affaiblissements, contrôle. Il ne se voit pas dans les chiffres de dégâts, mais il les multiplie.' },
  HEAL:    { nom: 'HEAL',    texte: 'maintient l\'équipe en vie. Sur les combats longs et les boss, c\'est lui qui fait la différence entre réussir et recommencer.' },
  REGEN:   { nom: 'REGEN',   texte: 'restaure les ressources de l\'équipe dans la durée. Un rôle d\'endurance, précieux en exploration prolongée.' },
};

const mult = (att, def) => (TABLE[att].fort.includes(def) ? '1,6'
  : TABLE[att].resiste.includes(def) ? '0,625' : '1');
const teinte = (m) => (m === '1,6' ? 'var(--vert)' : m === '0,625' ? 'var(--rouge-fr)' : 'var(--texte-doux)');

/** Tableau des neuf affrontements pour un élément donné. */
const tableauDuel = (e, nom) => `      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Affrontements de ${nom} (type ${e})</caption>
          <thead><tr><th scope="col">Adversaire</th><th scope="col">${nom} inflige</th><th scope="col">${nom} subit</th></tr></thead>
          <tbody>
${ELEMENTS.map((adv) => {
    const a = mult(e, adv); const d = mult(adv, e);
    return `            <tr>
              <th scope="row">${badge(adv)}</th>
              <td style="color:${teinte(a)};font-weight:800">×${a}</td>
              <td style="color:${teinte(d)};font-weight:800">×${d}</td>
            </tr>`;
  }).join('\n')}
          </tbody>
        </table>
      </div>`;

let n = 0;

for (const c of CREATURES) {
  const s = slugCrea(c.nom);
  const url = `aniimopedia/${s}/`;
  const principal = c.types[0];
  const dual = c.types.length > 1;
  const role = ROLES[c.roles[0]] || { nom: c.roles[0], texte: 'occupe un rôle spécifique en équipe.' };
  const vulnerable = menaces(principal);
  const incertain = c.confiance !== 'confirme';

  // Créatures du même élément, pour le maillage.
  const voisines = CREATURES
    .filter((x) => x.nom !== c.nom && x.types[0] === principal)
    .slice(0, 6);

  ecrire(`${url}index.html`, page({
    url, actif: 'pedia',
    titre: `${c.nom} Aniimo : type, rôle et faiblesses`,
    description: `${c.nom} est un Aniimo de type ${c.types.join(' et ')} et de rôle ${role.nom}. Ses faiblesses élémentaires, ce qu'il écrase, et le tableau complet de ses affrontements.`,
    motsCles: `${s} aniimo, aniimo ${s}, ${s} faiblesse, ${s} type, ${s} role, aniimo ${s} contre`,
    h1: `${c.nom}`,
    chapo: `${c.emoji} <strong>${c.nom}</strong> est un Aniimo de type ${c.types.map((t) => badge(t)).join(' ')} et de rôle <strong>${role.nom}</strong>${c.num ? `, n°&nbsp;${c.num} de l'Aniilog` : ''}.`,
    fil: [
      { nom: 'Aniimopédia', href: 'aniimopedia/' },
      { nom: c.nom, href: url },
    ],
    maj: MAJ,
    ld: [
      {
        '@type': 'Article',
        headline: `${c.nom} — Aniimo de type ${c.types.join(' et ')}, rôle ${role.nom}`,
        description: `Fiche de ${c.nom} dans Aniimo : élément, rôle et faiblesses élémentaires.`,
        inLanguage: 'fr-FR',
        datePublished: MAJ, dateModified: MAJ,
        image: SITE + '/assets/og/banniere.jpg',
        author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
        publisher: { '@id': SITE + '/#organisation' },
        mainEntityOfPage: `${SITE}/${url}`,
        about: { '@id': SITE + '/#jeu' },
        isPartOf: { '@id': SITE + '/aniimopedia/#page' },
        mentions: {
          '@type': 'Thing',
          name: c.nom,
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Élément', value: c.types.join(', ') },
            { '@type': 'PropertyValue', name: 'Rôle', value: role.nom },
            ...(c.num ? [{ '@type': 'PropertyValue', name: 'Numéro Aniilog', value: String(c.num) }] : []),
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Quel est le type de ${c.nom} dans Aniimo ?`,
            acceptedAnswer: { '@type': 'Answer', text: `${c.nom} est un Aniimo de type ${c.types.join(' et ')}, avec le rôle ${role.nom}.` },
          },
          {
            '@type': 'Question',
            name: `Quelle est la faiblesse de ${c.nom} ?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: vulnerable.length
                ? `Étant de type ${principal}, ${c.nom} subit 1,6 fois les dégâts des attaques de type ${vulnerable.join(' et ')}.`
                : `Étant de type ${principal}, ${c.nom} ne subit de dégâts augmentés d'aucun élément.`,
            },
          },
        ],
      },
    ],
    corps: `${incertain ? `      <div class="encadre alerte">
        <span class="etiq">Donnée à confirmer</span>
        <p>${c.note || 'Cette créature n\'a été relevée que dans un seul des deux index croisés.'} Si vous la possédez en jeu, confirmez son élément et son rôle sur le <a href="https://discord.gg/aniimofr" rel="noopener">Discord</a>.</p>
      </div>

` : ''}      <div class="fiche-rapide">
        <div class="item"><div class="k">Élément</div><div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(c.types)}</div></div>
        <div class="item"><div class="k">Rôle</div><div class="v">${role.nom}</div></div>
        ${c.num ? `<div class="item"><div class="k">Numéro Aniilog</div><div class="v">n° ${c.num}</div></div>` : ''}
        <div class="item"><div class="k">Vulnérable à</div><div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${badges(vulnerable)}</div></div>
      </div>

      <h2 id="faiblesses">Les faiblesses de ${c.nom}</h2>
      ${vulnerable.length
        ? `<p>${c.nom} étant de type ${badge(principal)}, il <strong>subit 1,6 fois les dégâts</strong> des attaques de type ${badges(vulnerable)}. C'est par là qu'il faut l'attaquer.</p>`
        : `<p>${c.nom} est de type ${badge(principal)}, le seul élément du jeu qu'aucun autre ne frappe en force. Vous ne le battrez pas par l'avantage élémentaire.</p>`}
      <p>À l'inverse, ses attaques ${badge(principal)} écrasent les Aniimo de type ${badges(TABLE[principal].fort)}, et sont réduites contre ${badges(TABLE[principal].resiste)}.</p>
      ${dual ? `<div class="encadre">
        <span class="etiq">Double type</span>
        <p>${c.nom} cumule les types ${badges(c.types)}. Le tableau ci-dessous détaille son type principal&nbsp;; son second type ajoute ses propres interactions, qui se combinent à celles-ci.</p>
      </div>` : ''}
      <p>Le détail complet est sur la fiche de l'élément&nbsp;: <a href="../../guides/types-et-faiblesses/${slugElement(principal)}/">faiblesses ${principal === 'Ténèbres' ? 'des Ténèbres' : principal === 'Feu' || principal === 'Vent' ? 'du ' + principal : principal === 'Eau' ? "de l'Eau" : 'de la ' + principal}</a>.</p>

      <h2 id="role">Le rôle ${role.nom}</h2>
      <p>${c.nom} tient le rôle <strong>${role.nom}</strong>&nbsp;: il ${role.texte}</p>
      <p>Une équipe équilibrée dans Aniimo repose sur trois rôles au minimum — <strong>DPS</strong>, <strong>BREAK</strong> et <strong>HEAL</strong> — complétés par du SUPPORT et du REGEN. Voir notre <a href="../../guides/bien-debuter/">guide du débutant</a>.</p>

      <h2 id="tableau">Tous les affrontements de ${c.nom}</h2>
${tableauDuel(principal, c.nom)}
      <p style="font-size:.86rem;color:var(--texte-doux);font-weight:600">×1,6 en super efficace, ×1 en neutre, ×0,625 en résisté. Aucune immunité dans Aniimo.</p>

      <div class="encadre">
        <span class="etiq">Fiche à compléter</span>
        <p>Les <strong>statistiques chiffrées, les compétences et la localisation</strong> de ${c.nom} ne sont pas encore relevées. Vous les avez en jeu&nbsp;? Partagez-les sur le Discord, nous les ajoutons.</p>
      </div>

${voisines.length ? `      <h2 id="voisines">Autres Aniimo de type ${principal}</h2>
      <div class="grille-liens">
${voisines.map((v) => `        <a class="carte-lien" href="../${slugCrea(v.nom)}/">
          <h3>${v.emoji} ${v.nom}</h3>
          <p>Type ${v.types.join(' et ')} · rôle ${v.roles[0]}</p>
          <span class="fleche">Voir la fiche →</span>
        </a>`).join('\n')}
      </div>

` : ''}      <div class="grille-liens">
        <a class="carte-lien" href="../">
          <h3>📖 Toutes les créatures</h3>
          <p>Les ${base.total} Aniimo recensés, filtrables par élément et par rôle.</p>
          <span class="fleche">Explorer →</span>
        </a>
        <a class="carte-lien" href="../../guides/types-et-faiblesses/">
          <h3>⚔️ Le tableau des faiblesses</h3>
          <p>Les neuf éléments et toutes leurs interactions.</p>
          <span class="fleche">Voir le tableau →</span>
        </a>
      </div>

${ctaDiscord(`Vous jouez ${c.nom}&nbsp;?`, 'Partagez ses statistiques et vos retours sur le Discord : c\'est ce qui fait grandir l\'Aniimopédia.')}`,
  }));
  n++;
}

console.log(`  ✓ ${n} fiches de créature générées`);
