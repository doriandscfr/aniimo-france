/**
 * pages-codes.mjs — La page des codes cadeaux Aniimo.
 *
 *   node tools/pages-codes.mjs
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  POUR METTRE À JOUR : modifiez les tableaux CODES et EXPIRES     │
 * │  ci-dessous, changez MAJ, puis lancez :                          │
 * │      npm run codes && npm run indexnow /codes/                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * C'est la page la plus sensible à la fraîcheur du site : sur un jeu-service,
 * une liste de codes à jour bat systématiquement un concurrent mieux établi
 * mais périmé. Elle est donc pilotée par des données plutôt qu'écrite à la
 * main, pour que la mise à jour prenne deux minutes.
 *
 * Les codes sont SENSIBLES À LA CASSE : recopiez-les exactement.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { page, ctaDiscord, SITE, DISCORD } from './gabarit.mjs';

const MAJ = '2026-10-16';
const MAJ_FR = '16 octobre 2026';

/* ============================================================
   Codes actifs
   Relevés le 16 octobre 2026 auprès de deux suiveurs à jour
   (game8.co au 7 octobre, destructoid.com au 14 octobre).
   `reserve`  : restriction régionale connue.
   `doute`    : les sources ne s'accordent pas — à tester en jeu.
   ============================================================ */
const CODES = [
  { code: 'Aniimo2026',       gains: 'Œuf SUSUTA · 2 Anipods Ultra · 200 Glimmer', phare: true },
  { code: 'ANIIMOGIFT',       gains: '10 Glimmer · 20 000 Crédits · 10 Fleurs de croissance · 5 Anipods Pro', phare: true },
  { code: 'aniimofreetoplay', gains: '50 Glimmer · 5 Anipods Pro · 5 Fleurs de croissance' },
  { code: 'twinewithaniimo',  gains: '50 Glimmer · 5 Anipods Pro · 5 Fleurs de croissance' },
  { code: 'aniimobonus',      gains: '50 Glimmer' },
  { code: 'aniimonow',        gains: '10 000 Crédits · 3 Fleurs de croissance' },
  { code: 'anywhereaniimo',   gains: '10 000 Crédits · 3 Fleurs de croissance' },
  { code: 'anythinganiimo',   gains: '10 000 Crédits · 3 Fleurs de croissance' },
  { code: 'aniimotogether',   gains: '10 000 Crédits · 3 Fleurs de croissance' },
  { code: 'anyoneaniimo',     gains: '10 000 Crédits · 5 Anipods' },
  { code: 'aniimoopenworld',  gains: '10 000 Crédits · 5 Anipods' },
  { code: 'aniimolaunch2026', gains: '10 000 Crédits · 5 Anipods' },
  { code: 'aniimoidyll',      gains: '10 000 Crédits · 5 Anipods',
    doute: 'La casse diffère selon les sources (aniimoidyll ou aniimoidyLL). Essayez les deux.' },
  { code: 'aniimowelcome',    gains: '50 Glimmer · 5 Anipods Pro · 5 Fleurs de croissance',
    doute: 'Donné comme expiré par une source, encore actif par une autre. À tenter.' },
  { code: 'aniimazingfroyo',  gains: '20 Glimmer',
    reserve: 'Serveur américain uniquement' },
];

const EXPIRES = [
  { code: 'aniimoparty',  gains: '50 Glimmer', fin: '19 septembre 2026' },
];

/* ============================================================ */

const ecrire = (chemin, html) => {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, html, 'utf8');
  console.log('  ✓ ' + chemin);
};

const carteCode = (c) => `      <div class="code-carte${c.phare ? ' phare' : ''}">
        <button type="button" class="valeur" data-code="${c.code}" title="Cliquer pour copier">${c.code}</button>
        <div class="recompenses">
          <div class="k">Récompenses</div>
          <div class="v">${c.gains}</div>
          ${c.reserve ? `<div class="mention-code">⚠︎ ${c.reserve}</div>` : ''}
          ${c.doute ? `<div class="mention-code">⚠︎ ${c.doute}</div>` : ''}
        </div>
        <span class="chip ${c.reserve || c.doute ? 'chip-ajuste' : 'chip-buff'}">${c.reserve || c.doute ? 'À tester' : 'Actif'}</span>
      </div>`;

const sursCodes = CODES.filter((c) => !c.reserve && !c.doute).length;

ecrire('codes/index.html', page({
  url: 'codes/', actif: 'codes',
  titre: `Codes Aniimo (octobre 2026) : ${CODES.length} codes actifs`,
  description: `Les ${CODES.length} codes cadeaux Aniimo actifs en octobre 2026, avec leurs récompenses détaillées et le tutoriel pour les échanger en jeu. Liste vérifiée par la communauté FR.`,
  motsCles: 'codes aniimo, code aniimo, aniimo codes, code cadeau aniimo, aniimo redeem code, codes aniimo octobre 2026, code aniimo gratuit, aniimo gift code',
  h1: `Codes Aniimo&nbsp;: ${CODES.length} codes actifs en octobre 2026`,
  chapo: `Les codes cadeaux offrent du Glimmer, des Crédits, des Fleurs de croissance et des Anipods — gratuitement, en une minute. Voici les <strong>${CODES.length} codes encore valides</strong>, vérifiés le ${MAJ_FR}.`,
  fil: [{ nom: 'Codes Aniimo', href: 'codes/' }],
  maj: MAJ,
  sommaire: [
    { id: 'actifs', nom: 'Codes actifs' },
    { id: 'comment', nom: 'Comment les utiliser' },
    { id: 'expires', nom: 'Codes expirés' },
    { id: 'ne-marche-pas', nom: 'Mon code ne marche pas' },
    { id: 'trouver', nom: 'Trouver de nouveaux codes' },
  ],
  styles: `    .code-carte{
      background:var(--carte);border:1px solid var(--bordure);border-radius:16px;
      padding:18px 20px;margin-bottom:12px;
      display:flex;align-items:center;gap:18px;flex-wrap:wrap;
    }
    .code-carte.phare{border-color:rgba(255,201,77,.45);background:linear-gradient(135deg,var(--carte),rgba(255,201,77,.05))}
    .code-carte .valeur{
      font-family:'Fredoka',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.04em;
      background:var(--encre);border:1px dashed rgba(77,124,255,.55);color:var(--blanc);
      padding:10px 18px;border-radius:12px;user-select:all;cursor:pointer;flex:none;
      transition:border-color .15s,background .15s;
    }
    .code-carte .valeur:hover{border-color:var(--bleu-fr);background:rgba(77,124,255,.12)}
    .code-carte .recompenses{flex:1;min-width:220px}
    .code-carte .recompenses .k{
      font-family:'Fredoka',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.08em;
      text-transform:uppercase;color:var(--texte-doux);margin-bottom:3px;
    }
    .code-carte .recompenses .v{font-weight:800;color:var(--texte);font-size:.92rem;line-height:1.45}
    .mention-code{font-size:.8rem;font-weight:700;color:var(--or);margin-top:5px}
    .code-carte.expire{opacity:.55}
    .code-carte.expire .valeur{text-decoration:line-through;border-style:solid;cursor:default}
    .copie-ok{font-size:.78rem;font-weight:800;color:var(--vert);margin-left:10px}`,
  ld: [
    {
      '@type': 'Article',
      headline: `Codes Aniimo (octobre 2026) : ${CODES.length} codes actifs et comment les utiliser`,
      description: 'Liste vérifiée des codes cadeaux Aniimo actifs, leurs récompenses et la procédure d\'échange en jeu.',
      inLanguage: 'fr-FR',
      datePublished: '2026-09-17', dateModified: MAJ,
      image: SITE + '/assets/og/banniere.jpg',
      author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
      publisher: { '@id': SITE + '/#organisation' },
      mainEntityOfPage: SITE + '/codes/',
      about: { '@id': SITE + '/#jeu' },
    },
    {
      '@type': 'HowTo',
      name: 'Comment utiliser un code cadeau dans Aniimo',
      inLanguage: 'fr-FR',
      totalTime: 'PT1M',
      description: 'Procédure pour échanger un code cadeau Aniimo depuis le menu du jeu.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Ouvrir les Paramètres', text: 'Lancez Aniimo et ouvrez le menu Paramètres depuis l\'interface principale.' },
        { '@type': 'HowToStep', position: 2, name: 'Aller dans Compte', text: 'Dans les Paramètres, sélectionnez l\'onglet Compte.' },
        { '@type': 'HowToStep', position: 3, name: 'Ouvrir l\'échange de code', text: 'Cliquez sur le bouton Échange de code cadeau (Gift Code Redemption).' },
        { '@type': 'HowToStep', position: 4, name: 'Saisir le code', text: 'Saisissez le code en respectant exactement les majuscules et minuscules, puis validez.' },
        { '@type': 'HowToStep', position: 5, name: 'Récupérer les récompenses', text: 'Les récompenses arrivent dans la boîte de réception du jeu. Ouvrez-la pour les réclamer.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Quels sont les codes Aniimo actifs en octobre 2026 ?',
          acceptedAnswer: { '@type': 'Answer', text: `En octobre 2026, ${CODES.length} codes Aniimo sont recensés comme actifs, dont ${CODES.filter((c) => c.phare).map((c) => c.code).join(' et ')}. Les codes sont sensibles à la casse et utilisables une seule fois par compte.` } },
        { '@type': 'Question', name: 'Où entrer un code cadeau dans Aniimo ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Ouvrez les Paramètres du jeu, allez dans l\'onglet Compte, puis cliquez sur Échange de code cadeau. Saisissez le code et validez : les récompenses arrivent dans la boîte de réception en jeu.' } },
        { '@type': 'Question', name: 'Les codes Aniimo sont-ils sensibles à la casse ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Oui. Les codes Aniimo distinguent les majuscules des minuscules. Copiez-collez le code tel quel pour éviter toute erreur de saisie.' } },
        { '@type': 'Question', name: 'Peut-on utiliser un code Aniimo plusieurs fois ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Non. Chaque code ne peut être utilisé qu\'une seule fois par compte.' } },
        { '@type': 'Question', name: 'Pourquoi mon code Aniimo ne fonctionne-t-il pas ?',
          acceptedAnswer: { '@type': 'Answer', text: 'Quatre causes : le code a expiré, il a déjà été utilisé sur votre compte, la casse n\'a pas été respectée, ou le code est réservé à une autre région. Certains codes sont limités au serveur américain.' } },
      ],
    },
  ],
  corps: `      <h2 id="actifs">Les ${CODES.length} codes actifs</h2>
      <p>Cliquez sur un code pour le copier. Ils sont <strong>sensibles à la casse</strong> et <strong>utilisables une seule fois par compte</strong>.</p>

${CODES.map(carteCode).join('\n')}

      <div class="encadre alerte">
        <span class="etiq">Les codes expirent vite</span>
        <p>Les codes Aniimo tiennent rarement plus de quelques semaines, et certains sont désactivés dès qu'un quota d'utilisations est atteint — sans préavis. Cette liste a été vérifiée le <strong>${MAJ_FR}</strong>. Si un code ne passe plus, signalez-le sur le <a href="${DISCORD}" rel="noopener">Discord Aniimo France</a>&nbsp;: nous le déplaçons dans les expirés le jour même.</p>
      </div>

      <h2 id="comment">Comment utiliser un code cadeau</h2>
      <p>La procédure prend moins d'une minute, à l'identique sur PC, console et mobile&nbsp;:</p>
      <ol>
        <li>Lancez <strong>Aniimo</strong> et ouvrez le menu <strong>Paramètres</strong>.</li>
        <li>Rendez-vous dans l'onglet <strong>Compte</strong>.</li>
        <li>Cliquez sur <strong>Échange de code cadeau</strong> (<em>Gift Code Redemption</em>).</li>
        <li>Collez le code en <strong>respectant exactement les majuscules</strong>, puis validez.</li>
        <li>Ouvrez votre <strong>boîte de réception</strong> en jeu pour récupérer les récompenses.</li>
      </ol>
      <div class="encadre">
        <span class="etiq">Astuce</span>
        <p>Copiez-collez systématiquement plutôt que de retaper&nbsp;: une majuscule mal placée suffit à faire échouer l'échange. Les boutons ci-dessus copient le code d'un clic.</p>
      </div>

      <h2 id="expires">Codes expirés</h2>
      <p>Conservés ici pour vous éviter de les essayer&nbsp;:</p>
${EXPIRES.map((c) => `      <div class="code-carte expire">
        <span class="valeur">${c.code}</span>
        <div class="recompenses">
          <div class="k">Expiré le ${c.fin}</div>
          <div class="v">${c.gains}</div>
        </div>
        <span class="chip chip-nerf">Expiré</span>
      </div>`).join('\n')}

      <h2 id="ne-marche-pas">Mon code Aniimo ne fonctionne pas</h2>
      <div class="tableau-enveloppe">
        <table class="tbl">
          <caption>Causes fréquentes d'échec d'un code Aniimo</caption>
          <thead><tr><th scope="col">Symptôme</th><th scope="col">Cause probable</th><th scope="col">Solution</th></tr></thead>
          <tbody>
            <tr><td>Code invalide</td><td>Erreur de casse ou de saisie</td><td>Copiez-collez le code exactement</td></tr>
            <tr><td>Code expiré</td><td>Période de validité passée, ou quota atteint</td><td>Essayez un autre code de la liste</td></tr>
            <tr><td>Code déjà utilisé</td><td>Un code = une fois par compte</td><td>Vérifiez votre boîte de réception</td></tr>
            <tr><td>Code indisponible</td><td>Réservé à une autre région</td><td>Rien à faire&nbsp;: il n'est pas pour votre serveur</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="trouver">Où trouver de nouveaux codes</h2>
      <p>Les codes sont distribués à des moments précis&nbsp;:</p>
      <ul>
        <li>sur les <strong>réseaux sociaux officiels</strong> d'Aniimo&nbsp;;</li>
        <li>pendant les <strong>diffusions en direct</strong> et les présentations de mise à jour&nbsp;;</li>
        <li>lors des <strong>événements</strong> et des paliers communautaires&nbsp;;</li>
        <li>à chaque <strong>sortie de patch</strong> — voir nos <a href="../patch-notes/">patch notes en français</a>.</li>
      </ul>
      <p>Le plus simple reste de laisser la communauté faire le travail&nbsp;: sur le Discord Aniimo France, les nouveaux codes sont relayés et traduits dès leur publication.</p>

${ctaDiscord('Ne ratez plus aucun code', 'Les codes Aniimo sont annoncés puis expirent vite. Sur le Discord, ils sont relayés dès leur sortie, en français.')}

      <div class="grille-liens">
        <a class="carte-lien" href="../guides/types-et-faiblesses/">
          <h3>⚔️ Faiblesses et types</h3>
          <p>Le tableau complet des neuf éléments et une fiche par élément.</p>
          <span class="fleche">Voir le tableau →</span>
        </a>
        <a class="carte-lien" href="../aniimo/mobile/">
          <h3>📱 Aniimo mobile</h3>
          <p>Télécharger sur iOS et Android, configuration requise.</p>
          <span class="fleche">Tout savoir →</span>
        </a>
        <a class="carte-lien" href="../guides/bien-debuter/">
          <h3>🚀 Bien débuter</h3>
          <p>Vos premières heures à Idyll sans perdre de temps.</p>
          <span class="fleche">Lire le guide →</span>
        </a>
        <a class="carte-lien" href="../aniimo/">
          <h3>🎮 La fiche du jeu</h3>
          <p>Plateformes, prix, crossplay et configuration PC.</p>
          <span class="fleche">Consulter →</span>
        </a>
      </div>

      <script>
      document.querySelectorAll('.code-carte .valeur[data-code]').forEach(function(bouton){
        bouton.addEventListener('click', function(){
          navigator.clipboard.writeText(bouton.dataset.code).then(function(){
            var deja = bouton.parentElement.querySelector('.copie-ok');
            if (deja) deja.remove();
            var ok = document.createElement('span');
            ok.className = 'copie-ok';
            ok.textContent = 'Copié !';
            bouton.after(ok);
            setTimeout(function(){ ok.remove(); }, 2000);
          }).catch(function(){});
        });
      });
      </script>`,
}));

console.log(`\nPage codes générée : ${CODES.length} actifs (${sursCodes} sans réserve), ${EXPIRES.length} expiré(s).`);
