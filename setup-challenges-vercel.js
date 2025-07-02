#!/usr/bin/env node

// Vercel-compatible challenges setup script
const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

const challenges = [
  { id: "1", correct: "flag{pr3d1ct10n}", points: 10 },
  { id: "2", correct: "flag{6a6y_ko_6ase_9asand_hai}", points: 20 },
  { id: "3", correct: "flag{9v9n_r0b0ts_sm3ll}", points: 30 },
  { id: "4", correct: "flag{st3g4n0_s4n}", points: 40 },
  { id: "5", correct: "flag{4ud10_h1dd3n}", points: 50 },
  { id: "6", correct: "flag{c0l0r_c0d3d}", points: 50 },
  { id: "7", correct: "flag{z1p_cr4ck3d}", points: 40 },
  { id: "8", correct: "flag{shar1ng_1s_car1ng}", points: 10 },
  { id: "9", correct: "flag{c00k1es_are_tasty}", points: 30 },
];

async function setupChallenges() {
  console.log("🔄 Setting up challenges collection for Vercel deployment...");
  
  try {
    const db = admin.firestore();
    const batch = db.batch();
    
    challenges.forEach((challenge) => {
      const docRef = db.collection("challenges").doc(challenge.id);
      batch.set(docRef, {
        correct: challenge.correct,
        points: challenge.points,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
    
    console.log("✅ Successfully populated challenges collection!");
    console.log(`📊 Added ${challenges.length} challenges to Firestore`);
    
    console.log("\n📋 Challenges added:");
    challenges.forEach((challenge) => {
      console.log(`   Challenge ${challenge.id}: ${challenge.points} points - ${challenge.correct}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up challenges:", error);
    process.exit(1);
  }
}

// Export for Vercel function or run directly
if (require.main === module) {
  setupChallenges();
}

module.exports = setupChallenges;
