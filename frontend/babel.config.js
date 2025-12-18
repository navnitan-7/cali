module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        "babel-plugin-transform-import-meta",
        "react-native-reanimated/plugin",
      ],
      overrides: [
        {
          // Transform import.meta in zustand and other packages that use it
          test: /node_modules[\\/](zustand)[\\/]/,
          plugins: ["babel-plugin-transform-import-meta"],
        },
      ],
    };
  };