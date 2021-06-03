import { Interface } from '@ethersproject/abi'
import erc20Abi from './abis/erc20.json'
import xDaiMediatorAbi from './abis/xdai-mediator.json'

// not an enum to easily loop over it
export const CHAIN_ID = Object.freeze({
  Mainnet: 1,
  xDai: 100,
})

export const NATIVE_CURRENCY_SPEC = Object.freeze({
  [CHAIN_ID.Mainnet]: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
  },
  [CHAIN_ID.xDai]: {
    name: 'xDai',
    symbol: 'XDAI',
    decimals: 18,
    coingeckoId: 'xdai',
  },
})

export const DAO_AVATAR_ADDRESS = {
  [CHAIN_ID.Mainnet]: '0x519b70055af55a007110b4ff99b0ea33071c720a',
  [CHAIN_ID.xDai]: '0xe716ec63c5673b3a4732d22909b38d779fa47c3f',
}

export const COINGECKO_PLATFORM_ID = {
  [CHAIN_ID.Mainnet]: 'ethereum',
  [CHAIN_ID.xDai]: 'xdai',
}

export const PERMISSIVE_MULTICALL_ADDRESS = {
  [CHAIN_ID.Mainnet]: '0x0946f567d0ed891e6566c1da8e5093517f43571d',
  [CHAIN_ID.xDai]: '0x4E75068ED2338fCa56631E740B0723A6dbc1d5CD',
}

export const XDAI_MEDIATOR_ADDRESS = '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d'

export const RPC_URL = {
  [CHAIN_ID.Mainnet]: 'https://mainnet.infura.io/v3/0ebf4dd05d6740f482938b8a80860d13',
  [CHAIN_ID.xDai]: 'https://rpc.xdaichain.com/',
}

export const ERC20_INTERFACE = new Interface(erc20Abi)
export const XDAI_MEDIATOR_INTERFACE = new Interface(xDaiMediatorAbi)
