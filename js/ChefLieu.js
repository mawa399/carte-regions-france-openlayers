/**
 * Un chef-lieu de région.
 * Propriétés et méthode demandées par le sujet : nom, region, lon, lat, getDescription().
 */
class ChefLieu {
    /**
     * @param {string} nom    Nom de la ville
     * @param {string} region Nom de la région
     * @param {number} lat    Latitude (WGS 84)
     * @param {number} lon    Longitude (WGS 84)
     */
    constructor(nom, region, lat, lon) {
        this.nom = nom;
        this.region = region;
        this.lat = lat;
        this.lon = lon;
    }

    /** Description du chef-lieu (chaîne de caractères). */
    getDescription() {
        return `${this.nom} est le chef-lieu de la région ${this.region}.`;
    }

    /** Convertit le chef-lieu en entité OpenLayers (point projeté en Web Mercator). */
    toFeature() {
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([this.lon, this.lat])),
        });
        feature.set('type', 'chef-lieu');
        feature.set('chefLieu', this);
        return feature;
    }
}

/** Tableau du sujet : Ville | Région | Latitude | Longitude */
const CHEFS_LIEUX = [
    ['Lyon',       'Auvergne-Rhône-Alpes',       45.763420,  4.834277],
    ['Dijon',      'Bourgogne-Franche-Comté',    47.316666,  5.016667],
    ['Rennes',     'Bretagne',                   48.114700, -1.679400],
    ['Orléans',    'Centre-Val de Loire',        47.902500,  1.909000],
    ['Ajaccio',    'Corse',                      41.926701,  8.736900],
    ['Strasbourg', 'Grand Est',                  48.580002,  7.750000],
    ['Lille',      'Hauts-de-France',            50.629250,  3.057256],
    ['Paris',      'Île-de-France',              48.8537648, 2.352356],
    ['Rouen',      'Normandie',                  49.439999,  1.100000],
    ['Bordeaux',   'Nouvelle-Aquitaine',         44.836151, -0.580816],
    ['Toulouse',   'Occitanie',                  43.604500,  1.444000],
    ['Nantes',     'Pays de la Loire',           47.218102, -1.552800],
    ['Marseille',  "Provence-Alpes-Côte d'Azur", 43.296398,  5.370000],
].map(([nom, region, lat, lon]) => new ChefLieu(nom, region, lat, lon));
