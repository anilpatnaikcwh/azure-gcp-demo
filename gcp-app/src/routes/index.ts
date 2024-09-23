import express, { Router } from "express";
import { publishMessageAsync, pullMessageAsync } from "../services";
import { authRequest } from "../util";

const apiRouter: Router = express.Router();

apiRouter.post("/topic/pub", authRequest, publishMessageAsync);
apiRouter.post("/topic/sub/pull", authRequest, pullMessageAsync);

export { apiRouter };
