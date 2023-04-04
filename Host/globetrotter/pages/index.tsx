import { useEffect, useState } from "react";
import { HopMessage } from "~/@types/HopMessage";
import { useSignalR } from "~/context/useSignalR";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const GetLocationUrl = () =>
  `https://gl-node-uk-func.azurewebsites.net/api/Globetrotter`;

const GetNodeLocation = (message: HopMessage): [number, number] => {
  const loc = Locations.find((l) => l.id === message.Node);
  return loc ? [loc.pos.long, loc.pos.lat] : [0, 0];
};

const Locations = [
  {
    id: "southafrica",
    name: "South Africa",
    pos: { lat: -26.204444, long: 28.045556 },
  },
  {
    id: "india",
    name: "India Central",
    pos: { lat: 18.520278, long: 73.856667 },
  },
  {
    id: "southasia",
    name: "SE Asia",
    pos: { lat: 1.283333, long: 103.833333 },
  },
  {
    id: "asia",
    name: "East Asia",
    pos: { lat: 22.3, long: 114.2 },
  },
  {
    id: "japan",
    name: "Japan",
    pos: { lat: 35.683333, long: 139.766667 },
  },
  {
    id: "westus",
    name: "West US",
    pos: { lat: 37.7775, long: -122.416389 },
  },
  {
    id: "southus",
    name: "South US",
    pos: { lat: 29.762778, long: -95.383056 },
  },
  {
    id: "canada",
    name: "East Canada",
    pos: { lat: 46.813889, long: -71.208056 },
  },
  {
    id: "uk",
    name: "UK",
    pos: { lat: 51.507222, long: -0.1275 },
  },
];

export default function Home() {
  const [messages, setMessages] = useState<HopMessage[]>([]);
  const [totalTime, setTotalTime] = useState<number>();
  const signalRConnection = useSignalR();

  useEffect(() => {
    if (signalRConnection.connection) {
      signalRConnection.connection.on("newMessage", (message) => {
        setMessages((m) => [...m, message]);
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length === 10) {
      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      const totalTime =
        new Date(lastMessage.Time).getTime() -
        new Date(firstMessage.Time).getTime();
      setTotalTime(totalTime);

      setTimeout(() => {
        setMessages([]);
      }, 1000);

      setTimeout(() => {
        setTotalTime(undefined);
      }, 3000);
    }
  }, [messages]);

  return (
    <div className="flex h-full m-3 space-x-3">
      <div className="flex flex-col border border-gray-600 justify-between w-64 px-3 py-3 right-3 top-3 bottom-3 bg-gray-800 shadow-lg rounded-lg text-white space-y-5">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex h-full flex-col">
            <div className="flex flex-col space-y-3 text-gray-200">
              <h1 className="text-2xl font-bold">Globetrotter</h1>
              <p className="text-sm italic">
                A race around the world via Azure Functions.
              </p>
              <hr className="border-gray-500" />
              <h3 className="text-xl font-bold">Why is this interesting?</h3>
              <p className="text-sm">
                Through deployments controlled via{" "}
                <a
                  href="https://www.terraform.io/"
                  className="underline text-green-400"
                >
                  Terraform
                </a>
                , deployment of Azure Functions running the{" "}
                <a
                  href="https://github.com/WhatFor/Globetrotter/blob/main/Node/Globetrotter.cs"
                  className="underline text-green-400"
                >
                  same code
                </a>{" "}
                can be shipped to multiple regions around the world.
              </p>
              <p className="text-sm">
                Each deployed node knows about the next node in the chain, and
                calls on to it when invoked.
              </p>
              <p className="text-sm">
                As each node is hit, it makes a call to Azure SignalR Service to
                notify you, the user!
              </p>
              <p className="text-sm">
                What you&apos;re seeing here is almost real-time data as the
                traffic navigates the globe.
              </p>
              <h4 className="text-lg font-bold">Click Start!</h4>
            </div>
            <button
              className="bg-green-300 text-gray-600 font-bold mt-10 hover:bg-green-400 transition rounded-lg px-12 py-2 w-full"
              onClick={() => fetch(GetLocationUrl())}
            >
              Start
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-3 w-full max-w-7xl">
        <div className="relative w-full">
          <ComposableMap>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#343434"
                    stroke="#555"
                  />
                ))
              }
            </Geographies>
            {messages &&
              messages.map((message) => (
                <Marker
                  key={`${message.Time.toString()}-${message.HopCount.toString()}`}
                  coordinates={GetNodeLocation(message)}
                >
                  <circle r="5" className="ping-1"></circle>
                  <circle r="4" className="ping-2"></circle>
                </Marker>
              ))}
          </ComposableMap>
          {totalTime && (
            <div className="absolute bottom-10 left-1/3 bg-gray-800 text-white p-2 rounded-lg">
              <p className="text-xl">Total time: {totalTime} milliseconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
