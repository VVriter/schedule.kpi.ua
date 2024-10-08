import styled from 'styled-components';
import { Flex, media } from '../../common/styles/styles';

export const TabContainer = styled(Flex)<{justifyContent: string, alignItems: string}>`
  ${media.extraSmallMode} {
    flex-direction: column;
  }
`;