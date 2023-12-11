import axios from "axios";
import { UserContextProvider } from "./UserContext";

import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = "https://margo-chat-server.vercel.app/";
  axios.defaults.withCredentials = false;

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}

export default App;
