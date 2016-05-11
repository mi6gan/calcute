var angoose = require("angoose");
var mongoose = angoose.getMongoose();
var moduleSchema = new mongoose.Schema({
    name: {type: String},
    domains: [String]
});
module.exports = mongoose.model('Module', moduleSchema);
