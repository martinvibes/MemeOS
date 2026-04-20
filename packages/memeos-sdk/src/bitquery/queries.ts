export const TOKENS_CREATED_BY_DEV = `
  query TokensCreatedByDev($dev: String!, $since: String!) {
    EVM(network: bsc, dataset: combined) {
      Transfers(
        limit: { count: 50 }
        orderBy: { descending: Block_Time }
        where: {
          Block: { Date: { since: $since } }
          Transfer: { Sender: { is: "0x0000000000000000000000000000000000000000" } }
          Transaction: { From: { is: $dev } }
        }
      ) {
        Block { Time }
        Transaction { Hash From To }
        Transfer {
          Amount
          Currency { Name Symbol SmartContract }
        }
      }
    }
  }
`

export const TOP_TOKENS_BY_VOLUME = `
  query TopTokensByVolume {
    EVM(network: bsc, dataset: combined) {
      DEXTradeByTokens(
        limit: { count: 20 }
        orderBy: { descendingByField: "volume_24hr" }
        where: {
          Block: { Time: { since_relative: { hours_ago: 24 } } }
          TransactionStatus: { Success: true }
          Trade: { Dex: { ProtocolName: { is: "fourmeme_v1" } } }
        }
      ) {
        Trade {
          Currency { Name Symbol SmartContract }
          current: Price(maximum: Block_Time)
        }
        volume_24hr: sum(of: Trade_Side_AmountInUSD)
        buyers_24hr: count(distinct: Transaction_From
          if: { Trade: { Side: { Type: { is: buy } } } })
      }
    }
  }
`

export const RECENT_TOKEN_LAUNCHES = `
  query RecentLaunches {
    EVM(dataset: realtime, network: bsc) {
      Events(
        where: {
          Transaction: { To: { is: "0x5c952063c7fc8610ffdb798152d69f0b9550762b" } }
          Log: { Signature: { Name: { is: "TokenCreate" } } }
        }
        limit: { count: 50 }
        orderBy: { descending: Block_Time }
      ) {
        Arguments {
          Name
          Value {
            ... on EVM_ABI_String_Value_Arg { string }
            ... on EVM_ABI_Address_Value_Arg { address }
          }
        }
        Block { Time }
        Transaction { Hash }
      }
    }
  }
`

export const BONDING_CURVE_LEADERS = `
  query BondingCurveLeaders {
    EVM(dataset: combined, network: bsc) {
      BalanceUpdates(
        limit: { count: 50 }
        where: {
          BalanceUpdate: {
            Address: { is: "0x5c952063c7fc8610FFDB798152D69F0B9550762b" }
          }
        }
        orderBy: { descendingByField: "Bonding_Curve_Progress_precentage" }
      ) {
        Currency { SmartContract Name Symbol }
        balance: sum(of: BalanceUpdate_Amount
          selectWhere: { ge: "200000000" le: "1000000000" })
        Bonding_Curve_Progress_precentage: calculate(
          expression: "100 - ((($balance - 200000000) * 100) / 800000000)"
        )
      }
    }
  }
`

export const TOKEN_OHLCV = `
  query TokenOHLCV($token: String!) {
    EVM(network: bsc, dataset: combined) {
      DEXTradeByTokens(
        limit: { count: 50 }
        orderBy: { descendingByField: "Block_Time" }
        where: {
          Trade: {
            Currency: { SmartContract: { is: $token } }
            PriceAsymmetry: { lt: 0.1 }
            Dex: { ProtocolName: { is: "fourmeme_v1" } }
          }
        }
      ) {
        Block { Time(interval: { count: 5 in: minutes }) }
        Trade {
          open: PriceInUSD(minimum: Block_Number)
          close: PriceInUSD(maximum: Block_Number)
          max: PriceInUSD(maximum: Trade_PriceInUSD)
          min: PriceInUSD(minimum: Trade_PriceInUSD)
        }
        volumeUSD: sum(of: Trade_Side_AmountInUSD selectWhere: { gt: "0" })
      }
    }
  }
`

export const TOP_HOLDERS = `
  query TopHolders($token: String!) {
    EVM(network: bsc) {
      TransactionBalances(
        where: {
          TokenBalance: {
            Currency: { SmartContract: { is: $token } }
          }
          TransactionStatus: { Success: true }
        }
        limit: { count: 10 }
        orderBy: { descendingByField: "holding_percentage" }
      ) {
        TokenBalance {
          Address
          Balance: PostBalance(maximum: Block_Time)
        }
        holding_percentage: calculate(
          expression: "$TokenBalance_Balance / 10000000"
        )
      }
    }
  }
`

export const BONDING_CURVE_PROGRESS = `
  query BondingProgress($token: String!) {
    EVM(dataset: combined, network: bsc) {
      BalanceUpdates(
        where: {
          BalanceUpdate: {
            Address: { is: "0x5c952063c7fc8610FFDB798152D69F0B9550762b" }
          }
          Currency: { SmartContract: { is: $token } }
        }
      ) {
        balance: sum(of: BalanceUpdate_Amount)
      }
    }
  }
`
