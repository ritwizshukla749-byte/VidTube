import { useEffect, useState } from "react";
import CommentCard from "./CommentCard.jsx"
import {
  getVideoComments,
  addComment,
  deleteComment,
} from "../../services/comment.services.js";
import CommentForm from "./CommentForm.jsx";
function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);

  
  const fetchComments = async () => {
  try {
    const response = await getVideoComments(videoId);
    setComments(response.docs);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchComments();
}, [videoId]);

  const handleAddComment = async (content) => {
    try {
      await addComment(videoId, content);
      await fetchComments();
     
    } catch (err) {
      console.error(err);
    }
  };
const handleDeleteComment = async (commentId) => {
  try {
    await deleteComment(commentId);
    await fetchComments();
  } catch (error) {
    console.error(error);
  }
};
  return (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">Comments ({comments.length})</h2>
      <CommentForm onSubmit={handleAddComment} />

      {comments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} onDelete={handleDeleteComment} onRefresh={fetchComments} />
      ))}
    </div>
  );
}

export default CommentSection;
