import * as React from 'react';
import { Input } from './Inputs';

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
        <Input
          type="text"
          onChange={this.handleInputChange}
          placeholder="search"
          style={{ margin: '10px 0 10px 0', width: '100%' }}
        />
        {this.props.render(filteredItems)}
      </div>
    );
  }
}

export default Filterable;