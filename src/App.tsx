import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
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
  BitsyItem,
  BitsyDialog,
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
import { Button, TextArea } from './atoms/Inputs';
import ListItem from './atoms/ListItem';
import ListItemButton from './atoms/ListItemButton';
import * as ReactDOM from 'react-dom';
import DialogEditor from './molecules/DialogEditor';
import {
  StoreState,
  createRoom,
  setGame,
  cloneRoom,
  changeRoom,
  deleteRoom,
  createTile,
  changeTile,
  deleteTile,
  createSprite,
  changeSprite,
  deleteSprite,
  createItem,
  changeItem,
  deleteItem,
  changePalette,
  undo,
  UndoAction,
  Undoable,
  createPalette,
  deletePalette,
  clonePalette,
} from './state';
import { bindActionCreators } from 'redux';

const VerticalContainer = styled('div') `
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MAX_UNDO_HISTORY = 10;

type Props = {
  game: BitsyGame,
  undoStack: Array<UndoAction>,

  undo: typeof undo,
  setGame: typeof setGame,

  createTile: typeof createTile,
  changeTile: typeof changeTile,
  deleteTile: typeof deleteTile,

  createSprite: typeof createSprite,
  changeSprite: typeof changeSprite,
  deleteSprite: typeof deleteSprite,

  createItem: typeof createItem,
  changeItem: typeof changeItem,
  deleteItem: typeof deleteItem,

  createRoom: typeof createRoom,
  changeRoom: typeof changeRoom,
  deleteRoom: typeof deleteRoom,
  cloneRoom: typeof cloneRoom,

  createPalette: typeof createPalette,
  changePalette: typeof changePalette,
  deletePalette: typeof deletePalette,
  clonePalette: typeof clonePalette,
};

type State = {
  // game: BitsyGame,
  // previousGames: Array<UndoAction>,
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
  trauma: number = 0;
  constructor(props: Props) {
    super(props);

    this.state = {
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

    this.handleAddTile = this.handleAddTile.bind(this);
    this.handleAddSprite = this.handleAddSprite.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);

    this.handleAddRoom = this.handleAddRoom.bind(this);
    this.handleCloneRoom = this.handleCloneRoom.bind(this);

    this.handleEditSprite = this.handleEditSprite.bind(this);
    this.handleEditPalette = this.handleEditPalette.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // this is so stupid i have to find a place for it
    /*
    let pt = new Date().getTime();
    const frame = () => {
      let ct = new Date().getTime();
      let dt = ct - pt;
      const simplex = new SimplexNoise();
      const seed = Math.random() * 10;

      this.trauma -= 0.05;
      this.trauma = Math.max(Math.min(this.trauma, 1), 0);

      if (this.trauma > 0) {
        const x = (simplex.noise2D(seed, dt) * 2 - 1) * Math.pow(this.trauma, 2) * 20;
        const y = (simplex.noise2D(seed + 1, dt) * 2 - 1) * Math.pow(this.trauma, 2) * 20;
        const r = simplex.noise2D(seed + 2, dt) * Math.pow(this.trauma, 2) / 12;
        document.body.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(6)}rad)`;
      } else {
        document.body.style.transform = 'translate(0, 0) rotate(0rad)';
      }

      pt = new Date().getTime();
    };
    setInterval(frame, 70);
    */
  }

  componentDidUpdate() {
    this.trauma += 0.25;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const node = document.createElement('div');
    let serializedGame: string = '';

    try {
      serializedGame = serializeBitsy(this.props.game).join('\n');
    } catch (e) {
      serializedGame = `:( uh oh serialization also broke. raw data:\n${JSON.stringify(this.props.game, null, 2)}`;
    }

    ReactDOM.render(
      (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ margin: '10px 0' }}>
            Oh no. Spudsy crashed. Here is your game data:
          </div>
          <textarea
            style={{
              flexGrow: 1,
              height: '128px',
              backgroundColor: colours.bg2,
              color: colours.fg,
              border: `2px solid ${colours.fg2}`,
            }}
            value={serializedGame}
          />
          <div style={{ margin: '10px 0' }}>
            Error information:
          </div>
          <textarea
            style={{
              flexGrow: 1,
              height: '128px',
              backgroundColor: colours.bg2,
              color: colours.fg,
              border: `2px solid ${colours.fg2}`,
            }}
            value={`${error.toString()}${info.componentStack}`}
          />
        </div>
      ),
      node,
    );

    swal({
      title: 'Crash!',
      content: { element: node },
    });
  }

  handleKeyDown(evt: KeyboardEvent) {
    /*
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
    */
  }

  handleKeyUp(evt: KeyboardEvent) {
    /*
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
    */
  }

  handleUndo(index: number) {
    /*
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
    */
  }

  handleTileChange(newThing: BitsyDrawable) {
    if (typeof this.state.selectedTileId === 'number') {
      this.props.changeTile(newThing as BitsyTile);
    } else if (typeof this.state.selectedSpriteId === 'number') {
      this.props.changeSprite(newThing as BitsySprite);
    } else if (typeof this.state.selectedItemId === 'number') {
      this.props.changeItem(newThing as BitsyItem);
    }
  }

  handleDeleteTile(thingToDelete: BitsyDrawable) {
    this.props.deleteTile(thingToDelete.id);
  }

  handleDeleteSprite(thingToDelete: BitsyDrawable) {
    this.props.deleteSprite(thingToDelete.id);
  }

  handleDeleteItem(thingToDelete: BitsyDrawable) {
    this.props.deleteItem(thingToDelete.id);
  }

  handleEditRoom(newRoom: BitsyRoom) {
    this.props.changeRoom(newRoom);
  }

  handleDeleteRoom(roomToDelete: BitsyRoom) {
    this.props.deleteRoom(roomToDelete.id);
  }

  handleAddTile() {
    this.props.createTile();
  }

  handleAddSprite() {
    this.props.createSprite();
  }

  handleAddItem() {
    this.props.createItem();
  }

  handleAddRoom() {
    this.props.createRoom();
  }

  handleCloneRoom(roomToClone: BitsyRoom) {
    this.props.cloneRoom(roomToClone.id);
  }

  handleEditSprite(newSprite: BitsySprite) {
    this.props.changeSprite(newSprite);
  }

  handleEditPalette(newPalette: BitsyPalette) {
    this.props.changePalette(newPalette);
  }

  handleEditGameData(evt: React.ChangeEvent<HTMLTextAreaElement>) {
    const game = parseBitsy(evt.target.value);
    this.props.setGame(game);
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

  getCurrentPalette(): BitsyPalette | undefined {
    const { game } = this.props;
    const { selectedRoomId } = this.state;
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
    const { game } = this.props;

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

    let selectedDialog: BitsyDialog | null = null;
    if (selectedThing && selectedThing.dialogId) {
      const dialogId: string = selectedThing.dialogId;
      selectedDialog = this.props.game.dialogs.filter(dialog => dialog.id === dialogId)[0];
    }

    const selectedRoom = this.props.game.rooms.filter(room => room.id === this.state.selectedRoomId)[0];

    const InfoSeparator = <div style={{ margin: '0 10px' }}>|</div>;

    const undoHistory = this.props.undoStack
      .filter(undoAction => undoAction.action)
      .slice()
      .reverse();

    const palette = this.getCurrentPalette();
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <VerticalContainer>
            <Card title={`Room ${selectedRoom ? formatId(selectedRoom) : 'Editor'}`} width={384}>
              {palette &&
                <RoomEditor
                  rooms={game.rooms}
                  size={384}
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

                  handleAddTile={this.handleAddTile}
                  handleAddSprite={this.handleAddSprite}
                  handleAddItem={this.handleAddItem}
                />}
            </Card>
          </VerticalContainer>

          <VerticalContainer>
            <Card title="Dialog" width={256}>
              {selectedDialog &&
                <DialogEditor
                  dialog={selectedDialog.content}
                />}
            </Card>

            <Card title="Palette" width={256}>
              <PaletteEditor
                palettes={game.palettes}
                handleChange={this.handleEditPalette}
                handleAdd={this.props.createPalette}
                handleDelete={paletteToDelete => this.props.deletePalette(paletteToDelete.id)}
                handleClone={paletteToClone => this.props.clonePalette(paletteToClone.id)}
              />
            </Card>
          </VerticalContainer>

          <VerticalContainer>
            <Card title="Game Data" width={256}>
              <TextArea
                style={{
                  width: '256px',
                  height: '256px',
                }}
                // TODO: My god no
                // value={serializeBitsy(this.props.game).join('\n')}
                onChange={this.handleEditGameData}
              />
              <Button
                type="button"
                onClick={() => {
                  console.groupCollapsed(this.props.game.title);
                  const serializedGame = serializeBitsy(this.props.game).join('\n');
                  // tslint:disable-next-line:no-any
                  (window as any).serializedGame = serializedGame;
                  console.log(serializedGame);
                  console.groupEnd();
                }}
              >
                serialize
              </Button>
            </Card>

            <Card title="Actions" width={256}>
              <div
                style={{
                  maxHeight: '288px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  marginBottom: '10px',
                }}
              >
                {undoHistory.map(undoItem => {
                  if ((undoItem.action as Undoable).undoName) {
                    const undoAction = (undoItem.action as Undoable);
                    return (
                      <ListItem
                        selected={false}
                        key={undoItem.id}
                        style={{
                          padding: '0 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <div style={{ fontSize: '8pt', color: colours.fg1 }}>
                            {new Date(undoItem.timestamp).toLocaleTimeString()}
                          </div>
                          {undoAction.undoName}
                        </div>
                        <ListItemButton title="Undo to here" onClick={() => this.props.undo(undoItem.id)}>
                          <i className="fa fa-undo fa-lg" />
                        </ListItemButton>
                      </ListItem>
                    );
                  }

                  return null;
                })}
              </div>
              <div style={{ color: colours.fg1, textAlign: 'right' }}>Ctrl+Z to undo</div>
            </Card>
          </VerticalContainer>
        </div>
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'flex-end',
            fontSize: '12pt',
            marginBottom: '10px',
            marginLeft: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="spud.png" />
            <a href="https://github.com/Alligator/spudsy" target="_blank">spudsy</a>
            <div>&nbsp;by <a href="https://alligatr.co.uk" target="_blank">alligator</a></div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState): Partial<Props> => ({
  game: state.game,
  undoStack: state.undoStack,
});

const mapDispatchToProps = (dispatch: Dispatch<StoreState>) => bindActionCreators(
  {
    setGame,
    undo,

    createTile,
    changeTile,
    deleteTile,

    createSprite,
    changeSprite,
    deleteSprite,

    createItem,
    changeItem,
    deleteItem,

    createRoom,
    changeRoom,
    deleteRoom,
    cloneRoom,

    createPalette,
    changePalette,
    deletePalette,
    clonePalette,
  },
  dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
