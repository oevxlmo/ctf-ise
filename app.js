const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');

// Use cookie-parser middleware to parse cookies
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Check if all required Firebase environment variables are set
const requiredFirebaseEnvVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID', 
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
];

const missingEnvVars = requiredFirebaseEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar].includes('your-'));

if (missingEnvVars.length > 0) {
  console.error('❌ Firebase configuration incomplete!');
  console.error('Missing or placeholder environment variables:', missingEnvVars);
  console.error('\n📝 To run this application, you need to:');
  console.error('1. Create a Firebase project at https://console.firebase.google.com/');
  console.error('2. Enable Firestore and Authentication services');
  console.error('3. Go to Project Settings > Service Accounts');
  console.error('4. Generate a new private key (JSON file)');
  console.error('5. Update the .env file with your Firebase credentials');
  console.error('\n🔍 Check the .env file and replace all placeholder values with your actual Firebase credentials.');
  process.exit(1);
}

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix newline formatting
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  console.error('\n🔍 Please check your Firebase credentials in the .env file');
  process.exit(1);
}

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
app.use(express.static("public"));

app.set("view engine", "ejs");

const challenges = [
  {
    id: 1,
    title: "Challenge 1",
    description: "You foresaw it before the event commenced",
    points: 10,
    problem_statement: "ಮುಂಬರುವ ಮೇಘಗಳನ್ನೇ ನೋಡಿ ಮಳೆ ಅನುಮಾನಿಸಬೇಕು",
    category: "Easy",
  },
  {
    id: 2,
    title: "Challenge 2",
    description: "ZmxhZ3s2YTZ5X2tvXzZhc2VfOWFzYW5kX2hhaX0=",
    points: 20,
    problem_statement: "8^2",
    category: "Easy",
  },
  {
    id: 3,
    title: "Challenge 3",
    description: "I Dictate the Crawlers",
    points: 30,
    problem_statement: "Henna ❌ Henn na ✅",
    category: "Medium",
  },
  {
    id: 4,
    title: "Challenge 4",
    description: "Sir M. Visvesvaraya wants to meet Stegan San!",
    points: 40,
    problem_statement: "Hidden truths of UVCE",
    category: "Medium",
    filePath: "./public/files/uvce.jpg",
  },
  {
    id: 5,
    title: "Challenge 5",
    description: "",
    points: 50,
    problem_statement: "ಕೇಳಿದ್ದು ಸುಳ್ಳಾಗ ಬಹುದು, ನೋಡಿದ್ದು ಸುಳ್ಳಾಗ ಬಹುದು",
    category: "Hard",
    filePath: "./public/files/flag.wav",
  },
  {
    id: 6,
    title: "Challenge 6",
    description: "Decode the color palette. (P.S: coders have an upperhand)",
    points: 50,
    problem_statement: "naagin bolti hai, juice PILa do",
    category: "Hard",
    filePath: "./public/files/color_img.png",
  },
  {
    id: 7,
    title: "Challenge 7",
    description: "Help me find keys!",
    points: 40,
    problem_statement: "darwaza tod do daya",
    category: "Medium",
    filePath: "./public/files/flag.zip",
  },
  {
    id: 8,
    title: "Challenge 8",
    description: "6763c5a8-d950-8001-83bd-070b2b19505d",
    points: 10,
    problem_statement: "Sharing is Caring!",
    category: "Bonus - Easy",
    // filePath: "./public/files/flag.zip",
  },
  {
    id: 9,
    title: "Challenge 9",
    description: "Can you give me one please 😋",
    points: 30,
    problem_statement: "A Jar full of Biscuits :)",
    category: "Bonus - Medium",
    // filePath: "./public/files/flag.zip",
  },
  // {
  //   id: 8,
  //   title: "Challenge 8",
  //   description: "A corrupted file has been provided here, decode the flag: ",
  //   points: 40,
  //   problem_statement: "The duty of youth is to challenge corruption",
  //   category: "Medium",
  //   filePath: "./public/files/file.exe",
  // },
  // {
  //   id: 9,
  //   title: "Challenge 9",
  //   description: "Play the game :)",
  //   points: 20,
  //   problem_statement: "Khelega India Tabhi Toh Khilega India",
  //   category: "Easy",
  //   filePath: "./public/files/game.sh",
  // },
  // {
  //   "id": 10,
  //   "title": "Challenge 10",
  //   "description": "Get the flag from the website",
  //   "points": 50,
  //   "problem_statement": "Kuch cheezein sui ki tarah hoti hain, dard ho sakta hai, par zaroori hoti hain.",
  //   "category": "Bonus"
  // }
];

// Routes
app.get("/", (req, res) => {
 

  // Render the 'index' page
  res.render("index", { challenges });
});

app.get("/challenges", isAuthenticated, (req, res) => {
  // Check if the user is authorized by verifying the 'auth' cookie
  const isAuthorized = req.cookies.auth === 'true'; // Check for 'auth' cookie

  if (isAuthorized) {
    const flag = Buffer.from("flag{c00k1es_are_tasty}").toString("base64");
    res.cookie("ZmxhZz0", flag, { path: "/", secure: true, httpOnly: true });
  }
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
app.post("/challenge/:id/submit", isAuthenticated, async (req, res) => {
  const challengeId = req.params.id; // ID of the challenge
  const submittedFlag = req.body.flag; // User's submitted flag
  const userId = req.session.user.uid; // User's ID from the session

  try {
    // Fetch the challenge data
    const challengeDoc = await admin
      .firestore()
      .collection("challenges")
      .doc(challengeId)
      .get();

    if (!challengeDoc.exists) {
      req.flash("error", "Challenge not found!");
      return res.redirect(`/challenge/${challengeId}`);
    }

    const challengeData = challengeDoc.data();

    // Fetch user data
    const userRef = admin.firestore().collection("users").doc(userId);

    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found!");
      }

      const userData = userDoc.data();
      const completedChallenges = userData.completedChallenges || [];

      // Check if the challenge is already completed
      if (completedChallenges.includes(challengeId)) {
        req.flash("error", "You have already solved this challenge!");
        return;
      }

      // Check if the submitted flag is correct
      if (submittedFlag === challengeData.correct) {
        const currentPoints = userData.points || 0;

        // Ensure points are numeric, in case it's stored as a string
        const newPoints = currentPoints + (Number(challengeData.points) || 0);

        // Update user's points and mark the challenge as completed
        completedChallenges.push(challengeId);

        transaction.update(userRef, {
          points: Number(newPoints), // Store points as a number
          completedChallenges: completedChallenges,
        });

        req.flash(
          "success",
          `Correct flag! You earned ${challengeData.points} points.`
        );
      } else {
        req.flash("error", "Incorrect flag. Try again!");
      }
    });
  } catch (error) {
    console.error("Error validating flag or updating points:", error);
    req.flash("error", "An error occurred. Please try again later.");
  }

  res.redirect(`/challenge/${challengeId}`);
});

// Leaderboard
// Leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const points = Number(userData.points) || 0;
      const completedChallenges = (userData.completedChallenges || []).sort(
        (a, b) => a - b // Sort the completedChallenges array numerically in ascending order
      );

      users.push({
        username: userData.username,
        points,
        completedChallenges, // Sorted completed challenges
      });
    });

    // Sort the users by points in descending order
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

app.get("/register", blockIfAuthenticated, (req, res) =>
  res.render("register")
);

// Registration Route
// Login/Logout Middleware

const blockIfNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }
  next();
};

// Login and Register Routes
app.get("/login", blockIfAuthenticated, (req, res) => {
  res.render("login", { messages: req.flash() });
});

app.get("/register", blockIfAuthenticated, (req, res) => {
  res.render("register", { messages: req.flash() });
});

// Register Route
app.post("/register", async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match!");
    return res.redirect("/register");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRecord = await admin.auth().createUser({
      email,
      password, // Required plaintext password for Firebase creation
      displayName: name,
    });

    // Save user details to Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      username,
      email,
      displayName: name,
      hashedPassword, // Store only hashed passwords
      points: 0,
    });

    req.flash("success", "Registration successful! Please log in.");
    res.redirect("/login");
  } catch (error) {
    console.error("Registration Error:", error.message);
    req.flash("error", "Registration failed. Please try again.");
    res.redirect("/register");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userSnapshot = await admin
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(
      password,
      userData.hashedPassword
    );

    if (!isPasswordValid) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    req.session.user = {
      uid: userDoc.id,
      displayName: userData.displayName,
      email: userData.email,
    };

    // Set the auth cookie
    res.cookie("auth", "true", { path: "/", secure: true, httpOnly: true });

    req.flash("success", "Login successful!");
    res.redirect("/challenges");
  } catch (error) {
    console.error("Login Error:", error.message);
    req.flash("error", "Login failed. Please try again.");
    res.redirect("/login");
  }
});


app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Failed to logout");
    res.redirect("/");
  });
});

app.get("/write-ups", (req, res) => {
  res.render("write-ups");
});

app.get("/robots.txt", (req, res) => {
  const filePath = path.join(__dirname, "robots.txt");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading robots.txt file:", err);
      res.status(500).send("Error loading robots.txt");
    } else {
      res.type("text/plain");
      res.send(data);
    }
  });
});

app.get("/*", (req, res) => res.status(404).render("notfound"));

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
