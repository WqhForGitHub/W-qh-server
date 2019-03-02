const mongoose = require('../Database/mongoose');
const dataSchema = new mongoose.Schema({});
const dataModel = mongoose.model('modelName', dataSchema, 'userlists');

module.exports = dataModel;