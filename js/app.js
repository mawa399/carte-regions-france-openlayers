/* Carte des régions de France métropolitaine — OpenLayers 6.5 */

// ---------------------------------------------------------------------------
// Classification de la population (tableau du sujet)
// ---------------------------------------------------------------------------
const CLASSES = [
    { min: 0,       max: 3000000,  libelle: '0 à 3 000 000 hab.',          couleur: [254, 229, 217] },
    { min: 3000001, max: 6000000,  libelle: '3 000 001 à 6 000 000 hab.',  couleur: [252, 174, 145] },
    { min: 6000001, max: 9000000,  libelle: '6 000 001 à 9 000 000 hab.',  couleur: [251, 106, 74] },
    { min: 9000001, max: Infinity, libelle: 'Plus de 9 000 000 hab.',      couleur: [203, 24, 29] },
];
const OPACITE = 0.7;

function classeDe(population) {
    return CLASSES.findIndex(c => population >= c.min && population <= c.max);
}

/** Couleur en rgba : ol.style.Fill n'a pas d'option « opacity », l'opacité va dans la couleur. */
function rgba([r, g, b], a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const formatNombre = n => Number(n).toLocaleString('fr-FR');

// ---------------------------------------------------------------------------
// Carte : fond OpenStreetMap, vue centrée sur la France, échelle linéaire
// ---------------------------------------------------------------------------
const map = new ol.Map({
    target: 'map',
    layers: [new ol.layer.Tile({ source: new ol.source.OSM(), className: 'fond-osm' })],
    view: new ol.View({
        center: ol.proj.fromLonLat([2.4, 46.6]),
        zoom: 6,
        minZoom: 4,
    }),
    controls: ol.control.defaults({ attributionOptions: { collapsible: false } }).extend([
        new ol.control.ScaleLine({ units: 'metric' }),
        new ol.control.MousePosition({
            // className remplace « ol-mouse-position », qu'ol.css place en absolu en haut à droite :
            // sans cela, les coordonnées s'affichaient hors du panneau.
            className: 'position-curseur',
            coordinateFormat: c => `Longitude ${c[0].toFixed(4)}°<br>Latitude ${c[1].toFixed(4)}°`,
            projection: 'EPSG:4326',
            target: document.getElementById('mouse-position'),
            undefinedHTML: '<span class="vide">Survolez la carte</span>',
        }),
    ]),
});

// Texte affiché tant que la souris n'est pas passée sur la carte
document.querySelector('.position-curseur').innerHTML = '<span class="vide">Survolez la carte</span>';

// ---------------------------------------------------------------------------
// Couche 1 : les régions (polygones), colorées selon la population
// ---------------------------------------------------------------------------
// Le fichier data/regions.js (à ne pas modifier) contient aussi les régions d'outre-mer ;
// le sujet porte sur la métropole : on garde les régions dont le code est supérieur à 10.
const toutesRegions = new ol.format.GeoJSON().readFeatures(regions, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
});
const regionsMetropole = toutesRegions.filter(f => Number(f.get('code')) > 10);
regionsMetropole.forEach(f => f.set('type', 'region'));

function styleRegion(feature, survol = false) {
    const classe = CLASSES[classeDe(feature.get('population'))];
    return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: survol ? '#1f2937' : '#6b6b6b', width: survol ? 2.5 : 1 }),
        fill: new ol.style.Fill({ color: rgba(classe.couleur, survol ? 0.85 : OPACITE) }),
    });
}

const regionLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: regionsMetropole }),
    style: f => styleRegion(f),
});
map.addLayer(regionLayer);

// Cadrage sur la métropole, quelle que soit la taille de l'écran
map.getView().fit(regionLayer.getSource().getExtent(), { padding: [30, 30, 30, 30] });

// ---------------------------------------------------------------------------
// Couche 2 : les chefs-lieux (points), à partir des objets ChefLieu
// ---------------------------------------------------------------------------
function styleChefLieu(feature, resolution) {
    const etiquette = resolution < 2500; // noms affichés à partir du zoom 6 environ
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: '#1e3a8a' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 }),
        }),
        text: etiquette ? new ol.style.Text({
            text: feature.get('chefLieu').nom,
            offsetY: -15,
            font: '600 12px system-ui, sans-serif',
            fill: new ol.style.Fill({ color: '#111827' }),
            stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,0.9)', width: 3 }),
        }) : undefined,
    });
}

const chefLieuxLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: CHEFS_LIEUX.map(c => c.toFeature()) }),
    style: styleChefLieu,
    zIndex: 10,
});
map.addLayer(chefLieuxLayer);

// ---------------------------------------------------------------------------
// Visibilité des couches liée aux cases à cocher
// ---------------------------------------------------------------------------
const caseRegions = document.getElementById('regions-france');
const caseChefs = document.getElementById('chef-lieux');

caseRegions.addEventListener('change', () => {
    regionLayer.setVisible(caseRegions.checked);
    document.getElementById('bloc-legende').classList.toggle('estompe', !caseRegions.checked);
});
caseChefs.addEventListener('change', () => chefLieuxLayer.setVisible(caseChefs.checked));
regionLayer.setVisible(caseRegions.checked);
chefLieuxLayer.setVisible(caseChefs.checked);

// ---------------------------------------------------------------------------
// Légende : couleur, bornes de classe et nombre de régions par classe
// ---------------------------------------------------------------------------
(function construireLegende() {
    const effectifs = CLASSES.map(() => 0);
    regionsMetropole.forEach(f => effectifs[classeDe(f.get('population'))]++);
    document.getElementById('legend').innerHTML = CLASSES.map((c, i) => `
        <div class="legende-ligne">
            <span class="legende-carre" style="background:${rgba(c.couleur, OPACITE)}"></span>
            <span class="legende-libelle">${c.libelle}</span>
            <span class="legende-nb">${effectifs[i]}</span>
        </div>`).join('');
})();

// ---------------------------------------------------------------------------
// Popup et fiche : clic sur un chef-lieu ou une région
// ---------------------------------------------------------------------------
const popup = document.getElementById('popup');
const popupContenu = document.getElementById('popup-content');
const overlay = new ol.Overlay({ element: popup, autoPan: true, autoPanAnimation: { duration: 250 } });
map.addOverlay(overlay);

document.getElementById('popup-closer').addEventListener('click', e => {
    e.preventDefault();
    overlay.setPosition(undefined);
});

function regionParNom(nom) {
    return regionsMetropole.find(f => f.get('nom') === nom);
}

function htmlRegion(region) {
    const pop = region.get('population');
    const classe = CLASSES[classeDe(pop)];
    const chef = CHEFS_LIEUX.find(c => c.region === region.get('nom'));
    return `<strong class="popup-titre">${region.get('nom')}</strong>
        <dl class="popup-stats">
            <dt>Code région</dt><dd>${region.get('code')}</dd>
            <dt>Population</dt><dd>${formatNombre(pop)} hab.</dd>
            <dt>Classe</dt><dd><span class="pastille" style="background:${rgba(classe.couleur, 1)}"></span>${classeDe(pop) + 1}</dd>
            ${chef ? `<dt>Chef-lieu</dt><dd>${chef.nom}</dd>` : ''}
        </dl>`;
}

function htmlChefLieu(chef) {
    const region = regionParNom(chef.region);
    return `<strong class="popup-titre">${chef.nom}</strong>
        <p class="popup-texte">${chef.getDescription()}</p>
        <dl class="popup-stats">
            ${region ? `<dt>Population régionale</dt><dd>${formatNombre(region.get('population'))} hab.</dd>` : ''}
            <dt>Coordonnées</dt><dd>${chef.lat.toFixed(4)}° N, ${Math.abs(chef.lon).toFixed(4)}° ${chef.lon < 0 ? 'O' : 'E'}</dd>
        </dl>`;
}

map.on('singleclick', evt => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
        layerFilter: l => l === chefLieuxLayer || l === regionLayer,
    });
    if (!feature) {
        overlay.setPosition(undefined);
        return;
    }
    const html = feature.get('type') === 'chef-lieu' ? htmlChefLieu(feature.get('chefLieu')) : htmlRegion(feature);
    popupContenu.innerHTML = html;
    document.getElementById('fiche').innerHTML = html;
    overlay.setPosition(feature.get('type') === 'chef-lieu' ? feature.getGeometry().getCoordinates() : evt.coordinate);
});

// ---------------------------------------------------------------------------
// Survol : mise en évidence de la région et curseur « main »
// ---------------------------------------------------------------------------
let survolee = null;
map.on('pointermove', evt => {
    if (evt.dragging) return;
    const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
        layerFilter: l => l === chefLieuxLayer || l === regionLayer,
    });
    map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    const region = feature && feature.get('type') === 'region' ? feature : null;
    if (region !== survolee) {
        if (survolee) survolee.setStyle(undefined);
        if (region) region.setStyle(styleRegion(region, true));
        survolee = region;
    }
});
