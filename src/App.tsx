import * as React from 'react';
import styled from 'react-emotion';
import parseBitsy, {
  BitsyGame,
  BitsyTile,
  BitsyThing,
  BitsyRoom,
  BitsyPalette,
  serializeBitsy,
  BitsyDrawable,
  BitsySprite,
} from './bitsy-parser';
import Card from './atoms/Card';
import PaletteEditor from './molecules/PaletteEditor';
import TileEditor from './molecules/TileEditor';
// import TileList from './molecules/TileList';
import RoomEditor from './molecules/RoomEditor';
import swal from 'sweetalert';
import formatId from './formatId';
import ThingsEditor from './molecules/ThingsEditor';
import * as colours from './colours';

const VerticalContainer = styled('div')`
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

    this.handleEditSprite = this.handleEditSprite.bind(this);
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
    // TODO: tidy up any rooms that have this tile
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
    // TODO: tidy up any rooms that have this item
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

  handleEditSprite(newSprite: BitsySprite) {
    const newSprites = this.state.game.sprites.map((sprite) => {
      if (sprite.id === newSprite.id) {
        return newSprite;
      }
      return sprite;
    });

    this.setState({ game: Object.assign({}, this.state.game, { sprites: newSprites }) });
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
    let title = 'Thing';
    let isTile = false;
    if (typeof this.state.selectedTileId === 'number') {
      selectedThing = this.findThing(game.tiles, this.state.selectedTileId) as BitsyDrawable;
      title = 'Tile';
      isTile = true;
    } else if (typeof this.state.selectedSpriteId === 'number') {
      selectedThing = this.findThing(game.sprites, this.state.selectedSpriteId) as BitsyDrawable;
      title = 'Sprite';
    } else if (typeof this.state.selectedItemId === 'number') {
      selectedThing = this.findThing(game.items, this.state.selectedItemId) as BitsyDrawable;
      title = 'Item';
    }

    const selectedRoom = this.state.game.rooms.filter(room => room.id === this.state.selectedRoomId)[0];

    const palette = this.getCurrentPalette();
    return (
      <div>
        <h1 style={{ margin: '10px 0 0 10px', color: colours.fg1 }}>
          spudsy |{' '}
          by <a href="https://alligatr.co.uk" target="_blank">alligator</a> |{' '}
          <a href="https://github.com/Alligator/spudsy" target="_blank"><i className="fab fa-github" /></a>
        </h1>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <VerticalContainer>
            <Card title={`Room ${selectedRoom ? formatId(selectedRoom) : 'Editor'}`} width={512}>
              {palette &&
                <RoomEditor
                  rooms={game.rooms}
                  size={512}
                  selectedRoomId={this.state.selectedRoomId}
                  handleSelectRoom={(room) => {
                    this.setState({ selectedRoomId: room.id });
                  }}
                  palette={palette}
                  palettes={game.palettes}
                  tiles={game.tiles}
                  sprites={game.sprites}
                  items={game.items}
                  selectedTileId={this.state.selectedTileId}
                  selectedSpriteId={this.state.selectedSpriteId}
                  selectedItemId={this.state.selectedItemId}
                  handleEditRoom={this.handleEditRoom}
                  handleDeleteRoom={this.handleDeleteRoom}
                  handleEditSprite={this.handleEditSprite}
                  handleSelectTile={(tile) => {
                    this.setState({ selectedTileId: tile.id });
                  }}
                />}
            </Card>
          </VerticalContainer>

          <VerticalContainer>
            <Card title={`${title} ${selectedThing ? formatId(selectedThing) : 'Editor'}`} width={256}>
              {palette &&
                <TileEditor
                  size={256}
                  tileCount={8}
                  bgColour={palette.bg}
                  fgColour={isTile ? palette.tile : palette.sprite}
                  tile={selectedThing as BitsyTile}
                  handleChange={this.handleTileChange}
                />}
            </Card>
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
          </VerticalContainer>

          <VerticalContainer>
            <Card title="Palette" width={256}>
              <PaletteEditor
                palettes={game.palettes}
                handleChange={() => null}
              />
            </Card>
            <Card title="Game Data" width={256}>
              <textarea
                style={{
                  width: '100%',
                  height: '256px',
                  backgroundColor: colours.bg2,
                  color: colours.fg,
                  border: `2px solid ${colours.fg2}`,
                }}
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
          </VerticalContainer>
        </div>
      </div>
    );
  }
}

export default App;
