module.exports = function (config) {
  config.set({
    reporters: ['progress', 'kjhtml', 'coverage'],

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/tu-proyecto'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
  });
};
