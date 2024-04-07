export const IS_DEV = process.env.NODE_ENV === "development";

export const LOGGING_ON = IS_DEV;

export const AUTH_DOMAIN = IS_DEV
  ? "prettysmart-dev.us.auth0.com"
  : "prettysmart.us.auth0.com";
export const AUTH_ID = IS_DEV
  ? "l2EdgB8cAh3swlNTBO476nqUlfzJvg2W"
  : "ioDLFKxzfv1TprtHgwB0lZy4Vy5pQlN1";

export const POLOTNO_KEY = "FA29LdEvOAJdMenXqqEy"

const IS_LOCAL = false;

export const API = IS_LOCAL
  ? "http://localhost:4000/graphql"
  : "https://clyps.io/graphql"
  
export const TOKEN = "c819f484-71e7-4514-b5ab-98d980f48442"

export const IN_APP = true
