import * as React from 'react';
import styled from 'styled-components';
import * as colours from '../colours';
import { withProps } from '../types';

type Props = {
  tabs: Array<string>,
  renderTab: (tabName: string) => React.ReactNode,
};

type State = {
  currentTab: string,
};

const Tab = withProps<{ active: boolean }>()(styled.div) `
  flex-grow: 1;
  text-align: center;
  background-color: ${(props) => props.active ? colours.fg2 : colours.bg2};
  padding: 5px 0;
  cursor: pointer;

  &:hover {
    font-weight: bold;
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