// pages/api/stream.js

// Import required dependencies
import { useEffect } from 'react';
import io from 'socket.io-client';

// Function to create a channel string for subscriptions
function createChannelString(symbolInfo) {
  const channel = symbolInfo.name.split(/[:/]/);
  const to = channel[1];
  const from = channel[0];
  return `0~${from}-${to}~${from}~${to}`;
}

// Function to update bar data
function updateBar(data, lastBar, resolution) {
  const rounded = Math.floor(data.ts / (resolution * 60)) * (resolution * 60);
  if (rounded > lastBar.time / 1000) {
    return {
      time: rounded * 1000,
      open: lastBar.close,
      high: lastBar.close,
      low: lastBar.close,
      close: data.price,
      volume: data.volume
    };
  } else {
    if (data.price < lastBar.low) {
      lastBar.low = data.price;
    } else if (data.price > lastBar.high) {
      lastBar.high = data.price;
    }
    lastBar.volume += data.volume;
    lastBar.close = data.price;
    return lastBar;
  }
}

// Next.js API route
export default function StreamPage() {
  useEffect(() => {
    // Connect to WebSocket server
    const socketUrl = 'wss://streamer.cryptocompare.com';
    const socket = io(socketUrl);

    // Keep track of subscriptions
    const subs = [];

    // Event listener for socket connection
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    // Event listener for socket disconnection
    socket.on('disconnect', (e) => {
      console.log('Socket disconnected:', e);
    });

    // Event listener for socket errors
    socket.on('error', err => {
      console.log('Socket error:', err);
    });

    // Event listener for incoming WebSocket messages
    socket.on('m', (e) => {
      // Handle incoming messages
      const data = e.split('~');
      if (data[0] === "3") {
        return; // Disregard initial catchup snapshot
      }

      const symbolInfo = {
        name: `${data[3]}:${data[2]}` // Assuming format is 'FROM:TO'
      };

      const channelString = createChannelString(symbolInfo);
      const sub = subs.find(e => e.channelString === channelString);

      if (sub) {
        const resolution = sub.resolution;
        const lastBar = sub.lastBar;
        const newData = {
          sub_type: parseInt(data[0], 10),
          exchange: data[1],
          to_sym: data[2],
          from_sym: data[3],
          trade_id: data[5],
          ts: parseInt(data[6], 10),
          volume: parseFloat(data[7]),
          price: parseFloat(data[8])
        };

        if (newData.ts < lastBar.time / 1000) {
          return; // Disregard if older than last bar time
        }

        const updatedBar = updateBar(newData, lastBar, resolution);
        sub.listener(updatedBar);
        sub.lastBar = updatedBar;
      }
    });

    // Cleanup function
    return () => {
      // Unsubscribe and disconnect socket on component unmount
      subs.forEach(sub => {
        socket.emit('SubRemove', { subs: [sub.channelString] });
      });
      socket.disconnect();
    };
  }, []);

  // Return nothing because API routes in Next.js do not return JSX
  return null;
}
