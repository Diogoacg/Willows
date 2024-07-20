module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      "@babel/plugin-transform-export-namespace-from", // Adicione esta linha
      "react-native-reanimated/plugin", // Certifique-se de que esta linha também está presente
    ],
  };
};
