import * as React from 'react';
import styled from 'react-emotion';
import * as colours from '../colours';

type Props = {
  tabs: Array<string>,
  renderTab: (tabName: string) => React.ReactNode,
};

type State = {
  currentTab: string,
};

const Tab = styled<{ active: boolean }, 'div'>('div')`
  flex-grow: 1;
  text-align: center;
  background-color: ${(props) => props.active ? colours.fg2 : colours.bg2};
  padding: 5px 0;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.active ? colours.fg2 : colours.fg3};
  }
`;

class Tabs extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: props.tabs[0],
    };
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `2px solid ${colours.fg2}`,
            marginBottom: '10px',
          }}
        >
          {this.props.tabs.map(tab => (
            <Tab
              active={this.state.currentTab === tab}
              className="spudsy-tab"
              onClick={() => { this.setState({ currentTab: tab }); }}
              key={tab}
            >
              {tab}
            </Tab>
          ))}
        </div>
        <div>
          {this.props.renderTab(this.state.currentTab)}
        </div>
      </div>
    );
  }
}

export default Tabs;