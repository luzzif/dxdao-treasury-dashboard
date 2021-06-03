import React, { ReactNode, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'
import { Logo } from '../logo'

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const Wrapper = styled.div<{ size: string; marginRight: number; marginLeft: number; loading?: boolean }>`
  margin-right: ${({ marginRight }) => marginRight}px;
  margin-left: ${({ marginLeft }) => marginLeft}px;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  background-color: ${(props) => (props.loading ? 'transparent' : props.theme.white)};
  position: relative;
`

export const CurrencyLogo = ({
  address,
  symbol,
  size = '24px',
  style,
  className,
  loading,
  marginRight = 0,
  marginLeft = 0,
}: {
  address: string
  symbol: string
  size?: string
  style?: React.CSSProperties
  className?: string
  loading?: boolean
  marginRight?: number
  marginLeft?: number
}) => {
  const srcs: string[] = useMemo(() => {
    return [getTokenLogoURL(address)]
  }, [address])

  if (loading)
    return (
      <Skeleton
        wrapper={({ children }: { children: ReactNode }) => (
          <Wrapper
            loading={loading}
            size={size}
            marginRight={marginRight}
            marginLeft={marginLeft}
            className={className}
          >
            {children}
          </Wrapper>
        )}
        circle
        width={size}
        height={size}
      />
    )
  return (
    <Wrapper size={size} marginRight={marginRight} marginLeft={marginLeft} className={className}>
      <StyledLogo size={size} defaultText={symbol} srcs={srcs} alt={symbol} style={style} />
    </Wrapper>
  )
}
