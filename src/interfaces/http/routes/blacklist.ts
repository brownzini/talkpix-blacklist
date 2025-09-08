import StoreService from "@infrastructure/services/StoreService";
import { Router } from "express";

import { io } from "socket.io-client";

const store = new Map();
let lastModified = null; 

const service = new StoreService(); 

const blacklistRoutes = Router();

const callSocket = io(process.env.QUEUE_MESSEGER_SERVER_ADDRESS, {
  transports: ["websocket"],
  auth: {
    handle: process.env.SERVER_BLACKLIST_HANDLE,
  },
});

callSocket.on(process.env.SERVER_BLACKLIST_ROUTE, (ip) => {
  service.cleanByExpiredTime(store, lastModified);
  service.addInMap(store, ip);
  lastModified = service.defineTimeLimit();
});

blacklistRoutes.get("/validate/:ip", async (req, res) => {
  const { ip } = req.params;
  const status = service.validateIfItIsOnTheBlacklist(store, ip);
  return res.status(200).json({ status });
});

export default blacklistRoutes;
