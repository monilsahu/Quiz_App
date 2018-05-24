var express = require('express');
var router = express.Router();
var docx = require("docx");
var officegen = require('officegen');
var User = require('../models/User');
var Ques = require("../models/questions");
var Quiz = require('../models/Quiz');
var Cat = require('../models/Category.js');
var Branch = require('../models/branches');

router.get('/', isAuthenticated, function(req, res){
    res.render('admin');
});

router.get('/viewques', function(req, res, next){
    Cat.getCat(req.user, function(err, cat){
        if(err){throw err};
        res.render('viewquesform', {cats: cat});
    });    
});

router.get('/viewques/:catid', function(req, res, next){
    var catid = req.params.catid;
    console.log(catid);
    Ques.getQuesByCat(catid, function(err, ques){
        if(err){throw err};
        console.log(ques);
        res.render('adminque', {ques:ques})
    });
})

router.get('/addadmin', function(req, res, next){
    res.render('addadmin');
})

router.post('/addadmin', function(req, res, next){
	var username = req.body.username.toUpperCase();
	var password = req.body.password;
	var password2 = req.body.password2;
	var usertype = "admin";
	
	req.checkBody('username', 'username field is required').notEmpty();
	req.checkBody('password', 'password field is required').notEmpty();
	req.checkBody('password2', 'confirm password field is required').notEmpty();

    User.getUserByUsername(username, function(err, user){
        console.log("username check called");
        if(err) throw err;
        if(user){
            console.log("user found");
            res.end("this username already exists");
        }else{

        

            var errors = req.validationErrors();

            if(errors){
                req.flash('error', 'there was some error with the signup process');
                console.log(errors);
                res.send('there was some validation error');
            }else{
                var newUser = new User({	
                    username: username,
                    password:password,
                    usertype:usertype
                });


                User.createUser(newUser, function(err, user){
                    if (err) throw err;
                    console.log(user);
                    //res.send('admin was created');
                    res.redirect('/admin')
                });
            }
        }
    });

});

router.get('/addques', function(req, res, next){
    Cat.getCat(req.user, function(err, cats){
        console.log(cats);
        res.render('addques', {cats:cats});
    })
    
});

router.post('/addques', function(req, res, next){
    var ques = req.body.ques;
    var op1 = req.body.op1;
    var op2 = req.body.op2;
    var op3 = req.body.op3;
    var op4 = req.body.op4;
    var ans = req.body.ans;
    var cat = req.body.cat;

    console.log(req.body);


    var newQues =new Ques ({
        ques:ques,
        op1:op1,
        op2:op2,
        op3:op3,
        op4:op4,
        ans:ans,
        cat:cat
    });
    console.log(newQues);


    req.checkBody('ques', 'ques should not be empty').notEmpty();
    req.checkBody('op1', 'op1 should not be empty').notEmpty();
    req.checkBody('op2', 'op2 should not be empty').notEmpty();
    req.checkBody('op3', 'op3 should not be empty').notEmpty();
    req.checkBody('op4', 'op4 should not be empty').notEmpty();
    req.checkBody('ans', 'answer should not be empty').notEmpty();
    req.checkBody('cat', 'category should not be empty').notEmpty();


    var errors = req.validationErrors();
    console.log(newQues);
    console.log(errors);
    if(errors){
        res.render('addques', {ques:newQues});
    }else{
        Ques.addques(newQues, function(err, ques){
            if(err) throw err;
            //res.send('the ques was added to db' + ques);
        });
        res.redirect('/admin');
    }    

});

router.get('/addcat', function(req, res, next){
    Cat.getCat(req.user, function(err, cats){
        if(err)throw err;
        res.render('addcategory',{cats:cats});
    })
    
});

router.post('/addcat', function(req, res, next){
    var cat = req.body.cat;

    req.checkBody('cat', 'cat should not be empty').notEmpty();
    
    var newCat =new Cat ({
        cat:cat,
        admin:req.user._id
    });

    var errors = req.validationErrors();
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(newCat);
    console.log(errors);
    if(errors){
        res.render('addcat', {cat:newCat});
    }else{
        Cat.addCat(newCat, function(err, cat){
            if(err) throw err;
            //res.send('the ques was added to db' + ques);
        });
        res.redirect('/admin');
    }    

});

router.delete('/deletecat/:id', function(req, res){
    var id = req.params.id;
    Cat.delCat(id, function(err, cat){
        if(err)throw err;
    })
})

router.get('/addquiz', function(req, res, next){
    Cat.getCat(req.user, function(err, cats){
        if(err) {throw err};
        Quiz.getActive(req.user, function(err, quizzes){
            for(var key in cats){
                for(var l in quizzes){
                    if(cats[key].cat == quizzes[l].quizname){
                        cats.splice(key, 1);
                    }
                }
            }
            console.log(cats);
            console.log(quizzes);
            res.render('addquiz', {
                cats : cats,
                quizzes : quizzes
            });
        })
        
    });
});



router.get('/addquiz/:quizname/:catid', function(req, res, next){
    var catid = req.params.catid;
    var quizname = req.params.quizname;
    Ques.getQuesByCat(catid, function(err, ques){
        if(err){throw err};
        Branch.getBranch(function(err, branches){
            if(err)throw err;
            console.log(branches);
            res.render('viewquiz', {
                ques:ques,
                topic:quizname,
                branches:branches,
                catid:catid
            });
        })        
    });
});


router.post('/addquiz', function(req, res, next){
    var quizname = req.body.quizname;
    var duration = req.body.duration || 30;
    var branch = req.body.branch;
    var branch = req.body.branch;
    var catid = req.body.catid;

    req.checkBody('quizname',' Quizname cannot be empty').notEmpty();
    
    var newQuiz = new Quiz({
        quizname: quizname,
        duration: duration,
        branch:branch,
        admin:req.user._id,
        catid:catid
    });
    console.log(newQuiz);
    console.log("addquiz functoin is called");
    Quiz.addQuiz(newQuiz, function(err, quiz){
        if(err) {return res.send("the quiz cannot be added")};
        console.log(quiz);
        console.log("res is ready to be sent");
        res.redirect('/admin/addquiz')
    })
});

router.delete('/delete/:id', function(req, res, next){
    var id = req.params.id;
    Ques.delques(id, function(err){
        if(err){
            throw err;
        }
        res.send('Ques deleted successfully');
    });
});

router.delete('/deletequiz/:id', function(req, res, next){
    var id = req.params.id;
    Quiz.delquiz(id, function(err){
        if(err){
            throw err;
        }
        res.send('Ques deleted successfully');
    });
});

router.get('/viewscores', function(req, res, next){
    Branch.getBranch(function(err, branches){
        console.log(branches);
        res.render('adminresult', {branches:branches});
    });
})

router.get('/viewscores/:branch', function(req, res, next){
    var branch = req.params.branch;
    console.log(branch);
    Quiz.findWithBranch(branch, function(err, results){
        console.log(results);
        res.render('adminresult', {branch:branch, subjects:results})
    })
})


router.get('/viewscores/:branch/:quizid', function(req, res){
    var quizid = req.params.quizid;
    var branch = req.params.branch;
    User.findByQuizidAndBranch(quizid, branch, function(err, results){
        if(err)throw err;
        console.log(results);
        res.render('adminresult', {results:results});
    });
})

router.get('/addbranch', function(req, res, next){
    Branch.getBranch(function(err, branches){
        res.render('addbranch', {branches: branches});
    })
})

router.post('/addbranch', function(req, res, next){
    var branch = req.body.branch;
    
    req.checkBody('branch', 'branch should not be empty').notEmpty();
    
    var newBranch =new Branch ({
        branch:branch
    });

    var errors = req.validationErrors();
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(newBranch);
    console.log(errors);
    if(errors){
        res.render('addbranch', {branch:newBranch});
    }else{
        Branch.addBranch(newBranch, function(err, branch){
            if(err) throw err;
            //res.send('the ques was added to db' + ques);
        });
        res.redirect('/admin');
    }  
})

router.delete('/deletebranch/:id', function(req, res, next){
    var id = req.params.id;
    Branch.delBranch(id, function(err){
        if(err){
            throw err;
            res.send(false);
        }
        res.send(true);
    });
});


function  isAuthenticated(req, res, next){
    if(!req.user){
        res.redirect('/');
    }
    if(req.isAuthenticated && req.user.usertype == "admin"){
        return next();
    }
    res.redirect('/');
}

router.get('/quesdocx', function(req, res, next){
    Quiz.getActive(req.user, function(err, quizzes){
        res.render('quizresultdownload', {
            quizzes:quizzes
        })
    })
})

router.get('/quesdocx/:quizname/:quizid/:branch', function(req, res){
    

    var quizname = req.params.quizname;
    var quizid = req.params.quizid;
    var branch = req.params.branch;
    Ques.getQuesByCat(quizid, function(err, results){
        User.findByQuizidAndBranch(quizid, branch, function(err, userresults){
            if(err)throw err;
            var docx = officegen('docx');
            var q=1;
            var pObjx = docx.createP();
            pObjx.addText ( 'QUESTIONS', { bold: true, underline: true } );
            for(var key in results){
                var pObj = docx.createP();
                var pObj1 = docx.createP();
                var pObj2 = docx.createP();
                var pObj3 = docx.createP();
                var pObj4 = docx.createP();
                var pObj5 = docx.createP();
                var pObj6 = docx.createP();
                pObj1.addText("Q" + q + ". " + results[key].ques )
                pObj2.addText("a) " + results[key].op1);
                pObj3.addText("b) " + results[key].op2);
                pObj4.addText("c) " + results[key].op3);
                pObj5.addText("d) " + results[key].op4);
                pObj6.addText("ans: " + results[key].ans);
                pObj.addLineBreak();
                q++;
            }
            function formatDate(date) {
                var monthNames = [
                "Jan", "Feb", "March",
                "Apr", "May", "Jun", "Jul",
                "Aug", "Sept", "Oct",
                "Nov", "Dec"
                ];
            
                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();
            
                return day + ' ' + monthNames[monthIndex] + ' ' + year;
            }

            docx.putPageBreak();

            var table = [
                [{
                    val: "S.No.",
                    opts: {
                        align: "center",
                        vAlign: "center",
                        cellColWidth: 20,
                        b:true,
                        color:"000",
                        sz: '25',
                        shd: {
                        fill: "ffffff"
                        }
                    }
                },{
                    val: "Enrollment No.",
                    opts: {
                        align: "center",
                        vAlign: "center",
                        color:"000",
                        cellColWidth: 20,
                        b:true,
                        sz: '20',
                        shd: {
                        fill: "ffffff"
                        }
                    }
                },{
                    val: "Subject",
                    opts: {
                        align: "center",
                        vAlign: "center",
                        color:"000",
                        cellColWidth: 20,
                        b:true,
                        sz: '20',
                        shd: {
                        fill: "ffffff"
                        }
                    }
                },{
                    val: "Date",
                    opts: {
                        align: "center",
                        vAlign: "center",
                        color:"000",
                        cellColWidth: 20,
                        b:true,
                        sz: '20',
                        shd: {
                        fill: "ffffff"
                        }
                    }
                },{
                    val: "Scores",
                    opts: {
                        align: "center",
                        vAlign: "center",
                        color:"000",
                        cellColWidth: 20,
                        b:true,
                        sz: '20',
                        shd: {
                        fill: "ffffff"
                        }
                    }
                }],
            ]
            q = 1;
            for(var l in userresults){
                var x = [ 
                    {
                        "val":q, 
                        "opts":{
                            align: "center",
                            vAlign: "center",
                            color:"000",
                            cellColWidth: 20,
                            b:true,
                            sz: '20',
                            shd: {
                            fill: "ffffff"
                            }
                        }
                    }, 
                    {
                        "val":userresults[l].username,
                        "opts":{
                            align: "center",
                            vAlign: "center",
                            color:"000",
                            cellColWidth: 20,
                            b:true,
                            sz: '20',
                            shd: {
                            fill: "ffffff"
                            }
                        }, 
                    },
                    {
                        "val":userresults[l].scores[0].subject,
                        "opts":{
                            align: "center",
                            vAlign: "center",
                            color:"000",
                            cellColWidth: 20,
                            b:true,
                            sz: '20',
                            shd: {
                            fill: "ffffff"
                            }
                        }
                    },{
                        "val":formatDate(userresults[l].scores[0].date),
                        "opts":{
                            align: "center",
                            vAlign: "center",
                            color:"000",
                            cellColWidth: 20,
                            b:true,
                            sz: '20',
                            shd: {
                            fill: "ffffff"
                            }
                        }
                    },{
                        "val":userresults[l].scores[0].score,
                        "opts":{
                            align: "center",
                            vAlign: "center",
                            color:"000",
                            cellColWidth: 20,
                            b:true,
                            sz: '20',
                            shd: {
                            fill: "ffffff"
                            }
                        }
                    }
                ];
                table.push(x);
                q++;
            }
            
            var tableStyle = {
                tableColWidth: 2000,
                tableSize: 25,
                tableColor: "fff",
                tableAlign: "center",
                color:"000",
                tableFontFamily: "Comic Sans MS",
                borders: true,
                background:"fff"
            }
            
            docx.createTable (table, tableStyle);


            res.writeHead ( 200, {
                "Content-Type": "application/vnd.openxmlformats-officedocument.documentml.document",
                'Content-disposition': 'attachment; filename=' + quizname + formatDate(new Date()) + '.docx'
            });
            docx.generate(res);
        });
    })
})

function formatDate(input) {
    var date = new Date(input);
    return [
       ("0" + date.getDate()).slice(-2),
       ("0" + (date.getMonth()+1)).slice(-2),
       date.getFullYear()
    ].join('/');
}

module.exports = router;