const passport = require('passport');
const userSchema = require('./users');
const express = require('express');
const router = express.Router();
const LocalStrategy = require('passport-local').Strategy;
const upload = require('./multer');
const postModel = require('./posts');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

passport.use(new LocalStrategy(userSchema.authenticate()));

router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.get('/edit', isLoggedIn, async (req, res) => {
  const user = await userSchema.findOne({ username: req.session.passport.user });
  res.render('edit', { footer: true, user });
});
router.get('/follow/:userid', isLoggedIn, async function (req, res) {
  let followKarneWaala = await userSchema
    .findOne({ username: req.session.passport.user })

  let followHoneWaala = await userSchema
    .findOne({ _id: req.params.userid })

  if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
    let index = followKarneWaala.following.indexOf(followHoneWaala._id);
    followKarneWaala.following.splice(index, 1);

    let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
    followHoneWaala.followers.splice(index2, 1);
  }
  else {
    followHoneWaala.followers.push(followKarneWaala._id);
    followKarneWaala.following.push(followHoneWaala._id);
  }
  await followHoneWaala.save();
  await followKarneWaala.save();
  console.log("followHoneWaala", followHoneWaala);
  console.log("followKarneWaala", followKarneWaala);
  res.redirect("back");
});
router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userSchema.findOne({ username: req.session.passport.user }).populate('posts');
  res.render('profile', { footer: true, user });
});
router.get('/feed', isLoggedIn, async (req, res) => {
  const posts = await postModel.find().populate("user");
  console.log("posts in feed", posts);
  let user = await userSchema.findOne({ username: req.session.passport.user });
  res.render('feed', { footer: true, posts, user });
});
router.get('/like/post/:id', isLoggedIn, async function (req, res) {
  console.log("req.params.id", req.params.id);
  const post = await postModel.findOne({ _id: req.params.id });
  console.log("post", post);
  const user = await userSchema.findOne({ username: req.session.passport.user });
  if (post.like.indexOf(user._id) === -1) {
    post.like.push(user._id);
  }
  else {
    post.like.splice(post.like.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect('/feed')
})
router.get('/search', isLoggedIn, async function (req, res) {
  let user = await userSchema
    .findOne({ username: req.session.passport.user })
  res.render('search', { footer: true, user });
});
router.get('/search/:user', isLoggedIn, async function (req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);

  let users = await userSchema
    .find({ username: { $regex: regex } })

  res.json(users);
});
router.get('/profile/:user', isLoggedIn, async function (req, res) {
  let user = await userSchema
    .findOne({ username: req.session.passport.user });
  if (user.username == req.params.user) {
    res.redirect('/profile');
  }
  const userprofile = await userSchema.findOne({ username: req.params.user }).populate('posts');
  res.render('userprofile', { footer: true, userprofile, user });
})
router.get('/upload', isLoggedIn, async function (req, res) {
  res.render('upload', { footer: true });
});

router.post('/upload', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userSchema.findOne({ username: req.session.passport.user });
  const { caption } = req.body;
  const posts = await postModel.create({
    caption,
    user: user._id,
  });
  if (req.file) {
    console.log("req.file in upload post", req.file);
    posts.picture = req.file.filename;
  }
  await posts.save();
  user.posts.push(posts._id);
  await user.save();
  res.redirect('/feed');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

router.post('/update', isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userSchema.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });
  if (req.file) {
    console.log("req.file", req.file);
    user.picture = req.file.filename;
  }
  await user.save();
  res.redirect('/profile');
});

router.post('/register', (req, res) => {
  const userData = new userSchema({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  userSchema.register(userData, req.body.password, (err) => {
    if (err) {
      // Handle registration error
      console.error('Registration error:', err);
      return res.render('register', { error: err.message }); // Render a register page with an error message
    }

    passport.authenticate("local")(req, res, () => {
      res.redirect('/profile');
    });
  });

});

module.exports = router;
