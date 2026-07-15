import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Globe, Lock, Upload } from "lucide-react";
import { Link } from "react-router-dom";

function DashboardTable({ videos, onTogglePublish, onDelete, onEdit }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 py-20 text-center">
        <div className="text-5xl">🎥</div>

        <h2 className="mt-5 text-2xl font-bold text-white">No uploads yet</h2>

        <p className="mt-3 text-slate-400">
          Your videos will appear here after you upload them.
        </p>

        <Link to="/upload">
          <Button className="mt-6 rounded-xl bg-red-600 hover:bg-red-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload your first video
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
      <table className="w-full">
        <thead className="border-b border-slate-800 bg-slate-900/60 text-sm font-semibold text-slate-500">
          <tr>
            <th className="p-4 text-left">Thumbnail</th>
            <th className="p-4 text-left">Video</th>
            <th className="p-4 text-left">Views</th>
            <th className="p-4 text-left">Visibility</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {videos.map((video) => (
            <tr
              key={video._id}
              className="group border-t border-slate-800 transition-all duration-300 hover:bg-slate-800/50"
            >
              <td className="max-w-xs p-4 font-medium">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-24 w-44 rounded-2xl object-cover shadow-lg transition duration-300 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/600x338/1e293b/ffffff?text=No+Image";
                  }}
                />
              </td>

              <td className="max-w-md p-6">
                <h3 className="truncate text-lg font-semibold text-white">
                  {video.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Uploaded recently
                </p>
              </td>

              <td className="p-6">
                <p className="text-lg font-semibold">
                  {video.views}
                </p>

                <span className="text-sm text-slate-500">
                  Views
                </span>
              </td>

              <td className="p-6">
                <Badge
                  className={
                    video.isPublished
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/20"
                      : "bg-slate-700/40 border border-slate-600 text-slate-300"
                  }
                >
                  {video.isPublished ? (
                    <>
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1 h-3 w-3" />
                      Private
                    </>
                  )}
                </Badge>
              </td>

              <td className="p-6">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700"
                    onClick={() => onTogglePublish(video._id)}
                  >
                    {video.isPublished ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-xl text-red-500 hover:bg-red-500/10"
                    onClick={() => onDelete(video._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-xl hover:bg-slate-700"
                    onClick={() => onEdit(video)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardTable;
