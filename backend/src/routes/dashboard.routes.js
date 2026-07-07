import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();

router.use(verifyJWT);

router.get("/stats", getChannelStats);
router.get("/videos", getChannelVideos);

export default router;
