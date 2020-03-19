'use strict';

// http://karma-runner.github.io/4.0/config/configuration-file.html
function fetchMock() {
    return (request, response, next) => {
        if (request.originalUrl.includes('/success')) {
            response.writeHead(204);
            return response.end(JSON.stringify({message: 'ok'}));
        } else if (request.originalUrl.includes('/fail')) {
            response.writeHead(422);
            return response.end(JSON.stringify({message: 'error'}));
        }
        next();
    }
}

module.exports = function (config) {
    /** @type {ConfigOptions} */
    const options = {
        frameworks: ['mocha', 'chai'],
        reporters: ['mocha'],
        port: 4096,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true,
        concurrency: Infinity,
        files: [
            '../dist/index.umd.js',
            './**/*.spec.js'],
        middleware: ['fetch-mock'],
        plugins: [
            'karma-*',
            {'middleware:fetch-mock': ['factory', fetchMock]}
        ]
    };

    config.set(options);
};
