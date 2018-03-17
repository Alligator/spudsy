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
// import TileList from './molecules/TileList';
import RoomEditor from './molecules/RoomEditor';
import swal from 'sweetalert';
import formatId from './formatId';
import ThingsEditor from './molecules/ThingsEditor';

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
  selectedItemId?: number,
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
        items: [],
        startingItems: [],
        variables: {},
      },
      rawGameData: '',
    };

    this.handleTileChange = this.handleTileChange.bind(this);
    this.handleEditRoom = this.handleEditRoom.bind(this);
    this.handleEditGameData = this.handleEditGameData.bind(this);

    this.handleDeleteRoom = this.handleDeleteRoom.bind(this);
    this.handleDeleteTile = this.handleDeleteTile.bind(this);
    this.handleDeleteSprite = this.handleDeleteSprite.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
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

  handleDeleteTile(thingToDelete: BitsyDrawable) {
    swal({
      title: `Delete tile "${formatId(thingToDelete)}"?`,
      text: 'This cannot be undone!',
      icon: 'warning',
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          const newTiles = this.state.game.tiles.filter(tile => tile.id !== thingToDelete.id);
          this.setState({ game: Object.assign({}, this.state.game, { tiles: newTiles }) });
        }
      });
  }

  handleDeleteSprite(thingToDelete: BitsyDrawable) {
    swal({
      title: `Delete sprite "${formatId(thingToDelete)}"?`,
      text: 'This cannot be undone!',
      icon: 'warning',
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          const newSprites = this.state.game.sprites.filter(sprite => sprite.id !== thingToDelete.id);
          this.setState({ game: Object.assign({}, this.state.game, { sprites: newSprites }) });
        }
      });
  }

  handleDeleteItem(thingToDelete: BitsyDrawable) {
    swal({
      title: `Delete item "${formatId(thingToDelete)}"?`,
      text: 'This cannot be undone!',
      icon: 'warning',
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          const newItems = this.state.game.items.filter(item => item.id !== thingToDelete.id);
          this.setState({ game: Object.assign({}, this.state.game, { items: newItems }) });
        }
      });
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

  handleDeleteRoom(roomToDelete: BitsyRoom) {
    swal({
      title: `Delete room "${formatId(roomToDelete)}"?`,
      text: 'This cannot be undone!',
      icon: 'warning',
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          const newRooms = this.state.game.rooms.filter(room => room.id !== roomToDelete.id);
          this.setState({ game: Object.assign({}, this.state.game, { rooms: newRooms }) });
        }
      });
    return;
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
    let isTile = false;
    if (typeof this.state.selectedTileId === 'number') {
      selectedThing = this.findThing(game.tiles, this.state.selectedTileId) as BitsyDrawable;
      isTile = true;
    } else if (typeof this.state.selectedSpriteId === 'number') {
      selectedThing = this.findThing(game.sprites, this.state.selectedSpriteId) as BitsyDrawable;
    } else if (typeof this.state.selectedItemId === 'number') {
      selectedThing = this.findThing(game.items, this.state.selectedItemId) as BitsyDrawable;
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
                handleDeleteRoom={this.handleDeleteRoom}
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
                fgColour={isTile ? palette.tile : palette.sprite}
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
          <Card title="Things" width={256}>
            {palette &&
              <ThingsEditor
                palette={palette}
                tiles={game.tiles}
                sprites={game.sprites}
                items={game.items}
                selectedTileId={this.state.selectedTileId}
                selectedSpriteId={this.state.selectedSpriteId}
                selectedItemId={this.state.selectedItemId}

                handleSelectTile={(tile) => {
                  this.setState({
                    selectedTileId: tile.id,
                    selectedSpriteId: undefined,
                    selectedItemId: undefined,
                  });
                }}
                handleSelectSprite={(sprite) => {
                  this.setState({
                    selectedTileId: undefined,
                    selectedSpriteId: sprite.id,
                    selectedItemId: undefined,
                  });
                }}
                handleSelectItem={(item) => {
                  this.setState({
                    selectedTileId: undefined,
                    selectedSpriteId: undefined,
                    selectedItemId: item.id,
                  });
                }}

                handleDeleteTile={this.handleDeleteTile}
                handleDeleteSprite={this.handleDeleteSprite}
                handleDeleteItem={this.handleDeleteItem}
              />}
          </Card>
          {/*
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
                handleDelete={this.handleDeleteTile}
              />}
          </Card>

          <Card title="Sprites" width={256}>
            {palette &&
              <TileList
                items={[...game.sprites, ...game.items]}
                bgColour={palette.bg}
                fgColour={palette.sprite}
                selectedId={this.state.selectedSpriteId}
                handleClick={(item) => {
                  this.setState({
                    selectedSpriteId: item.id,
                    selectedTileId: undefined,
                  });
                }}
                handleDelete={this.handleDeleteSprite}
              />}
          </Card>
          */}
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
