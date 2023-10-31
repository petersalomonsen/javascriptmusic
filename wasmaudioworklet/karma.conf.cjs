module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    listenAddress: '0.0.0.0',
    hostname: 'localhost',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: '**/*.spec.js', type: 'module' },
      { pattern: '**/*.js', included: false, type: 'module' },
      { pattern: 'synth1/assembly/**/*.ts', included: false },
      { pattern: '**/*.json', included: false },
      { pattern: '**/*.html', included: false },
      { pattern: '**/*.wasm', included: false }
    ],

    // list of files / patterns to exclude
    exclude: [
      'node_modules/**/*.spec.js'
    ],

    proxies: {
      '/app.html': '/base/app.html',
      '/analyser': '/base/analyser',
      '/audioworkletprocessor.js': '/base/audioworkletprocessor.js',
      '/synth1': '/base/synth1',
      '/midisequencer': '/base/midisequencer',
      '/webaudiomodules': '/base/webaudiomodules',
      '/wasmgit': '/base/wasmgit',
      '/emptysong.js': '/base/emptysong.js',
      '/pattern_tools.js': '/base/pattern_tools.js',
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome_NoUserGestureRequired', 'ChromeHeadless_NoUserGestureRequired', 'Safari', 'FirefoxAutoplay'],
    // you can define custom flags
    customLaunchers: {
      Chrome_NoUserGestureRequired: {
        base: 'Chrome',
        flags: ['--autoplay-policy=no-user-gesture-required']
      },
      ChromeHeadless_NoUserGestureRequired: {
        base: 'Chrome',
        flags: ['--autoplay-policy=no-user-gesture-required', '--headless=new']
      },
      FirefoxAutoplay: {
        base: 'FirefoxHeadless',
        prefs: {
          'media.autoplay.block-webaudio': false
        }
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
