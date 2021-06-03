import { useEffect, useState } from 'react'
import {
  ERC20_INTERFACE,
  PERMISSIVE_MULTICALL_ADDRESS,
  RPC_URL,
  DAO_AVATAR_ADDRESS,
  CHAIN_ID,
  NATIVE_CURRENCY_SPEC,
} from '../constants'
import { useTokenList } from './useTokenList'
import { JsonRpcProvider } from '@ethersproject/providers'
import { PermissiveMulticall__factory } from '../typechain/factories/PermissiveMulticall__factory'
import { BigNumber, ethers } from 'ethers'
import { Decimal } from 'decimal.js-light'
import { formatUnits } from 'ethers/lib/utils'
import { useListWithPerChainTokenAddresses } from './useListWithPerChainTokenAddresses'

export interface Holding {
  address: string
  ethereumMainnetAddress: string
  name: string
  symbol: string
  balance: Decimal
  decimals: number
  usdPrice: Decimal
}

interface TreasuryBreakdown {
  chainId: number
  holdings: Holding[]
  totalUsdValue: Decimal
}

export const useTreasuryBreakdown = () => {
  const { tokenList, loading: loadingTokenList } = useTokenList()
  const { tokenWithPerChainAddresses, loading: loadingTokenWithPerChainAddresses } = useListWithPerChainTokenAddresses(
    tokenList || undefined
  )

  const [loading, setLoading] = useState(false)
  const [treasuryBreakdown, setTreasuryBreakdown] = useState<TreasuryBreakdown[]>([])

  useEffect(() => {
    const fetchTreasuryHoldings = async () => {
      if (treasuryBreakdown.length > 0 || !tokenWithPerChainAddresses || loadingTokenWithPerChainAddresses) return
      setLoading(true)
      try {
        const nativeCurrencyPricesResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(NATIVE_CURRENCY_SPEC)
            .map((nativeCurrencySpec) => nativeCurrencySpec.coingeckoId)
            .join(',')}&vs_currencies=usd`
        )
        if (!nativeCurrencyPricesResponse.ok) {
          console.error('error fetching native currency prices')
          return
        }
        const nativeCurrencyPrices = (await nativeCurrencyPricesResponse.json()) as { [id: string]: { usd: string } }
        const holdingsPerChain = await Promise.all(
          Object.values(CHAIN_ID).map(async (chainId) => {
            const daoAvatarAddress = DAO_AVATAR_ADDRESS[chainId]
            const provider = new JsonRpcProvider(RPC_URL[chainId])
            const nonZeroBalances = []
            const nativeCurrencyBalance = await provider.getBalance(daoAvatarAddress)
            if (!nativeCurrencyBalance.isZero()) {
              const nativeCurrency = NATIVE_CURRENCY_SPEC[chainId]
              nonZeroBalances.push({
                address: ethers.constants.AddressZero,
                name: nativeCurrency.name,
                symbol: nativeCurrency.symbol,
                decimals: nativeCurrency.decimals,
                balance: new Decimal(formatUnits(nativeCurrencyBalance, nativeCurrency.decimals)),
                usdPrice: new Decimal(nativeCurrencyPrices[nativeCurrency.coingeckoId].usd),
                ethereumMainnetAddress: ethers.constants.AddressZero,
              })
            }
            const permissiveMulticall = PermissiveMulticall__factory.connect(
              PERMISSIVE_MULTICALL_ADDRESS[chainId],
              provider
            )
            const callData = ERC20_INTERFACE.encodeFunctionData('balanceOf(address)', [daoAvatarAddress])
            const calls = tokenWithPerChainAddresses.map((token) => ({ target: token.addresses[chainId], callData }))
            const result = await permissiveMulticall.aggregateWithPermissiveness(calls)
            nonZeroBalances.push(
              ...result.callOutcomes.reduce((accumulator: Holding[], outcome, index) => {
                const relatedToken = tokenWithPerChainAddresses[index]
                let balance
                if (
                  !outcome.success ||
                  outcome.data === '0x' ||
                  (balance = ERC20_INTERFACE.decodeFunctionResult(
                    'balanceOf(address)',
                    outcome.data
                  )[0] as BigNumber).isZero()
                ) {
                  console.error(`failed fetching balance for ${relatedToken.symbol} on chain ${chainId}`)
                  return accumulator
                }
                accumulator.push({
                  address: relatedToken.addresses[chainId],
                  name: relatedToken.name,
                  symbol: relatedToken.symbol,
                  decimals: relatedToken.decimals,
                  balance: new Decimal(formatUnits(balance, relatedToken.decimals)),
                  usdPrice: new Decimal(0),
                  ethereumMainnetAddress: relatedToken.addresses[CHAIN_ID.Mainnet],
                })
                return accumulator
              }, [])
            )
            const tokenPricesResponse = await fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/ethereum?vs_currencies=usd&contract_addresses=${nonZeroBalances
                .map((balance) => balance.ethereumMainnetAddress)
                .join(',')}`
            )
            let totalUsdValue = new Decimal(0)
            if (!tokenPricesResponse.ok) {
              console.error('error fetching token prices')
              return { chainId, holdings: [], totalUsdValue }
            }
            const tokenPrices = (await tokenPricesResponse.json()) as { [address: string]: { usd: string } }
            const holdings = nonZeroBalances.map((nonZeroBalance) => {
              if (nonZeroBalance.usdPrice.gt(0)) {
                totalUsdValue = totalUsdValue.plus(nonZeroBalance.balance.times(nonZeroBalance.usdPrice))
                return nonZeroBalance
              }
              const lowercaseAddress = nonZeroBalance.ethereumMainnetAddress.toLowerCase()
              const usdPrice = new Decimal(tokenPrices[lowercaseAddress] ? tokenPrices[lowercaseAddress].usd : 0)
              totalUsdValue = totalUsdValue.plus(nonZeroBalance.balance.times(usdPrice))
              return {
                ...nonZeroBalance,
                usdPrice,
              }
            })
            return {
              chainId,
              holdings,
              totalUsdValue,
            }
          })
        )
        setTreasuryBreakdown(holdingsPerChain)
      } finally {
        setLoading(false)
      }
    }
    fetchTreasuryHoldings()
  }, [treasuryBreakdown, tokenWithPerChainAddresses, loadingTokenWithPerChainAddresses])

  return { loading, treasuryBreakdown }
}
