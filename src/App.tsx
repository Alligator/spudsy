import * as React from 'react';
import styled from 'styled-components';
import parseBitsy, {
  BitsyGame,
  BitsyTile,
  BitsyThing,
  BitsyRoom,
  BitsyPalette,
  serializeBitsy,
  BitsyDrawable,
} from './bitsy-parser';
import Card from './atoms/Card';
import PaletteEditor from './molecules/PaletteEditor';
import TileEditor from './molecules/TileEditor';
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
  selectedRoomId?: number,
  selectedTileId?: number,
  selectedSpriteId?: number,
  rawGameData: string,
};

/*
TODO:
- Fix the ID collision stuff. E.g. editing a sprite with the same ID as a
  tile causes all of the pixels of that sprite to be copied into the tile.
*/

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      game: {
        title: '',
        palettes: [],
        rooms: [],
        tiles: [],
        sprites: [],
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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // tslint:disable-next-line:no-console
    console.error(info);
  }

  handleTileChange(newThing: BitsyDrawable) {
    const foundTile = this.findThing(this.state.game.tiles, newThing.id);
    const foundSprite = this.findThing(this.state.game.tiles, newThing.id);

    if (foundTile) {
      const newThings = this.state.game.tiles.map((tile) => tile.id === newThing.id ? newThing : tile);
      this.setState({ game: Object.assign({}, this.state.game, { tiles: newThings }) });
    } else if (foundSprite) {
      const newSprites = this.state.game.sprites.map((sprite) => sprite.id === newThing.id ? newThing : sprite);
      this.setState({ game: Object.assign({}, this.state.game, { sprites: newSprites }) });
    }
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
    // tslint:disable-next-line:no-console
    console.log(parsedGame);
    this.setState({
      game: parsedGame,
      rawGameData: rawData,
    });
  }

  getCurrentPalette(): BitsyPalette | undefined {
    const { game, selectedRoomId } = this.state;
    const selectedRoom = typeof selectedRoomId === 'number' ? this.findThing(game.rooms, selectedRoomId) : undefined;

    if (selectedRoom) {
      const palette = this.findThing(game.palettes, (selectedRoom as BitsyRoom).paletteId);
      if (palette) {
        return palette as BitsyPalette;
      }
    } else if (game.palettes.length) {
      return game.palettes[0];
    }

    return undefined;
  }

  findThing(things: Array<BitsyThing>, id: number): BitsyThing | undefined {
    return things.filter(thing => thing.id === id)[0];
  }

  render() {
    const { game } = this.state;

    let selectedThing: BitsyDrawable | null = null;
    if (typeof this.state.selectedTileId === 'number') {
      selectedThing = this.findThing(game.tiles, this.state.selectedTileId) as BitsyDrawable;
    } else if (typeof this.state.selectedSpriteId === 'number') {
      selectedThing = this.findThing(game.sprites, this.state.selectedSpriteId) as BitsyDrawable;
    }

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
                handleSelectRoom={(room) => {
                  this.setState({ selectedRoomId: room.id });
                }}
                palette={palette}
                tiles={game.tiles}
                sprites={game.sprites}
                selectedTile={selectedThing as BitsyTile}
                handleEditRoom={this.handleEditRoom}
                handleSelectTile={(tile) => {
                  this.setState({ selectedTileId: tile.id });
                }}
              />}
          </Card>
        </VerticalContainer>

        <VerticalContainer>
          <Card title="Draw" width={256}>
            {palette && selectedThing ?
              <TileEditor
                size={256}
                tileCount={8}
                bgColour={palette.bg}
                fgColour={typeof this.state.selectedSpriteId === 'number' ? palette.sprite : palette.tile}
                tile={selectedThing as BitsyTile}
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

        <VerticalContainer>
          <Card title="Tiles" width={256}>
            {palette &&
              <TileList
                items={game.tiles}
                bgColour={palette.bg}
                fgColour={palette.tile}
                selectedId={this.state.selectedTileId}
                handleClick={(item) => {
                  this.setState({
                    selectedTileId: item.id,
                    selectedSpriteId: undefined,
                  });
                }}
              />}
          </Card>

          <Card title="Sprites" width={256}>
            {palette &&
              <TileList
                items={game.sprites}
                bgColour={palette.bg}
                fgColour={palette.sprite}
                selectedId={this.state.selectedSpriteId}
                handleClick={(item) => {
                  this.setState({
                    selectedSpriteId: item.id,
                    selectedTileId: undefined,
                  });
                }}
              />}
          </Card>
        </VerticalContainer>

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
