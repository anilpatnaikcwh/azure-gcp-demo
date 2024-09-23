import { NextFunction, Request, Response } from "express";
import { helper, IUser } from "../util";
import { faker } from "@faker-js/faker";

export const publishMessageAsync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, message } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    let updateMessage = message;
    console.log("message", updateMessage);
    // fake message for testing
    if (!updateMessage) {
      const user: IUser = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email()
      };
      updateMessage = JSON.stringify(user);
    }
    const messageId = await helper.publishMessage(topic, updateMessage);
    res.status(200).json({ messageId });
  } catch (error) {
    return next(error);
  }
};

export const pullMessageAsync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subscription, timeout } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: "Subscription is required" });
    }
    await helper.listenForMessages(subscription, timeout);
    res.status(200).json({ message: "Started listening for Pub/Sub messages" });
  } catch (error) {
    return next(error);
  }
};
