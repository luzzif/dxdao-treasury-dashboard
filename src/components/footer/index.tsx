import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { UndecoratedExternalLink } from '../undecorated-link'
import logo from '../../assets/svg/dxdao.svg'

const Logo = styled.img`
  height: 20px;
`

export const Footer = () => {
  return (
    <Flex width="100%" px="20px" height="80px" justifyContent="space-between" alignItems="center">
      <Box>
        <Logo src={logo} alt="logo" />
      </Box>
      <UndecoratedExternalLink href="https://dxdao.eth.link">About</UndecoratedExternalLink>
    </Flex>
  )
}
