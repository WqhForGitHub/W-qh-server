const mongoose = require('../Database/mongoose');
const Schema = mongoose.Schema;

let blogListSchema = new Schema({
  publishTime: {type: String},
  watchnum: {type: Number},
  blogtitle: {type:String},
  tagList: {type:Object},
  selectedkind: {type:Object},
  briefcontent: {type:String},
  blogcontent: {type:String},
  markdowncontent: {type:String},
  blogToc: {type:String}
});

module.exports = mongoose.model('BlogList', blogListSchema);