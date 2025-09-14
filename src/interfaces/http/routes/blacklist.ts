import StoreService from "@infrastructure/services/StoreService";
import { Router } from "express";

import { io } from "socket.io-client";

let lastTimestampModified = null;

let lastFirstIpModified = null;
let lastSecondIpModified = null;
let lastThirdIpModified = null;
let lastFourthIpModified = null;
let lastFifthIpModified = null;
const store = new Map();
const service = new StoreService();

const blacklistRoutes = Router();

const callSocket = io(process.env.QUEUE_MESSEGER_SERVER_ADDRESS, {
  transports: ["websocket"],
  auth: {
    handle: process.env.SERVER_BLACKLIST_HANDLE,
  },
});

callSocket.on(process.env.SERVER_BLACKLIST_ROUTE, (ip) => {
  const cleanedBefore = service.resetListIfExpiredTime(
    store,
    lastTimestampModified
  );
  cleanChunck(cleanedBefore);
  service.addInMap(store, ip);
  addNewIpAddressInLastUpdate(ip);
  lastTimestampModified = service.defineTimeLimit();
});

blacklistRoutes.get("/validate/:ip", async (req, res) => {
  const { ip } = req.params;
  const status = service.validateIfItIsOnTheBlacklist(store, ip);
  return res.status(200).json({ status });
});

function addNewIpAddressInLastUpdate(ip: string) {
  const oldtimestamp = lastFirstIpModified
    ? store.get(lastFirstIpModified)
    : null;
  const expired = new Date() >= new Date(oldtimestamp);
  const canInsert = verifyIfAllModfiedHasFilled();
  if (expired || !canInsert) {
    let oldFirst = lastFirstIpModified;
    lastFirstIpModified = ip;
    let oldSecond = lastSecondIpModified;
    if (oldFirst) lastSecondIpModified = oldFirst;
    let oldThird = lastThirdIpModified;
    if (oldSecond) lastThirdIpModified = oldSecond;
    let oldFourth = lastFourthIpModified;
    if (oldThird) lastFourthIpModified = oldThird;
    if (oldFourth) lastFifthIpModified = oldFourth;

    oldFirst = null;
    oldSecond = null;
    oldThird = null;
    oldFourth = null;
  }
}
function verifyIfAllModfiedHasFilled() {
  if (
    lastFirstIpModified &&
    lastSecondIpModified &&
    lastThirdIpModified &&
    lastFourthIpModified &&
    lastFifthIpModified
  )
    return true;
  else return false;
}
function cleanChunck(open: boolean) {
  if (open) {
    lastFirstIpModified = null;
    lastSecondIpModified = null;
    lastThirdIpModified = null;
    lastFourthIpModified = null;
    lastFifthIpModified = null;
  } else {
    service.clearOldIP(store, lastFirstIpModified);
    service.clearOldIP(store, lastSecondIpModified);
    service.clearOldIP(store, lastThirdIpModified);
    service.clearOldIP(store, lastFourthIpModified);
    service.clearOldIP(store, lastFifthIpModified);
  }
}

export default blacklistRoutes;
