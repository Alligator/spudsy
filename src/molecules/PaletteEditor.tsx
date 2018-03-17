import * as React from 'react';
import styled from 'styled-components';
import ColourPicker from '../atoms/ColourPicker';
import { withProps } from '../types';
import ListItem from '../atoms/ListItem';
import { BitsyPalette } from '../bitsy-parser';
import { RGBColor } from 'react-color';
import formatId from '../formatId';
import ListItemButton from '../atoms/ListItemButton';
import Tabs from '../atoms/Tabs';

type Props = {
  palettes: Array<BitsyPalette>,
  handleChange: (palette: BitsyPalette) => void,
};

type Colours = 'bg' | 'tile' | 'sprite';

type State = {
  selectedColour: Colours,
  selectedPalette?: BitsyPalette,
};

const SquareColourBlock = withProps<{ colour: string }>()(styled.div) `
  height: 32px;
  width: 10px;
  background-color: ${(props) => props.colour};
`;

class PaletteEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedColour: 'bg',
      selectedPalette: props.palettes[0],
    };

    this.handleColourChange = this.handleColourChange.bind(this);
    this.handleColourClick = this.handleColourClick.bind(this);
  }

  handleColourChange(colour: RGBColor) {
    const newPalette = Object.assign(
      {},
      this.state.selectedPalette,
      { [this.state.selectedColour]: colour },
    );

    this.props.handleChange(newPalette);
  }

  handleColourClick(colour: Colours) {
    this.setState({ selectedColour: colour });
  }

  render() {
    const sortedPalettes = this.props.palettes.slice().sort((a, b) => {
      const aName = formatId(a);
      const bName = formatId(b);
      return aName.toLowerCase().localeCompare(bName.toLowerCase());
    });

    return (
      <div>
        {this.state.selectedPalette &&
          <Tabs
            tabs={['bg', 'tile', 'sprite']}
            renderTab={(tabName) => {
              return (
                <div style={{ marginBottom: '10px' }}>
                  {this.state.selectedPalette &&
                    <ColourPicker
                      colour={this.state.selectedPalette[tabName]}
                      handleChange={this.handleColourChange}
                    />
                  }
                </div>
              );
            }}
          />
        }
        <div>
          {sortedPalettes.map((palette) => (
            <ListItem
              key={palette.id}
              selected={this.state.selectedPalette ? palette.id === this.state.selectedPalette.id : false}
              style={{ justifyContent: 'space-between', paddingRight: '10px' }}
              onClick={() => { this.setState({ selectedPalette: palette }); }}
            >
              <div style={{ display: 'flex' }}>
                <SquareColourBlock colour={palette.bg} />
                <SquareColourBlock colour={palette.tile} />
                <SquareColourBlock colour={palette.sprite} />
              </div>
              <div style={{ marginLeft: '10px', flexGrow: 1 }}>{formatId(palette)}</div>
              <ListItemButton
                onClick={() => null}
                title="Delete room"
              >
                <i className="fas fa-trash-alt fa-lg" />
              </ListItemButton>
            </ListItem>
          ))}
        </div>
      </div>
    );
  }
}

export default PaletteEditor;