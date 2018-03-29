import * as React from 'react';
import styled from 'react-emotion';
import ColourPicker from '../atoms/ColourPicker';
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
  selectedPaletteId?: number,
};

const SquareColourBlock = styled<{ colour: string }, 'div'>('div')`
  height: 32px;
  width: 10px;
  background-color: ${(props) => props.colour};
`;

class PaletteEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleColourChange = this.handleColourChange.bind(this);
  }

  handleColourChange(selectedColour: string, colour: RGBColor) {
    const selectedPalette = this.props.palettes.filter(palette => palette.id === this.state.selectedPaletteId)[0];

    const newPalette = Object.assign(
      {},
      selectedPalette,
      { [selectedColour]: `rgb(${colour.r}, ${colour.g}, ${colour.b})` },
    );

    this.props.handleChange(newPalette);
  }

  // TODO: Why is this jumping back after you select a colour?
  render() {
    const sortedPalettes = this.props.palettes.slice().sort((a, b) => {
      const aName = formatId(a);
      const bName = formatId(b);
      return aName.toLowerCase().localeCompare(bName.toLowerCase());
    });

    const selectedPalette = this.props.palettes.filter(palette => palette.id === this.state.selectedPaletteId)[0];

    return (
      <div>
        {selectedPalette &&
          <Tabs
            tabs={['Background', 'Tile', 'Sprite']}
            renderTab={(tabName) => {
              const mapping = {
                'Background': 'bg',
                'Tile': 'tile',
                'Sprite': 'sprite',
              };
              return (
                <div style={{ marginBottom: '10px' }}>
                  <ColourPicker
                    colour={selectedPalette[mapping[tabName]]}
                    handleChange={(colour) => this.handleColourChange(mapping[tabName], colour)}
                  />
                </div>
              );
            }}
          />
        }
        <div>
          {sortedPalettes.map((palette) => (
            <ListItem
              key={palette.id}
              selected={selectedPalette ? palette.id === selectedPalette.id : false}
              style={{ justifyContent: 'space-between', paddingRight: '10px' }}
              onClick={() => { this.setState({ selectedPaletteId: palette.id }); }}
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