module.exports = function(api) {
  api.cache(true);

  return {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "browsers": [
              "last 1 version",
              "ie >= 11"
            ]
          },
          "useBuiltIns": "usage",
          "modules": false
        }
      ]
    ]
  };
};