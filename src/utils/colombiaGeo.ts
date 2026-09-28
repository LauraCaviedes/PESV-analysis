/**
 * Información Geográfica de Colombia: Departamentos y Municipios Principales
 * Coordenadas de centroides oficiales EPSG:4326 (WGS84) para mapeo geoespacial
 */
import mapData from './departamentos.json';

export interface DepartamentoInfo {
  codigo: string;
  nombre: string;
  lat: number;
  lon: number;
  capital: string;
  region: 'Andina' | 'Caribe' | 'Pacífica' | 'Orinoquía' | 'Amazonía';
  pathSvg: string;
}

export interface MunicipioInfo {
  nombre: string;
  departamento: string;
  lat: number;
  lon: number;
}

export const DEPARTAMENTOS_COLOMBIA: DepartamentoInfo[] = mapData as DepartamentoInfo[];

export const MUNICIPIOS_CLAVE: MunicipioInfo[] = [
  { nombre: 'BOGOTÁ', departamento: 'BOGOTÁ, D.C.', lat: 4.6097, lon: -74.0817 },
  { nombre: 'MEDELLÍN', departamento: 'ANTIOQUIA', lat: 6.2442, lon: -75.5812 },
  { nombre: 'CALI', departamento: 'VALLE DEL CAUCA', lat: 3.4516, lon: -76.5320 },
  { nombre: 'BARRANQUILLA', departamento: 'ATLÁNTICO', lat: 10.9685, lon: -74.7813 },
  { nombre: 'BUCARAMANGA', departamento: 'SANTANDER', lat: 7.1254, lon: -73.1198 },
  { nombre: 'CARTAGENA', departamento: 'BOLÍVAR', lat: 10.3910, lon: -75.4794 },
  { nombre: 'PEREIRA', departamento: 'RISARALDA', lat: 4.8133, lon: -75.6961 },
  { nombre: 'MANIZALES', departamento: 'CALDAS', lat: 5.0689, lon: -75.5174 },
  { nombre: 'CÚCUTA', departamento: 'NORTE DE SANTANDER', lat: 7.8939, lon: -72.5078 },
  { nombre: 'IBAGUÉ', departamento: 'TOLIMA', lat: 4.4389, lon: -75.2322 },
  { nombre: 'VILLAVICENCIO', departamento: 'META', lat: 4.1420, lon: -73.6266 },
  { nombre: 'SANTA MARTA', departamento: 'MAGDALENA', lat: 11.2408, lon: -74.1990 },
  { nombre: 'PASTO', departamento: 'NARIÑO', lat: 1.2136, lon: -77.2811 },
  { nombre: 'MONTERÍA', departamento: 'CÓRDOBA', lat: 8.7479, lon: -75.8814 },
  { nombre: 'VALLEDUPAR', departamento: 'CESAR', lat: 10.4631, lon: -73.2532 },
  { nombre: 'NEIVA', departamento: 'HUILA', lat: 2.9273, lon: -75.2819 },
  { nombre: 'ARMENIA', departamento: 'QUINDÍO', lat: 4.5339, lon: -75.6811 },
  { nombre: 'POPAYÁN', departamento: 'CAUCA', lat: 2.4448, lon: -76.6147 },
  { nombre: 'SINCELEJO', departamento: 'SUCRE', lat: 9.3047, lon: -75.3978 },
  { nombre: 'TUNJA', departamento: 'BOYACÁ', lat: 5.5353, lon: -73.3678 },
  { nombre: 'FLORENCIA', departamento: 'CAQUETÁ', lat: 1.6144, lon: -75.6062 },
  { nombre: 'RIOHACHA', departamento: 'LA GUAJIRA', lat: 11.5444, lon: -72.9072 },
  { nombre: 'YOPAL', departamento: 'CASANARE', lat: 5.3378, lon: -72.3959 },
  { nombre: 'QUIBDÓ', departamento: 'CHOCÓ', lat: 5.6919, lon: -76.6583 },
  { nombre: 'SOACHA', departamento: 'CUNDINAMARCA', lat: 4.5800, lon: -74.2167 },
  { nombre: 'BELLO', departamento: 'ANTIOQUIA', lat: 6.3372, lon: -75.5578 },
  { nombre: 'ENVIGADO', departamento: 'ANTIOQUIA', lat: 6.1759, lon: -75.5917 },
  { nombre: 'PALMIRA', departamento: 'VALLE DEL CAUCA', lat: 3.5394, lon: -76.3036 },
  { nombre: 'FLORIDABLANCA', departamento: 'SANTANDER', lat: 7.0622, lon: -73.0864 },
  { nombre: 'BARRANCABERMEJA', departamento: 'SANTANDER', lat: 7.0653, lon: -73.8547 },
  { nombre: 'BUENAVENTURA', departamento: 'VALLE DEL CAUCA', lat: 3.8801, lon: -77.0312 },
  { nombre: 'ITAGÜÍ', departamento: 'ANTIOQUIA', lat: 6.1722, lon: -75.6094 },
  { nombre: 'GIRARDOT', departamento: 'CUNDINAMARCA', lat: 4.3014, lon: -74.8058 },
  { nombre: 'DUITAMA', departamento: 'BOYACÁ', lat: 5.8267, lon: -73.0336 },
  { nombre: 'SOGAMOSO', departamento: 'BOYACÁ', lat: 5.7144, lon: -72.9339 },
];

/**
 * Convierte lat/lon a coordenadas SVG dentro de una caja de 600x700
 * Bounds Colombia aproximados: lon: -79 a -67, lat: -4.5 a 12.5
 */
export function proyectarCoordsSVG(lat: number, lon: number, width = 600, height = 700) {
  const minLon = -79.2;
  const maxLon = -66.8;
  const minLat = -4.3;
  const maxLat = 12.6;

  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  // Latitud invertida en SVG
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

  return { x, y };
}

/**
 * Homologa cualquier nombre de departamento hacia el formato exacto de NOMBRE_DPT en colombia_map.geojson
 */
export function homologarNombreDepartamento(nombre: string): string {
  if (!nombre) return 'SANTAFE DE BOGOTA D.C';
  const limpio = nombre
    .toUpperCase()
    .replace(/[ÁÀÄ]/g, 'A')
    .replace(/[ÉÈË]/g, 'E')
    .replace(/[ÍÌÏ]/g, 'I')
    .replace(/[ÓÒÖ]/g, 'O')
    .replace(/[ÚÙÜ]/g, 'U')
    .replace(/[.,]/g, '')
    .trim();

  if (
    limpio.includes('BOGOTA') ||
    limpio.includes('SANTAFE') ||
    limpio.includes('D C') ||
    limpio.includes('DC')
  ) {
    return 'SANTAFE DE BOGOTA D.C';
  }
  if (limpio.includes('SAN ANDRES') || limpio.includes('PROVIDENCIA')) {
    return 'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA';
  }
  if (limpio.includes('VALLE DEL CAUCA') || limpio === 'VALLE') {
    return 'VALLE DEL CAUCA';
  }
  if (limpio.includes('NORTE') && limpio.includes('SANTANDER')) {
    return 'NORTE DE SANTANDER';
  }
  if (limpio === 'SANTANDER') {
    return 'SANTANDER';
  }
  if (limpio.includes('GUAJIRA')) {
    return 'LA GUAJIRA';
  }
  if (limpio.includes('NARINO') || limpio.includes('NARIÑO')) {
    return 'NARIÑO';
  }

  return limpio;
}

/**
 * Convierte geometría GeoJSON (Polygon o MultiPolygon) a path SVG optimizado
 */
export function geojsonCoordsToSvgPath(geometry: any, width = 600, height = 700): string {
  if (!geometry || !geometry.coordinates) return '';

  const projectPoint = (pt: [number, number]) => {
    // pt es [lon, lat] en WGS84
    const { x, y } = proyectarCoordsSVG(pt[1], pt[0], width, height);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const projectRing = (ring: [number, number][]) => {
    if (!ring || ring.length === 0) return '';
    return 'M ' + ring.map(pt => projectPoint(pt)).join(' L ') + ' Z';
  };

  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring: any) => projectRing(ring)).join(' ');
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((poly: any) => poly.map((ring: any) => projectRing(ring)).join(' '))
      .join(' ');
  }
  return '';
}
