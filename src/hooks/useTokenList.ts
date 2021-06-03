import { useEffect, useState } from 'react'
import { TokenList } from '@uniswap/token-lists'

const TOKEN_LIST_URI = 'https://bafybeifwizjbhnji66f3pac7lclzmmzmyubnrhflo33p4jusm32ry7zpka.ipfs.dweb.link'

export const useTokenList = () => {
  const [loading, setLoading] = useState(false)
  const [tokenList, setTokenList] = useState<TokenList | null>(null)

  useEffect(() => {
    const fetchTokenList = async () => {
      setLoading(true)
      try {
        const response = await fetch(TOKEN_LIST_URI)
        if (!response.ok) {
          console.error('could not fetch token list')
          setTokenList(null)
          return
        }
        const json = await response.json()
        setTokenList(json as TokenList)
      } finally {
        setLoading(false)
      }
    }
    if (!tokenList) {
      fetchTokenList()
    }
  }, [tokenList])

  return { loading, tokenList }
}
