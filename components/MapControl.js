import React from 'react'
import PubSub from 'pubsub-js'
import Select from 'react-select';
import InputHandler from './InputHandler'
import StateHandler from './StateHandler'

import * as MapOperations from './MapOperations'

class MapControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = new StateHandler(this);
        this.inputHandler = new InputHandler(this.state);
        this.handleChange = this.handleChange.bind(this);
        this.addFeature = this.addFeature.bind(this);

        PubSub.publish(MapOperations.LAYER_CREATE);
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

    static focusFeature(featureInfo, highlight) {
        PubSub.publish(MapOperations.FEATURE_FOCUS, { feature: featureInfo.feature, on: highlight })
    }

    handleChange(value) {
        console.log(value);
        this.state.selectedOptions = value;
        console.log(`Selected:`);
        console.log(arguments);
        this.forceUpdate();
    };

    render() {
        // const { selectedOption } = this.state;
        //const value = selectedOptions && selectedOptions.value;

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
                <Select.Creatable
                    multi
                    name="form-field-name"
                    value={that.inputHandler.state.selectedOptions}
                    onChange={(option) => that.inputHandler.handleChange(this, option)}
                    options={[
                        { value: 'one', label: 'One' },
                        { value: 'two', label: 'Two' },
                    ]}
                    isValidNewOption={(args) => that.inputHandler.isValid(args.label)}
                    newOptionCreator={(args) => that.inputHandler.createOption(args.label, args.labelKey, args.valueKey)}
                    promptTextCreator={(label => "Add " + label)}
                />
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