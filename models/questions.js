var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quizapp');
var db = mongoose.connection;

var QuestionSchema = mongoose.Schema({
    ques:{
        type:String,
        required: true
    },
    op1:{
        type:String,
        required:true
    },
    op2:{
        type:String,
        required:true
    },
    op3:{
        type:String,
        required:true
    },
    op4:{
        type:String,
        required:true
    },
    ans:{
        type:String,
        required:true
    },
    cat:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
});

var Ques = module.exports = mongoose.model('Ques', QuestionSchema);


module.exports.addques = function(quesObj, callback){
    quesObj.save(quesObj, callback);
}

module.exports.getQuesByCat = function(cat, callback){
    Ques.find({cat:cat}).exec(callback);
}

module.exports.getques = function(callback){
    console.log("getques caled");
    Ques.find({}, callback);
}

module.exports.delques = function(id, callback){
    Ques.findByIdAndRemove(id, callback);   
}
