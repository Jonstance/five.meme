import { ethers } from "ethers"
import BNBLaunchPadFactory from "../ABIs/BNBLaunchPadFactory.json"
import BNBLaunchPad from "../ABIs/BNBLaunchPad.json"
import * as TokenAbi from "../ABIs/token.json"
import Erc20 from "../ABIs/IERC20Extra.json"
import vestingAbi from "../ABIs/vestingInfoABI.json"

export const STANDARD_TOKEN_FACTORY_ADDRESS = "0x3Be8b6CE8F0Ebf1C9284605F567d07C97B2aE017"
export const TOKEN_FACTORY_BASE_ADDRESS = "0x94D77085BB3B1628Af1953Ee8799247d05036493"
export const LAUNCHPAD_FACTORY_ADDRESS = "0x3e45Cea6a460a6144F01f9a2372BB54C68C7894A"

/**
 * Returns all contract and signer utilities using the Reown signer.
 * @param signer ethers.js Signer (from useSigner() or custom Wagmi signer)
 */
export const getConnectedContracts = (signer: ethers.Signer) => {
  const provider = signer.provider
  if (!provider) throw new Error("Provider not found on signer")

  return {
    signer,
    provider,
    signerAddress: signer.getAddress(), // you might still need to await this
    STANDARD_TOKEN_FACTORY_ADDRESS,
    TOKEN_FACTORY_BASE_ADDRESS,
    LAUNCHPAD_FACTORY_ADDRESS,
    BNBLaunchPadFactory,
    BNBLaunchPad,
    TokenAbi,
    Erc20,
    vestingAbi,
  }
}

export interface ConnectInterface {
  signer: ethers.Signer
  signerAddress: Promise<string> | string
  provider: ethers.providers.Provider
  STANDARD_TOKEN_FACTORY_ADDRESS: string
  TOKEN_FACTORY_BASE_ADDRESS: string
  LAUNCHPAD_FACTORY_ADDRESS: string
  BNBLaunchPadFactory: any
  BNBLaunchPad: any
  TokenAbi: any
  Erc20: any
  vestingAbi: any
}
