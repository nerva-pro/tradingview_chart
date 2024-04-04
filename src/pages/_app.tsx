import React from 'react';
import Head from 'next/head';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>Nerva.pro | Charts</title>
        <meta name="keywords" content="nerva,tradingview,crypto" />
        <meta name="description" content="Nerva.pro | Charts" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}