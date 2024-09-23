import { App, applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { EnvType } from "./enums";

let defaultApp: App;
if (process.env.NODE_ENV !== EnvType.PROD) {
  // GOOGLE_APPLICATION_CREDENTIALS
  defaultApp = initializeApp({ credential: applicationDefault() });
} else {
  defaultApp = initializeApp();
}

const fAuth = getAuth(defaultApp);
const fStore = getFirestore(defaultApp);

export { fAuth, fStore };
