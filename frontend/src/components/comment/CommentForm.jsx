import { useState } from "react";
import { Button } from "@/components/ui/button";

function CommentForm({ onSubmit, loading }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    onSubmit(content);

    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </Button>
    </form>
  );
}

export default CommentForm;
