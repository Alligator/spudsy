import * as React from 'react';
import styled from 'styled-components';
import * as colours from '../colours';

const FilterInput = styled.input`
  display: flex;
  align-items: center;
  background-color: ${colours.bg2};
  color: ${colours.fg};
  min-height: 32px;
  max-height: 32px;
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 0 0 0 10px;
  border: 2px solid ${colours.fg2};
  font-family: 'Montserrat', 'Segoe UI', 'Helvetica', sans-serif;

  &::placeholder {
    color: ${colours.fg1};
  }
`;

interface Props<T> {
  items: Array<T>;
  getKey?: (item: T) => string;
  render: (filteredItems: Array<T>) => React.ReactNode;
}

interface State {
  searchTerm: string;
}

class Filterable<T> extends React.PureComponent<Props<T>, State> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      searchTerm: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ searchTerm: evt.target.value });
  }

  render() {
    const filteredItems = this.props.items.filter(item => {
      if (this.state.searchTerm === '') {
        return item;
      }

      if (this.props.getKey) {
        const key = this.props.getKey(item);
        return key.includes(this.state.searchTerm);
      }

      return item.toString().includes(this.state.searchTerm);
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <FilterInput
          type="text"
          onChange={this.handleInputChange}
          placeholder="search"
        />
        {this.props.render(filteredItems)}
      </div>
    );
  }
}

export default Filterable;