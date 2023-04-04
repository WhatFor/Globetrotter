import { createContext, useContext, useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

interface Props {
  hubName: string;
  children: React.ReactNode | React.ReactNode[];
}

interface SignalRContextProps {
  connection: HubConnection | null;
  connected: boolean;
}

const signalRContext = createContext<SignalRContextProps>({
  connection: null,
  connected: false,
});
const useSignalR = () => useContext(signalRContext);

const SignalRContextProvider = ({ children }: Props) => {
  const [connected, setConnected] = useState(false);

  const connection = new HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_ADDRESS}`)
    .withAutomaticReconnect()
    .build();

  const start = async () => {
    try {
      await connection.start();
      setConnected(true);
      console.log("SignalR Connected.");
    } catch (err) {
      console.log(err);
      //setTimeout(() => start(), 5000);
    }
  };

  connection.onclose(async () => {
    setConnected(false);
    await start();
  });

  useEffect(() => {
    start();
  }, []);

  return (
    <signalRContext.Provider value={{ connection, connected }}>
      {children}
    </signalRContext.Provider>
  );
};

export { SignalRContextProvider, useSignalR };
