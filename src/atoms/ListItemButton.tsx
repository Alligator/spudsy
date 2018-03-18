import * as React from 'react';
import styled from 'styled-components';
import * as colours from '../colours';

type Props = {
  title: string,
  style?: React.CSSProperties,
  onClick: () => void,
};

const StyledButton = styled.button`
  border: none;
  background-color: inherit;
  color: inherit;
  padding: 0;
  margin: 0;
  cursor: pointer;
  transition: all 0.1s;
  transform: scale(1);
  color: ${colours.fg};

  & + & {
    margin-left: 10px;
  }

  &:hover {
    transform: scale(1.2);
  }
`;

const ListemItemButton: React.StatelessComponent<Props> = (props) => {
  return (
    <StyledButton
      type="button"
      onClick={(evt) => {
        evt.stopPropagation();
        props.onClick();
      }}
      title={props.title}
      style={props.style}
    >
      {props.children}
    </StyledButton>
  );
};

export default ListemItemButton;