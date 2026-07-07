import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.use(verifyJWT);

router.post("/:channelId", toggleSubscription);
router.get("/subscribers/:channelId", getUserChannelSubscribers);
router.get("/subscribed/:subscriberId", getSubscribedChannels);

export default router;
