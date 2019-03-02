const mongoose = require('../Database/mongoose');
const Schema = mongoose.Schema;

let classifyschema = new Schema({
    name:{type:String},
    color:{type:String},
    backgroundColor:{type:String}
});

module.exports = mongoose.model('Classify', classifyschema);