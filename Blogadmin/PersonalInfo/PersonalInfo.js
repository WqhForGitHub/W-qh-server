const mongoose = require('../Database/mongoose');
const dataSchema = new mongoose.Schema({
    methods: String,
    blognum: Number,
    kindnum: Number,
    tagnum:  Number
}, {collection:'PersonalInfo'});
const dataModel = mongoose.model('PersonalInfo', dataSchema, 'PersonalInfo');

module.exports = dataModel;