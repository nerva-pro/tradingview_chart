import React from 'react';
import Head from 'next/head';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>Vittaverse Charts | Trade the world. All in one place</title>
        <meta name="keywords" content="vittaverse,forex,tradingview,stocks,mt5,commodities,etf,crypto,economic calender" />
        <meta name="description" content="Trade the world. All in one place" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}