var bodyParser = require('body-parser'),
    Bridge = require('../../lib/bridge.js'),
    models = require('../../models/local.js'),
    mongoose = require('mongoose'),
    expect = require('chai').expect,
    express = require("express"),
    settings = require("../../settings.js").test,
    http = require('http');

describe('Model form directives', function() {
    var bridge;
    var app;
    var server;
    it('starter screen', function(done) {
        browser.get('http://localhost:8080/demo');
        done();
    });
    it('click start button', function(done) {
        element(by.model('feedback')).click().then(function(){
            var screen = element(by.tagName('screen'));
            done();
        });
    });
});
