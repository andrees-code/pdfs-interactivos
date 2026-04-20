<template>
  <div ref="mapContainer" class="leaflet-map-element" :style="{ pointerEvents: interactive ? 'auto' : 'none' }"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = defineProps<{
  element: any;
  interactive?: boolean;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let markerLayer: L.LayerGroup | null = null;
let routeLayer: L.Polyline | null = null;

const configureLeafletIcons = () => {
  const iconDefault = L.Icon.Default as unknown as { prototype?: any; mergeOptions?: (opts: any) => void };
  if (iconDefault.prototype && iconDefault.prototype._iconUrl) {
    delete iconDefault.prototype._iconUrl;
  }
  if (iconDefault.mergeOptions) {
    iconDefault.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }
};

const clampZoom = (value: unknown) => {
  const zoom = Number(value ?? 14);
  if (Number.isNaN(zoom)) return 14;
  return Math.max(1, Math.min(19, zoom));
};

const parseCoord = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
};

const getRoutePoints = () => {
  const points = Array.isArray(props.element?.routePoints) ? props.element.routePoints : [];
  return points
    .filter((p: any) => p && p.lat !== undefined && p.lng !== undefined)
    .map((p: any) => [parseCoord(p.lat, 0), parseCoord(p.lng, 0)] as [number, number]);
};

const renderOverlays = () => {
  if (!mapInstance || !markerLayer) return;

  markerLayer.clearLayers();
  if (routeLayer) {
    mapInstance.removeLayer(routeLayer);
    routeLayer = null;
  }

  const markers = Array.isArray(props.element?.markers)
    ? props.element.markers.filter((m: any) => m && m.lat !== undefined && m.lng !== undefined)
    : [];

  markers.forEach((marker: any) => {
    const lat = parseCoord(marker.lat, 0);
    const lng = parseCoord(marker.lng, 0);
    const leafletMarker = L.marker([lat, lng]);
    if (marker.label) {
      leafletMarker.bindPopup(String(marker.label));
    }
    leafletMarker.addTo(markerLayer!);
  });

  const routePoints = getRoutePoints();
  if (routePoints.length >= 2) {
    routeLayer = L.polyline(routePoints, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.85,
    }).addTo(mapInstance);
  }
};

const updateMapView = () => {
  if (!mapInstance) return;
  const centerLat = parseCoord(props.element?.centerLat, 40.4168);
  const centerLng = parseCoord(props.element?.centerLng, -3.7038);
  const zoom = clampZoom(props.element?.zoomLevel);
  mapInstance.setView([centerLat, centerLng], zoom, { animate: false });
};

const initializeMap = () => {
  if (!mapContainer.value || mapInstance) return;

  configureLeafletIcons();

  const centerLat = parseCoord(props.element?.centerLat, 40.4168);
  const centerLng = parseCoord(props.element?.centerLng, -3.7038);
  const zoom = clampZoom(props.element?.zoomLevel);

  mapInstance = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: true,
    dragging: !!props.interactive,
    scrollWheelZoom: !!props.interactive,
    doubleClickZoom: !!props.interactive,
    boxZoom: !!props.interactive,
    keyboard: !!props.interactive,
    touchZoom: !!props.interactive,
  }).setView([centerLat, centerLng], zoom);

  tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(mapInstance);

  markerLayer = L.layerGroup().addTo(mapInstance);
  renderOverlays();

  setTimeout(() => {
    mapInstance?.invalidateSize();
  }, 0);
};

watch(
  () => [props.element?.centerLat, props.element?.centerLng, props.element?.zoomLevel],
  () => {
    updateMapView();
  },
);

watch(
  () => [props.element?.markers, props.element?.routePoints],
  () => {
    renderOverlays();
  },
  { deep: true },
);

watch(
  () => props.interactive,
  (interactive) => {
    if (!mapInstance) return;
    if (interactive) {
      mapInstance.dragging.enable();
      mapInstance.scrollWheelZoom.enable();
      mapInstance.doubleClickZoom.enable();
      mapInstance.boxZoom.enable();
      mapInstance.keyboard.enable();
      mapInstance.touchZoom.enable();
    } else {
      mapInstance.dragging.disable();
      mapInstance.scrollWheelZoom.disable();
      mapInstance.doubleClickZoom.disable();
      mapInstance.boxZoom.disable();
      mapInstance.keyboard.disable();
      mapInstance.touchZoom.disable();
    }
  },
);

onMounted(() => {
  initializeMap();
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  tileLayer = null;
  markerLayer = null;
  routeLayer = null;
});
</script>

<style scoped>
.leaflet-map-element {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
</style>
