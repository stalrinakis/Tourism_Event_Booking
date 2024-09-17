
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    region: String,
    cat: String,
    actid: String,
    mainimg:
    {
        data: Buffer,
        contentType: String
    },
});
  
  
module.exports = new mongoose.model('acts', imageSchema);