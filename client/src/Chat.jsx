import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact.jsx";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserID] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    // to always connect to WebSocket, even if we change something in index.js(api)
    // we will always be connected to WebSocket, and the online user will not disappear
    const ws = new WebSocket("ws://https://margo-chat-server.vercel.app/");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    // try to reconnect in case it is disconnected
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect...");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    console.log({ e, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e, file = null) {
    if (e) e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendFile(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: e.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((person) => person._id !== id)
        .filter((person) => !Object.keys(onlinePeople).includes(person._id));

      const offlinePeople = {};
      offlinePeopleArr.forEach((person) => {
        offlinePeople[person._id] = person;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    // Use this reference to scroll to the bottom
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    // check if the a user is selected, then get the messages from the database
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen bg-sky-700">
      <div className="flex w-full lg:w-[90%] lg:h-[90%] lg:m-auto bg-sky-600 rounded-lg">
        <div
          className={
            "bg-white w-full sm:w-2/4 md:w-1/4 flex flex-col lg:rounded-tl-lg lg:rounded-bl-lg " +
            (selectedUserId &&
              "hidden sm:flex bg-whitesm:w-2/4 md:w-1/4 flex-col lg:rounded-tl-lg lg:rounded-bl-lg")
          }
        >
          <div className="flex-grow ">
            <Logo />
            {Object.keys(onlinePeopleExclOurUser).map((userId) => (
              <Contact
                key={userId}
                id={userId}
                online={true}
                username={onlinePeopleExclOurUser[userId]}
                onClick={() => setSelectedUserID(userId)}
                selected={userId === selectedUserId}
              />
            ))}
            {Object.keys(offlinePeople).map((userId) => (
              <Contact
                key={userId}
                id={userId}
                online={false}
                username={offlinePeople[userId].username}
                onClick={() => setSelectedUserID(userId)}
                selected={userId === selectedUserId}
              />
            ))}
          </div>
          <div className="p-2 text-center flex justify-center">
            <span className="mb-1 mr-2 text-sm text-gray-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
              {username}
            </span>
            <button
              onClick={logout}
              className="ml-4 text-sm text-white bg-sky-500 hover:bg-sky-400 px-4 py-1 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
        <div
          className={
            !selectedUserId
              ? "hidden sm:flex sm:flex-col sm:bg-sky-200 sm:w-3/4 sm:p-2 lg:rounded-tr-lg lg:rounded-br-lg"
              : "flex flex-col w-full sm:flex sm:flex-col bg-sky-200 sm:w-3/4 sm:p-2 lg:rounded-tr-lg lg:rounded-br-lg"
          }
        >
          <div className="flex bg-sky-200 h-16 items-center justify-end pr-6 border-b border-gray-100 gap-4 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-sky-500 hover:text-sky-400 cursor-pointer absolute left-0 m-2"
              onClick={() => setSelectedUserID(null)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-sky-500 hover:text-sky-400 cursor-pointer"
            >
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-sky-500 hover:text-sky-400 cursor-pointer"
            >
              <path
                fillRule="evenodd"
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-sky-500 hover:text-sky-400 cursor-pointer"
            >
              <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            </svg>
          </div>
          <div className="flex-grow">
            {!selectedUserId && (
              <div className="flex h-full flex-grow justify-center items-center">
                <div className="pl-3 pr-3 p-1 rounded-full text-sm bg-sky-300 ">
                  &larr; Select a chat to start messaging
                </div>
              </div>
            )}
          </div>
          {selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute inset-0  ">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left max-w-[50%] inline-block p-2 m-2 " +
                        (message.sender === id
                          ? "bg-sky-500 text-white rounded-tl-md rounded-bl-md rounded-br-md"
                          : "bg-white text-black rounded-tr-md rounded-bl-md rounded-br-md")
                      }
                    >
                      {message.text}
                      {message.file && (
                        <div>
                          <a
                            className="underline"
                            href={
                              axios.defaults.baseURL + "/uploads" + message.file
                            }
                          >
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
          {selectedUserId && (
            <form className="flex" onSubmit={sendMessage}>
              <label
                type="button"
                className="text-sky-400 p-2 bg-white rounded-tl-md rounded-bl-md hover:text-sky-300 cursor-pointer"
              >
                <input type="file" className="hidden" onChange={sendFile} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <input
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                type="text"
                placeholder="Type your message here"
                className="bg-white p-2 flex-grow outline outline-transparent "
              />
              <button
                type="submit"
                className="text-sky-400 p-2 bg-white rounded-tr-md rounded-br-md hover:text-sky-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
