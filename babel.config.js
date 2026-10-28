module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Lets drizzle migrations (.sql files) be bundled as strings.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
