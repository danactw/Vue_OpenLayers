<template>
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Stamen from 'ol/source/Stamen';
import BingMaps from 'ol/source/BingMaps';
import TileDebug from 'ol/source/TileDebug';
import TileArcGISRest from 'ol/source/TileArcGISRest';

import * as olControl from 'ol/control';
import FullScreen from 'ol/control/FullScreen';
import MousePosition from 'ol/control/MousePosition';
import OverviewMap from 'ol/control/OverviewMap';
import ScaleLine from 'ol/control/ScaleLine';
import ZoomSlider from 'ol/control/ZoomSlider';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Attribution from 'ol/control/Attribution';
import {createStringXY} from 'ol/coordinate';
import {defaults} from 'ol/control';

export default {
  name: "HomeView",
  props: {
    mapControlProps: Object
  },
  setup (props) {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    // Base Layers
    const OSMStandard = new TileLayer({
      source: new OSM(),
      visible: false,
      title: 'OSMStandard'
    })

    const OSMHumanitarian =  new TileLayer({
      source: new OSM({
        url:'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      }),
      visible: true,
      title: 'OSMHumanitarian'
    })

    const BingMap = new TileLayer({
      source: new BingMaps({
        key: 'AnFlt2m8C2DyKF7W_oJe0LUJ-y9-Nj06ZK3bKK6RPcDm9GL1R0MW1KNgItZs32Rd',
        imagerySet: 'AerialWithLabels'
      }),
      visible: false,
      title: 'BingMaps'
    })

    const CartoDBBase = new TileLayer({
      source: new XYZ({
        url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
        attributions: '@ CARTO'
      }),
      visible: false,
      title: 'CartoDBBase'
    })

    const stamenWater = new TileLayer({
      source: new Stamen({
        layer: 'watercolor'
      }),
      visible: true,
      title: 'stamenWater'
    })

    const baseLayers = ref([OSMStandard, OSMHumanitarian, BingMap, CartoDBBase, stamenWater])

    const baseLayerGroup = new LayerGroup({
      layers: baseLayers.value
    })

    // Optional Layers
    const tileDebug = new TileLayer({
      source: new TileDebug(),
      visible: false, 
      title: 'tileDebug'
    })

    const tileArcGIS = new TileLayer({
      source: new TileArcGISRest({
        url: 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer'
      }),
      visible: false,
      title: 'tileArcGIS'
    })

    const optionalLayers = ref([ tileDebug, tileArcGIS ])

    const optionalLayerGroup = new LayerGroup({
      layers: optionalLayers.value
    })

    // Controls
    const attribution = new Attribution({
      collapsible: true
    })

    const fullScreen = new FullScreen({
      tipLabel: "Full Screen"
    })

    const mousePosition = new MousePosition({
      className: "MousePosition",
      projection: 'EPSG:4326',
      coordinateFormat: createStringXY(2),
    })

    const overviewMap = new OverviewMap({
      collapsed:false,
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      tipLabel: "Toggle Overview",
      rotateWithView: true,
    })

    const scaleLine = new ScaleLine({
      bar: true,
      text: true,
      steps: 2
    })

    const zoomSlider = new ZoomSlider()
    const zoomExtent = new ZoomToExtent()

    const mapControls = ref([attribution, fullScreen, mousePosition, overviewMap, scaleLine, zoomSlider, zoomExtent])

    onMounted(() => {
      map.value = markRaw(new Map({
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
          constrainRotation: 16,
        }),
        layers: [ baseLayerGroup ],
        keyboardEventTarget: document,
        controls: defaults({attribution: false}).extend(mapControls.value)
      }))
      map.value.addLayer(optionalLayerGroup)

      watchEffect(()=> {
        const clickedControl = props.mapControlProps.title.replace(/[{()}]/g, '')
        if (props.mapControlProps.show) {
          mapControls.value.forEach(control => {
            if (control instanceof olControl[clickedControl]) {
              map.value.addControl(control)
            }
          })
        } else {
          map.value.getControls().forEach( control => {
            if (control instanceof olControl[clickedControl]) map.value.removeControl(control)
          })
        }
      })

    })

    

    return { map, mapContainer };
  }
};
</script>

<style>
.map {
  width: 100%;
  height: 600px;
}
</style>
