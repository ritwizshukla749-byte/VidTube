import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { updateComment } from "../../services/comment.services.js";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

function CommentCard({ comment, onDelete, onRefresh }) {
  const user = useSelector((state) => state.auth.user);
  const isOwner = user?._id === comment.owner._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  useEffect(() => {
    setEditedContent(comment.content);
  }, [comment]);

  return (
    <div className="mb-5 flex gap-4">
      <img
        src={comment.owner.avatar}
        alt={comment.owner.username}
        className="h-10 w-10 rounded-full object-cover"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{comment.owner.fullName}</h3>

          <span className="text-sm text-slate-500">
            @{comment.owner.username}
          </span>
        </div>

        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white"
          />
        ) : (
          <p className="mt-2 text-slate-300">{comment.content}</p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {new Date(comment.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          {isOwner && (
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await updateComment(comment._id, editedContent);
                      toast.success("Comment updated");
                      setIsEditing(false);
                      await onRefresh(); // Refresh comments after update
                    } catch (err) {
                      toast.error("Failed to update");
                    }
                  }}
                >
                  Save
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment?</AlertDialogTitle>

                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await onDelete(comment._id);
                          toast.success("Comment deleted");
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to delete comment");
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
