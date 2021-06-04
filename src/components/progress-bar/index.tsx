import styled from 'styled-components'

export const ProgressBar = styled.div<{ progress: number }>`
  width: ${(props) => `${props.progress}%`};
  height: 8px;
  border-radius: 4px;
  background-color: blue;
`
