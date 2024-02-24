import "@/styles/globals.css";
import type { AppProps } from "next/app";
import MegaMenu from "@/components/Menu/MenuBar";
import React from "react";
import { ProgramProvider } from '../context/ProgramContext';


export default function App({ Component, pageProps }: AppProps) {

  return (
      <ProgramProvider>
        <MegaMenu />
        <Component {...pageProps} />
      </ProgramProvider>
  );
}
