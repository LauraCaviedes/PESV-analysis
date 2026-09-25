/**
 * Información Geográfica de Colombia: Departamentos y Municipios Principales
 * Coordenadas de centroides oficiales EPSG:4326 (WGS84) para mapeo geoespacial
 */

export interface DepartamentoInfo {
  codigo: string;
  nombre: string;
  lat: number;
  lon: number;
  capital: string;
  region: 'Andina' | 'Caribe' | 'Pacífica' | 'Orinoquía' | 'Amazonía';
}

export interface MunicipioInfo {
  nombre: string;
  departamento: string;
  lat: number;
  lon: number;
}

export const DEPARTAMENTOS_COLOMBIA: DepartamentoInfo[] = [
  { codigo: '11', nombre: 'BOGOTÁ, D.C.', lat: 4.6097, lon: -74.0817, capital: 'Bogotá', region: 'Andina' },
  { codigo: '05', nombre: 'ANTIOQUIA', lat: 6.2518, lon: -75.5636, capital: 'Medellín', region: 'Andina' },
  { codigo: '76', nombre: 'VALLE DEL CAUCA', lat: 3.4516, lon: -76.5320, capital: 'Cali', region: 'Pacífica' },
  { codigo: '25', nombre: 'CUNDINAMARCA', lat: 4.8614, lon: -74.0319, capital: 'Bogotá', region: 'Andina' },
  { codigo: '68', nombre: 'SANTANDER', lat: 7.1254, lon: -73.1198, capital: 'Bucaramanga', region: 'Andina' },
  { codigo: '08', nombre: 'ATLÁNTICO', lat: 10.9685, lon: -74.7813, capital: 'Barranquilla', region: 'Caribe' },
  { codigo: '13', nombre: 'BOLÍVAR', lat: 10.3997, lon: -75.5144, capital: 'Cartagena', region: 'Caribe' },
  { codigo: '66', nombre: 'RISARALDA', lat: 4.8133, lon: -75.6961, capital: 'Pereira', region: 'Andina' },
  { codigo: '17', nombre: 'CALDAS', lat: 5.0689, lon: -75.5174, capital: 'Manizales', region: 'Andina' },
  { codigo: '54', nombre: 'NORTE DE SANTANDER', lat: 7.8939, lon: -72.5078, capital: 'Cúcuta', region: 'Andina' },
  { codigo: '73', nombre: 'TOLIMA', lat: 4.4389, lon: -75.2322, capital: 'Ibagué', region: 'Andina' },
  { codigo: '50', nombre: 'META', lat: 4.1420, lon: -73.6266, capital: 'Villavicencio', region: 'Orinoquía' },
  { codigo: '41', nombre: 'HUILA', lat: 2.9273, lon: -75.2819, capital: 'Neiva', region: 'Andina' },
  { codigo: '15', nombre: 'BOYACÁ', lat: 5.5353, lon: -73.3678, capital: 'Tunja', region: 'Andina' },
  { codigo: '19', nombre: 'CAUCA', lat: 2.4448, lon: -76.6147, capital: 'Popayán', region: 'Pacífica' },
  { codigo: '52', nombre: 'NARIÑO', lat: 1.2136, lon: -77.2811, capital: 'Pasto', region: 'Pacífica' },
  { codigo: '20', nombre: 'CESAR', lat: 10.4631, lon: -73.2532, capital: 'Valledupar', region: 'Caribe' },
  { codigo: '23', nombre: 'CÓRDOBA', lat: 8.7479, lon: -75.8814, capital: 'Montería', region: 'Caribe' },
  { codigo: '47', nombre: 'MAGDALENA', lat: 11.2408, lon: -74.1990, capital: 'Santa Marta', region: 'Caribe' },
  { codigo: '63', nombre: 'QUINDÍO', lat: 4.5339, lon: -75.6811, capital: 'Armenia', region: 'Andina' },
  { codigo: '44', nombre: 'LA GUAJIRA', lat: 11.5444, lon: -72.9072, capital: 'Riohacha', region: 'Caribe' },
  { codigo: '70', nombre: 'SUCRE', lat: 9.3047, lon: -75.3978, capital: 'Sincelejo', region: 'Caribe' },
  { codigo: '85', nombre: 'CASANARE', lat: 5.3378, lon: -72.3959, capital: 'Yopal', region: 'Orinoquía' },
  { codigo: '27', nombre: 'CHOCÓ', lat: 5.6919, lon: -76.6583, capital: 'Quibdó', region: 'Pacífica' },
  { codigo: '81', nombre: 'ARAUCA', lat: 7.0847, lon: -70.7591, capital: 'Arauca', region: 'Orinoquía' },
  { codigo: '18', nombre: 'CAQUETÁ', lat: 1.6144, lon: -75.6062, capital: 'Florencia', region: 'Amazonía' },
  { codigo: '86', nombre: 'PUTUMAYO', lat: 1.1488, lon: -76.6496, capital: 'Mocoa', region: 'Amazonía' },
  { codigo: '91', nombre: 'AMAZONAS', lat: -4.2153, lon: -69.9406, capital: 'Leticia', region: 'Amazonía' },
  { codigo: '95', nombre: 'GUAVIARE', lat: 2.5729, lon: -72.6459, capital: 'San José del Guaviare', region: 'Amazonía' },
  { codigo: '94', nombre: 'GUAINÍA', lat: 3.8653, lon: -67.9239, capital: 'Inírida', region: 'Amazonía' },
  { codigo: '97', nombre: 'VAUPÉS', lat: 1.2514, lon: -70.2333, capital: 'Mitú', region: 'Amazonía' },
  { codigo: '99', nombre: 'VICHADA', lat: 4.4233, lon: -69.7389, capital: 'Puerto Carreño', region: 'Orinoquía' },
];

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
