<template>
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script>
import { shallowRef, onMounted, markRaw } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';
import Geolocation from 'ol/Geolocation';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import {Fill, Stroke, Style, Text} from 'ol/style';


export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)',
      }),
      stroke: new Stroke({
        color: '#319FD3',
        width: 1,
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: '#000',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3,
        }),
      }),
    });

    const MVTStyle = (feature) => {
      style.getText().setText(feature.get('name'));
      return style;
    }

    const MVTLayer = new VectorTileLayer({
      declutter: true,
      source: new VectorTileSource({
        maxZoom: 15,
        format: new MVT(),
        url:
          'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
          'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      }),
      style: MVTStyle
    });

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          MVTLayer
        ],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      const viewProjection = map.value.getView().getProjection()
      const geolocationAPI = new Geolocation({
        tracking: true,
        trackingOptions: {
          enableHighAccuracy: true
        },
        projection: viewProjection
      })

      geolocationAPI.on('change:position', (e) => {
        console.log(e.target.getPosition());
      })
    })


  return { map, mapContainer }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}
</style>