import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { updateComment } from "../../services/comment.services.js";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

function CommentCard({ comment, onDelete, onRefresh }) {
  const user = useSelector((state) => state.auth.user);
  const isOwner = user?._id === comment.owner._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{comment.owner.fullName}</h3>

            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {isOwner && (
            <>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
                        setDeleteOpen(false);
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to delete comment");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </>
          )}
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

        {isEditing && (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await updateComment(comment._id, editedContent);
                  toast.success("Comment updated");
                  setIsEditing(false);
                  await onRefresh();
                } catch (err) {
                  toast.error("Failed to update");
                }
              }}
            >
              Save
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(comment.content);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentCard;
