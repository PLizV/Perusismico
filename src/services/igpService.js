import axios from "axios";

export const IGP_MODERN_START_YEAR = 2012;

const DEFAULT_BACKEND_URL = "http://localhost:3000";
const DEFAULT_IGP_GEOJSON_PATH = "/igp-data/sismos-geojson";

function getViteEnv() {
  return import.meta.env || {};
}

function normalizeEnvUrl(value) {
  const url = String(value || "").trim();
  return url ? url.replace(/\/+$/, "") : "";
}

function getBackendUrl() {
  const env = getViteEnv();
  return (
    normalizeEnvUrl(env.VITE_PDGIBD) ||
    normalizeEnvUrl(env.VITE_API_URL) ||
    DEFAULT_BACKEND_URL
  );
}

function getIgpGeoJsonPath() {
  const env = getViteEnv();
  const path = String(
    env.VITE_IGP_SISMOS_GEOJSON_PATH || DEFAULT_IGP_GEOJSON_PATH
  ).trim();

  return path.startsWith("/") ? path : `/${path}`;
}

function getSecurityToken() {
  const env = getViteEnv();
  return String(
    env.VITE_PDGIBD_FRONT_TOKEN ||
    env.VITE_PDGIBD_TOKEN ||
    ""
  ).trim();
}

function getSecurityHeaders() {
  const token = getSecurityToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
    "x-pdgibd-token": token,
  };
}

export function formatDateParam(value) {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function computeDepthRangeFromSelection(selection = {}) {
  const isSuperficial = Boolean(selection.isSuperficial);
  const isIntermediate = Boolean(
    selection.isIntermediate ?? selection.isIntermedio
  );
  const isDeep = Boolean(selection.isDeep);

  if (isSuperficial && isIntermediate && isDeep) {
    return { minDepth: 0, maxDepth: 700 };
  }
  if (isSuperficial && isIntermediate) {
    return { minDepth: 0, maxDepth: 300 };
  }
  if (isSuperficial && isDeep) {
    return { minDepth: 0, maxDepth: 700 };
  }
  if (isIntermediate && isDeep) {
    return { minDepth: 61, maxDepth: 700 };
  }
  if (isSuperficial) {
    return { minDepth: 0, maxDepth: 60 };
  }
  if (isIntermediate) {
    return { minDepth: 61, maxDepth: 300 };
  }
  if (isDeep) {
    return { minDepth: 301, maxDepth: 700 };
  }

  return { minDepth: 0, maxDepth: 700 };
}

export function buildIgpGeoJsonParams({
  startDate,
  endDate,
  magnitudeRange,
  depthSelection,
  bounds,
} = {}) {
  const startDateParam = formatDateParam(startDate);
  const endDateParam = formatDateParam(endDate);
  const startYear = Math.max(
    Number(startDateParam?.slice(0, 4) || IGP_MODERN_START_YEAR),
    IGP_MODERN_START_YEAR
  );
  const endYear = Number(endDateParam?.slice(0, 4) || new Date().getFullYear());
  const { minDepth, maxDepth } = computeDepthRangeFromSelection(depthSelection);

  return {
    startYear,
    endYear,
    startDate: startDateParam,
    endDate: endDateParam,
    minMagnitude: magnitudeRange?.minMagnitude,
    maxMagnitude: magnitudeRange?.maxMagnitude,
    minDepth,
    maxDepth,
    minLatitude: bounds?.minLatitude,
    maxLatitude: bounds?.maxLatitude,
    minLongitude: bounds?.minLongitude,
    maxLongitude: bounds?.maxLongitude,
  };
}

export async function fetchIgpEarthquakesGeoJson(params) {
  const response = await axios.get(`${getBackendUrl()}${getIgpGeoJsonPath()}`, {
    headers: getSecurityHeaders(),
    params,
  });

  if (response.data?.type === "FeatureCollection") {
    return response.data;
  }

  if (response.data?.data?.type === "FeatureCollection") {
    return response.data.data;
  }

  return response.data;
}
