import React from 'react'
import {
    interaction, layer, custom, control, //name spaces
    Interactions, Overlays, Controls,     //group
    Map, Layers, Overlay, Util    //objects
} from "react-openlayers";

class MapToolSet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.map = new ol.Map({
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
        this.addLayer = this.addLayer.bind(this)
    }

    addLayer(e) {
        const value = e.target.value;
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
        const layer = this.state.map.addLayer(vector);
        this.state.map.changed();
        e.target.value = '';
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <div className="dynamic-area">
                    <input type="text"
                           id="dynamic-field"
                           multiple className="multi-select fa"
                           placeholder="Input..."
                           onBlur={this.addLayer}/>
                    {this.state.map.getLayers().getArray().map((layer, n) => <div key={n}>{layer.type}</div>)}
                </div>
            </div>
        );
    }
}

// const MapToolSet = () => {
//     return (
//         <div className="dynamic-area">
//             <input type="text" id="dynamic-field" multiple className="multi-select fa" placeholder="Input..."/>
//         </div>
//     );
// };

export default MapToolSet;