import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import https from "https";
import fs from "fs";
import { helper } from "./util";
import { apiRouter } from "./routes";

const api: Application = express();

api.use(helmet());
api.use(express.json());
api.use(cors({ origin: "*" }));
api.use("/api", apiRouter);
api.use(helper.errorHandler);

const httpsOptions = {
  key: fs.readFileSync("./ssl.key"),
  cert: fs.readFileSync("./ssl.pem")
};
const httpsServer = https.createServer(httpsOptions, api);
const apiPort: number = 44455;
httpsServer.listen(apiPort, () => console.log(`server: https://localhost:${apiPort}`));
