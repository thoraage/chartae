import * as MapOperations from "./MapOperations";
import PubSub from "pubsub-js";

class StateHandler {
    constructor(component) {
        const that = this;
        this.selectedOptions = [];
        this.layers = [];

        PubSub.subscribe(MapOperations.LAYER_CREATED, function(msg, object) {
            const layer = object.layer;
            const name = object.hidden ? 'Hidden' : 'Vector ' + that.layers.filter(l => !l.hidden).length;
            that.layers.push({ layer: layer, visible: true, hidden: object.hidden, name: name, featureInfos: [] });
            that.currentLayer = layer;
            component.forceUpdate();
        });

        PubSub.subscribe(MapOperations.LAYER_REMOVED, function(msg, value) {
            that.layers = that.layers.filter(layerInfo => layerInfo.layer !== value.layer);
            if (that.layers.filter(l => !l.hidden).length === 0) {
                PubSub.publish(MapOperations.LAYER_CREATE);
            }
            component.forceUpdate();
        });

        PubSub.subscribe(MapOperations.FEATURE_FOCUS, function(msg, value) {
            that.layers.forEach(layerInfo => {
                layerInfo.featureInfos.forEach(featureInfo => {
                    if (featureInfo.feature === value.feature) {
                        featureInfo.focused = value.on;
                    }
                });
            });
            component.forceUpdate();
        });

        PubSub.subscribe(MapOperations.LAYER_VISIBLE_CHANGED, function(msg, value) {
            const layer = that.layers.find(layerInfo => value.layer === layerInfo.layer);
            console.log(value);
            console.log(layer);
            layer.visible = value.on;
            component.forceUpdate();
        });

        PubSub.subscribe(MapOperations.FEATURES_ADDED, function(msg, value) {
            value.features.forEach(feature => {
                const layerInfo = that.layers.find(layerInfo => layerInfo.layer === value.layer);
                layerInfo.featureInfos.push({ feature: feature, visible: true });
            });
            component.forceUpdate();
        });
    }
}

export default StateHandler;
