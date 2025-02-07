interface Window {
  ethereum?: {
    isMetaMask?: boolean
    request: (request: { method: string; params?: Array<any> }) => Promise<any>
    on: (event: string, callback: (params: any) => void) => void
    removeAllListeners: () => void
  }
}

