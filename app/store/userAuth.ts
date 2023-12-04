import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { DEFAULT_API_HOST, StoreKey } from "../constant";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import {
  firebaseListenerSetup,
  firebaseListenerTeardown,
} from "../firebase-helper";

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

const DEFAULT_ACCESS_STATE = {
  email: "",
  password: "",
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  uid: "",
  openaiUrl: DEFAULT_OPENAI_URL,
};

export const userAuthStore = createPersistStore(
  { ...DEFAULT_ACCESS_STATE },

  (set, get) => ({
    async signInWithFirebase(email: string, password: string): Promise<number> {
      try {
        let auth = await getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        if (!!user && !!user.uid) {
          if (!user.emailVerified) {
            await signOut(auth);
            return 2; // Email not verified
          }
          console.log(
            "[Auth] User signed in with Firebase successfully, email: ",
            email,
          );
          this.updateEmail(email);
          this.updatePassword(password);
          return 1; // Successful sign in
        } else {
          // This else block might not be necessary because if user or user.uid is not present,
          // an error would be thrown by signInWithEmailAndPassword
          console.log("[Auth] No user data returned from Firebase");
          return 0; // No user data
        }
      } catch (error) {
        console.error("[Auth] Failed to sign in with Firebase, email: ", email);
        throw error;
      }
    },

    async signOutFromFirebase() {
      try {
        const auth = getAuth();
        await signOut(auth);
        console.log("[Auth] Signed out successfully!");
        // Clear local state if necessary
        set({ ...DEFAULT_ACCESS_STATE });
      } catch (error) {
        console.error("[Auth] Failed to sign out from Firebase");
        throw error;
      }
    },

    async signUpWithFireBase(email: string, password: string) {
      try {
        const auth = await getAuth();
        await createUserWithEmailAndPassword(auth, email, password).then(
          async (userCredential) => {
            const user = userCredential.user;
            if (user != null) {
              await sendEmailVerification(user);
              await signOut(auth);
              console.log("User Registration Succeeded! Email: ", email);
            }
          },
        );
      } catch (error) {
        console.error("Error registering new user: ", error);
        throw error;
      }
    },

    async passwordRecoveryEmailFromFirebase(email: string) {
      try {
        const auth = await getAuth();
        await sendPasswordResetEmail(auth, email).then(() => {
          console.log("successffully sent recovery email to: ", email);
        });
      } catch (error) {
        console.error("Error registering new user: ", error);
      }
    },

    async resendVerificationEmailFromFirebase(email: string, password: string) {
      try {
        // Sign in the user
        const auth = await getAuth();
        await signInWithEmailAndPassword(auth, email, password).then(
          async (userCredential) => {
            const user = userCredential.user;
            if (user != null) {
              await sendEmailVerification(user);
              await signOut(auth);
              console.log(`Resend successfully to email: ${email}`);
            }
          },
        );
        // Notify the user that the email has been sent
      } catch (error) {
        console.error("Error: ", error);
        // Handle errors (e.g., user not found, wrong password, etc.)
      }
    },

    enabledAccessControl() {
      return get().needCode;
    },
    updateEmail(email: string) {
      set(() => ({ email: email?.trim() }));
    },
    updatePassword(password: string) {
      set(() => ({ password: password?.trim() }));
    },

    isAuthorized() {
      return get().uid !== "";
    },

    setupAuthStateListener() {
      return onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          console.log("[Auth] State: User Login Detected: ", user.uid);
          set(() => ({ uid: user.uid }));
          firebaseListenerSetup();
        } else {
          console.log("[Auth] State: Not Login.");
          set(() => ({ email: "", password: "", uid: "" }));
          firebaseListenerTeardown();
        }
      });
    },
  }),
  {
    name: StoreKey.Access,
    version: 1,
  },
);
