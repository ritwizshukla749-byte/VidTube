import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Globe, Lock } from "lucide-react";
function DashboardTable({ videos, onTogglePublish, onDelete, onEdit }) {
  return (
    <div className="overflow-hidden rounded-xl bg-slate-900">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-4 text-left">Thumbnail</th>
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Views</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {videos.map((video) => (
            <tr key={video._id} className="border-t border-slate-800">
              <td className="p-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-16 w-28 rounded-lg object-cover"
                />
              </td>

              <td className="p-4">{video.title}</td>

              <td className="p-4">{video.views}</td>

              <td className="p-4">
                <Badge variant={video.isPublished ? "default" : "secondary"}>
                  {video.isPublished ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Badge>
              </td>

              <td className="p-4">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onTogglePublish(video._id)}>
                    {video.isPublished ? "Private" : "Publish"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(video._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
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
