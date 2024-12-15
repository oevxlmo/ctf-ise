const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const session = require('express-session');
const flash = require('connect-flash');

// Initialize Firebase Admin with the service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ctf-ise.firebaseio.com'
});

// Session setup
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use 'true' in production with HTTPS
}));

// Setup flash messages
app.use(flash());

// Middleware to make flash messages available globally
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session.user || null; // Make user available in templates
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // User is logged in, proceed
    }
    req.flash('error', 'You must log in first!');
    res.redirect('/login');
}

// Middleware to block authenticated users from accessing login/register
function blockIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        req.flash('error', 'You are currently logged in. Logout first to access this page.');
        return res.redirect('/challenges');
    }
    next();
}

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Challenges array
const challenges = [
    { id: 1, title: 'Challenge 1', description: 'Solve this CTF challenge to earn points!', points: 10, problem_statement: "Lorem Ipsum is simply dummy text.", category: 'Easy' },
    { id: 2, title: 'Challenge 2', description: 'Another challenge awaits you.', points: 20, problem_statement: 'This is the problem statement for challenge 2.', category: 'Medium' },
    { id: 3, title: 'Challenge 3', description: 'Complete this to increase your score.', points: 30, problem_statement: 'This is the problem statement for challenge 3.', category: 'Hard' }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', { challenges });
});

app.get('/challenges', isAuthenticated, (req, res) => {
    res.render('challenges', { challenges });
});

app.get('/leaderboard', async (req, res) => {
    const db = admin.firestore();

    try {
        // Fetch users from Firestore
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            users.push({
                username: userData.username,
                points: userData.points || 0, // Default to 0 if not set
            });
        });

        // Sort users by points in descending order
        users.sort((a, b) => b.points - a.points);

        // Render leaderboard page
        res.render('leaderboard', { user: req.session.user, users });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        req.flash('error', 'Failed to load leaderboard.');
        res.redirect('/');
    }
});


app.get('/challenge/:id', isAuthenticated, (req, res) => {
    const challengeId = parseInt(req.params.id);
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
        res.render('challengeDetail', { challenge });
    } else {
        res.status(404).render('notfound');
    }
});

app.get('/login', blockIfAuthenticated, (req, res) => {
    res.render('login');
});

app.get('/register', blockIfAuthenticated, (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { name, username, email, password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match!');
        return res.redirect('/register');
    }

    // Check if all required fields are provided
    if (!name || !username || !email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required!');
        return res.redirect('/register');
    }

    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // Optionally store username in Firebase database or Firestore
        const db = admin.firestore();
        await db.collection('users').doc(userRecord.uid).set({
            username: username,
            email: email,
            displayName: name,
            points: 0, // Initialize points to 0 for leaderboard
        });

        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);

        // Handle specific Firebase error codes
        if (error.errorInfo && error.errorInfo.code === 'auth/email-already-exists') {
            req.flash('error', 'The email address is already in use by another account.');
        } else {
            req.flash('error', 'Failed to register user. Try again!');
        }

        res.redirect('/register');
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        req.session.user = {
            uid: userRecord.uid,
            displayName: userRecord.displayName,
            email: userRecord.email
        };
        res.redirect('/challenges');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Invalid email or password!');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/');
    });
});

app.get('/*', (req, res) => {
    res.status(404).render('notfound');
});

// Start the server
app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
