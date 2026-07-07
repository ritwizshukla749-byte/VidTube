import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createPlaylist);
router.get("/user/:userId", getUserPlaylists);
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);
router.patch("/add/:playlistId/:videoId", addVideoToPlaylist);
router.patch("/remove/:playlistId/:videoId", removeVideoFromPlaylist);

export default router;