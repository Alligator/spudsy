import * as React from 'react';
import styled from 'react-emotion';
import { debounce, omit } from 'lodash';
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
  width: 128px;

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

type DebouncedInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string,
  onValueChange?: (value: string) => void,
};

type DebouncedInputState = {
  value?: string,
};

class DebouncedInput extends React.Component<DebouncedInputProps, DebouncedInputState> {
  debounceChange: (value: string) => void;

  constructor(props: DebouncedInputProps) {
    super(props);

    this.state = {
      value: props.value,
    };

    if (this.props.onValueChange) {
      this.debounceChange = debounce(this.props.onValueChange, 250);
    }

    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(nextProps: DebouncedInputProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }

  onChange(evt: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ value: evt.target.value });
    this.debounceChange(evt.target.value);
  }

  render() {
    const newProps = omit(this.props, ['onChange', 'value', 'defaultValue']);
    return (
      <Input
        {...this.props}
        onChange={this.onChange}
        value={this.state.value}
      />
    );
  }
}

export {
  Input,
  DebouncedInput,
  Select,
  Button,
};