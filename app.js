import React from 'react'
import ReactDOM from 'react-dom'
import HelloWorld from './components/HelloWorld'
import MapToolSet from './components/MapToolSet'

proj4.defs('EPSG:32633',"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
if (!ol.proj.get('EPSG:32633')) {
    console.error("Failed to register projection in OpenLayers");
}

ReactDOM.render(<MapToolSet />, document.getElementById('app'));
