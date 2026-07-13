import { useSelector } from "react-redux";
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
function CommentCard({ comment, onDelete }) {
  const user = useSelector((state) => state.auth.user);
  const isOwner = user?._id === comment.owner._id;
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

        <p className="mt-2 text-slate-300">{comment.content}</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {new Date(comment.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          {isOwner && (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
