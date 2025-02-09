const path = require('path');

module.exports = {
  // Your other webpack configurations here...

  resolve: {
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
    }
  },

  // Additional webpack configurations...
};
