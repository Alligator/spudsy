import styled from 'styled-components';
import { withProps } from '../types';
import * as colours from '../colours';

type Props = {
  selected: boolean,
};

const ListItem = withProps<Props>()(styled.div)`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.selected ? colours.fg2 : colours.bg2};
  cursor: pointer;
  min-height: 32px;
  margin-bottom: 10px;

  &:hover {
    font-weight: bold;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default ListItem;