var pathUtil = require('./schema-path.js'),
    mongoose = require('mongoose');
function clean(model, inObj, exclude, level){
    var promises = [], obj = {};
    exclude = exclude || [];
    level = level || 0;
    for(var path in model.schema.paths) {
        var pathObj = model.schema.paths[path],
            opts = pathObj.options;
        if(path in inObj){
            if(pathUtil.isMultiRef(pathObj)){
                obj[path] = Array(inObj[path] ? inObj[path].length : 0); 
                (inObj[path]||[]).forEach(function(id, i){
                    var model = mongoose.model(opts.type[0].ref);
                    promises.push(new Promise(function(i, id, model, path, resolve, reject){
                        if(exclude.indexOf(model)==-1){
                          model.findById(mongoose.Types.ObjectId(id)).then(function(doc){
                              if(!doc){
                                resolve();
                              } else if(level>0){
                                clean(model, doc, [], level-1).then(function(doc){
                                    obj[path][i] = doc;
                                    resolve();
                                }, function(err){
                                    reject(err);
                                });
                              } else {
                                obj[path][i] = doc;
                                resolve();
                              }
                          });
                        } else {resolve();}
                    }.bind(this, i, id, model, path)));
                });
            }
            else if(opts.ref){
              if(inObj[path]){
                promises.push(new Promise(function(id, model, path, resolve, reject){
                    if(exclude.indexOf(model)==-1){
                      model.findById(mongoose.Types.ObjectId(id)).then(function(doc){
                        if(!doc){
                            resolve();
                        } else if(level){
                            clean(model, doc, [], level-1).then(function(doc){
                                obj[path] = doc;
                                resolve();
                            }, function(err){
                                reject(err);
                            });
                        } else {
                            obj[path] = doc;
                            resolve();
                        }
                      });
                    } else {resolve();}
                }.bind(this, inObj[path], mongoose.model(opts.ref), path)));
              }
            }
            else {
                obj[path] = inObj[path];
            }
        }
    }
    return new Promise(function(resolve, reject){
        Promise.all(promises).then(function(){
            resolve(obj);
        }, function(err){
            reject(err);
        });
    });
}
module.exports.clean = clean; 
