export const IS_DEV = false //process.env.NODE_ENV === "development";

export const LOGGING_ON = IS_DEV;

export const POLOTNO_KEY = process.env.REACT_APP_POLOTNO_KEY || "FA29LdEvOAJdMenXqqEy";

// Build-time environment (CRA replaces this at build)
const IS_PROD_BUILD = process.env.NODE_ENV === 'production';
// Infer local dev by window location when available
const WINDOW_LOCAL = (typeof window !== 'undefined')
  ? (/localhost|127\.0\.0\.1/.test(window.location.hostname))
  : false;
// Env-driven local toggle (only respected in non-prod builds)
const ENV_LOCAL = (process.env.REACT_APP_LOCAL || "").toLowerCase() === "true";
const IS_LOCAL = IS_PROD_BUILD ? WINDOW_LOCAL : (ENV_LOCAL || WINDOW_LOCAL);

// GraphQL API endpoint for the editor
export const API = IS_LOCAL
  ? (process.env.REACT_APP_API || "http://localhost:18002/graphql")
  : "https://clyps.prettysmart.co/graphql";

// Public base URL where the editor is hosted (not currently used elsewhere)
export const BASE_URL = (typeof window !== 'undefined')
  ? window.location.origin
  : (IS_LOCAL ? "http://localhost:18001" : "https://clyps.prettysmart.co");

// Base URL of the PrettySmart app (used for login endpoint)
export const APP_URL = IS_LOCAL
  ? (process.env.REACT_APP_BASE_URL || "http://localhost:18000")
  : "https://app.prettysmart.co";

// Optional configurable login path
export const CLYPS_ENDPOINT = process.env.REACT_APP_CLYPS_ENDPOINT || "/clyps";

export const TOKEN = process.env.REACT_APP_TOKEN || "2fdba0ae-ad85-406c-8cad-94a90f58a5b5";

export const IN_APP = false;

// Determine the prefix based on whether IN_APP is true
export const URL_PREFIX = IN_APP ? "editor/" : "";
