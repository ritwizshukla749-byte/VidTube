import { useEffect, useState } from "react";
import { getVideoComments } from "../../services/comment.services.js";

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

  return (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl font-bold">Comments ({comments.length})</h2>

      {comments.map((comment) => (
        <div key={comment._id} className="mb-4 rounded-xl bg-slate-900 p-4">
          <p className="text-slate-200">{comment.content}</p>

          <p className="mt-2 text-xs text-slate-500">
            {new Date(comment.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CommentSection;
