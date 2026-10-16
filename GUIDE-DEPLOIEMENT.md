# 🚀 Déploiement — aniimo-france.fr

> **En une phrase : `git push` est le déploiement. Il n'y a rien d'autre à faire.**
>
> Pas de VPS, pas de SSH, pas de Certbot, pas de FTP. Le site est hébergé sur
> **GitHub Pages**, qui reconstruit et republie automatiquement à chaque push.
>
> *(Si vous vous souvenez d'un VPS avec Certbot : c'était un autre projet.
> L'ancienne version de ce guide l'évoquait en comparaison, ce qui prêtait à
> confusion. Vérifié le 16 octobre 2026 : le domaine pointe vers les IP de
> GitHub Pages et les en-têtes HTTP renvoient `Server: GitHub.com`.)*

---

## L'architecture, en trois lignes

```
Votre PC  ──git push──▶  GitHub (dépôt doriandscfr/aniimo-france)
                              │
                              ▼  « pages build and deployment », ~1 à 2 min
                         GitHub Pages
                              │
                              ▼  DNS OVH : 4 enregistrements A
                      https://aniimo-france.fr
```

---

## Publier une modification

```powershell
npm run build       # régénère toutes les pages, le sitemap et llms.txt
npm run controle    # audit SEO + liens + JSON-LD — doit finir sans erreur
git add .
git commit -m "Décrivez ce qui change"
git push
```

Puis, **après 1 à 2 minutes** (le temps que GitHub reconstruise) :

```powershell
npm run enligne     # vérifie le site réellement publié
npm run indexnow    # prévient Bing, Yandex, Seznam
```

> ⚠️ Lancer `npm run enligne` juste après le `git push` renvoie des 404 et une
> date ancienne : le déploiement n'est pas terminé. C'est normal — attendez et
> relancez.

---

## La configuration, déjà en place

Rien de tout cela n'est à refaire. C'est documenté pour le jour où ce serait
nécessaire.

### GitHub Pages
**Settings → Pages** : source `Deploy from a branch`, branche `main`, dossier
`/ (root)`. Le fichier `CNAME` à la racine contient `aniimo-france.fr` — **ne
le supprimez jamais**, c'est lui qui rattache le domaine.

### DNS chez OVH
| Type | Sous-domaine | Cible |
|---|---|---|
| A | *(vide)* | 185.199.108.153 |
| A | *(vide)* | 185.199.109.153 |
| A | *(vide)* | 185.199.110.153 |
| A | *(vide)* | 185.199.111.153 |
| CNAME | www | doriandscfr.github.io. |
| TXT | *(vide)* | google-site-verification=… |

Le HTTPS est géré par GitHub (certificat Let's Encrypt automatique), avec
**Enforce HTTPS** activé.

---

## En cas de problème

| Symptôme | Cause probable | Que faire |
|---|---|---|
| Le site ne change pas après un push | Déploiement encore en cours | Attendre 2 min, relancer `npm run enligne` |
| 404 sur une nouvelle page | Idem | Idem |
| Le site entier tombe en 404 | `CNAME` supprimé | Le recréer avec `aniimo-france.fr` |
| Avertissement de certificat | Domaine personnalisé décoché | GitHub → Settings → Pages → recocher |
| `npm run controle` échoue | Lien mort, JSON-LD cassé, titre en double | Corriger avant de pousser |

Pour voir l'état d'un déploiement : onglet **Actions** du dépôt GitHub,
workflow « pages build and deployment ».

---

## Aller plus loin

- **[MODE-D-EMPLOI.md](MODE-D-EMPLOI.md)** — comment ajouter du contenu
- **[SEO.md](SEO.md)** — référencement : ce qui est fait, ce qui reste
