var express = require('express');
var router = express.Router();
var Branch = require('../models/branches');
var svgCaptcha = require('svg-captcha');


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.get('/signup', function(req, res, next){
	Branch.getBranch(function(err, branches){
		if(err){throw err};
		var captcha = svgCaptcha.create();
		req.session.captcha = captcha.text;
		res.render('signup', {branches:branches, captcha:captcha.data});
	})
});



module.exports = router;
