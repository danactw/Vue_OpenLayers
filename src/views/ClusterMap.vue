<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <form class="clusterForm">
    <div class="form-group">
      <label for="distance">Cluster distance</label>
      <input id="distance" type="range" min="0" max="200" step="1" v-model="distance"/>
    </div>
    <div class="form-group">
      <label for="minDistance">Minimum distance</label>
      <input id="minDistance" type="range" min="0" max="200" step="1" v-model="minDistance"/>
      <small>(the value must be less than the value of the distance)</small>
    </div>
  </form>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { Cluster, OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { boundingExtent } from 'ol/extent';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const minDistance = ref(20)
    const distance = ref(70)

    const count = 2000;
    const features = new Array(count);
    const x = 18000000;
    const y = 8000000;
    for (let i = 0; i < count; ++i) {
      const coordinates = [2 * x * Math.random() - x, 2 * y * Math.random() - y];
      features[i] = new Feature(new Point(coordinates));
    }

    const clusterSource = new Cluster({
      distance: parseInt(distance.value, 10),
      minDistance: parseInt(minDistance.value, 10),
      source: new VectorSource({
        features: features,
      }),
    });

    const styleCache = {};

    const clusters = new VectorLayer({
      source: clusterSource,
      style: function (feature) {
        const size = feature.get('features').length;
        const radius = size < 20 ? 10 : size/2
        const opacity = (size/20).toFixed(1)
        let style = styleCache[size];
        if (!style) {
            style = new Style({
              image: new CircleStyle({
                radius: radius,
                stroke: new Stroke({
                  color: '#fff',
                }),
                fill: new Fill({
                  color: `rgb(255, 153, 51, ${opacity})`,
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: '#fff',
                }),
              }),
            });
          styleCache[size] = style;
        }
        return style;
      },
    });

    const raster = new TileLayer({
      source: new OSM(),
    });

    watchEffect(() => {
      clusterSource.setDistance(parseInt(distance.value, 10));
    })
    watchEffect(() => {
      clusterSource.setMinDistance(parseInt(minDistance.value, 10));
    })

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [raster, clusters],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      map.value.on('click', (e) => {
        clusters.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            const features = clickedFeatures[0].get('features');
            const extent = boundingExtent(
              features.map((r) => r.getGeometry().getCoordinates())
            );
            if (features.length > 20) {
              map.value.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50], maxZoom: 4});
            } else if (features.length > 10) {
              map.value.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50], maxZoom: 10});
            } else {
              map.value.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
            }
          }
        });
      });
    })

  return { map, mapContainer, distance, minDistance }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}

.clusterForm {
  text-align: start;
}
</style>