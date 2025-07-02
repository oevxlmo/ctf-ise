const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3001;

// Use cookie-parser middleware to parse cookies
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: "demo-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use 'true' in production with HTTPS
  })
);

// Setup flash messages
app.use(flash());

// Middleware to make flash messages available globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Set EJS as template engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Mock data for demo mode
const mockChallenges = [
  {
    id: "1",
    title: "Basic Cryptography",
    description: "Decode this simple cipher to find the flag.",
    points: 100,
    category: "Crypto",
    difficulty: "Easy",
    flag: "CTF{demo_flag_1}",
    solved: false
  },
  {
    id: "2", 
    title: "Web Exploitation",
    description: "Find the hidden vulnerability in this web application.",
    points: 200,
    category: "Web",
    difficulty: "Medium",
    flag: "CTF{demo_flag_2}",
    solved: false
  },
  {
    id: "3",
    title: "Binary Analysis",
    description: "Reverse engineer this binary to extract the flag.",
    points: 300,
    category: "Reverse",
    difficulty: "Hard",
    flag: "CTF{demo_flag_3}",
    solved: false
  }
];

const mockUsers = [
  { username: "demo_user", email: "demo@example.com", password: "password123", score: 150 },
  { username: "alice", email: "alice@example.com", password: "alice123", score: 300 },
  { username: "bob", email: "bob@example.com", password: "bob123", score: 100 }
];

let currentUser = null;

// Routes
app.get("/", (req, res) => {
  res.render("index", { user: currentUser });
});

app.get("/challenges", (req, res) => {
  if (!currentUser) {
    req.flash("error_msg", "Please login to view challenges");
    return res.redirect("/login");
  }
  res.render("challenges", { challenges: mockChallenges, user: currentUser });
});

app.get("/challenge/:id", (req, res) => {
  if (!currentUser) {
    req.flash("error_msg", "Please login to view challenges");
    return res.redirect("/login");
  }
  
  const challenge = mockChallenges.find(c => c.id === req.params.id);
  if (!challenge) {
    return res.render("notfound");
  }
  
  res.render("challengeDetail", { challenge, user: currentUser });
});

app.post("/submit-flag", (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  const { challengeId, flag } = req.body;
  const challenge = mockChallenges.find(c => c.id === challengeId);
  
  if (!challenge) {
    return res.status(404).json({ success: false, message: "Challenge not found" });
  }
  
  if (flag.trim() === challenge.flag) {
    challenge.solved = true;
    // Add points to current user (mock)
    const userIndex = mockUsers.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
      mockUsers[userIndex].score += challenge.points;
      currentUser.score = mockUsers[userIndex].score;
    }
    
    return res.json({ success: true, message: "Correct flag! Points awarded." });
  } else {
    return res.json({ success: false, message: "Incorrect flag. Try again!" });
  }
});

app.get("/leaderboard", (req, res) => {
  const sortedUsers = [...mockUsers].sort((a, b) => b.score - a.score);
  res.render("leaderboard", { users: sortedUsers, user: currentUser });
});

app.get("/write-ups", (req, res) => {
  res.render("write-ups", { user: currentUser });
});

app.get("/login", (req, res) => {
  if (currentUser) {
    return res.redirect("/challenges");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    req.flash("success_msg", "Login successful!");
    res.redirect("/challenges");
  } else {
    req.flash("error_msg", "Invalid credentials");
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (currentUser) {
    return res.redirect("/challenges");
  }
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email || u.username === username);
  if (existingUser) {
    req.flash("error_msg", "User already exists");
    return res.redirect("/register");
  }
  
  // Create new user
  const newUser = { username, email, password, score: 0 };
  mockUsers.push(newUser);
  
  req.flash("success_msg", "Registration successful! Please login.");
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  currentUser = null;
  req.flash("success_msg", "Logged out successfully");
  res.redirect("/");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("notfound");
});

app.listen(PORT, () => {
  console.log(`🚀 Demo CTF application running at http://localhost:${PORT}`);
  console.log("📝 Demo credentials:");
  console.log("   Email: demo@example.com");
  console.log("   Password: password123");
  console.log("");
  console.log("🔧 This is running in DEMO MODE with mock data");
  console.log("💡 To use with Firebase, configure your .env file and use 'npm start'");
});
