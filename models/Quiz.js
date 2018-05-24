var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quizapp');
var db = mongoose.connection;

var QuizSchema = mongoose.Schema({
    quizname:{
        type:String,
        required:true
    },
    catid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
});

var Quiz = module.exports = mongoose.model('Quiz', QuizSchema);

module.exports.addQuiz = function(newQuiz, callback){
    newQuiz.save(newQuiz, function(err, quiz){
        if(err){throw err};
        console.log("quiz save called");
        console.log(quiz);
        return callback(null, quiz);
    });
}

module.exports.getActiveQuizzes = function(user, callback){
    var ignore = [];
    console.log(user.scores);
    if(user.scores.length > 0){
        for( var key in user.scores){
            ignore.push(user.scores[0].catid);
        }
    }
    Quiz.find({catid:{$nin : ignore}, branch:{$eq : user.branch}}, {}, callback);
}

module.exports.getActive = function(user, callback){
    Quiz.find( { admin:{$eq : user._id} } , callback);
}

module.exports.delquiz = function(id, callback){
    Quiz.findOneAndRemove({_id:id}, callback);
}

module.exports.getQuizName = function(id, callback){
    Quiz.findOne({_id:id}, callback);
}
module.exports.findWithBranch = function(branch, callback){
    Quiz.find({branch:branch}, {}, callback);
}