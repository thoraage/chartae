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
        this.highlightLayer = this.highlightLayer.bind(this);
    }

    addLayer(event) {
        function split(str, array) {
            str = str.trim();
            if (!array) {
                array = [];
            }
            const idx = str.search(/.LINESTRING/i);
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
        const format = new ol.format.WKT();
        values.forEach(value => {
            const feature = format.readFeature(value, {
                dataProjection:
                    'EPSG:32633',
                   // 'EPSG:4326',
                   //  'EPSG:3857',
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
            const style = new ol.style.Style();
            style.pointRadius = 10;
            const stroke = new ol.style.Stroke();
            stroke.setColor(randomColor());
            stroke.setWidth(5);
            style.setStroke(stroke);
            vector.setStyle(style);
            this.state.map.addLayer(vector);
            this.state.map.changed();
        });
        // this.state.map.setView( new ol.View({
        //     center: vector.,
        //     zoom: 2
        // }));
        event.target.value = '';
        this.forceUpdate();
    }

    removeLayer(layer) {
        this.state.map.removeLayer(layer);
        this.forceUpdate();
    }

    highlightLayer(layer, highlight) {
        if (layer.type !== 'TILE') {
            let stroke = layer.getStyle().getStroke();
            if (highlight) {
                stroke.setWidth(10);
            } else {
                stroke.setWidth(5);
            }
            console.log(highlight);
            console.log(layer);
            this.state.map.changed();
        }
    }

    render() {
        const that = this;
        function layerItem(layer, n) {
            return <li className="list-group-item"
                       onMouseEnter={() => that.highlightLayer(layer, true)}
                       onMouseLeave={() => that.highlightLayer(layer, false)}
                       key={n}>
                <span>{layer.type}</span>
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