import axios from "axios";

const USGS_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";


/**
 * Calcula mindepth y maxdepth combinando los checkboxes de profundidad activos.
 * @param {boolean} isSuperficial  - Sismos superficiales (< 60 km)
 * @param {boolean} isIntermedio   - Sismos intermedios (61–300 km)
 * @param {boolean} isProfundo     - Sismos profundos (> 300 km)
 * @returns {{ mindepth: number, maxdepth: number }}
 */
export function computeDepthRange(isSuperficial, isIntermedio, isProfundo) {
  if (isSuperficial && isIntermedio && isProfundo) return { mindepth: 0, maxdepth: 700 };
  if (isSuperficial && isIntermedio) return { mindepth: 0, maxdepth: 300 };
  if (isSuperficial && isProfundo)   return { mindepth: 0, maxdepth: 700 };
  if (isIntermedio   && isProfundo)  return { mindepth: 61, maxdepth: 700 };
  if (isSuperficial)                 return { mindepth: 0, maxdepth: 60 };
  if (isIntermedio)                  return { mindepth: 61, maxdepth: 300 };
  if (isProfundo)                    return { mindepth: 301, maxdepth: 700 };
  // Fallback: ningún checkbox activo → rango completo
  return { mindepth: 0, maxdepth: 700 };
}

/**
 * Llama a la USGS Earthquake API con los parámetros dados usando axios.
 * Retorna el GeoJSON nativo de la USGS (FeatureCollection).
 * Lanza una excepción si la petición falla.
 *
 * @param {{
 *   starttime:     string,      // YYYY-MM-DD
 *   endtime:       string,      // YYYY-MM-DD
 *   minmagnitude:  number,
 *   maxmagnitude:  number,
 *   mindepth:      number,
 *   maxdepth:      number,
 *   minlatitude?:  number,
 *   maxlatitude?:  number,
 *   minlongitude?: number,
 *   maxlongitude?: number,
 * }} params
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export async function fetchUsgsEarthquakes(params) {
  const queryParams = {
    format:       "geojson",
    starttime:    params.starttime,
    endtime:      params.endtime,
    minmagnitude: params.minmagnitude,
    maxmagnitude: params.maxmagnitude,
    mindepth:     params.mindepth,
    maxdepth:     params.maxdepth,
    eventtype:    "earthquake",   // solo terremotos, sin explosiones ni otros
    orderby:      "time-asc",     // ascendente para la animación progresiva
    limit:        10000,          // la API admite máx 20000; 10000 es seguro y rápido
  };

  // Parámetros geográficos son opcionales (Global = sin filtro de bbox)
  if (params.minlatitude  !== undefined) queryParams.minlatitude  = params.minlatitude;
  if (params.maxlatitude  !== undefined) queryParams.maxlatitude  = params.maxlatitude;
  if (params.minlongitude !== undefined) queryParams.minlongitude = params.minlongitude;
  if (params.maxlongitude !== undefined) queryParams.maxlongitude = params.maxlongitude;

  const response = await axios.get(USGS_BASE_URL, { params: queryParams });
  return response.data;
}
