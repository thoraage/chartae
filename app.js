import React from 'react'
import ReactDOM from 'react-dom'

import ol_proj from 'ol/proj'

import MapControlBox from './components/MapControl'
import Map from './components/Map'

proj4.defs('EPSG:32633',"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
if (!ol_proj.get('EPSG:32633')) {
    console.error("Failed to register projection in OpenLayers");
}

new Map();

ReactDOM.render(<MapControlBox />, document.getElementById('app'));
