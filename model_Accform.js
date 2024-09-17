
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    book: String,
});
  
  
module.exports = new mongoose.model('accbooks', imageSchema);