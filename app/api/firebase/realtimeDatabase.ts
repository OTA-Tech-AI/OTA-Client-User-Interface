import { getApp } from "firebase/app";
import {
  getDatabase as firebaseGetDatabase,
  ref as firebaseRef,
  push,
  serverTimestamp,
  DatabaseReference,
  update,
} from "firebase/database";

export function getFireBaseConversationRef(
  userId: string,
  conversationId: string,
) {
  const app = getApp();
  const fbDatabase = firebaseGetDatabase(app);
  const dbPartition = [userId, conversationId].join("/");
  return firebaseRef(fbDatabase, dbPartition);
}

export function getfirebaseServerTimeStamp() {
  return serverTimestamp();
}

export function firebasePush(
  msgRef: DatabaseReference,
  FirebaseSingleMsgPayload: any,
) {
  return push(msgRef, FirebaseSingleMsgPayload);
}

export function firebaseUpdate(
  msgRef: DatabaseReference,
  FirebaseSingleMsgPayload: any,
) {
  return update(msgRef, FirebaseSingleMsgPayload);
}
