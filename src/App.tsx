import * as React from 'react';
import styled from 'styled-components';
import ImageEditor from './atoms/ImageEdtior';
import Card from './atoms/Card';
import PaletteEditor from './molecules/PaletteEditor';
import parseBitsy, { BitsyGame, BitsyTile, BitsyThing, BitsyRoom, BitsyPalette } from './bitsy-parser';
import TileList from './molecules/TileList';
import RoomEditor from './molecules/RoomEditor';

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

type Props = {};
type State = {
  game: BitsyGame,
  selectedTileId?: number,
  selectedRoomId?: number,
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
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

  getCurrentPalette(): BitsyPalette | undefined {
    const { game, selectedRoomId } = this.state;
    const selectedRoom = typeof selectedRoomId  === 'number' ? this.findThing(selectedRoomId, game.rooms) : undefined;

    if (selectedRoom) {
      const palette = this.findThing((selectedRoom as BitsyRoom).paletteId, game.palettes);
      if (palette) {
        return palette as BitsyPalette;
      }
    } else if (game.palettes.length) {
      return game.palettes[0];
    }

    return undefined;
  }

  findThing(id: number, things: Array<BitsyThing>): BitsyThing | undefined {
    return things.filter(thing => thing.id === id)[0];
  }

  render() {
    const { game } = this.state;
    // const selectedTiles = game.tiles.filter((tile) => tile.id === this.state.selectedTileId);
    // const selectedTile = selectedTiles.length > 0 ? selectedTiles[0] : null;
    const selectedTile = typeof this.state.selectedTileId === 'number'
      ? this.findThing(this.state.selectedTileId, game.tiles)
      : undefined;
    const palette = this.getCurrentPalette();
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <VerticalContainer>
          <Card title="Room" width={512}>
            {palette &&
            <RoomEditor
              rooms={game.rooms}
              size={512}
              selectedRoomId={this.state.selectedRoomId}
              handleSelectRoom={(room) => { this.setState({ selectedRoomId: room.id }); }}
              palette={palette}
              tiles={game.tiles}
            />}
          </Card>
        </VerticalContainer>

        <VerticalContainer>
          <Card title="Draw" width={256}>
            {palette && selectedTile ?
            <ImageEditor
              size={256}
              tileCount={8}
              bgColour={palette.bg}
              fgColour={palette.tile}
              tile={selectedTile as BitsyTile}
              handleChange={this.handleTileChange}
            /> : <div>There is no tile selected!</div>}
          </Card>
          <Card title="Palette" width={256}>
            <PaletteEditor
              palettes={game.palettes}
              handleChange={() => null}
            />
          </Card>
        </VerticalContainer>

        <Card title="Tiles" width={256}>
          {palette &&
          <TileList
            tiles={game.tiles}
            bgColour={palette.bg}
            fgColour={palette.tile}
            selectedTileId={this.state.selectedTileId}
            handleClick={(tile) => { this.setState({ selectedTileId: tile.id }); }}
          />}
        </Card>

        <Card title="Game Data" width={256}>
          <textarea
            style={{ width: '100%', height: '256px' }}
            onChange={(evt) => {
              const data = evt.target.value;
              const parsedGame = parseBitsy(data);
              // tslint:disable-next-line:no-console
              console.log(parsedGame);
              this.setState({ game: parsedGame });
            }}
          />
        </Card>
      </div>
    );
  }
}

export default App;
