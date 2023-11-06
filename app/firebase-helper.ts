import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
} from "firebase/database";
import { createPersistStore } from "./utils/store";

const firebaseConfig = {
  apiKey: "AIzaSyBu_QBFvmZ6n2AYzIgBsqB7-942R6BjEmw",
  authDomain: "ota-user-system.firebaseapp.com",
  projectId: "ota-user-system",
  storageBucket: "ota-user-system.appspot.com",
  messagingSenderId: "1080297856968",
  appId: "1:1080297856968:web:ad1493d6755a03eb892afd",
};

export const initializeFirebase = () => {
  if (!getApps().length) {
    console.log("Initializing Firebase App...");
    initializeApp(firebaseConfig);
    console.log("Firebase App Initialization Done");
  } else {
    console.log("Firebase App exists. skip initialization.");
  }
};

export const listenForChildAdded = (
  userPath: string,
  callback: (snapshot: any, prevChildKey?: string | null) => void,
) => {
  // const app = getApp();
  const db = getDatabase();
  const userRef = ref(db, userPath);

  onChildAdded(
    userRef,
    (snapshot, prevChildKey) => {
      callback(snapshot, prevChildKey);
    },
    (error: any) => {
      console.error("Firebase onChildAdded failed:", error);
    },
  );
};

// onChildChanged listener helper
export const listenForChildChanged = (
  userPath: string,
  callback: (snapshot: any) => void,
) => {
  const db = getDatabase();
  const userRef = ref(db, userPath);

  onChildChanged(
    userRef,
    (snapshot) => {
      callback(snapshot);
    },
    (error: any) => {
      console.error("Firebase onChildChanged failed:", error);
    },
  );
};

// onChildRemoved listener helper
export const listenForChildRemoved = (
  userPath: string,
  callback: (snapshot: any) => void,
) => {
  const db = getDatabase();
  const userRef = ref(db, userPath);

  onChildRemoved(
    userRef,
    (snapshot) => {
      callback(snapshot);
    },
    (error: any) => {
      console.error("Firebase onChildRemoved failed:", error);
    },
  );
};

// Define a listener type to store our listeners
interface Listener {
  eventType: string;
  callback: Function;
}

// The default state will simply be an empty object
const DEFAULT_LISTENER_STATE = {
  ConversationOnChildAddedListener: null,
  ConversationOnChildChangededListener: null,
  ConversationOnChildRemovedListener: null,
};

// export const useFirebaseListenerStore = createPersistStore(
//   DEFAULT_LISTENER_STATE,
//   (set, get) => ({
//     attachListener(path: string, eventType: string, callback: Function) {
// 	const linder
// 	switch (eventType) {
// 		case 'child_added':
// 			onChildAdded(databaseRef, eventHandler);
// 			break;
// 		case 'child_changed':
// 			onChildChanged(databaseRef, eventHandler);
// 			break;
// 		case 'child_removed':
// 			onChildRemoved(databaseRef, eventHandler);
// 			break;
// 		default:
// 			console.warn('Unsupported event type');
// 			return;
// 		}
//       const database = getDatabase();
//       const databaseRef = ref(database, path);
//       const listenerKey = `${path}_${eventType}`;

//       // Check if we already have a listener attached to avoid duplicates
//       const currentListeners = get();
//       if (currentListeners[listenerKey]) {
//         console.log(`Listener already attached for ${listenerKey}`);
//         return;
//       }

//       // Use the appropriate Firebase method based on the event type
//       const eventHandler = (snapshot) => {
//         callback(snapshot.val(), snapshot);
//       };

//       switch (eventType) {
//         case 'child_added':
//           onChildAdded(databaseRef, eventHandler);
//           break;
//         case 'child_changed':
//           onChildChanged(databaseRef, eventHandler);
//           break;
//         case 'child_removed':
//           onChildRemoved(databaseRef, eventHandler);
//           break;
//         default:
//           console.warn('Unsupported event type');
//           return;
//       }

//       // Update the store with the new listener
//       set({
//         ...currentListeners,
//         [listenerKey]: {
//           eventType,
//           callback: eventHandler,
//         },
//       });

//       console.log(`Listener attached for ${listenerKey}`);
//     },

//     detachListener(path: string, eventType: string) {
//       const database = getDatabase();
//       const databaseRef = ref(database, path);
//       const listenerKey = `${path}_${eventType}`;
//       const currentListeners = get();

//       // Remove the listener if it exists
//       if (currentListeners[listenerKey]) {
//         off(databaseRef, eventType, currentListeners[listenerKey].callback);
//         const { [listenerKey]: _, ...remainingListeners } = currentListeners;
//         set(remainingListeners);
//         console.log(`Listener detached for ${listenerKey}`);
//       }
//     },
//   }),
//   {
//     name: 'FirebaseListeners',
//     version: 1,
//   },
// );
