import { useEffect, useState } from "react";
import { useSignalR } from "~/context/useSignalR";

interface HopMessage {
  Node: string;
  Time: string;
  HopCount: number;
}

const GetLocationUrl = (location: string) =>
  `https://gl-node-${location}-func.azurewebsites.net/api/Globetrotter`;

const Locations = [
  { id: "india", name: "India" },
  { id: "southafrica", name: "South Africa" },
];

export default function Home() {
  const [messages, setMesages] = useState<HopMessage[]>([]);
  const signalRConnection = useSignalR();

  useEffect(() => {
    if (signalRConnection.connection) {
      signalRConnection.connection.on("newMessage", (message) => {
        console.log("message received", message);
        setMesages((messages) => [...messages, message]);
      });
    }
  }, []);

  return (
    <div>
      <div className="fixed px-12 py-3 right-4 top-4 bottom-4 bg-gray-800 shadow rounded-lg text-white space-y-8">
        <h1 className="text-xl">Locations</h1>
        <div className="flex flex-col space-y-3">
          {Locations.map((loc) => (
            <div key={loc.id}>
              <button
                className="bg-gray-700 rounded-lg px-5 py-2 w-full"
                onClick={() => fetch(GetLocationUrl(loc.id))}
              >
                {loc.name}
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setMesages([])}
          className="text-white bg-gray-800 rounded w-full px-5 py-2"
        >
          Clear
        </button>
      </div>
      <div className="bg-red-100">
        {messages.map((message, index) => {
          return (
            <div key={index}>
              <div className="font-bold text-red-800">
                Hop #{message.HopCount}
              </div>
              <div>{message.Node}</div>
              <div>{message.Time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
