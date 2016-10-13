/* TODO fix shitty bug with refArray update (drivers for Feedback and DiscountInfo)
var assert = require("assert"),
    settings = require("../settings.js").clienttest,
    testClient = require("../client.js").testClient,
    prodServer = require("../server.js").prodServer,
    when = require("autobahn").when,
    http = require("http"),
    NUM_CLIENTS = 2;

describe('', function() {
    beforeEach('start prod server', function(done){
        server = new prodServer(settings).then(
            function(shared){
                extra.serverShared = shared;
                var promises = [];
                for(var i=0;i<NUM_CLIENTS; i++) {
                        var d = when.defer();
                        promises.push(d.promise);
                        (function(d){
                            new testClient(settings).then(function(_session){
                                if(!sessions.length) {
                                    session = _session;
                                }
                                sessions.push(_session);
                                d.resolve();
                            })
                        })(d);
                }
                when.all(promises).then(function(){
                    done();
                });
        });
    });
    it('aut.aut', function(done) { 
*/
