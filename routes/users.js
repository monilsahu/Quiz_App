var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Quiz = require('../models/Quiz');
var Ques = require('../models/questions');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
	Quiz.getActiveQuizzes(req.user, function(err, quizzes){
		if(err){throw err};
		console.log(quizzes); 
		res.render('user', {
			user: req.user,
			quizzes:quizzes
		});
	});
});


passport.serializeUser(function(user, done) {
    console.log('user serialized');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});



passport.use(new LocalStrategy(
    function (username, password, done) {
		//console.log("local starrategy vcalloed");
        User.getUserByUsername( username, function (err, user) {
			console.log("username  called");
			if(err) return done(err);
			console.log(user);
            if(!user){
				console.log("user not found");
                return done(null, false, {message: 'User with this username does not exist'});
            }

            User.comparePassword(user.password, password, function (err, isMatch) {
				console.log("compare password called");
				if(err) throw err;
				console.log("no errrrrrrrrrrrrr called");
                if(!isMatch){
					//console.log("ismatch called");
                    return done(err, false, {message:'Incorrect Password'});
                }
				//console.log("password matched called");
                return done(null, user);
            });
        });
    }
));


router.post('/login', function(req, res, next){
	
		var username = req.body.username;
		var password = req.body.password;
		console.log(username);
		console.log(username);
		console.log(password);
		console.log("login route is called");
	
	
		passport.authenticate('local', function(err, user, info) {
			if (err) { return next(err); }
			if (!user) { 
				console.log("^^^^^^^^^^^^^^^^^^^^^^^^^");
				console.log(user);
				return res.send({
					success: false,
					msg:"this username does not exits"
				});
			}
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				if(user.usertype == "admin")	{
					res.redirect('/admin');
				}else{
					res.redirect('/users/')
				}
			});
		})(req, res, next);
	});

router.get('/startquiz/:quizid', function(req, res, next){
	var quizid = req.params.quizid;
	console.log(quizid);
	Quiz.getQuizName(quizid, function(err, quiz){
		if(err)throw err;
		var catid = quiz.catid;
		console.log(catid);
		Ques.getQuesByCat(catid, function(err, ques){
			console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
			console.log(ques);
			if(err){throw err};
			//res.render('takequiz', {ques:ques});
			var data = {
				ques:ques,
				quizid:quiz._id,
				catid:catid,
				duration:quiz.duration
			}
			console.log(data);
			res.send(data);
		});
	});
});

router.get('/takequiz', function(req, res, next){
	res.render('takequiz');
})


router.post('/signup', function(req, res, next){
	var username = req.body.username.toUpperCase();
	var password = req.body.password;
	var password2 = req.body.password2;
	var branch = req.body.branch;
	var usertype = "user";
	var captcha = req.body.captcha;
	
	req.checkBody('username', 'username field is required').notEmpty();
	req.checkBody('password', 'password field is required').notEmpty();
	req.checkBody('password2', 'confirm password field is required').notEmpty();
	req.checkBody('captcha','You entered the wrong captcha').equals(req.session.captcha);

	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if(user){
			res.send("this username already exists");
		}else{

		
			var errors = req.validationErrors();

			if(errors){
				console.log(errors);
				console.log(req.session.captcha);
				req.flash('error', 'there was some error with the signup process');
				res.send('there was some validation error');
			}else{
				var newUser = new User({	
					username: username,
					password:password,
					usertype:usertype,
					branch:branch
				});


				User.createUser(newUser, function(err, user){
					if (err) throw err;
					console.log(user);
					//res.send('user was created');
					res.redirect('/');
				});
			}
		}
	});

});

router.get('/endquiz', function(req, res, next){
	
})

router.post('/endquiz', function(req, res, next){
	var score = req.body.score;
	var subject = req.body.subject;
	var date = Date.now();
	var id = req.user._id;
	var quizid = req.body.quizid;
	var catid = req.body.catid;


	console.log(req.body.quizid);
	console.log(req.body.subject);
	var newScore = {
		score:score,
		subject: subject,
		date:date,
		quizid:quizid,
		catid:catid
	};

	console.log(newScore);

	User.insertscores(id, newScore, function(err, data){
		if(err){throw err};
		res.send(score);
	});
})

function isAuthenticated(req,res, next){
	if(req.isAuthenticated()){return next()}
	else{
		res.redirect('/login');
	}
}

module.exports = router;