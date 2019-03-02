const mongoose = require('../Database/mongoose');
const Schema = mongoose.Schema;

let tagList = new Schema({
    tagname:{type: String},
    color:{type: String},
    backgroundColor:{type: String}
});
module.exports = mongoose.model('TagList', tagList);