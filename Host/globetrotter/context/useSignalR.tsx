import { createContext, useContext, useEffect } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

interface Props {
  hubName: string;
  children: React.ReactNode | React.ReactNode[];
}

interface SignalRContextProps {
  connection: HubConnection | null;
}

const signalRContext = createContext<SignalRContextProps>({ connection: null });
const useSignalR = () => useContext(signalRContext);

const SignalRContextProvider = ({ children }: Props) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_ADDRESS}`)
    .withAutomaticReconnect()
    .build();

  const start = async () => {
    try {
      await connection.start();
      console.log("SignalR Connected.");
    } catch (err) {
      console.log(err);
      //setTimeout(() => start(), 5000);
    }
  };

  connection.onclose(async () => {
    await start();
  });

  useEffect(() => {
    start();
  }, []);

  return (
    <signalRContext.Provider value={{ connection }}>
      {children}
    </signalRContext.Provider>
  );
};

export { SignalRContextProvider, useSignalR };
