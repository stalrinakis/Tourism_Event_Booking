
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    title: String,
    subj: String,
    accid: String,
    cat: String,
    rooms: Number,
    ssb: Number,
    dsb: Number,
    guests: Number,
    price: Number,
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
  
  
module.exports = new mongoose.model('accos', imageSchema);