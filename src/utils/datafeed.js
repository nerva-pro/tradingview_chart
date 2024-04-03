import { subscribeOnStream, unsubscribeFromStream } from './streaming.js'

const API_ENDPOINT = 'https://api.nerva.pro/tradingview/chart'

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map()

// const datafeed = {
//   onReady: (callback) => {
//     console.log('[onReady]: Method call')
//     fetch(`${API_ENDPOINT}/config`).then((response) => {
//       response.json().then((configurationData) => {
//         setTimeout(() => callback(configurationData))
//       })
//     })
//   },

const datafeed = {
  onReady: (callback) => {
    //console.log('[onReady]: Method call')
    const configurationData = {
      supports_search: true,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
      // exchanges: [
      //     { value: "", name: "All Exchanges", desc: "" },
      //     { value: "NasdaqNM", name: "NasdaqNM", desc: "NasdaqNM" },
      //     { value: "NYSE", name: "NYSE", desc: "NYSE" }
      // ],
      // symbols_types: [
      //     { name: "All types", value: "" },
      //     { name: "Stock", value: "stock" },
      //     { name: "Index", value: "index" },
      //     { name: "Forex", value: "forex" },
      //     { name: "ETF", value: "ETFS" },
      //     { name: "Commodity", value: "commodity" },
      //     { name: "Crypto", value: "crypto" }
      // ],
      supported_resolutions: ["1","3","5","15","30","60","120","240","360","480","720","D","1D","3D","1W","1M"]
  }
    setTimeout(() => callback(configurationData));
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    //console.log('[searchSymbols]: Method call')
    fetch(`${API_ENDPOINT}/search?query=${userInput}`).then((response) => {
      response.json().then((data) => {
        onResultReadyCallback(data)
      })
    })
  },
  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    //console.log('[resolveSymbol]: Method call', symbolName)
    fetch(`${API_ENDPOINT}/symbols?symbol=${symbolName}`).then((response) => {
      response
        .json()
        .then((symbolInfo) => {
          onSymbolResolvedCallback(symbolInfo)
        })
        .catch((error) => {
          //console.log('[resolveSymbol]: Cannot resolve symbol', symbolName)
          onResolveErrorCallback('Cannot resolve symbol')
          return
        })
    })
  },
  getBars: (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    const { from, to, firstDataRequest } = periodParams
    // console.log('[getBars]: Method call', symbolInfo, resolution, from, to)
    fetch(
      `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&resolution=${resolution}`//&from=${periodParams.from}&to=${periodParams.to}
    ).then((response) => {
      response
        .json()
        .then((data) => {
          // If the API didn't return any data, we return noData=true to the charting library
          // We do this by checking the length of the ticker array from the response
          if (data.t.length === 0) {
            // We need to adjust the end time to the previous day, because the charting library
            // expects the bars to be in ascending order from oldest to newest
            // let time = new Date(periodParams.to * 1000);
            // time.setUTCHours(0);
            // time.setUTCMinutes(0);
            // time.setUTCMilliseconds(0);
            // time.setUTCDate(time.getUTCDate() - 1);
            onHistoryCallback([], { noData: true })
            return // Return early to prevent creating any bars
          }
          // If the API did return data, we create an array of bars from the response
          const bars = []
          for (let i = 0; i < data.t.length; ++i) {
            // We need to adjust the bar time to UTC, because the charting library
            // expects the bars to be in UTC time
            let adjustedTime = new Date(data.t[i] * 1000);// - 3 * 60 * 60 * 1000);
            // We push each bar into the bars array
            bars.push({
              time: adjustedTime.getTime(), // We use getTime() to convert the Date to a number of milliseconds since the Unix epoch
              low: data.l[i], // These are the low, high, open, close and volume values from the API response
              high: data.h[i],
              open: data.o[i],
              close: data.c[i],
              volume: data.v[i],
            })
          }
          // If this is the first data request for this symbol, we store the most recent bar in the cache
          if (firstDataRequest) {
            lastBarsCache.set(symbolInfo.ticker, {
              ...bars[bars.length - 1], // We use spread syntax to create a new object with the properties of the last bar
            })
          }
          // We call the onHistoryCallback with the bars array and noData:false flag
          onHistoryCallback(bars, { noData: true })
        })
        .catch((error) => {
          //console.log('[getBars]: Get error', error)
          onErrorCallback(error)
        })
    })
  },
  
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    //console.log(
      // '[subscribeBars]: Method call with subscriberUID:',
      // subscriberUID
    //)
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.ticker)
    )
  },
  unsubscribeBars: (subscriberUID) => {
    //console.log(
      // '[unsubscribeBars]: Method call with subscriberUID:',
      // subscriberUID
    //)
    unsubscribeFromStream(subscriberUID)
  },
}

export default datafeed