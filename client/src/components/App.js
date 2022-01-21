import { ContactsProvider } from "../Context/ContactsProvider";
import { ConversationProvider } from "../Context/ConversationProvider";
import { SocketProvider } from "../Context/SocketProvider";
import useLocalStorage from "../hooks/useLocalStorage";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [id, setId] = useLocalStorage("id");

  const dashboard = (
    <SocketProvider id={id}>
      <ContactsProvider>
        <ConversationProvider id={id}>
          <Dashboard id={id} />
        </ConversationProvider>
      </ContactsProvider>
    </SocketProvider>
  );

  return (
    <div className="App">{id ? dashboard : <Login onIdSubmit={setId} />}</div>
  );
}

export default App;
