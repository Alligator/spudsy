import * as React from 'react';
import styled from 'styled-components';
import * as tinycolor from 'tinycolor2';
import ColourPicker from '../atoms/ColourPicker';
import { withProps } from '../types';
import * as colours from '../colours';
import ListItem from '../atoms/ListItem';
import { BitsyPalette } from '../bitsy-parser';
import { RGBColor } from 'react-color';

type Props = {
  palettes: Array<BitsyPalette>,
  handleChange: (palette: BitsyPalette) => void,
};

type Colours = 'bg' | 'tile' | 'sprite';

type State = {
  selectedColour: Colours,
  selectedPalette?: BitsyPalette,
};

const ColourBlock = withProps<{ colour: string, selected: boolean }>()(styled.div)`
  height: ${(props) => props.selected ? '30px' : '20px'};
  width: calc(100% / 3);
  background-color: ${(props) => props.colour};
  font-size: 8pt;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => tinycolor(props.colour).isDark() ? colours.fg : colours.bg};
  cursor: pointer;
  &:hover {
    font-weight: bold;
  }
`;

const SquareColourBlock = withProps<{ colour: string }>()(styled.div)`
  height: 32px;
  width: 30px;
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
      const aName = `${a.id} - ${a.name}`;
      const bName = `${b.id} - ${b.name}`;
      return aName.toLowerCase().localeCompare(bName.toLowerCase());
    });

    return (
      <div>
        {this.state.selectedPalette &&
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <ColourBlock
              selected={this.state.selectedColour === 'bg'}
              colour={this.state.selectedPalette.bg}
              onClick={this.handleColourClick.bind(this, 'bg')}
            >
              bg
            </ColourBlock>
            <ColourBlock
              selected={this.state.selectedColour === 'tile'}
              colour={this.state.selectedPalette.tile}
              onClick={this.handleColourClick.bind(this, 'tile')}
            >
              tile
            </ColourBlock>
            <ColourBlock
              selected={this.state.selectedColour === 'sprite'}
              colour={this.state.selectedPalette.sprite}
              onClick={this.handleColourClick.bind(this, 'sprite')}
            >
              sprite
            </ColourBlock>
          </div>
          <ColourPicker
            colour={this.state.selectedPalette[this.state.selectedColour]}
            handleChange={this.handleColourChange}
          />
        </div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {sortedPalettes.map((palette) => (
            <ListItem
              key={palette.id}
              selected={this.state.selectedPalette ? palette.id === this.state.selectedPalette.id : false}
              style={{ paddingLeft: '10px', justifyContent: 'space-between', width: 'calc(50% - 20px)' }}
              onClick={() => { this.setState({ selectedPalette: palette }); }}
            >
              <div>{palette.id}{palette.name ? '- ' + palette.name : ''}</div>
              <div style={{ display: 'flex' }}>
                <SquareColourBlock colour={palette.bg} />
                <SquareColourBlock colour={palette.tile} />
                <SquareColourBlock colour={palette.sprite} />
              </div>
            </ListItem>
          ))}
        </div>
      </div>
    );
  }
}

export default PaletteEditor;