import { useEffect, useState } from 'react'
import { CHAIN_ID } from '../constants'
import { TokenList } from '@uniswap/token-lists'
import { getForeignAddresses } from '../utils/addresses'

export interface TokenWithPerChainAddresses {
  addresses: { [chainId: number]: string }
  name: string
  symbol: string
  decimals: number
}

export const useListWithPerChainTokenAddresses = (tokenList?: TokenList) => {
  const [loading, setLoading] = useState(false)
  const [tokenWithPerChainAddresses, setTokenWithPerChainAddresses] = useState<TokenWithPerChainAddresses[]>([])

  useEffect(() => {
    const fetchTreasuryHoldings = async () => {
      if (tokenWithPerChainAddresses.length > 0 || !tokenList) return
      setLoading(true)
      try {
        const mainnetTokenAddresses = tokenList.tokens
          .filter((token) => token.chainId === CHAIN_ID.Mainnet)
          .map((mainnetToken) => mainnetToken.address)
        const tokenWithPerChainAddresses = tokenList.tokens
          .filter((token) => token.chainId === CHAIN_ID.Mainnet)
          .map((mainnetToken) => {
            return { ...mainnetToken, addresses: { [CHAIN_ID.Mainnet]: mainnetToken.address } }
          })
        await Promise.all(
          Object.values(CHAIN_ID).map(async (chainId) => {
            if (chainId === CHAIN_ID.Mainnet) return
            const tokenAddressesOnForeignChain = await getForeignAddresses(mainnetTokenAddresses, chainId)
            tokenWithPerChainAddresses.forEach((token, index) => {
              token.addresses[chainId] = tokenAddressesOnForeignChain[index]
            })
          })
        )
        setTokenWithPerChainAddresses(tokenWithPerChainAddresses)
      } catch (error) {
        console.error('error getting token addresses in other chains')
      } finally {
        setLoading(false)
      }
    }
    fetchTreasuryHoldings()
  }, [tokenList, tokenWithPerChainAddresses.length])

  return { loading, tokenWithPerChainAddresses }
}
