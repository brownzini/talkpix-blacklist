import { Router } from "express";
import blacklistRoutes from "./blacklist";

const router = Router();

router.use("/blacklist", blacklistRoutes);

export { router };
