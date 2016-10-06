var models = require("../models/local.js"),
    mongoose = require('mongoose'),
    settings = require('../../settings/index.js'),
    POST_AFTER_MS = 4*60*1000;
    mongoose.Promise = Promise;
mongoose.connect(settings.MONGO_CONSTRING).then(function(){
    models.Feedback.aggregate([{
        $project: { msElapsed: { $subtract: [new Date(), "$createdAt"] } },
    }, {
        $match: { msElapsed: { $gt: POST_AFTER_MS } },
    }]).exec(function(err, objs){
        if(!err){
          Promise.all(objs.map(function(obj){
            return new Promise(function(resolve, reject){
              models.Feedback.findById(obj._id, function(err, doc){
                  if(err){reject(err);}
                  else{
                      doc.postToCRM().then(function(){
                        resolve(doc);
                      });
                  }
              });
            });
          })).then(function(docs){
              process.exit();
          }, function(err){
              console.log(err);
              process.exit();
          });
        } else {
            console.log(err);
            process.exit();
        }
    });
});
