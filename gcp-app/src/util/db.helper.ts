import * as crypto from "crypto";
import { fStore } from "./firebase";
import { IMessage } from "./models";

/*

export const getDocument = async () => {
  const docRef = fStore.collection("users").doc("userId");
  const doc = await docRef.get();
  return doc.exists ? doc.data() : undefined;
};

export const getAllDocuments = async () => {
  const snapshot = await fStore.collection("users").get();
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
};

export const addDocument = async () => {
  const docRef = fStore.collection("users").doc("userId");
  await docRef.set({
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30
  });
};

export const updateDocument = async () => {
  const docRef = fStore.collection("users").doc("userId");
  await docRef.update({
    age: 31,
    email: "new.email@example.com"
  });
};

export const deleteDocument = async () => {
  const docRef = fStore.collection("users").doc("userId");
  await docRef.delete();
};

*/

export const addUser = async (message: IMessage) => {
  return await fStore.collection("users").add({
    id: message.id,
    name: message.name,
    email: message.email,
    messageId: message.messageId
  });
};
