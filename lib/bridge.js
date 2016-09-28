"use strict";
var AngularBridge = require('angular-bridge'),
    _ = require('angular-bridge/node_modules/underscore'),
    remote = require("./models/remote.js"),
    models = require("./models/local.js");

class Bridge extends AngularBridge {
    constructor(router, options) {
        super(router, options);
        for( var name in remote.schemas ) {
            this.addResource(name.toLowerCase(), models[name]);
        }
    }
    registerRoutes() {
        this.router.route(this.options.urlPrefix + ':resourceName/action/:methodName')
            .all(this.options.requestPrehandler)
            .all(this.collection())
            .get(this.collectionGet())
            .get(this.collectionMethod());
        super.registerRoutes();
    }
    collectionPost() {
        return _.bind(function(req, res, next) {
            if (!req.resource) { next(); return; }
            if (!req.body) throw new Error('Nothing submitted.');
            var epured_body = this.epureRequest(req, req.resource),
                self = this;
            if('parseInitOpts' in req.resource.model.schema.statics) {
                req.resource.model.parseInitOpts(epured_body, function () {
                    var doc = new req.resource.model(epured_body);
                    doc.save(function(err) {
                        if (err) {
                            self.renderError(err, null, req, res, next);
                            return;
                        }
                        if (doc.schema.methods.post)
                            doc.schema.methods.post(doc);
                       res.send(doc);
                    });
                });
            } else {
      	        self.renderError(new Error('not allowed'), null, req, res, next);
            }
        }, this);
    }
    collectionGet() {
        return _.bind(function(req, res, next) {
          if (!req.resource) {
            return next();
          }
          var self = this;
          if(req.params.methodName) {
              return next();
          }
          req.resource.model.query.exec(function(err, docs) {
            if (err) {
      	        self.renderError(err, null, req, res, next);
            }
            else {
                res.send(docs);
            }
            return false;
          });
          return false;
        }, this);
    }
    collectionMethod() {
        return _.bind(function(req, res, next) {
            var methodName = req.params.methodName,
                self = this;
            if(!(methodName in req.resource.model.schema.statics)) {
                return next();
            }
            req.resource.model[methodName](req.query, function(err, result) {
                if (err) {
      	            return self.renderError(err, null, req, res, next);
                }
                else {
                    res.send(result);
                }
            });
            return false;
        }, this);
    }
}
module.exports = exports = Bridge;
