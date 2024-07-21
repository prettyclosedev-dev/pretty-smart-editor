export const IS_DEV = false//process.env.NODE_ENV === "development";

export const LOGGING_ON = IS_DEV;

export const POLOTNO_KEY = "FA29LdEvOAJdMenXqqEy"

const IS_LOCAL = false;

export const API = IS_LOCAL
  ? "http://localhost:4000/graphql"
  : "https://clyps.io/graphql"
  
export const TOKEN = "c819f484-71e7-4514-b5ab-98d980f48442"

export const IN_APP = true;

// Determine the prefix based on whether IN_APP is true
export const URL_PREFIX = IN_APP ? "editor/" : "";
