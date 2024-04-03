// Assuming you're working in a browser environment that supports fetch and ReadableStream
const streamingUrl = 'https://api.nerva.pro/tradingview/chart/streaming'
const channelToSubscription = new Map()

// Format the date to a readable format
const options = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
};


function handleStreamingData(data) {
  const { id, p, t } = data

  const tradePrice = p
  const tradeTime = t * 1000 // Multiplying by 1000 to get milliseconds

  const channelString = id
  const subscriptionItem = channelToSubscription.get(channelString)
  // console.log('subscriptionItem : '+JSON.stringify(subscriptionItem, null, 2))
  if (!subscriptionItem) {
    return
  }
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second:'2-digit',
    hour12: true
  };
  
  const resolution = parseInt(subscriptionItem.resolution);
  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);
  const formatter = new Intl.DateTimeFormat('en-US', options);
  
  const lastDailyBarFormatted = formatter.format(lastDailyBar.time);// + ':00';
  const nextDailyBarTimeFormatted = formatter.format(nextDailyBarTime);// + ':00';
  
  // console.log('lastDailyBarFormatted: ' + lastDailyBarFormatted);
  // console.log('nextDailyBarTimeFormatted: ' + nextDailyBarTimeFormatted);
  
  // Convert formatted time strings into timestamp integers
  const getLastDailyBarTimestamp = (formattedTime) => {
    const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
    const currentDate = new Date();
    currentDate.setHours(hours, minutes, seconds, 0);
    return currentDate.getTime();
  };

  let resolutionInMinutes = subscriptionItem.resolution;

  if (resolution === '1D') {
    resolutionInMinutes = 1440; // 1 day in minutes
  } else if (resolution === '3D') {
    resolutionInMinutes = 4320; // 1 week in minutes
  } else if (resolution === '1W') {
    resolutionInMinutes = 10080; // 1 week in minutes
  } else if (resolution === '1M') {
    resolutionInMinutes = 43200; // 1 month in minutes
  } else {
    resolutionInMinutes = resolution; // Use the original resolution value
  }
  const lastDailyBarTimestamp = getLastDailyBarTimestamp(lastDailyBarFormatted);
  const nextDailyBarTimestamp = lastDailyBarTimestamp + (resolutionInMinutes * 60 * 1000);
  
  // console.log('lastDailyBarTimestamp: ' + lastDailyBarTimestamp);
  // console.log('nextDailyBarTimestamp: ' + nextDailyBarTimestamp);
  // console.log('Using resolution in minutes:', resolutionInMinutes);
  

  
  let bar
  if (tradeTime >= nextDailyBarTimestamp) {
    bar = {
      time: nextDailyBarTimestamp,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    }
    // console.log('[stream] Generate new bar', bar)
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, lastDailyBar.close),
      low: Math.min(lastDailyBar.low, lastDailyBar.close),
      close: tradePrice,
    }
    // console.log('[stream] Update the latest bar by price', tradePrice)
  }

  subscriptionItem.lastDailyBar = bar

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar))
  channelToSubscription.set(channelString, subscriptionItem)
}

function startStreaming(retries = 3, delay = 3000) {
  fetch(streamingUrl,{
    headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
  })
    .then((response) => {
      const reader = response.body.getReader()

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              // console.error('[stream] Streaming ended.')
              return
            }

            // Assuming the streaming data is separated by line breaks
            const dataStrings = new TextDecoder().decode(value).split('\n')
            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim()
              if (trimmedDataString) {
                try {
                  var jsonData = JSON.parse(trimmedDataString)
                  handleStreamingData(jsonData)
                } catch (e) {
                  // console.error('Error parsing JSON:', e.message)
                }
              }
            })

            streamData() // Continue processing the stream
          })
          .catch((error) => {
            // console.error('[stream] Error reading from stream:', error)
            attemptReconnect(retries, delay)
          })
      }

      streamData()
    })
    .catch((error) => {
      console.error(
        // '[stream] Error fetching from the streaming endpoint:',
        error
      )
    })
  function attemptReconnect(retriesLeft, delay) {
    if (retriesLeft > 0) {
      // console.log(`[stream] Attempting to reconnect in ${delay}ms...`)
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay)
      }, delay)
    } else {
      // console.error('[stream] Maximum reconnection attempts reached.')
    }
  }
}

function getNextDailyBarTime(barTime) {
  const date = new Date(barTime * 1000)
  date.setDate(date.getDate() + 1)
  return date.getTime() / 1000
}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastDailyBar
) {
  const channelString = symbolInfo.ticker
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  }
  let subscriptionItem = channelToSubscription.get(channelString)
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  }
  channelToSubscription.set(channelString, subscriptionItem)
  // console.log(
  //   '[subscribeBars]: Subscribe to streaming. Channel:',
  //   channelString
  // )

  // Start streaming when the first subscription is made
  startStreaming()
}

export function unsubscribeFromStream(subscriberUID) {
  // Find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString)
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    )

    if (handlerIndex !== -1) {
      // Unsubscribe from the channel if it is the last handler
      // console.log(
      //   '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
      //   channelString
      // )
      channelToSubscription.delete(channelString)
      break
    }
  }
}