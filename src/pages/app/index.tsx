import { useTreasuryBreakdown, TreasuryBreakdown } from '../../hooks/useTreasuryBreakdown'
import { Flex, Box, Text } from 'rebass'
import { CurrencyLogo } from '../../components/currency-logo'
import { Header } from '../../components/header'
import { commify } from 'ethers/lib/utils'
import styled from 'styled-components'
import { Footer } from '../../components/footer'
import { Card } from '../../components/card'
import { TabBar } from '../../components/tab-bar'
import { ProgressBar } from '../../components/progress-bar'
import { useEffect, useState } from 'react'
import { CHAIN_ID } from '../../constants'
import Decimal from 'decimal.js-light'

const PercentageChange24HText = styled(Text)<{ positive: boolean }>`
  color: ${(props) => (props.positive ? '#00b300' : '#e60000')};
  font-weight: 600;
`

const TableHeaderBox = styled(Box)`
  font-weight: 700;
`

const TableHeaderDivider = styled(Box)`
  height: 1px;
  width: 100%;
  background-color: #ccc;
`

export const App = () => {
  const { treasuryBreakdown, loading } = useTreasuryBreakdown()

  const [tabIndex, setTabIndex] = useState(0)
  const [totalUsdValue, setTotalUsdValue] = useState(new Decimal(0))
  const [sortedTreasuryBreakdown, setSortedTreasuryBreakdown] = useState<TreasuryBreakdown[]>([])

  useEffect(() => {
    setTotalUsdValue(
      treasuryBreakdown.reduce((totalValue, breakdown) => {
        return totalValue.plus(breakdown.totalUsdValue.toFixed(6))
      }, new Decimal(0))
    )
  }, [treasuryBreakdown])

  useEffect(() => {
    setSortedTreasuryBreakdown(
      treasuryBreakdown.map((breakdown) => ({
        ...breakdown,
        holdings: breakdown.holdings.sort((a, b) => {
          return b.usdValue.minus(a.usdValue).toNumber()
        }),
      }))
    )
  }, [treasuryBreakdown])

  return (
    <>
      <Flex flexDirection="column" alignItems="center">
        <Flex flexDirection="column" width={['100%', '90%', '70%', '60%']}>
          <Header />
          <Card>
            <Flex flexDirection="column" width="100%">
              <Text fontSize="32px" fontWeight="700" mb="16px">
                Total: ${commify(totalUsdValue.toFixed(2))}
              </Text>
              <Box>
                <TabBar titles={Object.keys(CHAIN_ID)} active={tabIndex} onChange={setTabIndex} />
              </Box>
              <Flex flexDirection="column" width="100%" minHeight="600px" overflowX="auto">
                <Flex alignItems="center" mb="20px">
                  <TableHeaderBox width="100%" minWidth="160px">
                    Currency
                  </TableHeaderBox>
                  <TableHeaderBox width="100%" minWidth="160px" display="flex" alignItems="flex-end">
                    Balance
                  </TableHeaderBox>
                  <TableHeaderBox width="100%" minWidth="160px">
                    USD value
                  </TableHeaderBox>
                  <TableHeaderBox width="100%" minWidth="160px">
                    USD price
                  </TableHeaderBox>
                  <TableHeaderBox width="100%" minWidth="160px">
                    24h %age change
                  </TableHeaderBox>
                </Flex>
                <TableHeaderDivider mb="20px" />
                {sortedTreasuryBreakdown.length > 1 &&
                  sortedTreasuryBreakdown[tabIndex].holdings.map((holding) => {
                    return (
                      <Flex key={holding.address} flexDirection="column" height="60px" width="100%" mb="8px">
                        <Flex alignItems="center" mb="8px">
                          <Flex alignItems="center" width="100%" minWidth="160px">
                            <Box mr="8px">
                              <CurrencyLogo
                                size="24px"
                                address={holding.ethereumMainnetAddress}
                                symbol={holding.symbol}
                              />
                            </Box>
                            <Text fontWeight="600">{holding.name}</Text>
                          </Flex>
                          <Box width="100%" minWidth="160px" display="flex" alignItems="flex-end">
                            {commify(holding.balance.toFixed(4))}{' '}
                            <Text ml="4px" fontWeight="400" fontSize="12px" color="#999">
                              {holding.symbol}
                            </Text>
                          </Box>
                          <Box width="100%" minWidth="160px">
                            ${commify(holding.balance.times(holding.usdPrice).toFixed(2))}
                          </Box>
                          <Box width="100%" minWidth="160px">
                            ${commify(holding.usdPrice.toFixed(2))}
                          </Box>
                          <Box width="100%" minWidth="160px">
                            <PercentageChange24HText positive={holding.priceChange24h.isPositive()}>
                              {commify(holding.priceChange24h.toFixed(2))}%
                            </PercentageChange24HText>
                          </Box>
                        </Flex>
                        <Flex alignItems="center">
                          <Box width="60px">
                            <Text fontSize="12px">
                              {holding.usdValue
                                .dividedBy(sortedTreasuryBreakdown[tabIndex].totalUsdValue)
                                .times(100)
                                .toFixed(2)}
                              %
                            </Text>
                          </Box>
                          <Box width="100%">
                            <ProgressBar
                              progress={holding.usdValue
                                .dividedBy(sortedTreasuryBreakdown[tabIndex].totalUsdValue)
                                .times(100)
                                .toNumber()}
                            />
                          </Box>
                        </Flex>
                      </Flex>
                    )
                  })}
              </Flex>
            </Flex>
          </Card>
          <Footer />
        </Flex>
      </Flex>
    </>
  )
}
