import React from 'react'
import PubSub from 'pubsub-js'

import * as MapOperations from './MapOperations'

class MapControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.layers = [];
        this.addFeature = this.addFeature.bind(this);
        this.removeLayer = this.removeLayer.bind(this);
        this.highlightLayer = this.highlightLayer.bind(this);
        this.hideLayer = this.hideLayer.bind(this);
        this.layerCreated = this.layerCreated.bind(this);
        this.layerVisibleChanged = this.layerVisibleChanged.bind(this);

        PubSub.subscribe(MapOperations.LAYER_CREATED, this.layerCreated);
        PubSub.subscribe(MapOperations.LAYER_VISIBLE_CHANGED, this.layerVisibleChanged);

        PubSub.publish(MapOperations.LAYER_CREATE);
    }

    layerCreated(msg, layer) {
        this.state.layers.push({ object: layer, visible: true, type: 'Vector' });
        this.state.currentLayer = layer;
        this.forceUpdate();
    }

    addFeature(event) {
        function split(str, array) {
            str = str.trim();
            if (!array) {
                array = [];
            }
            const idx = str.search(/[^a-zA-Z](MULTILINESTRING|LINESTRING|POLYGON|POINT)/i);
            if (idx === -1) {
                if (str) {
                    array.push(str);
                }
                return array;
            }
            const substr = str.substring(0, idx + 1).trim();
            if (substr) {
                array.push(substr);
            }
            return split(str.substring(idx + 1), array);
        }
        const value = event.target.value;
        console.log(value);
        const values = split(value);
        console.log(values);
        console.log(this.state);
        PubSub.publish(MapOperations.FEATURES_ADD, { layer: this.state.currentLayer, strings: values });
    }

    removeLayer(layer) {
        this.state.map.removeLayer(layer);
        this.forceUpdate();
    }

    highlightLayer(layer, highlight) {
        // TODO implement other end
        PubSub.publish('layer-hightlight', { layer: layer.object, on: highlight });
        // if (layer.type !== 'TILE') {
        //     let stroke = layer.getStyle().getStroke();
        //     if (highlight) {
        //         stroke.setWidth(10);
        //     } else {
        //         stroke.setWidth(5);
        //     }
        //     console.log(highlight);
        //     console.log(layer);
        //     this.state.map.changed();
        // }
    }

    hideLayer(layer) {
        PubSub.publish(MapOperations.LAYER_VISIBLE, { layer: layer.object, on: !layer.visible });
    }

    layerVisibleChanged(msg, value) {
        const layer = this.state.layers.find(layer => value.layer === layer.object)
        console.log(value);
        console.log(layer);
        layer.visible = value.on;
        this.forceUpdate();
    }

    render() {
        const that = this;
        function layerItem(layer, n) {
            return <li className="list-group-item"
                       onMouseEnter={() => that.highlightLayer(layer, true)}
                       onMouseLeave={() => that.highlightLayer(layer, false)}
                       key={n}>
                <span>{layer.type}</span>
                &nbsp;
                <a href="#" onClick={() => that.hideLayer(layer)}>
                    <i className={ layer.visible ? "fa fa-eye-slash" : "fa fa-eye" }/>
                </a>
                &nbsp;
                <a href="#" onClick={() => that.removeLayer(layer)}>
                    <i className="fa fa-times-circle"/>
                </a>
            </li>;
        }
        return (
            <div className="dynamic-area">
                <input type="text"
                       id="dynamic-field"
                       multiple className="multi-select fa"
                       placeholder="Input..."
                       onBlur={this.addFeature}/>
                <ul className="list-group">
                    {this.state.layers.map((layer, n) => layerItem(layer, n))}
                </ul>
            </div>
        );
    }
}

// const MapControl = () => {
//     return (
//         <div className="dynamic-area">
//             <input type="text" id="dynamic-field" multiple className="multi-select fa" placeholder="Input..."/>
//         </div>
//     );
// };

export default MapControl;