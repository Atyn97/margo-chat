export default function Logo() {
  return (
    <div className="flex gap-2 mb-2 p-4 items-center">
      <img src="/chat.png" alt="" width={30} height={30} />
      <h3 className="bg-gradient-to-b from-sky-400 via-sky-500  to-indigo-700 text-transparent bg-clip-text text-lg font-bold">
        MargoChat
      </h3>
    </div>
  );
}
