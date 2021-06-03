import { useTreasuryBreakdown } from '../../hooks/useTreasuryBreakdown'
import { Flex, Box, Text } from 'rebass'
import { CurrencyLogo } from '../../components/currency-logo'
import { Header } from '../../components/header'
import { commify } from 'ethers/lib/utils'
import styled from 'styled-components'
import { Footer } from '../../components/footer'
import { Card } from '../../components/card'
import { TabBar } from '../../components/tab-bar'
import { useEffect, useState } from 'react'
import { CHAIN_ID } from '../../constants'
import Decimal from 'decimal.js-light'

const Table = styled.table`
  width: 100%;
`

const TableRow = styled.tr`
  width: 100%;
  height: 40px;
`

const TableData = styled.td`
  padding-right: 40px;
  white-space: nowrap;
`

const RelativeContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const AbsolutePieContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`

export const App = () => {
  const { treasuryBreakdown, loading } = useTreasuryBreakdown()

  const [tabIndex, setTabIndex] = useState(0)
  const [totalUsdValue, setTotalUsdValue] = useState(new Decimal(0))
  const [networkBreakdownData, setNetworkBreakdownData] = useState<{ id: string; value: number }[]>([])

  useEffect(() => {
    setNetworkBreakdownData(
      treasuryBreakdown.map((breakdown) => ({
        id: breakdown.chainId.toString(),
        value: breakdown.totalUsdValue.toNumber(),
      }))
    )
    setTotalUsdValue(
      treasuryBreakdown.reduce((totalValue, breakdown) => {
        return totalValue.plus(breakdown.totalUsdValue)
      }, new Decimal(0))
    )
  }, [treasuryBreakdown])

  return (
    <>
      <Flex flexDirection="column" alignItems="center">
        <Flex flexDirection="column" width={['100%', '90%', '70%', '60%']}>
          <Header />
          <Card>
            <Flex flexDirection="column" width="100%">
              <Flex justifyContent="space-between" mb="16px">
                <Box>
                  <TableRow>
                    <th>Treasury breakdown</th>
                  </TableRow>
                </Box>
                <Text fontSize="32px" fontWeight="700">
                  ${commify(totalUsdValue.toFixed(2))}
                </Text>
              </Flex>
              <Box>
                <TabBar titles={Object.keys(CHAIN_ID)} active={tabIndex} onChange={setTabIndex} />
              </Box>
              <Box width="100%" overflowX="auto">
                <Table style={{ width: '100%' }}>
                  {treasuryBreakdown.length > 1 &&
                    treasuryBreakdown[tabIndex].holdings.map((holding) => {
                      return (
                        <TableRow key={holding.address}>
                          <TableData>
                            <Flex alignItems="center">
                              <Box mr="8px">
                                <CurrencyLogo
                                  size="24px"
                                  address={holding.ethereumMainnetAddress}
                                  symbol={holding.symbol}
                                />
                              </Box>
                              <Text>{holding.name}</Text>
                            </Flex>
                          </TableData>
                          <TableData>
                            {commify(holding.balance.toFixed(4))} {holding.symbol}
                          </TableData>
                          <TableData>${commify(holding.balance.times(holding.usdPrice).toFixed(2))}</TableData>
                          <TableData>${commify(holding.usdPrice.toFixed(2))}</TableData>
                        </TableRow>
                      )
                    })}
                </Table>
              </Box>
            </Flex>
          </Card>
          <Footer />
        </Flex>
      </Flex>
    </>
  )
}
