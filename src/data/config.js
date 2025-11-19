export const IS_DEV = false//process.env.NODE_ENV === "development";

export const LOGGING_ON = IS_DEV;

export const POLOTNO_KEY = "FA29LdEvOAJdMenXqqEy"

const IS_LOCAL = false;

export const API = IS_LOCAL
  ? "http://localhost:4000/graphql"
  : "https://clyps.io/graphql"
  
export const BASE_URL = "https://clyps.io"

export const TOKEN = "2fdba0ae-ad85-406c-8cad-94a90f58a5b5"

export const IN_APP = false;

// Determine the prefix based on whether IN_APP is true
export const URL_PREFIX = IN_APP ? "editor/" : "";
