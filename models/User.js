var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quizapp');
var db = mongoose.connection;
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
    username:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required:true,
        bcrypt:true
    },
    usertype:{
        type:String,
        required:true
    },
    branch:{
        type:String
    },
    scores:[{
        date:{
            type:Date
        },
        subject:{
            type:String
        },
        score:{
            type:String
        },
        quizid:{
            type: mongoose.Schema.Types.ObjectId
        },
        catid:{
            type:mongoose.Schema.Types.ObjectId
        }
    }]
});

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.getUserByUsername = function(username, callback){
    username1 = username.toUpperCase();
    User.findOne({username:username1}, callback);
}
module.exports.comparePassword = function(password, candidatePassword, callback){
    bcrypt.compare(candidatePassword, password, function(err, isMatch){
        if(err) return callback(err, false);
        console.log(isMatch);
        return callback(null, isMatch);
    });
    //return callback(null, true);
}

module.exports.getUserById = function(id, callback){
    User.findById({_id:id}, callback);
}

module.exports.createUser = function (newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if(err) throw err;
        newUser.password = hash;
        var username = newUser.username.toUpperCase();
        newUser.username = username;
        newUser.save(newUser, callback);
    });
    //newUser.save(newUser, callback);

};

module.exports.findResultByBranch = function(branch, callback){
    User.find({branch:branch}, callback);
}

module.exports.insertscores = function(id, newScore, callback){
    User.findOneAndUpdate({_id : id}, {$push : {'scores' : newScore}}, {safe:true, upsert:true}, callback);
}

module.exports.findByQuizidAndBranch = function(quizid, branch, callback){
    //this function was made to capitalize usernames
    // User.find({}, function(err, users){
    //     console.log("inside first function");
    //     for(var key in users){
    //         if( true){
    //             var user = users[key];
    //             user.username = user.username.toUpperCase();
    //             user.save(function(err){
    //                 if(err)throw err;
    //             });
    //         }
            
    //     }
    // });
    User.find({
        branch:branch,
        "scores.quizid" : quizid
    },{
        username:1,
        "scores.$":1
    }).sort('username').exec(callback);
}