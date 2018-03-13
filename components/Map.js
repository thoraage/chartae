import PubSub from 'pubsub-js'

import ol_control from 'ol/control'
import ol_format_wkt from 'ol/format/wkt'
import ol_map from 'ol/map'
import ol_layer_tile from 'ol/layer/tile'
import ol_layer_vector from 'ol/layer/vector'
import ol_source_osm from 'ol/source/osm'
import ol_source_vector from 'ol/source/vector'
import ol_style from 'ol/style/style'
import ol_style_circle from 'ol/style/circle'
import ol_style_fill from 'ol/style/fill'
import ol_style_stroke from 'ol/style/stroke'
import ol_view from 'ol/view'

import * as MapOperations from './MapOperations'

export default class Map {
    constructor() {
        this.createLayer = this.createLayer.bind(this);
        this.addFeatures = this.addFeatures.bind(this);

        const map = new ol_map({
            layers: [
                new ol_layer_tile({
                    source: new ol_source_osm()
                })
            ],
            target: 'map',
            controls: ol_control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: false
                })
            }),
            view: new ol_view({
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
                            feature.setStyle(Map.createLineStyle(value.on));
                        }
                    });
                }
            });
            map.changed();
        });
    }

    createLayer() {
        const vector = new ol_layer_vector({
            source: new ol_source_vector({
                features: []
            })
        });
        const style = Map.createLineStyle(false);
        vector.setStyle(style);
        this.map.addLayer(vector);
        PubSub.publish(MapOperations.LAYER_CREATED, vector);
    }

    static createLineStyle(focus) {
        const style = new ol_style();
        style.setImage(new ol_style_circle({
            radius: focus ? 6 : 3,
            fill: new ol_style_fill({color: '#666666'}),
            stroke: new ol_style_stroke({color: '#bada55', width: 1})
        }));
        const stroke = new ol_style_stroke();
        stroke.setColor(randomColor());
        stroke.setWidth(focus ? 10 : 5);
        style.setStroke(stroke);
        return style;
    }

    addFeatures(msg, value) {
        console.log("addFeatures");
        console.log(value);
        const format = new ol_format_wkt();
        const features = [value.feature];
        //     value.strings.map(value => {
        //     const feature = format.readFeature(value, {
        //         dataProjection:
        //             'EPSG:32633',
        //         // 'EPSG:4326',
        //         //  'EPSG:3857',
        //         //  'EPSG:3857',
        //         featureProjection:
        //         //                'EPSG:32633'
        //             'EPSG:3857'
        //     });
        //     console.log(feature);
        //     return feature;
        // });
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
