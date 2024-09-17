
// Step 3 - this is the code for ./models.js
 /* 
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
  
//Image is a model which has a schema imageSchema
  
module.exports = new mongoose.model('Image', imageSchema);*/

// Step 3 - this is the code for ./models.js
  
var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    user: String,
    subj: String,
    rate: String,
    revid: String,
    date: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
  
//Image is a model which has a schema imageSchema
  
module.exports = new mongoose.model('revs', imageSchema);