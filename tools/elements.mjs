/**
 * elements.mjs — Les neuf éléments d'Aniimo et leurs interactions.
 *
 * Source unique partagée par le tableau général (/guides/types-et-faiblesses/)
 * et les neuf fiches par élément. Corriger ici corrige partout.
 *
 * ── VÉRIFICATION ──────────────────────────────────────────────────────
 * Matrice revérifiée le 16 octobre 2026 contre DEUX sources indépendantes
 * qui concordent à 100 % (aniidex.com/aniimo/elements et game8.co).
 *
 * Elle corrige la version publiée le 17 septembre, qui était incomplète :
 *   • Feu était donné fort uniquement contre Plante → il l'est aussi
 *     contre Glace ;
 *   • plusieurs résistances manquaient (Lumière pour Feu, Eau et Plante,
 *     Glace pour Foudre et Eau, Ténèbres et Terre pour Terre) ;
 *   • Plante était donnée résistée par Vent, ce qui est faux (neutre).
 *
 * Multiplicateurs : 1,6 (super efficace) · 1 (neutre) · 0,625 (résisté).
 * Aucune immunité dans le jeu.
 * ──────────────────────────────────────────────────────────────────────
 */

export const ELEMENTS = ['Feu', 'Eau', 'Plante', 'Foudre', 'Glace', 'Terre', 'Vent', 'Lumière', 'Ténèbres'];

/** `fort` : ce que l'élément écrase (×1,6). `resiste` : qui encaisse ses coups (×0,625). */
export const TABLE = {
  Feu:      { fort: ['Glace', 'Plante'],             resiste: ['Lumière', 'Feu', 'Terre', 'Eau'] },
  Eau:      { fort: ['Feu', 'Terre'],                resiste: ['Glace', 'Eau', 'Plante', 'Lumière'] },
  Plante:   { fort: ['Terre', 'Eau'],                resiste: ['Lumière', 'Feu', 'Plante'] },
  Foudre:   { fort: ['Eau', 'Vent'],                 resiste: ['Glace', 'Foudre', 'Terre'] },
  Glace:    { fort: ['Foudre', 'Eau'],               resiste: ['Glace', 'Feu', 'Terre'] },
  Terre:    { fort: ['Glace', 'Feu'],                resiste: ['Ténèbres', 'Terre', 'Eau', 'Plante'] },
  Vent:     { fort: ['Ténèbres', 'Plante'],          resiste: ['Vent', 'Foudre'] },
  Lumière:  { fort: ['Ténèbres', 'Vent'],            resiste: ['Lumière', 'Foudre'] },
  Ténèbres: { fort: ['Lumière', 'Foudre', 'Plante'], resiste: ['Eau', 'Vent'] },
};

/** Identifiant utilisable en URL et en classe CSS : « Ténèbres » → « tenebres ». */
export const slug = (e) => e.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Badge coloré d'un élément. */
export const badge = (e) => `<span class="type type-${slug(e)}">${e}</span>`;

/** Liste de badges, ou un tiret si la liste est vide. */
export const badges = (l) => (l.length
  ? l.map(badge).join(' ')
  : '<span style="color:var(--texte-doux)">—</span>');

/** Qui frappe fort contre cet élément ? Déduit du tableau, jamais saisi à la main. */
export const menaces = (cible) => ELEMENTS.filter((a) => TABLE[a].fort.includes(cible));

/** Contre qui cet élément est-il neutre ? Le reste, par soustraction. */
export const neutres = (e) => ELEMENTS.filter(
  (c) => !TABLE[e].fort.includes(c) && !TABLE[e].resiste.includes(c)
);

/**
 * Qui encaisse bien les coups portés À cet élément ? Autrement dit, quels
 * attaquants voient leurs dégâts réduits contre lui — sa solidité défensive.
 * À ne pas confondre avec TABLE[e].resiste, qui décrit l'inverse :
 * qui encaisse bien les coups QUE cet élément porte.
 */
export const encaisse = (cible) => ELEMENTS.filter((a) => TABLE[a].resiste.includes(cible));

/* ---------- Habillage éditorial ----------
   Uniquement du qualitatif : tous les chiffres et toutes les listes de la
   page sont calculés depuis TABLE, jamais recopiés ici. Une correction du
   tableau n'a donc jamais besoin d'être répercutée dans ces textes. */
export const PROFILS = {
  Feu: {
    emoji: '🔥', couleur: '--type-feu',
    accroche: 'Redoutable sur la Glace et la Plante, vite contenu ailleurs.',
    conseil: 'Sortez le Feu pour une cible précise, puis permutez. Contre un adversaire de Terre ou d\'Eau, il perd son temps.',
  },
  Eau: {
    emoji: '💧', couleur: '--type-eau',
    accroche: 'Le contre naturel du Feu et de la Terre.',
    conseil: 'Un élément d\'ouverture fiable : les cibles de Feu et de Terre sont parmi les plus répandues du jeu.',
  },
  Plante: {
    emoji: '🌿', couleur: '--type-plante',
    accroche: 'Efficace sur la Terre et l\'Eau, fragile face au Feu.',
    conseil: 'La Plante paie cher une erreur de lecture : trois éléments la punissent. Vérifiez la cible avant de l\'envoyer.',
  },
  Foudre: {
    emoji: '⚡', couleur: '--type-foudre',
    accroche: 'La réponse aux créatures aquatiques et volantes.',
    conseil: 'Excellente en ouverture contre l\'Eau et le Vent, à remiser dès que la cible change.',
  },
  Glace: {
    emoji: '❄️', couleur: '--type-glace',
    accroche: 'Le contre de la Foudre et de l\'Eau.',
    conseil: 'Attention aux retours de bâton : le Feu et la Terre la punissent sévèrement.',
  },
  Terre: {
    emoji: '🪨', couleur: '--type-terre',
    accroche: 'Frappe la Glace et le Feu, encaisse bien en retour.',
    conseil: 'Bonne créature de première ligne, mais son offensive est souvent contenue : accompagnez-la d\'un vrai DPS.',
  },
  Vent: {
    emoji: '🍃', couleur: '--type-vent',
    accroche: 'Le prédateur des Ténèbres et de la Plante.',
    conseil: 'Peu de contres, peu de cibles : un élément d\'appoint précieux plutôt qu\'un pilier d\'équipe.',
  },
  Lumière: {
    emoji: '✨', couleur: '--type-lumiere',
    accroche: 'Le contre direct des Ténèbres.',
    conseil: 'L\'élément le plus sûr à laisser au front : très peu d\'adversaires le frappent en force.',
  },
  'Ténèbres': {
    emoji: '🌙', couleur: '--type-tenebres',
    accroche: 'Le seul élément fort contre trois autres.',
    conseil: 'La meilleure polyvalence offensive du jeu. Si vous ne devez monter qu\'un élément, c\'est un excellent choix.',
  },
};
