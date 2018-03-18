import styled from 'react-emotion';
import * as colours from '../colours';

const Input = styled('input')`
  display: flex;
  align-items: center;
  background-color: ${colours.bg1};
  color: ${colours.fg};
  min-height: 26px;
  max-height: 26px;
  box-sizing: border-box;
  border: none;
  border-bottom: 2px solid ${colours.fg2};
  font-family: 'Montserrat', 'Segoe UI', 'Helvetica', sans-serif;

  &::placeholder {
    color: ${colours.fg1};
  }
`;

const Select = Input.withComponent('select');
const Button = styled('button')`
  display: flex;
  align-items: center;
  background-color: ${colours.fg2};
  color: ${colours.fg};
  min-height: 26px;
  max-height: 26px;
  box-sizing: border-box;
  padding: 0 10px;
  border: none;
  font-family: 'Montserrat', 'Segoe UI', 'Helvetica', sans-serif;
  cursor: pointer;

  &:hover {
    font-weight: bold;
  }
`;

export {
  Input,
  Select,
  Button,
};