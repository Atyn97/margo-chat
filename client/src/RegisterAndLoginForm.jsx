import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext); // put the info in the context after the registration

  async function handleSubmit(e) {
    e.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-sky-200 h-screen lg:p-4 lg:flex items-center justify-center ">
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <h1 className="mt-20 p-4 bg-gradient-to-b from-sky-400 via-sky-500  to-indigo-700 text-transparent bg-clip-text text-5xl sm:text-6xl font-bold">
            MargoChat
          </h1>
          <img
            src="/chat.png"
            alt=""
            className="w-16 h-16 mt-20 sm:w-[100] sm:h-[100]"
          />
        </div>
        <div className="flex m-auto w-[300px] sm:w-[380px] md:w-[380px] items-center">
          <h2 className="text-gray-700 text-lg sm:text-xl md:text-2xl font-bold">
            Connect with your friends around the world with MargoChat
          </h2>
        </div>
      </div>
      <div className="flex m-10 py-20 items-center justify-center bg-white md:py-20 md:ml-20 rounded-lg shadow-lg">
        <form className="mx-10 w-64 sm:mx-20 mb-4" onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username"
            className="block w-full rounded-md p-2 mb-2 border"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="block w-full rounded-md p-2 mb-2 border"
            required
          />
          <button className="bg-sky-500 text-white block w-full rounded-md p-2 hover:bg-sky-400">
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
          {isLoginOrRegister === "login" ? (
            <div className="text-center mt-2 text-sm">
              Don't have an account?{" "}
              <button onClick={() => setIsLoginOrRegister("register")}>
                Register now
              </button>
            </div>
          ) : (
            <div className="text-center mt-2 text-sm">
              Already a member?{" "}
              <button onClick={() => setIsLoginOrRegister("login")}>
                Login here
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
