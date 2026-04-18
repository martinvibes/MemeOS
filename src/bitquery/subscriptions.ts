export const LIVE_TRADES_SUBSCRIPTION = `
  subscription LiveTrades($token: String!) {
    EVM(network: bsc) {
      DEXTrades(
        where: {
          Trade: {
            Buy: { Currency: { SmartContract: { is: $token } } }
            Dex: { ProtocolName: { is: "fourmeme_v1" } }
          }
        }
      ) {
        Trade {
          Buy {
            Buyer
            Amount
            PriceInUSD
            Currency { Name Symbol SmartContract }
          }
          Sell {
            Amount
            Currency { Name Symbol }
          }
        }
        Block { Time }
        Transaction { Hash }
      }
    }
  }
`

export const LIVE_MARKET_CAP_SUBSCRIPTION = `
  subscription LiveMarketCap($token: String!) {
    Trading {
      Pairs(
        where: {
          Interval: { Time: { Duration: { eq: 1 } } }
          Price: { IsQuotedInUsd: true }
          Market: {
            Protocol: { is: "fourmeme_v1" }
            Network: { is: "Binance Smart Chain" }
          }
          Token: { Address: { is: $token } }
        }
      ) {
        Price {
          Average { Mean }
          Ohlc { Close High Low Open }
        }
        Volume { Usd }
        marketcap: calculate(expression: "Price_Average_Mean * 1000000000")
      }
    }
  }
`
