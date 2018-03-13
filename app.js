import React from 'react'
import ReactDOM from 'react-dom'

import ol_proj from 'ol/proj'

import proj4 from 'proj4'

import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css'
import 'react-select/dist/react-select.css'
import './public/css/chartae.css'

import MapControlBox from './components/MapControl'
import Map from './components/Map'

ol_proj.setProj4(proj4);
proj4.defs('EPSG:32633',"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
if (!ol_proj.get('EPSG:32633')) {
    console.error("Failed to register projection in OpenLayers");
}

new Map();

ReactDOM.render(<MapControlBox />, document.getElementById('app'));
