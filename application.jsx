const extent = {
//        'EPSG:3857': [20037508.34, 20037508.34, 20037508.34, 20037508.34],
    'EPSG:32633': [-2500000, 3500000, 3045984, 9045984]
};

let layers = [];

proj4.defs('EPSG:32633',"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
if (!ol.proj.get('EPSG:32633')) {
    console.error("Failed to register projection in OpenLayers");
}
//    var sProjection = 'EPSG:32633';
//    var projection = new ol.proj.Projection({
//        code: sProjection,
//        extent: extent[sProjection]
//    });
//    ol.proj.addProjection(projection);

const map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    target: 'map',
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }),
    view: new ol.View({
        center: [0, 0],
        zoom: 2
    })
});

console.log(map.getView().getProjection());

document.getElementById('zoom-out').onclick = function() {
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom - 1);
};

document.getElementById('zoom-in').onclick = function() {
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom + 1);
};

const dynamic_field = document.getElementById('dynamic-field');
dynamic_field.onchange = function () {
    const value = dynamic_field.value;
    console.log(value);
    const format = new ol.format.WKT();
    const feature = format.readFeature(value, {
        dataProjection:
            'EPSG:32633',
//                'EPSG:4326',
        featureProjection:
//                'EPSG:32633'
            'EPSG:3857'
    });
    console.log(feature);
    const vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [feature]
        })
    });
    const layer = map.addLayer(vector);
    layers.push(layer);
    map.changed();
};
