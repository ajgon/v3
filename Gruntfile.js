/*jslint node: true, stupid: true */
module.exports = function (grunt) {
    'use strict';

    var fs = require('fs'),
        portfolio = JSON.parse(fs.readFileSync('source/_data/json/portfolio.json')),
        specs = JSON.parse(fs.readFileSync('source/_data/json/specs.json')),
        clients = JSON.parse(fs.readFileSync('source/_data/json/clients.json')),
        years = portfolio.map(function (p) { return p.date.replace(/-[0-9\-]*$/, ''); }).sort().reverse().filter(function (value, index, self) { return self.indexOf(value) === index; });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        template: {
            dev: {
                src: 'source/_data/templates/portfolio.ejs',
                dest: 'source/portfolio/index.html',
                variables: {
                    portfolio: portfolio,
                    specs: specs,
                    clients: clients,
                    years: years,
                    moment: require('moment')
                }
            },
        }
    });

    grunt.loadNpmTasks('grunt-templater');

    // Default task(s).
    grunt.registerTask('default', ['template']);

};
