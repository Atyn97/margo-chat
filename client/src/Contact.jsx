import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onClick, selected, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-100 flex items-center gap-2 cursor-pointer hover:bg-sky-100 " +
        (selected ? "bg-sky-200" : "bg-white")
      }
    >
      {selected && <div className="w-1 h-12 bg-sky-500 rounded-r-md"></div>}
      <div className="flex py-2 pl-2 items-center gap-2">
        <Avatar online={online} username={username} userId={id} />{" "}
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
}
