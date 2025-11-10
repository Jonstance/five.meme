import { ethers } from "ethers"


export const getSigner = async () => {
  if (!window.ethereum) throw new Error("No wallet extension found")
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", [])
  return provider.getSigner()
}

