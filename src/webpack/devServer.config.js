const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

module.exports = function() {
  return {
    // Enable gzip compression of generated files.
    compress: true,
    hot: true,
    quiet: false,
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      disableDotRule: true,
    },
    // before(app, server) {
    //   console.log('-----');
    // },
  };
};
