import PubSub from 'pubsub-js'

import * as MapOperations from './MapOperations'

export default class Map {
    constructor() {
        this.createLayer = this.createLayer.bind(this);
        this.addFeatures = this.addFeatures.bind(this);

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

        this.map = map;

        this.map.on('pointermove', function(e) {
            const pixel = map.getEventPixel(e.originalEvent);
            const features = map.getFeaturesAtPixel(pixel);
            // TODO Cache whether there is anything to clear or not
            PubSub.publish('feature-mouseover-clear');
            if (features) {
                console.log(features);
                console.log(features.map(f => f.getId()));
                features.forEach(feature => PubSub.publish('feature-mouseover', feature));
            }
        });

        PubSub.subscribe(MapOperations.LAYER_CREATE, this.createLayer);

        PubSub.subscribe(MapOperations.FEATURES_ADD, this.addFeatures);

        PubSub.subscribe(MapOperations.LAYER_VISIBLE, function(msg, value) {
            console.log(value);
            map.getLayers().getArray().filter(layer => layer === value.layer).forEach(layer => {
                layer.setVisible(layer.on);
                map.changed();
                PubSub.publish(MapOperations.LAYER_VISIBLE_CHANGED, value);
            });
        });
    }

    createLayer() {
        const vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: []
            })
        });
        const style = new ol.style.Style();
        style.pointRadius = 10;
        const stroke = new ol.style.Stroke();
        stroke.setColor(randomColor());
        stroke.setWidth(5);
        style.setStroke(stroke);
        vector.setStyle(style);
        this.map.addLayer(vector);
        PubSub.publish(MapOperations.LAYER_CREATED, vector);
    }

    addFeatures(msg, value) {
        const format = new ol.format.WKT();
        const features = value.strings.map(value => {
            const feature = format.readFeature(value, {
                dataProjection:
                    'EPSG:32633',
                // 'EPSG:4326',
                //  'EPSG:3857',
                //  'EPSG:3857',
                featureProjection:
                //                'EPSG:32633'
                    'EPSG:3857'
            });
            console.log(feature);
            return feature;
        });
        value.layer.getSource().addFeatures(features);
        this.map.changed();
        // this.state.map.setView( new ol.View({
        //     center: vector.,
        //     zoom: 2
        // }));
        event.target.value = '';
        PubSub.publish(MapOperations.FEATURES_ADDED, { layer: value.layer, features: features});
    }

}

function randomColor() {
    return '#' + [7,0,7,0,7,0].map(n => Math.random() * (16-n) + n).map(n => Math.floor(n).toString(16)).join('');
}
