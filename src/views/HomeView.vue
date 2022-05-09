<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <div class="customizedBtnGroup">
    <CustomizationBtn action="Zoom Out" @click="zoomOut"/>
    <CustomizationBtn action="Zoom In" @click="zoomIn"/>
    <CustomizationBtn action="zoom To Taiwan" @click="zoomToTaiwan"/>
  </div>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
// import Circle from 'ol/geom/Circle';
// import Feature from 'ol/Feature';
import { Fill, Stroke, Style} from 'ol/style';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
import { OSM, XYZ, Stamen, BingMaps, TileDebug, TileArcGISRest } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import * as olControl from 'ol/control';
import { defaults, FullScreen, MousePosition, OverviewMap, ScaleLine, ZoomSlider, ZoomToExtent, Attribution } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';
import CustomizationBtn from '@/components/Customization/CustomizationBtn.vue';

export default {
    name: "HomeView",
    components: { CustomizationBtn },
    props: {
        mapControlProps: Object,
        optionalLayerProps: Object,
        baseLayerProps: Object
    },
    setup(props) {
      const mapContainer = shallowRef(null);
      const map = shallowRef(null);

      // View
      const view = new View({
        projection: "EPSG:4326",
        center: [0, 0],
        zoom: 2,
        constrainRotation: 16,
      })
      const zoomOut = () => {
        view.setZoom(view.getZoom()-1)
      }
      const zoomIn = () => {
        view.setZoom(view.getZoom()+1)
      }

      // Base Layers
      const OSMStandard = new TileLayer({
        source: new OSM(),
        visible: true,
        title: "OSM Standard"
      });
      const OSMHumanitarian = new TileLayer({
        source: new OSM({
            url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        }),
        visible: false,
        title: "OSM Humanitarian"
      });
      const BingMap = new TileLayer({
        source: new BingMaps({
          key: "Ak6hRbflYvuARcql-hA_RTu20jkC6UQGDi4PLkJ1vOHrD30DD-1et3-N3DSohoPA",
          imagerySet: "AerialWithLabelsOnDemand"
        }),
        preload: Infinity,
        visible: false,
        title: "Bing Map"
      });
      const CartoDBBase = new TileLayer({
        source: new XYZ({
          url: "https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
          attributions: "@ CARTO"
        }),
        visible: false,
        title: "CartoDB Base"
      });
      const StamenWater = new TileLayer({
        source: new Stamen({
            layer: "watercolor"
        }),
        visible: true,
        title: "Stamen Water"
      });
      const baseLayers = ref([OSMStandard, OSMHumanitarian, BingMap, CartoDBBase, StamenWater]);
      const baseLayerGroup = new LayerGroup({
          layers: baseLayers.value
      });
      //Switch Logic for baseLayerGroup
      watchEffect(() => {
        baseLayerGroup.getLayers().forEach(layer => {
          const layerTitle = layer.get("title");
          const clickedBaseLayer = props.baseLayerProps.title.replace(/[{()}]/g, "");
          layer.setVisible(layerTitle === clickedBaseLayer);
        });
      });
      // Optional Layers
      const tileDebug = new TileLayer({
        source: new TileDebug(),
        visible: false,
        title: "Tile Debug"
      });
      const tileArcGIS = new TileLayer({
        source: new TileArcGISRest({
          url: "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer"
        }),
        visible: false,
        title: "Tile ArcGIS"
      });
      const optionalLayers = ref([tileDebug, tileArcGIS ]);
      const optionalLayerGroup = new LayerGroup({
          layers: optionalLayers.value
      });
      //Switch Logic for optionalLayerGroup
      watchEffect(() => {
        const clickedOptionalLayer = props.optionalLayerProps.title.replace(/[{()}]/g, "");
        const ckeckedOptionalLayer = props.optionalLayerProps.show;
        optionalLayerGroup.getLayers().forEach(layer => {
          if (clickedOptionalLayer === layer.get("title")) {
              ckeckedOptionalLayer ? layer.setVisible(true) : layer.setVisible(false);
          }
        });
      });
      // Controls
      const attribution = new Attribution({
        collapsible: true
      });
      const fullScreen = new FullScreen({
        tipLabel: "Full Screen"
      });
      const mousePosition = new MousePosition({
        className: "MousePosition",
        projection: "EPSG:4326",
        coordinateFormat: createStringXY(2),
      });
      const overviewMap = new OverviewMap({
        collapsed: false,
        layers: [
          new TileLayer({
            source: new OSM(),
          })
        ],
        tipLabel: "Toggle Overview",
        rotateWithView: true,
      });
      const scaleLine = new ScaleLine({
        bar: true,
        text: true,
        steps: 2,
        minWidth: 100
      });
      const zoomSlider = new ZoomSlider();
      const zoomExtent = new ZoomToExtent();
      const mapControls = ref([attribution, fullScreen, mousePosition, overviewMap, scaleLine, zoomSlider, zoomExtent]);

      const geojsonObject = {
        'type': 'FeatureCollection',
        'crs': {
          'type': 'name',
          'properties': {
            'name': 'EPSG:3857',
          },
        },
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [
                    121.56921386718751,
                    25.299337565234087
                  ],
                  [
                    121.57470703125,
                    25.329131707091477
                  ],
                  [
                    121.4923095703125,
                    25.279470734081812
                  ],
                  [
                    121.4373779296875,
                    25.199970890386023
                  ],
                  [
                    121.28356933593749,
                    25.13533901613099
                  ],
                  [
                    121.04736328125,
                    25.04081549894912
                  ],
                  [
                    120.904541015625,
                    24.886436490787712
                  ],
                  [
                    120.91552734375,
                    24.776759933219164
                  ],
                  [
                    120.64636230468749,
                    24.50714328310284
                  ],
                  [
                    120.34423828125,
                    24.021379342900296
                  ],
                  [
                    120.1739501953125,
                    23.75015391301012
                  ],
                  [
                    120.13549804687501,
                    23.58412603264412
                  ],
                  [
                    120.1409912109375,
                    23.37755614917645
                  ],
                  [
                    120.02563476562501,
                    23.089838367476705
                  ],
                  [
                    120.1519775390625,
                    22.983681160330878
                  ],
                  [
                    120.30029296875,
                    22.588654394218803
                  ],
                  [
                    120.61340332031249,
                    22.339914425562032
                  ],
                  [
                    120.7177734375,
                    21.922663209325922
                  ],
                  [
                    120.81665039062499,
                    21.912470952680266
                  ],
                  [
                    120.89355468749999,
                    21.99908185836153
                  ],
                  [
                    120.89355468749999,
                    22.329752304376473
                  ],
                  [
                    121.04736328125,
                    22.695120184965695
                  ],
                  [
                    121.19018554687499,
                    22.771116581083135
                  ],
                  [
                    121.19567871093751,
                    22.862256424791937
                  ],
                  [
                    121.40991210937499,
                    23.135308681729665
                  ],
                  [
                    121.6021728515625,
                    23.805449612314625
                  ],
                  [
                    121.61315917968749,
                    24.041447460138738
                  ],
                  [
                    121.6351318359375,
                    24.13171516246295
                  ],
                  [
                    121.871337890625,
                    24.54712317973075
                  ],
                  [
                    121.81640624999999,
                    24.87148631935797
                  ],
                  [
                    121.9647216796875,
                    24.97609949369541
                  ],
                  [
                    122.0086669921875,
                    25.02090651422749
                  ],
                  [
                    121.9207763671875,
                    25.035838555635017
                  ],
                  [
                    121.904296875,
                    25.110471486223346
                  ],
                  [
                    121.64611816406249,
                    25.22978942503438
                  ],
                  [
                    121.56921386718751,
                    25.299337565234087
                  ]
                ],
              ],
            },
          },
        ],
      };

      const geoVectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonObject),
      });

      // geoVectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));

      const geoVectorLayer = new VectorLayer({
        source: geoVectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)',
          }),
        }),
      });

      const zoomToTaiwan = () => {
        const polygonTaiwan = geoVectorSource.getFeatures()[0].getGeometry()
        view.fit(polygonTaiwan, {padding: [170, 50, 30, 150]})
      }

      onMounted(() => {
        map.value = markRaw(new Map({
          target: "map",
          view: view,
          layers: [baseLayerGroup],
          keyboardEventTarget: document,
          controls: defaults({ attribution: false }).extend(mapControls.value)
        }));
        map.value.addLayer(optionalLayerGroup);
        map.value.addLayer(geoVectorLayer);
        watchEffect(() => {
          const clickedControl = props.mapControlProps.title.replace(/[{()}]/g, "");
          if (props.mapControlProps.show) {
            mapControls.value.forEach(control => {
              if (control instanceof olControl[clickedControl]) {
                map.value.addControl(control);
              }
            });
          }
          else {
            map.value.getControls().forEach(control => {
              if (control instanceof olControl[clickedControl])
              map.value.removeControl(control);
            });
          }
        });
      });
      return { map, mapContainer, zoomOut, zoomIn, zoomToTaiwan };
    }
};
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}

.MousePosition {
  color: red;
  position: absolute;
  top: 40px;
  right: 10px;
}

.ol-overviewmap {
  margin-bottom: 50px;
}

.ol-rotate {
  margin-right: 40px;
}
</style>