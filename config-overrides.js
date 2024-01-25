/* config-overrides.js */

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.output.library = "PrettySmartEditor";

  return config;
}