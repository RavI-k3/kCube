const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));
app.use(express.static('public'))
app.use(express.static(__dirname));
app.use('/assets',express.static(__dirname))

mongoose.connect('mongodb://127.0.0.1:27017/KCUBE');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const CourseSchema = new mongoose.Schema({
    title: String,
    description: String
});

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

// Define routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/userprofile', (req, res) => {
    res.sendFile(__dirname + '/userprofile.html');
});

app.get('/userprofile/payment', (req, res) => {
    res.sendFile(__dirname + '/payment.html');
});

app.post('/signup', async (req, res) => {
    try {
       const newUser = new User(req.body);
       await newUser.save();
   
       // Send confirmation email
       const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
           user: 'kalliudaykiran@gmail.com',
           pass: 'P@ssw0rd@2208',
         },
       });
   
       const mailOptions = {
         from: 'P@ssw0rd@2208',
         to: newUser.email,
         subject: 'Account Verification',
         text: 'Please verify your account by clicking the link: http://localhost:3000/verify/' + newUser.username,
       };
   
       transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
           console.log(error);
         } else {
           console.log('Email sent: ' + info.response);
         }
       });
   
       res.status(201).send(newUser);
    } catch (error) {
       if (error.name === 'ValidationError') {
         return res.status(400).send(error.message);
       }
       res.status(500).send(error.message);
    }
   });
   
   // Verify Account
   app.get('/verify/:username', async (req, res) => {
    try {
       const user = await User.findOne({ username: req.params.username });
       if (!user) return res.status(400).send('Invalid username.');
   
       user.isVerified = true;
       await user.save();
       res.status(200).send('Account verified.');
    } catch (error) {
       res.status(500).send(error.message);
    }
   });

app.post('/login', async (req, res) => {
    // Find the user in the database by username and password
    const user = await User.findOne({ username: req.body.username, password: req.body.password });

    if (user) {
        // Store the user's ID in the session for future use
        req.session.userId = user._id;

        res.redirect('/userprofile');
    } else {
        res.redirect('/login');
    }
});

app.get('/api/userprofile', async (req, res) => {
    // Get the user's courses from the database using the user's ID stored in the session
    const user = await User.findById(req.session.userId).populate('courses');

    res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));