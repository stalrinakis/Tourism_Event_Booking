
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    gmap: String,
    travid: String,
    read: String,
    mainimg:
    {
        data: Buffer,
        contentType: String
    },
});
  
  
module.exports = new mongoose.model('travelsug', imageSchema);