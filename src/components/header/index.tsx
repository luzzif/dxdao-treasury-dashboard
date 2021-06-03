import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import logo from '../../assets/svg/dxdao.svg'

const Logo = styled.img`
  height: 36px;
`

const Divider = styled.div`
  background-color: rgba(55, 71, 79, 0.4);
  width: 1px;
  height: 40px;
`

export const Header = () => {
  return (
    <>
      <Flex height="80px" justifyContent="center" alignItems="center">
        <Box mr="24px">
          <Logo src={logo} alt="logo" />
        </Box>
        <Box mr="24px">
          <Divider />
        </Box>
        <Text fontSize="24px">
          Treasury
        </Text>
      </Flex>
    </>
  )
}
