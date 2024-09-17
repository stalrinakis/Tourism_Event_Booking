
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    link: String,
    landid: String,
    mainimg:
    {
        data: Buffer,
        contentType: String
    },
    loimg:
    {
        data: Buffer,
        contentType: String
    }
});
  
  
module.exports = new mongoose.model('landmarks', imageSchema);