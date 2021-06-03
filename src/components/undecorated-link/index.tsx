import styled from 'styled-components'

export const UndecoratedExternalLink = styled.a.attrs((props) => ({ target: '_blank', rel: 'noopener noreferrer' }))`
  text-decoration: none;
  cursor: pointer;
  :active,
  :visited {
    color: inherit;
  }
`
