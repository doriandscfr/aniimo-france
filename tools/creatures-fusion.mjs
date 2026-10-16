/**
 * creatures-fusion.mjs — Construit data/creatures.json par recoupement.
 *
 *   node tools/creatures-fusion.mjs
 *
 * MÉTHODE
 * Deux index indépendants ont été relevés le 16 octobre 2026. Chaque créature
 * reçoit un niveau de confiance selon qu'elle apparaît dans l'un ou les deux :
 *
 *   • "confirme"  — présente dans les deux index, avec le MÊME élément
 *                   principal et le MÊME rôle.
 *   • "divergent" — présente dans les deux, mais ils ne s'accordent pas.
 *   • "source-unique" — vue dans un seul index.
 *
 * Seules les entrées "confirme" sont publiées en l'état. Les autres sont
 * marquées dans la page, pour ne jamais présenter comme certain ce qui ne
 * l'est pas — l'erreur commise en septembre avec des statistiques inventées.
 *
 * Ce script ne sert qu'une fois, à l'amorçage. Ensuite, data/creatures.json
 * devient la source de vérité et s'édite directement (ou via le jeu).
 *
 * Les statistiques chiffrées ne figurent PAS ici : aucune source publique
 * fiable ne les donne de façon concordante. Elles se relèvent en jeu.
 */
import { writeFileSync, mkdirSync } from 'fs';

/* Index A — 86 entrées, numérotation sautant le 030. */
const A = `001 Emberpup Fire DPS
002 Flameruff Fire DPS
003 Scorchhowl Fire DPS
004 Inferlupa Fire/Dark Break
005 Celestis Dark DPS
006 Stellarys Dark DPS
007 Chirpi Wind Support
008 Tromber Wind Support
009 Cornet Wind DPS
010 Tubster Wind Break
011 Iris Grass DPS
012 Irisal Grass DPS
013 Skippy Water Heal
014 Pranky Water Heal
015 Glacy Water/Ice Heal
016 Leafy Grass/Water Regen
017 Nimbi Wind Support
018 Turbo Wind Support
019 Dreaple Dark Support
020 Hummin Grass Break
021 Witchin Dark/Grass Regen
022 Tuckin Grass Break
023 Budclaw Rock/Grass Break
024 Shrubclaw Rock/Grass Break
025 Geoclaw Ice Break
026 Sparki Fire Regen
027 Flamerion Fire Regen
028 Flutternym Wind Heal
029 Gracewing Wind Heal
031 Eko Wind Support
032 Eklue Wind Support
033 Budsquire Grass DPS
034 Thornblade Grass DPS
035 Melloblum Grass Support
036 Pomegg Grass Break
037 Pomawk Grass Break
038 Dewy Dark Support
039 Fragrancier Dark Support
040 Wisptis Dark DPS
041 Ignitis Dark DPS
042 Bonesky Ice DPS
043 Fenrier Ice DPS
044 Glynsera Ice DPS
045 Bolty Electric Break
046 Blazen Electric Break
047 Squarrel Fire Break
048 Squashel Fire Break
049 Susuta Water Break
050 Popota Water Break
051 Piopiota Water Support
052 Panpanta Water Break
053 Shelly Water DPS
054 Sheldon Water DPS
055 Sherro Water DPS
056 Baleetle Rock DPS
057 Waleetle Rock DPS
058 Bouldus Rock Support
059 Fentuft Electric DPS
060 Fenmane Electric DPS
061 Helmut Dark Break
062 Pawney Dark DPS
063 Rookey Dark Break
064 Jawling Wind Break
065 Helmwhelp Wind Break
066 Helgon Wind Break
067 Infergon Fire DPS
068 Cubbo Rock DPS
069 Grizbo Rock DPS
070 Pebbling Rock Break
071 Lavazar Fire/Rock Break
072 Magmarex Fire/Rock Break
073 Geodeback Rock Break
074 Minespine Rock Break
075 Cozite Rock Support
076 Bailite Rock Support
077 Bulbly Electric Support
078 Veilfloat Electric Support
079 Luminelle Electric Support
080 Fahloo Water Regen
081 Erlath Water Regen
082 Besauce Electric Regen
10002 Dazmand Electric Support
10003 Fulmintis Electric DPS
11001 Little-Fire-Spirit Fire Support
99996 Lunara Holy DPS
99998 Helion Holy DPS`;

/* Index B — 94 entrées, numérotation sautant le 013. */
const B = `001 Emberpup Fire DPS
002 Flameruff Fire DPS
003 Scorchhowl Fire DPS
004 Inferlupa Fire BREAK
005 Celestis Dark DPS
006 Stellarys Dark DPS
007 Chirpi Wind Support
008 Tromber Wind Support
009 Cornet Wind DPS
010 Tubster Wind BREAK
011 Iris Grass DPS
012 Irisal Grass DPS
014 Skippy Water Heal
015 Pranky Water Heal
016 Glacy Water Heal
017 Leafy Grass REGEN
018 Nimbi Wind Support
019 Turbo Wind Support
020 Dreaple Dark Support
021 Hummin Grass BREAK
022 Witchin Dark REGEN
023 Tuckin Grass BREAK
024 Budclaw Rock BREAK
025 Shrubclaw Rock BREAK
026 Geoclaw Ice BREAK
027 Sparki Fire REGEN
028 Flamerion Fire REGEN
029 Flutternym Wind Heal
030 Gracewing Wind Heal
031 Somniwing Wind REGEN
032 Eko Wind Support
033 Eklue Wind Support
034 Budsquire Grass DPS
035 Thornblade Grass DPS
036 Melloblum Grass Support
037 Pomegg Grass BREAK
038 Dazmand Electric Support
039 Pomawk Grass BREAK
040 Dewy Dark Support
041 Fragrancier Dark Support
042 Wisptis Dark DPS
043 Ignitis Dark DPS
044 Fulmintis Electric DPS
045 Bonesky Ice DPS
046 Fenrier Ice DPS
047 Glynsera Ice DPS
048 Bolty Electric BREAK
049 Blazen Electric BREAK
050 Susuta Water BREAK
051 Popota Water BREAK
052 Piopiota Water Support
053 Panpanta Water BREAK
054 Shelly Water DPS
055 Sheldon Water DPS
056 Sherro Water DPS
057 Baleetle Rock DPS
058 Waleetle Rock DPS
059 Bouldus Rock Support
060 Fentuft Electric DPS
061 Fenmane Electric DPS
062 Helmut Dark BREAK
063 Pawney Dark DPS
064 Rookey Dark BREAK
065 Jawling Wind BREAK
066 Helmwhelp Wind BREAK
067 Helgon Wind BREAK
068 Infergon Fire DPS
069 Cubbo Rock DPS
070 Grizbo Rock DPS
071 Pebbling Rock BREAK
072 Lavazar Fire BREAK
073 Magmarex Fire BREAK
074 Geodeback Rock BREAK
075 Minespine Rock BREAK
076 Cozite Rock Support
077 Bailite Rock Support
078 Bulbly Electric Support
079 Veilfloat Electric Support
080 Luminelle Electric Support
081 Fahloo Water REGEN
082 Erlath Water REGEN
083 Besauce Electric REGEN
084 Reefish Rock REGEN
085 Coraliz Rock REGEN
086 Cheekie Ice BREAK
087 Wavwal Ice BREAK
088 Bubbeep Grass Heal
089 Glameep Grass Heal
090 Popapus Water DPS
091 Gachapus Water DPS
092 Malangel Ice DPS
093 Malevsera Ice DPS
9997 Fennelun Holy DPS
9998 Helion Holy DPS`;

/* ---------- Traduction vers le vocabulaire du site ---------- */
const ELEMENT_FR = {
  Fire: 'Feu', Water: 'Eau', Grass: 'Plante', Electric: 'Foudre', Ice: 'Glace',
  Rock: 'Terre', Wind: 'Vent', Holy: 'Lumière', Light: 'Lumière', Dark: 'Ténèbres',
};
const ROLE_FR = {
  DPS: 'DPS', BREAK: 'BREAK', Break: 'BREAK',
  Support: 'SUPPORT', SUPPORT: 'SUPPORT',
  Heal: 'HEAL', HEAL: 'HEAL', Regen: 'REGEN', REGEN: 'REGEN',
};
const EMOJI = {
  Feu: '🔥', Eau: '💧', Plante: '🌿', Foudre: '⚡', Glace: '❄️',
  Terre: '🪨', Vent: '🍃', Lumière: '✨', 'Ténèbres': '🌙',
};

const lire = (bloc) => bloc.trim().split('\n').map((ligne) => {
  const [num, nom, elements, role] = ligne.trim().split(/\s+/);
  return {
    num: Number(num),
    nom: nom.replace(/-/g, ' '),
    types: elements.split('/').map((e) => ELEMENT_FR[e] || e),
    roles: [ROLE_FR[role] || role],
  };
});

const listeA = lire(A);
const listeB = lire(B);
const parNom = (l) => new Map(l.map((c) => [c.nom.toLowerCase(), c]));
const mapA = parNom(listeA);
const mapB = parNom(listeB);

const tousNoms = [...new Set([...listeA, ...listeB].map((c) => c.nom))]
  .sort((x, y) => x.localeCompare(y, 'fr'));

const creatures = [];
const compte = { confirme: 0, divergent: 0, 'source-unique': 0 };

for (const nom of tousNoms) {
  const a = mapA.get(nom.toLowerCase());
  const b = mapB.get(nom.toLowerCase());
  let confiance;
  let note = '';

  if (a && b) {
    const memeElement = a.types[0] === b.types[0];
    const memeRole = a.roles[0] === b.roles[0];
    if (memeElement && memeRole) {
      confiance = 'confirme';
    } else {
      confiance = 'divergent';
      note = `Les deux index relevés ne s'accordent pas : ${a.types.join('/')} ${a.roles[0]} d'un côté, ${b.types.join('/')} ${b.roles[0]} de l'autre.`;
    }
  } else {
    confiance = 'source-unique';
    note = 'Vue dans un seul des deux index relevés. À confirmer en jeu.';
  }
  compte[confiance]++;

  // On retient le relevé le plus complet pour les types (certains index
  // n'affichent que l'élément principal des créatures à double type).
  const source = (a && b) ? (a.types.length >= b.types.length ? a : b) : (a || b);

  creatures.push({
    nom: source.nom,
    num: source.num,
    types: source.types,
    roles: source.roles,
    emoji: EMOJI[source.types[0]] || '✨',
    image: '',
    description: '',
    stats: {},
    confiance,
    ...(note ? { note } : {}),
  });
}

mkdirSync('data', { recursive: true });
writeFileSync('data/creatures.json', JSON.stringify({
  _lisezMoi: [
    'Base des créatures d\'Aniimo pour aniimo-france.fr.',
    'Amorcée le 16 octobre 2026 par recoupement de deux index indépendants',
    '(tools/creatures-fusion.mjs). Ce fichier est désormais la SOURCE DE VÉRITÉ :',
    'éditez-le directement, puis lancez « npm run pedia ».',
    '',
    'champ confiance :',
    '  confirme      = élément et rôle identiques dans les deux index',
    '  divergent     = les index se contredisent, affiché avec une réserve',
    '  source-unique = vu dans un seul index, affiché avec une réserve',
    '',
    'Les champs description et stats sont vides : aucune source publique ne les',
    'donne de façon fiable. Ils se relèvent en jeu, créature par créature.',
  ].join('\n'),
  miseAJour: '2026-10-16',
  total: creatures.length,
  repartition: compte,
  creatures,
}, null, 2) + '\n', 'utf8');

console.log(`${creatures.length} créatures écrites dans data/creatures.json`);
console.log(`  confirmées (2 sources concordantes) : ${compte.confirme}`);
console.log(`  divergentes                         : ${compte.divergent}`);
console.log(`  vues dans une seule source          : ${compte['source-unique']}`);
