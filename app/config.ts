import { createConfig, http } from "wagmi"
import { mainnet, arbitrum } from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "wagmi"

export const projectId = "2a9df62f6ea118676da017382c0c9112"

export const metadata = {
  name: "Hedge AI",
  description: "Next-Generation Investment Intelligence",
  url: "https://hedge-ai.com", // Update this with your actual URL
  icons: ["https://hedge-ai.com/icon.png"], // Update this with your actual icon URL
}

export const networks = [mainnet, arbitrum]

export const config = createConfig({
  chains: networks,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
})

