var express = require('express');
var router = express.Router();
var userhelper = require('../helpers/userhelpers');
const { check, validationResult } = require('express-validator');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'event.tedkochi@gmail.com',
    pass: 'hcetxlerqvdrqlie'
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.loggedIn == true) {
    res.redirect('/payment');
  } else {
    res.render('login', { title: "Login/Register" });
  }
});

router.get('/payment', function(req, res, next) {
  if(req.session.loggedIn == true) {
    userhelper.checkPaid(req.session.email, (result) => {
      if(result) {
        res.redirect('/videos');
      } else {
        res.render('payment', {title: "Payment Page"});
      }
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/signup', [check('name').isLength({min: 1}).withMessage("Name is Required"), check('email').isEmail().withMessage("Invalid Email"), check('phone').isMobilePhone().withMessage("Invalid Phone"), check('password').isLength({min: 6}).withMessage("Password Must be At Least 6 Characters"), check('profession').isLength({min: 1}).withMessage("Profession is Required"), check('city').isLength({min: 1}).withMessage("City is Required")], (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.redirect('/', { error: errors.mapped()});
  } else {
    userhelper.addUser(req.body, (result) => {
      req.session.loggedIn = true;
      req.session.email = req.body.email;	
      console.log("Here");
      res.redirect("/payment");
      /*var mailOptions = {
        from: "event.tedkochi@gmail.com",
        to: req.body.email,
        subject: "Look who We hooked in!!",
        text: "Yo! first of all congratulations for having absolutely amazing taste in life, and we are here to fill the bill for the connoisseur before us. We are mirthful to have you with us, and we just know that this journey is going to make a hit and will be very 'delicious' for the seeker in you, Lessgo..!\nStay tuned bestie! Welcome to the clan.\nDo check out our Brochure to get more insights.",
        attachments: [
          {
            path: "/attachments/logo.jpeg"
          },
          {
            path: "/attachments/brochure.pdf"
          }
        ]
      }
      transporter.sendMail(mailOptions, function(error, info) {
	console.log(error);
        if(error) {
          res.render('index', { senderror: true, default: true });
        } else {
          res.redirect('/payment');
        }
      });*/
    });
  }
});

router.post('/loginsubmit', [check('email').isEmail().withMessage("Invalid Email"), check('password').isLength({min: 6}).withMessage("Invalid Password")], (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('login', { error: errors.mapped() });
  } else {
    userhelper.loginUser(req.body, (result, paid, admin) => {
      if(admin) {
        req.session.loggedIn = true;
        req.session.email = "admin";
        res.redirect('/admin');
      }else if(result && paid) {
        req.session.loggedIn = true;
        req.session.email = req.body.email;
        res.redirect('/videos');
      } else if(result) {
        req.session.loggedIn = true;
        req.session.email = req.body.email;
        res.redirect('/payment')
      } else {
        res.render('login', {error: true});
      }
    });
  }
});

module.exports = router;
