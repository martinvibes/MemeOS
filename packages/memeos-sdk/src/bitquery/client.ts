import WebSocket from 'ws'

const BITQUERY_ENDPOINT = 'https://streaming.bitquery.io/graphql'
const BITQUERY_WS_ENDPOINT = 'wss://streaming.bitquery.io/graphql'

export class BitqueryClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async query<T = unknown>(gql: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query: gql, variables }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Bitquery query failed: ${response.status} — ${text}`)
    }

    const json = await response.json()

    if (json.errors?.length) {
      throw new Error(`Bitquery GraphQL error: ${JSON.stringify(json.errors)}`)
    }

    return json.data as T
  }

  subscribe(
    gql: string,
    variables: Record<string, unknown>,
    onData: (data: unknown) => void,
    onError?: (error: Error) => void,
  ): { stop: () => void } {
    let ws: WebSocket | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return

      ws = new WebSocket(BITQUERY_WS_ENDPOINT, ['graphql-ws'], {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      ws.on('open', () => {
        ws!.send(JSON.stringify({
          type: 'connection_init',
          payload: { Authorization: `Bearer ${this.apiKey}` },
        }))

        // Small delay to let connection_init be processed
        setTimeout(() => {
          ws!.send(JSON.stringify({
            id: '1',
            type: 'start',
            payload: { query: gql, variables },
          }))
        }, 100)
      })

      ws.on('message', (raw: WebSocket.Data) => {
        try {
          const msg = JSON.parse(raw.toString())
          if (msg.type === 'data' && msg.payload?.data) {
            onData(msg.payload.data)
          } else if (msg.type === 'error') {
            onError?.(new Error(`Subscription error: ${JSON.stringify(msg.payload)}`))
          }
        } catch {
          // skip malformed messages
        }
      })

      ws.on('error', (err: Error) => {
        console.error('[Bitquery WS] Error:', err.message)
        onError?.(err)
      })

      ws.on('close', () => {
        if (!stopped) {
          console.log('[Bitquery WS] Reconnecting in 5s...')
          setTimeout(connect, 5000)
        }
      })
    }

    connect()

    return {
      stop: () => {
        stopped = true
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      },
    }
  }
}
