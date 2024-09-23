import { Request, Response, NextFunction } from "express";
import { PubSub, Message } from "@google-cloud/pubsub";
import { formatISO } from "date-fns";
import { IMessage, IUser } from "./models";
import { addUser } from "./db.helper";

export const dateNow = () => formatISO(new Date(), { representation: "date" });
export const timeNow = () => formatISO(new Date(), { representation: "time" });

// log functions
export const logError = (message: string) => {
  const error: string = `error: [${dateNow()} ${timeNow()}] ${message}`;
  console.error(error);
};
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const error = err as Error;
  const errMessage = error.message;
  const errStack = error.stack?.replace(":", "") || errMessage;
  logError(errStack);
  return res.status(400).json({ error: errMessage });
};

// pub sub functions
export const publishMessage = async (topicNameOrId: string, data: string) => {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);
  const pubSubClient = new PubSub();
  return await pubSubClient.topic(topicNameOrId).publishMessage({ data: dataBuffer });
};

export const listenForMessages = async (subscriptionNameOrId: string, timeout: number = 60) => {
  // References an existing subscription
  const pubSubClient = new PubSub();
  const subscription = pubSubClient.subscription(subscriptionNameOrId);
  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = async (message: Message) => {
    try {
      console.log(`Received Message ID: ${message.id}:`);
      console.log(`Received Data: ${message.data}`);
      // console.log(`\tAttributes: ${message.attributes}`);
      const user: IUser = JSON.parse(message.data.toString());
      const fbUser: IMessage = {
        id: user.id || crypto.randomUUID(),
        name: user.name,
        email: user.email,
        messageId: message.id
      };
      console.log(`Firestore User ID: ${fbUser.id}`);
      const fbDoc = await addUser(fbUser);
      console.log(`Firestore Doc ID: ${fbDoc.id}`);
      messageCount += 1;
      message.ack();
    } catch (err) {
      const error = err as Error;
      console.log(`Message Error: ${error.message}`);
      message.nack();
    }
  };
  // Listen for new messages until timeout is hit
  subscription.on("message", messageHandler);
  // Wait a while for the subscription to run. (Part of the sample only.)
  setTimeout(() => {
    subscription.removeListener("message", messageHandler);
    console.log(`${messageCount} message(s) received`);
  }, timeout * 1000);
};
