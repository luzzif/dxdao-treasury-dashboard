import {
  CHAIN_ID,
  PERMISSIVE_MULTICALL_ADDRESS,
  RPC_URL,
  XDAI_MEDIATOR_ADDRESS,
  XDAI_MEDIATOR_INTERFACE,
} from '../../constants'
import { PermissiveMulticall__factory } from '../../typechain/factories/PermissiveMulticall__factory'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

export const getForeignAddresses = async (ethereumMainnetAddresses: string[], chainId: number): Promise<string[]> => {
  if (chainId === CHAIN_ID.Mainnet) return ethereumMainnetAddresses
  switch (chainId) {
    case CHAIN_ID.xDai: {
      return getXDaiAddresses(ethereumMainnetAddresses)
    }
    default: {
      return ethereumMainnetAddresses
    }
  }
}

const getXDaiAddresses = async (ethereumMainnetAddresses: string[]): Promise<string[]> => {
  const permissiveMulticall = PermissiveMulticall__factory.connect(
    PERMISSIVE_MULTICALL_ADDRESS[CHAIN_ID.xDai],
    new JsonRpcProvider(RPC_URL[CHAIN_ID.xDai])
  )
  const calls = ethereumMainnetAddresses.map((tokenAddress) => ({
    target: XDAI_MEDIATOR_ADDRESS,
    callData: XDAI_MEDIATOR_INTERFACE.encodeFunctionData('homeTokenAddress(address)', [tokenAddress]),
  }))
  const result = await permissiveMulticall.aggregateWithPermissiveness(calls)
  return result.callOutcomes.map((outcome) => {
    let xDaiTokenAddress
    if (
      !outcome.success ||
      outcome.data === '0x' ||
      !(xDaiTokenAddress = XDAI_MEDIATOR_INTERFACE.decodeFunctionResult('homeTokenAddress(address)', outcome.data)[0])
    ) {
      console.error(`failed fetching token address on xdai`)
      return ethers.constants.AddressZero
    }
    return xDaiTokenAddress
  })
}
