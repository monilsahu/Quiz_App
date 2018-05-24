var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quizapp');
var db = mongoose.connection;

var CategorySchema = mongoose.Schema({
    cat:{
        type:String,
        required: true
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId
    }
});

var Cat = module.exports = mongoose.model('Cat', CategorySchema);


module.exports.addCat = function(CatObj, callback){
    CatObj.save(CatObj, callback);
}

module.exports.getCat = function(user, callback){
    console.log("getCat caled");
    Cat.find({admin:user._id}, callback);
}

module.exports.delCat = function(id, callback){
    Cat.findByIdAndRemove(id, callback);   
}
