import * as React from 'react';

type Item = {
  label: string,
  value: string,
  style?: React.CSSProperties,
};

type Props = {
  items: Array<Item>,
  name: string,
  defaultSelected?: string,
  handleSelect: (item?: string) => void,
};

type State = {
  selectedItem?: string,
};

class RadioGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedItem: props.defaultSelected,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.selectedItem !== this.state.selectedItem) {
      this.props.handleSelect(this.state.selectedItem);
    }
  }

  render() {
    return (
      <div
        style={{ display: 'flex', marginBottom: '10px' }}
      >
        {this.props.items.map((item, idx) => (
          <label
            htmlFor={`${this.props.name}-${idx}`}
            key={idx.toString()}
            style={{ display: 'flex', marginRight: '1rem' }}
          >
            <input
              type="radio"
              id={`${this.props.name}-${idx}`}
              name={this.props.name}
              value={item.value}
              checked={this.state.selectedItem === item.value}
              onChange={(evt) => { this.setState({ selectedItem: evt.target.value }); }}
            />
            {item.label}
          </label>
        ))}
      </div>
    );
  }
}

export default RadioGroup;