# 💧 Eau potable à Raanana

Site web statique et interactif pour trouver les points d'eau potable à Raanana (Israël).

- Carte interactive (Leaflet + OpenStreetMap), icône 💧 par point
- Recherche, filtres (fontaine, parc, bâtiment public, école/sport, autre)
- Bouton « Les plus proches de moi » (géolocalisation)
- Bouton **Itinéraire** (Google Maps / Apple Maps) pour mobile
- Interface en **français, hébreu (RTL) et anglais**
- Signalement (point manquant, hors service, info incorrecte) via **GitHub Issues**
- Marqueurs orange + badge « non vérifié » quand une donnée n'est pas confirmée : rien n'est inventé

## Données

`data.js` est volontairement **vide** : aucune fontaine n'a été ajoutée sans vérification.
Deux façons de remplir la carte :

1. Bouton **« Charger depuis OpenStreetMap »** : récupère les `amenity=drinking_water` de la zone de Raanana (toujours affichés comme *non vérifiés*).
2. Ajouter manuellement des points vérifiés dans `window.WATER_POINTS` (voir le format en commentaire dans `data.js`), avec `verified:true` uniquement après contrôle sur place.

## Signalements

Le formulaire ouvre une issue GitHub pré-remplie. Créez les labels `point-manquant`, `hors-service`, `info-incorrecte`, `confirmation` pour les trier.

## Publication

Activer **Settings → Pages → Deploy from branch → main / root**. Aucun build nécessaire.

## Licence des données

Fond de carte et données OSM © contributeurs OpenStreetMap (ODbL).
