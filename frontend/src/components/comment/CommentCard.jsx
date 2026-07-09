function CommentCard({ comment }) {
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

        <p className="mt-2 text-xs text-slate-500">
          {new Date(comment.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default CommentCard;
