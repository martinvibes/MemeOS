export interface DeployedToken {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  deployedAt: string // ISO timestamp
}

export function saveDeployedToken(token: DeployedToken) {
  const history = getDeployHistory()
  history.unshift(token)
  if (typeof window !== 'undefined') {
    localStorage.setItem('memeos-history', JSON.stringify(history.slice(0, 50)))
  }
}

export function getDeployHistory(): DeployedToken[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('memeos-history') || '[]')
  } catch {
    return []
  }
}
