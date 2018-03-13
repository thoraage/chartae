import ol_format_wkt from 'ol/format/wkt'
import * as MapOperations from "./MapOperations";
import PubSub from "pubsub-js";

class InputHandler {
    constructor(state) {
        this.state = state;
        this.isValid = this.isValid.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.createOption = this.createOption.bind(this);
        PubSub.publish(MapOperations.LAYER_CREATE, { hidden: true });
    }

    isValid(value) {
        if (!value || value.trim().length === 0) {
            return false;
        }
        try {
            if (value !== this.cachedValue) {
                this.cachedFeature = InputHandler.parseWKT(value);
                this.cachedValue = value;
            }
        } catch (error) {
            return false;
        }
        return true;
    }

    static parseWKT(text) {
        const format = new ol_format_wkt();
        const feature = format.readFeature(text, {
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
    }

    createOption(value, labelKey, valueKey) {
        const option = {};
        console.log('createOption');
        console.log(arguments);
        option[labelKey] = "WKT";
        option[valueKey] = value;
        return option;
    }

    handleChange(component, option) {
        console.log("handleChange");
        console.log(option);
        console.log("drawing" + this.cachedValue);
        this.state.selectedOptions = option;
        if (!option || option.length === 0) {
            return;
        }
        if (option[option.length - 1].value === this.cachedValue) {
            const hiddenLayer = this.state.layers.find(l => l.hidden);
            if (hiddenLayer) {
                PubSub.publish(MapOperations.FEATURES_ADD, {layer: hiddenLayer.layer, feature: this.cachedFeature});
            } else {
                throw "Unable to find hidden layer";
            }
        }
    }
}

export default InputHandler;
