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
        console.log(this.state.map.getLayers().getArray()[0].type);
//         const layers = this.state.layers;
//         const map = this.state.map;
//         this.state.dynamic_field = document.getElementById('dynamic-field');
//         this.state.dynamic_field.onchange = function () {
//             const value = dynamic_field.value;
//             console.log(value);
//             const format = new ol.format.WKT();
//             const feature = format.readFeature(value, {
//                 dataProjection:
//                     'EPSG:32633',
// //                'EPSG:4326',
//                 featureProjection:
// //                'EPSG:32633'
//                     'EPSG:3857'
//             });
//             console.log(feature);
//             const vector = new ol.layer.Vector({
//                 source: new ol.source.Vector({
//                     features: [feature]
//                 })
//             });
//             const layer = map.addLayer(vector);
//             layers.push(layer);
//             map.changed();
//         };
    }

    addLayer(e) {
        console.log(e.target.value);
    }

    render() {
        return (
            <div>
                <div className="dynamic-area">
                    <input type="text"
                           id="dynamic-field"
                           multiple className="multi-select fa"
                           placeholder="Input..."
                           onChange={this.addLayer}/>
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