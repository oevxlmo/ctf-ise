const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const session = require("express-session");
const flash = require("connect-flash");
const PORT = process.env.PORT || 5000;
// Initialize Firebase Admin with the service account key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ctf-ise.firebaseio.com",
});

// Session setup
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use 'true' in production with HTTPS
  })
);

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
  req.flash("error", "You must log in first!");
  res.redirect("/login");
}

function blockIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    req.flash(
      "error",
      "You are currently logged in. Logout first to access this page."
    );
    return res.redirect("/challenges");
  }
  next();
}

// Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const challenges = [
  {
    id: 1,
    title: "Challenge 1",
    description: "Solve this CTF challenge to earn points!",
    points: 10,
    problem_statement: "Lorem Ipsum is simply dummy text.",
    category: "Easy",
  },
  {
    id: 2,
    title: "Challenge 2",
    description: "Another challenge awaits you.",
    points: 20,
    problem_statement: "This is the problem statement for challenge 2.",
    category: "Medium",
  },
  {
    id: 3,
    title: "Challenge 3",
    description: "Complete this to increase your score.",
    points: 30,
    problem_statement: "This is the problem statement for challenge 3.",
    category: "Hard",
  },
];

// Routes
app.get("/", (req, res) => {
  res.render("index", { challenges });
});

app.get("/challenges", isAuthenticated, (req, res) => {
  res.render("challenges", { challenges });
});

app.get("/challenge/:id", isAuthenticated, (req, res) => {
  const challengeId = parseInt(req.params.id);
  const challenge = challenges.find((c) => c.id === challengeId);
  if (challenge) {
    res.render("challengeDetail", { challenge });
  } else {
    req.flash("error", "Challenge not found!");
    res.redirect("/challenges");
  }
});

// Flag submission route
app.post('/challenge/:id/submit', isAuthenticated, async (req, res) => {
    const challengeId = req.params.id; // ID of the challenge
    const submittedFlag = req.body.flag; // User's submitted flag
    const userId = req.session.user.uid; // User's ID from the session

    try {
        // Fetch the challenge data
        const challengeDoc = await admin.firestore().collection('challenges').doc(challengeId).get();

        if (!challengeDoc.exists) {
            req.flash('error', 'Challenge not found!');
            return res.redirect(`/challenge/${challengeId}`);
        }

        const challengeData = challengeDoc.data();

        // Fetch user data
        const userRef = admin.firestore().collection('users').doc(userId);

        await admin.firestore().runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found!');
            }

            const userData = userDoc.data();
            const completedChallenges = userData.completedChallenges || [];

            // Check if the challenge is already completed
            if (completedChallenges.includes(challengeId)) {
                req.flash('error', 'You have already solved this challenge!');
                return;
            }

            // Check if the submitted flag is correct
            if (submittedFlag === challengeData.correct) {
                const currentPoints = userData.points || 0;
                const newPoints = currentPoints + challengeData.points;

                // Update user's points and mark the challenge as completed
                completedChallenges.push(challengeId);

                transaction.update(userRef, {
                    points: newPoints,
                    completedChallenges: completedChallenges
                });

                req.flash('success', `Correct flag! You earned ${challengeData.points} points.`);
            } else {
                req.flash('error', 'Incorrect flag. Try again!');
            }
        });
    } catch (error) {
        console.error('Error validating flag or updating points:', error);
        req.flash('error', 'An error occurred. Please try again later.');
    }

    res.redirect(`/challenge/${challengeId}`);
});


// Leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({ username: userData.username, points: userData.points || 0 });
    });

    users.sort((a, b) => b.points - a.points);
    res.render("leaderboard", { user: req.session.user, users });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    req.flash("error", "Failed to load leaderboard.");
    res.redirect("/");
  }
});

// Login/Logout Routes
app.get("/login", blockIfAuthenticated, (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    req.session.user = {
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      email: userRecord.email,
    };

    res.redirect("/challenges");
  } catch (error) {
    req.flash("error", "Invalid email or password!");
    res.redirect("/login");
  }
});

app.get("/register", blockIfAuthenticated, (req, res) =>
  res.render("register")
);
app.post("/register", async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match!");
    return res.redirect("/register");
  }

  try {
    const userRecord = await admin
      .auth()
      .createUser({ email, password, displayName: name });
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      username,
      email,
      displayName: name,
      points: 0,
    });

    req.flash("success", "Registration successful! Please login.");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Registration failed. Try again!");
    res.redirect("/register");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Failed to logout");
    res.redirect("/");
  });
});

app.get("/write-ups", (req,res) =>{
  res.render('write-ups');
})

app.get("/*", (req, res) => res.status(404).render("notfound"));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
