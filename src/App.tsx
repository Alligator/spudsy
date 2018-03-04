import * as React from 'react';
import styled from 'styled-components';
import ImageEditor from './atoms/ImageEdtior';
import Card from './atoms/Card';
import PaletteEditor from './molecules/PaletteEditor';
import { Palette } from './types';
import parseBitsy, { BitsyGame, BitsyTile } from './bitsy-parser';
import TileList from './molecules/TileList';

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

type Props = {};
type State = {
  palette: Palette,
  game: BitsyGame,
  selectedTileId?: string,
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      palette: {
        bg: '#000000',
        tile: '#888888',
        sprite: '#dddddd',
      },
      game: {
        title: '',
        palettes: [],
        rooms: [],
        tiles: [],
      },
    };

    this.handleTileChange = this.handleTileChange.bind(this);
  }

  handleTileChange(newTile: BitsyTile) {
    const newTiles = this.state.game.tiles.map((tile) => {
      if (tile.id === this.state.selectedTileId) {
        return newTile;
      }
      return tile;
    });

    this.setState({ game: Object.assign({}, this.state.game, { tiles: newTiles }) });
  }

  render() {
    const selectedTiles = this.state.game.tiles.filter((tile) => tile.id === this.state.selectedTileId);
    const selectedTile = selectedTiles.length > 0 ? selectedTiles[0] : null;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <VerticalContainer>
          <Card title="Draw" width={256}>
            {selectedTile ?
            <ImageEditor
              width={256}
              height={256}
              tileCount={8}
              bgColour={this.state.palette.bg}
              fgColour={this.state.palette.tile}
              tile={selectedTile}
              handleChange={this.handleTileChange}
            /> : <div>There is no tile selected!</div>}
          </Card>
          <Card title="Palette" width={256}>
            <PaletteEditor
              palettes={this.state.game.palettes}
              handleChange={() => null}
              // handleChange={(palette) => { this.setState({ palette }); }}
            />
          </Card>
        </VerticalContainer>

        <Card title="Tiles" width={256}>
          <TileList
            tiles={this.state.game.tiles}
            bgColour={this.state.palette.bg}
            fgColour={this.state.palette.tile}
            selectedTileId={this.state.selectedTileId}
            handleClick={(tile) => { this.setState({ selectedTileId: tile.id }); }}
          />
        </Card>

        <Card title="Game Data" width={256}>
          <textarea
            style={{ width: '100%', height: '256px' }}
            onChange={(evt) => {
              const data = evt.target.value;
              this.setState({ game: parseBitsy(data) });
            }}
          />
        </Card>
      </div>
    );
  }
}

export default App;
