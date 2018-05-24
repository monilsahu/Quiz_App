var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quizapp');
var db = mongoose.connection;

var BranchesSchema = mongoose.Schema({
    branch:{
        type:String,
        required: true
    }
});

var Branch = module.exports = mongoose.model('Branch', BranchesSchema);


module.exports.addBranch = function(BranchObj, callback){
    BranchObj.save(BranchObj, callback);
}

module.exports.getBranch = function(callback){
    console.log("getBranch caled");
    Branch.find({}, callback);
}

module.exports.delBranch = function(id, callback){
    Branch.findByIdAndRemove(id, callback);   
}
