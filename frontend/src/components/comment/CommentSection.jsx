import { useEffect, useState } from "react";
import { getVideoComments } from "../../services/comment.services.js";
import CommentCard from "./CommentCard.jsx";
import { addComment } from "../../services/comment.services.js";
import CommentForm from "./CommentForm.jsx";
function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getVideoComments(videoId);

        setComments(response.docs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComments();
  }, [videoId]);

  const handleAddComment = async (content) => {
    try {
      await addComment(videoId, content);

      const response = await getVideoComments(videoId);

      setComments(response.docs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">Comments ({comments.length})</h2>
      <CommentForm onSubmit={handleAddComment} />

      {comments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} />
      ))}
    </div>
  );
}

export default CommentSection;
