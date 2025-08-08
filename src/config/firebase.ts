import admin from "firebase-admin";
import { env } from "./env.js";

const initializeFirebaseAdmin = (): void => {
	if (admin.apps.length > 0) return;

	const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } =
		env;

	if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
		throw new Error("Firebase credentials are missing");
	}

	try {
		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: FIREBASE_PROJECT_ID,
				privateKey: FIREBASE_PRIVATE_KEY,
				clientEmail: FIREBASE_CLIENT_EMAIL,
			}),
		});
	} catch (err) {
		console.error("Error initializing Firebase Admin SDK:", err);
		process.exit(1);
	}
};

export default initializeFirebaseAdmin;
