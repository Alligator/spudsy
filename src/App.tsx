import * as React from 'react';
import styled from 'styled-components';
import TileEditor from './atoms/TileEditor';
import Card from './atoms/Card';
import PaletteEditor from './molecules/PaletteEditor';
import parseBitsy, { BitsyGame, BitsyTile, BitsyThing, BitsyRoom, BitsyPalette, serializeBitsy } from './bitsy-parser';
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
  rawGameData: string,
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
      rawGameData: '',
    };

    this.handleTileChange = this.handleTileChange.bind(this);
    this.handleEditRoom = this.handleEditRoom.bind(this);
    this.handleEditGameData = this.handleEditGameData.bind(this);
  }

  componentDidMount() {
    const gameData = localStorage.getItem('bitsyGame');
    if (gameData) {
      this.parseGame(gameData);
    }
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

  handleEditRoom(newRoom: BitsyRoom) {
    const newRooms = this.state.game.rooms.map((room) => {
      if (room.id === this.state.selectedRoomId) {
        return newRoom;
      }
      return room;
    });

    this.setState({ game: Object.assign({}, this.state.game, { rooms: newRooms }) });
  }

  handleEditGameData(evt: React.ChangeEvent<HTMLTextAreaElement>) {
    const data = evt.target.value;
    localStorage.setItem('bitsyGame', data);
    this.parseGame(data);
  }

  parseGame(rawData: string) {
    const parsedGame = parseBitsy(rawData);
    this.setState({
      game: parsedGame,
      rawGameData: rawData,
    });
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
              selectedTile={selectedTile as BitsyTile}
              handleEditRoom={this.handleEditRoom}
              handleSelectTile={(tile) => { this.setState({ selectedTileId: tile.id }); }}
            />}
          </Card>
        </VerticalContainer>

        <VerticalContainer>
          <Card title="Draw" width={256}>
            {palette && selectedTile ?
            <TileEditor
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
            value={this.state.rawGameData}
            onChange={this.handleEditGameData}
          />
          <button
            type="button"
            onClick={() => {
              // tslint:disable-next-line:no-console
              console.log(serializeBitsy(this.state.game).join('\n'));
            }}
          >
            serialize
          </button>
        </Card>
      </div>
    );
  }
}

export default App;
