const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase (using existing credentials)
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
});

const db = admin.firestore();

// Challenge flags (you'll need to update these with the actual correct flags)
const challengeFlags = {
  "1": {
    correct: "flag{pr3d1ct10n}", // Example flag for Challenge 1
    points: 10
  },
  "2": {
    correct: "flag{6a6y_ko_6ase_9asand_hai}", // Base64 decoded flag
    points: 20
  },
  "3": {
    correct: "flag{9v9n_r0b0ts_sm3ll}", // From robots.txt
    points: 30
  },
  "4": {
    correct: "flag{st3g4n0_s4n}", // Example flag for steganography challenge
    points: 40
  },
  "5": {
    correct: "flag{4ud10_h1dd3n}", // Example flag for audio challenge
    points: 50
  },
  "6": {
    correct: "flag{c0l0r_c0d3d}", // Example flag for image challenge
    points: 50
  },
  "7": {
    correct: "flag{z1p_cr4ck3d}", // Example flag for zip challenge
    points: 40
  },
  "8": {
    correct: "flag{shar1ng_1s_car1ng}", // Example flag for sharing challenge
    points: 10
  },
  "9": {
    correct: "flag{c00k1es_are_tasty}", // Example flag for cookie challenge
    points: 30
  }
};

async function populateChallenges() {
  console.log("🔄 Setting up challenges collection in Firestore...");
  
  try {
    const batch = db.batch();
    
    for (const [challengeId, data] of Object.entries(challengeFlags)) {
      const docRef = db.collection('challenges').doc(challengeId);
      batch.set(docRef, data);
    }
    
    await batch.commit();
    console.log("✅ Successfully populated challenges collection!");
    console.log(`📊 Added ${Object.keys(challengeFlags).length} challenges to Firestore`);
    
    // List the challenges
    console.log("\n📋 Challenges added:");
    for (const [id, data] of Object.entries(challengeFlags)) {
      console.log(`   Challenge ${id}: ${data.points} points - ${data.correct}`);
    }
    
  } catch (error) {
    console.error("❌ Error populating challenges:", error);
  } finally {
    process.exit();
  }
}

populateChallenges();
