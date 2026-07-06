# 📘 Mode d'emploi — Publier du contenu sur aniimo-france.fr

## 📋 Publier un nouveau patch note (5 minutes)

1. **Dupliquer le modèle** : dans le dossier `patch-notes/`, copie
   `2026-07-02-exemple.html` et renomme la copie au format
   `AAAA-MM-JJ-mot-cle.html` (ex : `2026-08-15-version-1-1.html`).

2. **Modifier le contenu** de la copie dans VS Code :
   - Dans `<head>` : le `<title>`, la `<meta name="description">`,
     le `<link rel="canonical">` (mettre l'URL exacte du nouveau fichier)
     et les balises `og:title`, `og:description`, `og:url`.
   - Le bandeau version : numéro, date, phrase de résumé, chips du résumé.
   - **Supprimer** le chip `EXEMPLE — à remplacer...`.
   - Les sections : dupliquer/supprimer les blocs selon le patch réel :
     * `carte-crea` = une créature équilibrée (stats + compétences)
     * `competence buff / nerf / nouveau` = une compétence modifiée
     * `liste-simple` = correctifs et optimisations
   - Le lien "Source" en bas de page.

3. **Ajouter la note à la liste** : dans `patch-notes/index.html`,
   copie le bloc `<a class="note-item">...</a>` existant, colle-le
   AU-DESSUS (le plus récent en premier) et adapte : lien, version,
   date, titre, chips.

4. **Ajouter l'URL au sitemap** : dans `sitemap.xml`, un bloc `<url>`
   par nouvelle page (un modèle en commentaire est prêt à copier).

5. **Publier** :
   ```powershell
   git add .
   git commit -m "Patch note 1.1"
   git push
   ```

6. **(Bonus SEO)** Dans la Google Search Console : inspecter l'URL de la
   nouvelle page → « Demander une indexation ».

## 📖 Ajouter une créature à l'Aniimopédia (2 minutes)

1. Ouvre `aniimopedia/index.html` dans VS Code.
2. Trouve le tableau `const CREATURES = [ ... ]` (bien commenté).
3. Copie un bloc `{ ... },` existant et remplis :
   - `nom`, `types` (Feu, Eau, Plante, Terre, Glace, Vent, Foudre,
     Ténèbres, Lumière), `roles` (DPS, Tank, Soin, Support)
   - `emoji` : affiché tant qu'il n'y a pas d'image
   - `image` : nom d'un fichier placé dans `aniimopedia/images/`
     (ex : `"scorchhowl.png"`) — laisser `""` pour utiliser l'emoji
   - `description` et `stats` (valeurs sur 200)
4. Publier : `git add .` → `git commit -m "Ajout créature X"` → `git push`

## ⚠️ Les données actuelles sont des EXEMPLES

Les statistiques, compétences et descriptions actuelles sont des
exemples plausibles créés pour montrer le rendu. Remplace-les par les
vraies valeurs du jeu (bêtas, wiki officiel) avant l'annonce publique —
la crédibilité du site en dépend.

## 🖼️ Images des créatures

Le champ `image` attend des fichiers dans `aniimopedia/images/`.
Attention au droit d'auteur : les rendus du jeu appartiennent à
Pawprint Studio / Kingsglory. Les wikis communautaires en utilisent
généralement avec mention de la source (comme le disclaimer déjà présent
dans le footer), mais c'est ta responsabilité d'éditeur — en cas de
demande des ayants droit, il faudra les retirer.
