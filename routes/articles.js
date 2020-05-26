const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const path = require('path');
const multer=require('multer');

// Bring in Article Model
let Article = require("../models/article");
// Bring in User Model
let User = require("../models/user");

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/article/',
  filename: function(req, file, cb){
    cb('',file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 5000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('file');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb('',true);
  } else {
    cb('Error: Images Only!');
  }
}


// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
	res.render('add_article',{
		title:'Add Article'
	})
});

// Get Single Article
router.get('/:id', ensureAuthenticated, function(req, res){
	Article.findById(req.params.id, function(err, article){
		User.findById(article.author, function(err, user){
			res.render('article', {
				article:article,
				author: user.name
			});
		});
	});
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			req.flash('danger','Not Authorized...');
			res.redirect('/');
		}
		res.render('edit_article',{
			article:article
		});
	});
});

// Update Submit POST Route
router.post('/edit/:id', upload, ensureAuthenticated, [
	check('title','Title is required').notEmpty(),
	check('body','Body is required').notEmpty()
	], function(req, res){
		var file;
		if(req.body.fileCheck != '' && req.file === undefined){
		 	file = path.basename(req.body.fileCheck);
		 }else if(req.file === undefined){
        	file= "noImage";
        }
        else{
        	file=req.file.filename
        }
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.render('edit_article',{
			errors:errors.array()
		});
	} else{
	let article = {};
	article.title=req.body.title;
	article.body=req.body.body;
	article.file=file;

	let query = {_id:req.params.id};
	Article.update(query, article, function(err){
		if(err){
			console.log(err);
			return;
		} else {
			req.flash('success','Article Updated');
			res.redirect('/');
		}
	});
}
});

// Delete Article
router.delete('/:id', ensureAuthenticated, function(req, res){
	let query = {_id:req.params.id};

	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		req.flash('danger','Article Deleted');
		res.send('Success');
	});
});

// Add Submit POST Route
router.post('/add',upload, ensureAuthenticated, [
	check('title','Title is required').notEmpty(),
	check('body','Body is required').notEmpty()
	], function(req, res){
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.render('add_article',{
			title:'Add Article',
			errors:errors.array()
		});
	} else{
	let article = new Article();
	article.title=req.body.title;
	article.author=req.user._id;
	article.body=req.body.body;
	if(req.file === undefined){
        	req.file= "noImage";
        	req.file.filename= "noImage";
        }
    article.file=req.file.filename;
	let userUpdate = {};
		userUpdate.Articles = req.user.Articles + 1;
		let query = {_id:req.user._id};
		User.update(query, userUpdate, function(err){
			if(err){
				console.log(err);
				return;
			} 
		});
	article.save(function(err){
		if(err){
			console.log(err);
			return;
		} else {
			req.flash('success','Article Added');
			res.redirect('/');
		}
	});
}
});

// Access Control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

module.exports = router;
