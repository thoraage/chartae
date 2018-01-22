import React from 'react'
import PubSub from 'pubsub-js'

import * as MapOperations from './MapOperations'

class MapControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.layers = [];
        this.addFeature = this.addFeature.bind(this);
        this.layerCreated = this.layerCreated.bind(this);
        this.layerVisibleChanged = this.layerVisibleChanged.bind(this);
        this.featuresAdded = this.featuresAdded.bind(this);

        const that = this;
        PubSub.subscribe(MapOperations.LAYER_CREATED, this.layerCreated);
        PubSub.subscribe(MapOperations.LAYER_VISIBLE_CHANGED, this.layerVisibleChanged);
        PubSub.subscribe(MapOperations.FEATURES_ADDED, this.featuresAdded);

        PubSub.subscribe(MapOperations.LAYER_REMOVED, function(msg, value) {
            that.state.layers = that.state.layers.filter(layerInfo => layerInfo.layer !== value.layer);
            if (that.state.layers.length === 0) {
                PubSub.publish(MapOperations.LAYER_CREATE);
            }
            that.forceUpdate();
        });

        PubSub.subscribe(MapOperations.FEATURE_FOCUS, function(msg, value) {
            that.state.layers.forEach(layerInfo => {
                layerInfo.featureInfos.forEach(featureInfo => {
                    if (featureInfo.feature === value.feature) {
                        featureInfo.focused = value.on;
                    }
                });
            });
            that.forceUpdate();
        });

        PubSub.publish(MapOperations.LAYER_CREATE);
    }

    layerCreated(msg, layer) {
        this.state.layers.push({ layer: layer, visible: true, name: 'Vector ' + this.state.layers.length, featureInfos: [] });
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

    featuresAdded(msg, value) {
        value.features.forEach(feature => {
            const layerInfo = this.state.layers.find(layerInfo => layerInfo.layer === value.layer);
            layerInfo.featureInfos.push({ feature: feature, visible: true });
        });
        this.forceUpdate();
    }

    static focusFeature(featureInfo, highlight) {
        PubSub.publish(MapOperations.FEATURE_FOCUS, { feature: featureInfo.feature, on: highlight })
    }

    layerVisibleChanged(msg, value) {
        const layer = this.state.layers.find(layerInfo => value.layer === layerInfo.layer);
        console.log(value);
        console.log(layer);
        layer.visible = value.on;
        this.forceUpdate();
    }

    render() {
        const that = this;
        function featureItem(featureInfo, n) {
            return <span className={ 'badge badge-pill' + (featureInfo.focused ? ' badge-primary' : ' badge-secondary') } key={n}
                         onMouseEnter={() => MapControl.focusFeature(featureInfo, true)}
                         onMouseLeave={() => MapControl.focusFeature(featureInfo, false)}>
                F&nbsp;<i className="fa fa-eye"/>&nbsp;<i className="fa fa-close"/>
            </span>;
        }
        function featureItems(layer) {
            if (!layer.featureCollapsed && layer.featureInfos.length > 0) {
                return <p className="card-text">
                    { layer.featureInfos.map((featureInfo, n) => featureItem(featureInfo, n)) }
                </p>;
            }
            return null;

        }
        function collapseFeatures(layer) {
            layer.featureCollapsed = !layer.featureCollapsed;
            that.forceUpdate();
        }
        function layerItem(layerInfo, n) {
            return <li className="list-group-item" key={n}>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">
                            <span width="100%">
                                {layerInfo.name}
                            </span>
                            <span className="pull-right">
                                <a href="#" onClick={() => collapseFeatures(layerInfo) }>
                                    <i className={ 'fa' + (layerInfo.featureCollapsed ? ' fa-window-minimize' : ' fa-window-maximize') }/>
                                </a>&nbsp;
                                <a href="#" onClick={() => PubSub.publish(MapOperations.LAYER_VISIBLE, { layer: layerInfo.layer, on: !layerInfo.visible }) }>
                                    <i className={ 'fa' + (layerInfo.visible ? ' fa-eye-slash' : ' fa-eye') }/>
                                </a>&nbsp;
                                <a href="#" onClick={() => PubSub.publish(MapOperations.LAYER_REMOVE, { layer: layerInfo.layer }) }>
                                    <i className="fa fa-close"/>
                                </a>
                            </span>
                        </h5>
                        { featureItems(layerInfo) }
                    </div>
                </div>
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
                    {this.state.layers.map((layerInfo, n) => layerItem(layerInfo, n))}
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