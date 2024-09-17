
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    region: String,
    date: String,
    time: String,
    price: Number, 
    eventid: String,
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
  
  
module.exports = new mongoose.model('events', imageSchema);