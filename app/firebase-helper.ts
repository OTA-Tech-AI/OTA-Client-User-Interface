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
import {
  getFireBaseConversationRef,
  firebaseUpdate,
  firebasePush,
  getfirebaseServerTimeStamp,
} from "./api/firebase/realtimeDatabase";
import { useChatStore } from "./store";
import { firebaseConfig, DEVICE_ID } from "./constant";
import { userAuthStore } from "./store/userAuth";

export const initializeFirebase = () => {
  if (!getApps().length) {
    console.log("Initializing Firebase App...");
    initializeApp(firebaseConfig);
    console.log("Firebase App Initialization Done");
  } else {
    console.log("Firebase App exists. skip initialization.");
  }
};

// Define a listener type to store our listeners
interface Listener {
  eventType: string;
  callback: Function;
}

// The default state will simply be an empty object
const DEFAULT_LISTENER_STATE: { [key: string]: Listener | null } = {
  ConversationOnChildAddedListener: null,
  ConversationOnChildChangededListener: null,
  ConversationOnChildRemovedListener: null,
};

export const useFirebaseListenerStore = createPersistStore(
  DEFAULT_LISTENER_STATE,
  (set, get) => ({
    attachListener(path: string, eventType: string, callback: Function) {
      let currentListener = get().ConversationOnChildAddedListener;
      switch (eventType) {
        case "child_added":
          break;
        case "child_changed":
          currentListener = get().ConversationOnChildAddedListener;
          break;
        case "child_removed":
          currentListener = get().ConversationOnChildRemovedListener;
          break;
        default:
          console.warn("Unsupported event type");
          return;
      }

      const database = getDatabase();
      const databaseRef = ref(database, path);

      // Use the appropriate Firebase method based on the event type
      const eventHandler = (snapshot: any) => {
        callback(snapshot);
      };
      console.log("Attaching listener for:", eventType);
      switch (eventType) {
        case "child_added":
          onChildAdded(databaseRef, (snapshot, prevChildKey) => {
            callback(snapshot, prevChildKey);
          });
          set({
            ConversationOnChildAddedListener: {
              eventType,
              callback: eventHandler,
            },
          });
          break;
        case "child_changed":
          onChildChanged(databaseRef, eventHandler);
          set({
            ConversationOnChildChangedListener: {
              eventType,
              callback: eventHandler,
            },
          });
          break;
        case "child_removed":
          onChildRemoved(databaseRef, eventHandler);
          set({
            ConversationOnChildremovedListener: {
              eventType,
              callback: eventHandler,
            },
          });
          break;
        default:
          console.warn("Unsupported event type");
          return;
      }
    },

    // detachListener(path: string, eventType: string) {
    //   const database = getDatabase();
    //   const databaseRef = ref(database, path);
    //   const listenerKey = `${path}_${eventType}`;
    //   const currentListeners = get();

    //   // Remove the listener if it exists
    //   if (currentListeners[listenerKey]) {
    //     off(databaseRef, eventType, currentListeners[listenerKey].callback);
    //     const { [listenerKey]: _, ...remainingListeners } = currentListeners;
    //     set(remainingListeners);
    //     console.log(`Listener detached for ${listenerKey}`);
    //   }
    // },
  }),
  {
    name: "FirebaseListeners",
    version: 1,
  },
);

// Define your callback for child added
export const handleChildAdded = (
  snapshot: any,
  prevChildKey?: string | null,
) => {
  console.log("Child added:", snapshot.key, snapshot.val(), prevChildKey);
  console.log(
    "current session: ",
    useChatStore.getState().currentSession().messages,
  );
  // Handle the new child data here...
};

// Define your callback for child changed
export const handleChildChanged = (snapshot: any) => {
  // console.log("Child changed:", snapshot.key, snapshot.val());
  // console.log("current session: ", useChatStore.getState().currentSession().messages);

  const remoteSnapshot = snapshot.val();
  const SnapshotConversation = snapshot.key;

  if (!remoteSnapshot.toDevice === undefined) {
    return;
  }

  if (remoteSnapshot.toDevice === 0 && remoteSnapshot.toDevice === DEVICE_ID) {
    if (!remoteSnapshot.toDeviceReceived) {
      /* ( toDevice == 0, toDeviceReceived==false ) */
      // only in this case DEVICE 0 need to take action
      // PC device should receive this msg
      // and immediately send a remoteChange.toDeviceReceived === true to FB.
      const convRef = getFireBaseConversationRef(
        "user_" + userAuthStore.getState().uid,
        SnapshotConversation,
      );
      firebaseUpdate(convRef, { toDeviceReceived: true });

      /* ( toDevice == 0, toDeviceReceived==true ) */
      // then PC device start to process
      console.log("then PC device start to process");
      // ................................

      // after processing, first push the receipt to FB
      /* ( receipt, toDevice == 0, toDeviceReceived==true ) */
      const lastMessage = remoteSnapshot["lastMessage"];
      const humanRequestMsg =
        "Receipt for " +
        JSON.parse(remoteSnapshot[lastMessage].body)["messages"][0]["content"] +
        " done";

      const FirebaseSingleMsgPayload = {
        body: JSON.stringify({ message: humanRequestMsg }),
        createdAt: getfirebaseServerTimeStamp(),
      };

      firebasePush(convRef, FirebaseSingleMsgPayload)
        .then((newRef: any) => {
          if (newRef._path) {
            const firebaseAutoMsgId = newRef._path.pieces_[2];
            console.log("DEVICE 0 Receipt: ", firebaseAutoMsgId);
            //   useChatStore.getState().updateCurrentSession((session) => {
            // 	session.messages[session.messages.length - 2].id =
            // 	  firebaseAutoMsgId;
            //   });

            // finally send another msg to FB to push ball pack to Mobile device
            /* ( receipt, toDevice == 1, toDeviceReceived==false ) */
            return firebaseUpdate(convRef, {
              lastMessage: firebaseAutoMsgId,
              toDevice: 1,
              toDeviceReceived: false,
            });
          } else {
            // Handle the case where path pieces are not available
            throw new Error("DEVICE 0 No path pieces found");
          }
        })
        .then(() => {
          // This .then() is for the firebaseUpdate
          console.log("DEVICE 0 Update successful!");
        })
        .catch((error) => {
          console.error("An error occurred:", error);
        });
    }
  } else if (
    remoteSnapshot.toDevice === 1 &&
    remoteSnapshot.toDevice === DEVICE_ID
  ) {
    if (!remoteSnapshot.toDeviceReceived) {
      /* ( toDevice == 1, toDeviceReceived==false ) */
      // only in this case DEVICE 1 need to take action
      // Mobile device should receive this msg
      // and immediately send a remoteChange.toDeviceReceived === true to FB.
      /* ( toDevice == 1, toDeviceReceived==true ) */
      const convRef = getFireBaseConversationRef(
        "user_" + userAuthStore.getState().uid,
        SnapshotConversation,
      );
      firebaseUpdate(convRef, { toDeviceReceived: true });

      // then mobile device updates the receipt to local conversation
      console.log(
        "then mobile device updates the receipt to local conversation",
      );

      // next time when mobile sends a new msg, the first push:
      /* ( receipt, toDevice == 1, toDeviceReceived==true ) ===> to ignore */
      // the second update will change status to:
      /* ( toDevice == 0, toDeviceReceived==false ) */
      // then back to the top
    }
  }

  // Handle the updated child data here...
};

// Define your callback for child removed
export const handleChildRemoved = (snapshot: any) => {
  console.log("Child removed:", snapshot.key);
  // Handle the child removal here...
};
