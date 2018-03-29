import * as React from 'react';
import styled from 'react-emotion';
import * as colours from '../colours';
import ListItemButton from './ListItemButton';

type Props = {
  title: React.ReactNode,
  width: number,
  children: React.ReactNode,
};

type State = {
  expanded: boolean;
};

const CardContainer = styled<{ width: number }, 'div'>('div') `
  min-width: ${(props) => props.width + 20}px;
  max-width: ${(props) => props.width + 20}px;
  border-radius: 5px;
  background-color: ${colours.bg1};
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  margin: 10px;

  display: flex;
  flex-direction: column;
`;

const CardHeader = styled('h2') `
  padding: 10px;
  font-weight: normal;
  margin-bottom: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: ${colours.bg2};
  display: flex;
  justify-content: space-between;
`;

const CardContent = styled('div') `
  padding: 10px;
`;

class Card extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: true,
    };
  }

  render() {
    return (
      <CardContainer width={this.props.width}>
        <CardHeader>
          {this.props.title}
          <ListItemButton
            title="expand"
            onClick={() => { this.setState({ expanded: !this.state.expanded }); }}
          >
            <i className={`fa ${this.state.expanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
          </ListItemButton>
        </CardHeader>

        <CardContent>
          {this.state.expanded && this.props.children}
        </CardContent>
      </CardContainer>
    );
  }
}

export default Card;