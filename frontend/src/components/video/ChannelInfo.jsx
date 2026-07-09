import { Button } from "../ui/button.jsx";

function ChannelInfo({ owner }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          src={owner.avatar}
          alt={owner.username}
          className="h-12 w-12 rounded-full"
        />

        <div>
          <h2 className="font-semibold">{owner.fullName}</h2>

          <p className="text-sm text-slate-400">@{owner.username}</p>
        </div>
      </div>

      <Button className="bg-red-600 hover:bg-red-700">Subscribe</Button>
    </div>
  );
}

export default ChannelInfo;
