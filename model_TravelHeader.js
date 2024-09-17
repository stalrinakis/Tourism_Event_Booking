
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    headid: String,
    mainimg:
    {
        data: Buffer,
        contentType: String
    },
});
  
  
module.exports = new mongoose.model('travelHeader', imageSchema);