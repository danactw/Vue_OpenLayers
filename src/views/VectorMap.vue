<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <div class="information"> {{ information }} </div>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';
import LayerGroup from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import GeoJSON from 'ol/format/GeoJSON';
import MVT from 'ol/format/MVT';
import {Fill, Stroke, Style, Text} from 'ol/style';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';


export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const information = ref(null)

    const countrySource = new VectorTileSource({
      maxZoom: 15,
      format: new MVT(),
      url:
        'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
        'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
    })

    const countryFeatureStyle = new Style({
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

    const countryMapStyle = (feature) => {
      countryFeatureStyle.getText().setText(feature.get('name'));
      return countryFeatureStyle;
    }

    const countryMap = new VectorTileLayer({
      declutter: true,
      source: countrySource,
      style: countryMapStyle,
      visible: false,
      title: 'Country Map'
    });

    // const baseVectorMap = new VectorTileLayer({
    //   source: new VectorTileSource({
    //     format: new MVT(),
    //     url: 'https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf',
    //   }),
    //   visible: true,
    //   title: 'Base Vector'
    // })

    const vectorStyle = new Style({
      fill: new Fill({
        color: 'rgba(102, 204, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgb(51, 153, 255)',
        width: 1
      })
    })

    const selectedVectorStyle = (feature) => {
      const color = feature.get('COLOR') || '#eeeeee';
      vectorStyle.getFill().setColor(color);
      return vectorStyle;
    }

    const vectorLayer = new VectorImageLayer({
      background: '#1a2b39',
      imageRatio: 2,
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ecoregions.json',
        format: new GeoJSON(),
      }),
      style: selectedVectorStyle,
      visible: true,
      title: 'vectorLayer'
    });

    const optionalLayers = ref([ countryMap, vectorLayer ]);
    const optionalLayerGroup = new LayerGroup({
        layers: optionalLayers.value
    });

    const featureOverlay = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.7)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.3)'
        })
      }),
    });

    let highlight;
    const displayFeatureInfo = function (pixel) {
      const feature = map.value.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });

      information.value = feature ? (feature.get('ECO_NAME')||'') : ''

      if (feature !== highlight) {
        if (highlight) featureOverlay.getSource().removeFeature(highlight);
        if (feature) featureOverlay.getSource().addFeature(feature);
        highlight = feature;
      }
    };

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          optionalLayerGroup,
          featureOverlay
        ],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      map.value.on('pointermove', (e) => {
        displayFeatureInfo(e.pixel)
      })
    })
  return { map, mapContainer, information }
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