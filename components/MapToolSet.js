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
        this.addLayer = this.addLayer.bind(this);
        this.removeLayer = this.removeLayer.bind(this);
    }

    addLayer(event) {
        const value = event.target.value;
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
        let style = new ol.style.Style();
        let stroke = new ol.style.Stroke();
        stroke.setColor(randomColor());
        stroke.setWidth(5);
        style.setStroke(stroke);
        vector.setStyle(style);
        const layer = this.state.map.addLayer(vector);
        this.state.map.changed();
        event.target.value = '';
        this.forceUpdate();
    }

    removeLayer(layer) {
        this.state.map.removeLayer(layer);
        this.forceUpdate();
    }

    render() {
        function layerItem(layer, n) {
            return <li className="list-group-item" key={n}>
                <span>{layer.type}</span>
                <a href="#" onClick={() => this.removeLayer(layer)}>
                    <i className="fa fa-times-circle"></i>
                </a>
            </li>;
        }
        return (
            <div className="dynamic-area">
                <input type="text"
                       id="dynamic-field"
                       multiple className="multi-select fa"
                       placeholder="Input..."
                       onBlur={this.addLayer}/>
                <ul className="list-group">
                    {this.state.map.getLayers().getArray().map((layer, n) => layerItem(layer, n))}
                </ul>
            </div>
        );
    }
}

function randomColor() {
    return '#' + [7,0,7,0,7,0].map(n => Math.random() * (16-n) + n).map(n => Math.floor(n).toString(16)).join('');
}

// const MapToolSet = () => {
//     return (
//         <div className="dynamic-area">
//             <input type="text" id="dynamic-field" multiple className="multi-select fa" placeholder="Input..."/>
//         </div>
//     );
// };

export default MapToolSet;