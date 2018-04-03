import * as React from 'react';
import styled from 'react-emotion';
import ColourPicker from '../atoms/ColourPicker';
import ListItem from '../atoms/ListItem';
import { BitsyPalette } from '../bitsy-parser';
import { RGBColor } from 'react-color';
import formatId from '../formatId';
import ListItemButton from '../atoms/ListItemButton';
import Tabs from '../atoms/Tabs';
import { Button, DebouncedInput } from '../atoms/Inputs';
import Filterable from '../atoms/Filterable';
import FormGroup from '../atoms/FormGroup';

type Props = {
  palettes: Array<BitsyPalette>,
  handleAdd: () => void,
  handleChange: (palette: BitsyPalette) => void,
  handleDelete: (palette: BitsyPalette) => void,
  handleClone: (palette: BitsyPalette) => void,
};

type Colours = 'bg' | 'tile' | 'sprite';

type State = {
  selectedPaletteId?: number,
};

class PaletteFilterable extends Filterable<BitsyPalette> { }

const SquareColourBlock = styled<{ colour: string }, 'div'>('div') `
  height: 32px;
  width: 10px;
  background-color: ${(props) => props.colour};
`;

class PaletteEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleColourChange = this.handleColourChange.bind(this);
    this.handleEditName = this.handleEditName.bind(this);
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

  handleEditName(value: string) {
    const selectedPalette = this.props.palettes.filter(palette => palette.id === this.state.selectedPaletteId)[0];
    const newPalette = Object.assign({}, selectedPalette, { name: value });
    this.props.handleChange(newPalette);
  }

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
          <React.Fragment>
            <Tabs
              tabs={['Background', 'Tile', 'Sprite']}
              renderTab={(tabName) => {
                const mapping = {
                  'Background': 'bg',
                  'Tile': 'tile',
                  'Sprite': 'sprite',
                };
                return (
                  <ColourPicker
                    colour={selectedPalette[mapping[tabName]]}
                    handleChange={(colour) => this.handleColourChange(mapping[tabName], colour)}
                  />
                );
              }}
            />
            <FormGroup htmlFor="spudsy-palette__name" label="Name">
              <DebouncedInput
                id="spudsy-palette__name"
                type="text"
                value={selectedPalette.name}
                placeholder={selectedPalette.id.toString()}
                onValueChange={this.handleEditName}
              />
            </FormGroup>
          </React.Fragment>
        }
        <div
          style={{
            height: '242px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <PaletteFilterable
            items={sortedPalettes}
            getKey={formatId}
            render={palettes => palettes.map(palette => (
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
                  onClick={() => this.props.handleClone(palette)}
                  title="Clone palette`"
                >
                  <i className="fas fa-clone fa-lg" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => this.props.handleDelete(palette)}
                  title="Delete palette"
                >
                  <i className="fas fa-trash-alt fa-lg" />
                </ListItemButton>
              </ListItem>
            ))}
          />
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={this.props.handleAdd}>
            Add new palette
          </Button>
        </div>
      </div>
    );
  }
}

export default PaletteEditor;