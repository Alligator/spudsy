import * as React from 'react';
import styled from 'react-emotion';
import { cloneDeep } from 'lodash';
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
import { Button } from './atoms/Inputs';
import ListItem from './atoms/ListItem';
import ListemItemButton from './atoms/ListItemButton';

const VerticalContainer = styled('div') `
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MAX_UNDO_HISTORY = 10;

type UndoAction = {
  game: BitsyGame,
  name: string,
  timestamp: Date,
};

type Props = {};
type State = {
  game: BitsyGame,
  previousGames: Array<UndoAction>,
  selectedRoomId?: number,
  selectedTileId?: number,
  selectedSpriteId?: number,
  selectedItemId?: number,
  rawGameData: string,
  ctrlHeld: boolean,
  zHeld: boolean,
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
      previousGames: [],
      rawGameData: '',
      ctrlHeld: false,
      zHeld: false,
    };

    this.handleTileChange = this.handleTileChange.bind(this);
    this.handleEditRoom = this.handleEditRoom.bind(this);
    this.handleEditGameData = this.handleEditGameData.bind(this);

    this.handleDeleteRoom = this.handleDeleteRoom.bind(this);
    this.handleDeleteTile = this.handleDeleteTile.bind(this);
    this.handleDeleteSprite = this.handleDeleteSprite.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);

    this.handleAddRoom = this.handleAddRoom.bind(this);
    this.handleCloneRoom = this.handleCloneRoom.bind(this);

    this.handleEditSprite = this.handleEditSprite.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
  }

  componentDidMount() {
    const gameData = localStorage.getItem('bitsyGame');
    if (gameData) {
      this.parseGame(gameData);
    }

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // tslint:disable-next-line:no-console
    console.error(info);
  }

  handleKeyDown(evt: KeyboardEvent) {
    switch (evt.which) {
      // ctrl
      case 17: {
        this.setState((prevState: State) => ({ ctrlHeld: true }));
        break;
      }
      // z
      case 90: {
        if (this.state.ctrlHeld && !this.state.zHeld) {
          const prevGames = this.state.previousGames.slice();
          const prevGame = prevGames.pop();
          if (prevGame) {
            this.setState((prevState: State) => ({
              zHeld: true,
              game: prevGame.game,
              previousGames: prevGames,
            }));
          }
        }
        break;
      }
      default:
        break;
    }
  }

  handleKeyUp(evt: KeyboardEvent) {
    switch (evt.which) {
      // ctrl
      case 17: {
        this.setState((prevState: State) => ({ ctrlHeld: false }));
        break;
      }
      // z
      case 90: {
        this.setState((prevState: State) => ({ zHeld: false }));
        break;
      }
      default:
        break;
    }
  }

  handleUndo(index: number) {
    // the index we get here is reversed, since the list is drawn in reverse order
    this.setState((prevState: State) => {
      const newPrevGames = prevState.previousGames.slice(0, prevState.previousGames.length - index);
      const newGame = newPrevGames.pop();
      if (newGame) {
        return {
          previousGames: newPrevGames,
          game: newGame.game,
        };
      }
      return prevState;
    });
  }

  handleTileChange(newThing: BitsyDrawable) {
    if (typeof this.state.selectedTileId === 'number') {
      const newThings = this.state.game.tiles.map((tile) => tile.id === newThing.id ? newThing : tile);
      this.updateGame(Object.assign({}, this.state.game, { tiles: newThings }), 'Edited tile');
    } else if (typeof this.state.selectedSpriteId === 'number') {
      const newSprites = this.state.game.sprites.map((sprite) => sprite.id === newThing.id ? newThing : sprite);
      this.updateGame(Object.assign({}, this.state.game, { sprites: newSprites }), 'Edited sprite');
    } else if (typeof this.state.selectedItemId === 'number') {
      const newItems = this.state.game.items.map((item) => item.id === newThing.id ? newThing : item);
      this.updateGame(Object.assign({}, this.state.game, { items: newItems }), 'Edited item');
    }
  }

  handleDeleteTile(thingToDelete: BitsyDrawable) {
    // TODO: tidy up any rooms that have this tile
    this.showDeletePrompt(`Delete tile "${formatId(thingToDelete)}"?`)
      .then((willDelete) => {
        if (willDelete) {
          const newTiles = this.state.game.tiles.filter(tile => tile.id !== thingToDelete.id);
          this.updateGame(Object.assign({}, this.state.game, { tiles: newTiles }), 'Deleted tile');
        }
      });
  }

  handleDeleteSprite(thingToDelete: BitsyDrawable) {
    this.showDeletePrompt(`Delete sprite "${formatId(thingToDelete)}"?`)
      .then((willDelete) => {
        if (willDelete) {
          const newSprites = this.state.game.sprites.filter(sprite => sprite.id !== thingToDelete.id);
          this.updateGame(Object.assign({}, this.state.game, { sprites: newSprites }), 'Deleted sprite');
        }
      });
  }

  handleDeleteItem(thingToDelete: BitsyDrawable) {
    // TODO: tidy up any rooms that have this item
    this.showDeletePrompt(`Delete item "${formatId(thingToDelete)}"?`)
      .then((willDelete) => {
        if (willDelete) {
          const newItems = this.state.game.items.filter(item => item.id !== thingToDelete.id);
          this.updateGame(Object.assign({}, this.state.game, { items: newItems }), 'Deleted item');
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

    this.updateGame(Object.assign({}, this.state.game, { rooms: newRooms }), 'Edited room');
  }

  handleDeleteRoom(roomToDelete: BitsyRoom) {
    this.showDeletePrompt(`Delete room "${formatId(roomToDelete)}"?`)
      .then((willDelete) => {
        if (willDelete) {
          const newRooms = this.state.game.rooms.filter(room => room.id !== roomToDelete.id);
          this.updateGame(Object.assign({}, this.state.game, { rooms: newRooms }), 'Deleted room');
        }
      });
    return;
  }

  handleAddRoom() {
    const maxId = Math.max.apply(Math, this.state.game.rooms.map(room => room.id));
    const newRoom: BitsyRoom = {
      id: maxId + 1,
      name: '',
      tiles: [],
      items: [],
      exits: [],
      endings: [],
      paletteId: 0,
    };

    const newRooms = this.state.game.rooms.slice();
    newRooms.push(newRoom);

    this.updateGame(Object.assign({}, this.state.game, { rooms: newRooms }), 'Added room');
    this.setState((prevState: State) => ({ selectedRoomId: newRoom.id }));
  }

  handleCloneRoom(roomToClone: BitsyRoom) {
    const newRoom = Object.assign({}, roomToClone);

    const maxId = Math.max.apply(Math, this.state.game.rooms.map(room => room.id));
    newRoom.id = maxId + 1;

    const newRooms = this.state.game.rooms.slice();
    newRooms.push(newRoom);

    this.updateGame(Object.assign({}, this.state.game, { rooms: newRooms }), 'Cloned room');
    this.setState((prevState: State) => ({ selectedRoomId: newRoom.id }));
  }

  handleEditSprite(newSprite: BitsySprite) {
    const newSprites = this.state.game.sprites.map((sprite) => {
      if (sprite.id === newSprite.id) {
        return newSprite;
      }
      return sprite;
    });

    this.updateGame(Object.assign({}, this.state.game, { sprites: newSprites }), 'Moved sprite');
  }

  handleEditGameData(evt: React.ChangeEvent<HTMLTextAreaElement>) {
    const data = evt.target.value;
    localStorage.setItem('bitsyGame', data);
    this.parseGame(data);
  }

  showDeletePrompt(title: string) {
    return swal({
      title,
      text: 'This cannot be undone!',
      icon: 'warning',
      dangerMode: true,
      buttons: {
        cancel: true,
        confirm: true,
      },
    });
  }

  parseGame(rawData: string) {
    const parsedGame = parseBitsy(rawData);
    console.log(parsedGame);

    this.setState({
      game: parsedGame,
      rawGameData: rawData,
    });
  }

  updateGame(newGame: BitsyGame, action: string) {
    this.setState((prevState: State) => {
      let newPrevGames = prevState.previousGames.slice();

      if (prevState.previousGames.length >= MAX_UNDO_HISTORY) {
        newPrevGames = newPrevGames.splice(1);
      }

      newPrevGames.push({
        game: cloneDeep(prevState.game),
        name: action,
        timestamp: new Date(),
      });

      return {
        game: newGame,
        previousGames: newPrevGames,
      };
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
                  handleAddRoom={this.handleAddRoom}
                  handleCloneRoom={this.handleCloneRoom}

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

            <Card title="Actions" width={256}>
              <div
                style={{
                  height: '288px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  marginBottom: '10px',
                }}
              >
                {this.state.previousGames.slice().reverse().map((action, idx) => (
                  <ListItem
                    selected={idx === 0}
                    style={{
                      padding: '0 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ fontSize: '8pt', color: colours.fg1 }}>
                        {action.timestamp.toLocaleTimeString()}
                      </div>
                      {action.name}
                    </div>
                    <ListemItemButton title="Undo to here" onClick={() => this.handleUndo(idx)}>
                      <i className="fa fa-undo fa-lg" />
                    </ListemItemButton>
                  </ListItem>
                ))}
              </div>
              <div style={{ color: colours.fg1, textAlign: 'right' }}>Ctrl+Z to undo</div>
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
              <Button
                type="button"
                onClick={() => {
                  console.groupCollapsed(this.state.game.title);
                  const serializedGame = serializeBitsy(this.state.game).join('\n');
                  // tslint:disable-next-line:no-any
                  (window as any).serializedGame = serializedGame;
                  console.log(serializedGame);
                  console.groupEnd();
                }}
              >
                serialize
              </Button>
            </Card>
          </VerticalContainer>
        </div>
      </div>
    );
  }
}

export default App;
