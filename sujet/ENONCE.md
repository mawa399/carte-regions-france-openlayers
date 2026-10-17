# Langages Web 3 (JavaScript avancé) — Projet final

## Présentation

L'objectif de ce projet est de créer une carte des régions de France (métropole) avec les couches suivantes :

- Une couche de type raster : un fond de carte OpenStreetMap
- Une couche de polygones : les régions de France
- Une couche de points : les chefs-lieux de région

Le répertoire du projet est composé de :

- le fichier **index.html** : le code HTML du projet
- un dossier **/data** : contient un fichier de données
  - **regions.js** : le GeoJSON des régions de France (**NE PAS MODIFIER**)
- le dossier **/js** :
  - **app.js** : contient la déclaration d'une variable de données GeoJSON

Le projet est basé sur les frameworks :

- OpenLayers v6.5.0
- Bootstrap v4.6.0

Les propriétés des objets GeoJSON **regions** : `code` (le code de la région), `nom`, `population`.

## Création de la carte

Créer une carte OpenLayers dans l'élément HTML `#map` avec les options suivantes :

- le fond de carte OpenStreetMap
- une vue centrée sur la France (métropole)
- un contrôleur de carte : l'échelle linéaire

## Première couche : les régions de France

1. Transformer l'objet GeoJSON **regions** (voir app.js) en une couche de type vecteur avec le style suivant :
   - Bordure : largeur **1** pixel, couleur **#6b6b6b**
   - Remplissage : opacité **0.7** ; couleur selon la propriété **population**, d'après la classification suivante :

   | Classes  | Limite inférieure       | Limite supérieure |
   |----------|-------------------------|-------------------|
   | Classe 1 | 0                       | 3.000.000         |
   | Classe 2 | 3.000.001               | 6.000.000         |
   | Classe 3 | 6.000.001               | 9.000.000         |
   | Classe 4 | supérieur à 9.000.000   |                   |

   > **Note :** vous êtes libre de choisir les couleurs pour chaque classe.

2. Ajouter la couche des régions à la carte et lier sa visibilité à la checkbox **Régions**.

## Troisième couche : les chefs-lieux

1. Créer la classe **ChefLieu** avec :
   - les propriétés `nom` (nom de la ville), `region` (nom de la région), `lon` (longitude), `lat` (latitude) ;
   - la méthode `getDescription` : retourne une description du chef-lieu (une chaîne de caractères).

2. Transformer le tableau suivant en une liste d'objets de type **ChefLieu** :

   | Ville      | Région                     | Latitude   | Longitude |
   |------------|----------------------------|------------|-----------|
   | Lyon       | Auvergne-Rhône-Alpes       | 45.763420  | 4.834277  |
   | Dijon      | Bourgogne-Franche-Comté    | 47.316666  | 5.016667  |
   | Rennes     | Bretagne                   | 48.114700  | -1.679400 |
   | Orléans    | Centre-Val de Loire        | 47.902500  | 1.909000  |
   | Ajaccio    | Corse                      | 41.926701  | 8.736900  |
   | Strasbourg | Grand Est                  | 48.580002  | 7.750000  |
   | Lille      | Hauts-de-France            | 50.629250  | 3.057256  |
   | Paris      | Île-de-France              | 48.8537648 | 2.352356  |
   | Rouen      | Normandie                  | 49.439999  | 1.100000  |
   | Bordeaux   | Nouvelle-Aquitaine         | 44.836151  | -0.580816 |
   | Toulouse   | Occitanie                  | 43.604500  | 1.444000  |
   | Nantes     | Pays de la Loire           | 47.218102  | -1.552800 |
   | Marseille  | Provence-Alpes-Côte d'Azur | 43.296398  | 5.370000  |

3. Transformer la liste des objets de type ChefLieu en une couche de type vecteur.

4. Ajouter la couche des chefs-lieux à la carte et lier sa visibilité à la checkbox **Chef-lieux**.
