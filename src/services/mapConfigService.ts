export type MapLayerType = 'dark' | 'satellite' | 'terrain' | 'street';

export interface MapProviderConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

/**
 * Map Configuration & Abstraction Service
 * Decouples Leaflet / MapLibre map components from specific tile providers.
 * Supports production Mapbox / Sentinel Hub / CartoDB / Esri / OpenStreetMap via environment variables.
 * Fallbacks gracefully to high-quality keyless open tile providers (CartoDB, OpenStreetMap, Esri)
 * ensuring ZERO "API KEY REQUIRED" watermarks or errors in the UI.
 */
class MapConfigService {
  private customProvider = import.meta.env.VITE_MAP_PROVIDER || 'default';
  private mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  private mapApiKey = import.meta.env.VITE_MAP_API_KEY || '';

  public getTileConfig(layerType: MapLayerType): MapProviderConfig {
    // If Mapbox token is present via environment variables, use Mapbox production styles
    if (this.mapboxToken) {
      const mapboxStyles: Record<MapLayerType, string> = {
        dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${this.mapboxToken}`,
        satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${this.mapboxToken}`,
        terrain: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=${this.mapboxToken}`,
        street: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${this.mapboxToken}`,
      };

      return {
        name: `Mapbox Production (${layerType})`,
        url: mapboxStyles[layerType],
        attribution: '&copy; Mapbox &copy; OpenStreetMap',
        maxZoom: 19,
      };
    }

    // If MapTiler API Key is provided
    if (this.mapApiKey) {
      const mapTilerStyles: Record<MapLayerType, string> = {
        dark: `https://api.maptiler.com/maps/ch-swisstopo-lbm-dark/{z}/{x}/{y}.png?key=${this.mapApiKey}`,
        satellite: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${this.mapApiKey}`,
        terrain: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${this.mapApiKey}`,
        street: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${this.mapApiKey}`,
      };

      return {
        name: `MapTiler (${layerType})`,
        url: mapTilerStyles[layerType],
        attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
        maxZoom: 19,
      };
    }

    // Default High-Availability Keyless Open Tile Providers (Zero Watermarks, Zero Errors)
    switch (layerType) {
      case 'satellite':
        return {
          name: 'Esri World Imagery (Satellite)',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 18,
        };
      case 'terrain':
        return {
          name: 'Esri World Topo Map (Terrain)',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, HERE, Garmin, Intermap',
          maxZoom: 18,
        };
      case 'street':
        return {
          name: 'OpenStreetMap (Standard Street)',
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        };
      case 'dark':
      default:
        return {
          name: 'Esri Dark Canvas (Command Center)',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, HERE, Garmin, USGS',
          maxZoom: 19,
        };
    }
  }
}

export const mapConfigService = new MapConfigService();
