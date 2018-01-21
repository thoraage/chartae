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
            const lastFeatures = this.lastFocusFeatures || [];
            const pixel = map.getEventPixel(e.originalEvent);
            const features = map.getFeaturesAtPixel(pixel) || [];
            PubSub.publish('feature-mouseover-clear');
            features.forEach(feature => {
                if (!lastFeatures.includes(feature)) {
                    PubSub.publish(MapOperations.FEATURE_FOCUS, { feature: feature, on: true })
                }
            });
            lastFeatures.forEach(feature => {
               if (!features.includes(feature)) {
                   PubSub.publish(MapOperations.FEATURE_FOCUS, { feature: feature, on: false })
               }
            });
            this.lastFocusFeatures = features;
        });

        PubSub.subscribe(MapOperations.LAYER_CREATE, this.createLayer);

        PubSub.subscribe(MapOperations.FEATURES_ADD, this.addFeatures);

        PubSub.subscribe(MapOperations.LAYER_VISIBLE, function(msg, value) {
            map.getLayers().forEach(layer => {
                if (layer === value.layer) {
                    layer.setVisible(value.on);
                    map.changed();
                    PubSub.publish(MapOperations.LAYER_VISIBLE_CHANGED, value);
                }
            });
        });

        PubSub.subscribe(MapOperations.LAYER_REMOVE, function(msg, value) {
            map.removeLayer(value.layer);
            map.changed();
            console.log(value);
            PubSub.publish(MapOperations.LAYER_REMOVED, value);
        });

        PubSub.subscribe(MapOperations.FEATURE_FOCUS, function(msg, value) {
            map.getLayers().forEach(layer => {
                if (layer.type === 'VECTOR') {
                    layer.getSource().getFeatures().forEach(feature => {
                        if (feature === value.feature) {
                            layer.setStyle(Map.createLineStyle(value.on ? 20 : 5));
                        }
                    });
                }
            });
            map.changed();
        });
    }

    createLayer() {
        const vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: []
            })
        });
        const style = Map.createLineStyle(5);
        vector.setStyle(style);
        this.map.addLayer(vector);
        PubSub.publish(MapOperations.LAYER_CREATED, vector);
    }

    static createLineStyle(lineWidth) {
        const style = new ol.style.Style();
        style.setImage(new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        }));
        const stroke = new ol.style.Stroke();
        stroke.setColor(randomColor());
        stroke.setWidth(lineWidth);
        style.setStroke(stroke);
        return style;
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
        PubSub.publish(MapOperations.FEATURES_ADDED, { layer: value.layer, features: features});
    }

}

function randomColor() {
    return '#' + [7,0,7,0,7,0].map(n => Math.random() * (16-n) + n).map(n => Math.floor(n).toString(16)).join('');
}
