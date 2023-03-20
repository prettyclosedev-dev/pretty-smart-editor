module.exports = {
    name: "editor",
    script: "serve",
    env: {
      PM2_SERVE_PATH: 'build',
      PM2_SERVE_PORT: 8080,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html',
      PM2_SERVE_BASIC_AUTH: 'true',
      PM2_SERVE_BASIC_AUTH_USERNAME: 'prettysmart',
      PM2_SERVE_BASIC_AUTH_PASSWORD: '_prettydum_'
    }
  }