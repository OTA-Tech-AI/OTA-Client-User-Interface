import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
  DataSnapshot,
} from "firebase/database";
import { createPersistStore } from "./utils/store";
import {
  getFireBaseConversationRef,
  firebaseUpdate,
  firebasePush,
  getfirebaseServerTimeStamp,
} from "./api/firebase/realtimeDatabase";
import { useChatStore } from "./store";
import { firebaseConfig, DEVICE_ID, WAIT_SERVER_TIMEOUT } from "./constant";
import { userAuthStore } from "./store/userAuth";
import {
  doLocalSubmit,
  LocalOnFinish,
  waitMillisecond,
} from "./store/chat-helper";

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
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => any;
  query: string;
}

// The default state will simply be an empty object
const DEFAULT_LISTENER_STATE: { [key: string]: Listener } = {
  ConversationOnChildAddedListener: {
    eventType: "child_added",
    callback: () => {},
    query: "",
  },
  ConversationOnChildChangedListener: {
    eventType: "child_changed",
    callback: () => {},
    query: "",
  },
  ConversationOnChildRemovedListener: {
    eventType: "child_removed",
    callback: () => {},
    query: "",
  },
};

export const useFirebaseListenerStore = createPersistStore(
  DEFAULT_LISTENER_STATE,
  (set, get) => ({
    attachListener(path: string, eventType: string, callback: Function) {
      const database = getDatabase();
      const databaseRef = ref(database, path);

      // Use the appropriate Firebase method based on the event type
      const eventHandler = (snapshot: DataSnapshot) => {
        callback(snapshot);
      };
      //   console.log("Attaching listener for:", eventType);
      switch (eventType) {
        case "child_added":
          onChildAdded(databaseRef, eventHandler);
          set({
            ConversationOnChildAddedListener: {
              eventType: eventType,
              callback: eventHandler,
              query: path,
            },
          });
          break;
        case "child_changed":
          onChildChanged(databaseRef, eventHandler);
          set({
            ConversationOnChildChangedListener: {
              eventType: eventType,
              callback: eventHandler,
              query: path,
            },
          });
          break;
        case "child_removed":
          onChildRemoved(databaseRef, eventHandler);
          set({
            ConversationOnChildRemovedListener: {
              eventType: eventType,
              callback: eventHandler,
              query: path,
            },
          });
          break;
        default:
          console.warn("Unsupported event type");
          return;
      }
    },

    detachListener(path: string, eventType: string) {
      const database = getDatabase();
      const databaseRef = ref(database, path);

      switch (eventType) {
        case "child_added":
          off(
            databaseRef,
            "child_added",
            get().ConversationOnChildAddedListener.callback,
          );
          set({
            currentOnChildAddedListener: {
              eventType: "child_added",
              callback: () => {},
              query: "",
            },
          });
          break;

        case "child_changed":
          off(
            databaseRef,
            "child_changed",
            get().ConversationOnChildChangedListener.callback,
          );
          set({
            ConversationOnChildChangedListener: {
              eventType: "child_changed",
              callback: () => {},
              query: "",
            },
          });
          break;

        case "child_removed":
          off(
            databaseRef,
            "child_removed",
            get().ConversationOnChildRemovedListener.callback,
          );
          set({
            ConversationOnChildRemovedListener: {
              eventType: "child_removed",
              callback: () => {},
              query: "",
            },
          });
          break;

        default:
          console.warn("Unsupported event type");
          return;
      }
      //   console.log(`Listener detached for ${eventType}`);
    },
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
};

// Define your callback for child changed
export const handleChildChanged = async (snapshot: any) => {
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

      useChatStore.getState().currentSessionQueryServerStart();
      const lastMessageId = remoteSnapshot["lastMessage"];
      const lastMessage = JSON.parse(remoteSnapshot[lastMessageId].body)[
        "messages"
      ][0]["content"];

      doLocalSubmit(lastMessage);

      let serverSuccess = false;
      let botMessage: string | undefined =
        "The remote device needs more time to execute the task, please check its receipt later.\nYour Task: " +
        lastMessage;
      for (let i = 0; i < WAIT_SERVER_TIMEOUT; i++) {
        if (useChatStore.getState().currentSessionQueryServerStatus()) {
          serverSuccess = true;
          console.log("OTA is working now, waiting " + i + " second...");
          botMessage = useChatStore.getState().getLatestBotMessage();
          break;
        }
        await waitMillisecond(1000);
      }

      // after processing, first push the receipt to FB
      /* ( receipt, toDevice == 0, toDeviceReceived==true ) */

      const FirebaseSingleMsgPayload = {
        body: JSON.stringify({ message: botMessage }),
        createdAt: getfirebaseServerTimeStamp(),
      };

      firebasePush(convRef, FirebaseSingleMsgPayload)
        .then((newRef: any) => {
          if (newRef._path) {
            const firebaseAutoMsgId = newRef._path.pieces_[2];
            console.log("DEVICE 0 Receipt: ", firebaseAutoMsgId);
            useChatStore.getState().changeLastBotMessageId(firebaseAutoMsgId);
            console.log(
              firebaseAutoMsgId,
              useChatStore.getState().currentSession(),
            );

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
      const lastMessageId = remoteSnapshot["lastMessage"];
      const lastMessage = JSON.parse(remoteSnapshot[lastMessageId].body)[
        "message"
      ];
      console.log(lastMessage);
      LocalOnFinish(lastMessage);

      // next time when mobile sends a new msg, the first push:
      /* ( receipt, toDevice == 1, toDeviceReceived==true ) ===> to ignore */
      // the second update will change status to:
      /* ( toDevice == 0, toDeviceReceived==false ) */
      // then back to the top
    }
  }
};

// Define your callback for child removed
export const handleChildRemoved = (snapshot: any) => {
  console.log("Child removed:", snapshot.key);
  // Handle the child removal here...
};

export async function firebaseListenerSetup() {
  if (!userAuthStore.getState().isAuthorized()) {
    return;
  }

  const userPath = "user_" + userAuthStore.getState().uid;

  // Setting up the listeners
  useFirebaseListenerStore
    .getState()
    .attachListener(userPath, "child_added", handleChildAdded);
  useFirebaseListenerStore
    .getState()
    .attachListener(userPath, "child_changed", handleChildChanged);
  useFirebaseListenerStore
    .getState()
    .attachListener(userPath, "child_removed", handleChildRemoved);

  console.log(`All Listeners Attached.`);
}

export function firebaseListenerTeardown() {
  const attachedListenerEvent = [
    "child_added",
    "child_changed",
    "child_removed",
  ];
  attachedListenerEvent.forEach((eventType) => {
    const userPath = "user_" + userAuthStore.getState().uid;
    useFirebaseListenerStore.getState().detachListener(userPath, eventType);
  });
  console.log(`All Listeners Detached.`);
}
