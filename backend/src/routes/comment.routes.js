import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";

const router = Router();

router.route("/:videoId").get(getVideoComments).post(verifyJWT, addComment);

router
  .route("/c/:commentId")
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;
