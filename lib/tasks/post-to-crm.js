var models = require("../models/local.js"),
    mongoose = require('mongoose'),
    settings = require('../../settings/index.js'),
    POST_AFTER_MS = 4*60*1000;
    mongoose.Promise = Promise;
models.init(settings);
mongoose.connect(settings.MONGO_CONSTRING).then(function(){
    models.Feedback.aggregate([{
        $project: {
            msElapsed: {$subtract: [new Date(), "$createdAt"]},
            emitted: 1
        }
    }, {
        $match: { 
            $and:[
                {msElapsed: {$gt: POST_AFTER_MS}}, 
                {emitted: false}
            ]
        }
    }]).exec(function(err, objs){
        if(!err){
          Promise.all(objs.map(function(obj){
            return new Promise(function(resolve, reject){
              models.Feedback.findById(obj._id, function(err, doc){
                  if(err){reject(err);}
                  else{
                      doc.postToCRM().then(function(){
                        resolve(doc);
                      },
                      function(err){
                          reject(err);
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
