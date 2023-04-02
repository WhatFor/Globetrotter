import "~/styles/globals.css";
import type { AppProps } from "next/app";
import { SignalRContextProvider } from "~/context/useSignalR";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SignalRContextProvider hubName="hops">
      <Component {...pageProps} />
    </SignalRContextProvider>
  );
}
