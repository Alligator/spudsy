import styled from 'react-emotion';
import * as colours from '../colours';

type Props = {
  selected: boolean,
};

const ListItem = styled<Props, 'div'>('div')`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.selected ? colours.fg2 : colours.bg2};
  cursor: pointer;
  min-height: 32px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0px;
  }

  &:hover {
    font-weight: bold;
  }
`;

export default ListItem;