import * as React from 'react';
import { BitsyRoom, BitsyTile, BitsyPalette, BitsySprite, BitsyDrawable, BitsyItem } from '../bitsy-parser';
import ListItem from '../atoms/ListItem';
import ListItemButton from '../atoms/ListItemButton';
import Filterable from '../atoms/Filterable';
import ImageEditor from '../atoms/ImageEditor';
import formatId from '../formatId';
import * as colours from '../colours';
import { Input, Select } from '../atoms/Inputs';
import FormGroup from '../atoms/FormGroup';

class RoomFilterable extends Filterable<BitsyRoom> { }

type Props = {
  selectedRoomId?: number,
  rooms: Array<BitsyRoom>,
  tiles: Array<BitsyTile>,
  sprites: Array<BitsySprite>,
  items: Array<BitsyItem>,
  selectedTileId?: number,
  selectedSpriteId?: number,
  selectedItemId?: number,
  palette: BitsyPalette,
  palettes: Array<BitsyPalette>,
  size: number,
  handleSelectRoom: (room: BitsyRoom) => void,
  handleEditRoom: (newRoom: BitsyRoom) => void,
  handleDeleteRoom: (room: BitsyRoom) => void,
  handleEditSprite: (sprite: BitsySprite) => void,
  handleSelectTile: (tile: BitsyTile) => void,
};

type State = {
  addingTiles: boolean,
  ignoreEdits: boolean,
  currentFrame: number,
};

class RoomEditor extends React.PureComponent<Props, State> {
  canvas: HTMLCanvasElement;
  interval: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      addingTiles: false,
      ignoreEdits: false,
      currentFrame: 0,
    };

    this.handleEditStart = this.handleEditStart.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleEditEnd = this.handleEditEnd.bind(this);
    this.handleInspect = this.handleInspect.bind(this);
    this.handleEditPalette = this.handleEditPalette.bind(this);
    this.handleEditName = this.handleEditName.bind(this);
    this.getCellInfo = this.getCellInfo.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  componentDidMount() {
    this.interval = window.setInterval(
      () => {
        this.setState(
          (prevState: State) => ({ currentFrame: (this.state.currentFrame + 1) % 2 }),
          () => this.forceUpdate(),
        );
      },
      400,
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  get cellSize() {
    return this.props.size / 16;
  }

  get innerCellSize() {
    return this.cellSize / 8;
  }

  handleEditStart(x: number, y: number) {
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const foundTile = this.getTileAtCoords(x, y);
      const foundSprite = this.getSpriteAtCoords(x, y);
      const foundItem = this.getItemAtCoords(x, y);
      const tileSelected = typeof this.props.selectedTileId === 'number';
      const spriteSelected = typeof this.props.selectedSpriteId === 'number';
      const itemSelected = typeof this.props.selectedItemId === 'number';

      if (tileSelected) {
        // tile selected, ignore sprites and items and only check the tile
        if (foundTile) {
          // clicked on a tile with a tile selected, start removing tiles
          this.setState(
            (prevState: State) => ({ addingTiles: false }),
            () => this.handleEdit(x, y),
          );
        } else {
          // clicked on an empty cell with a tile selected, start drawing that tile
          this.setState(
            (prevState: State) => ({ addingTiles: true }),
            () => this.handleEdit(x, y),
          );
        }
      } else if (spriteSelected) {
        if (foundSprite) {
          // clicked on a sprite with a sprite selected, remove that sprite and ignore editing until mouseup
          const newSprite = Object.assign({}, foundSprite, { pos: null });
          this.props.handleEditSprite(newSprite);
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        } else if (foundItem) {
          // clicked on an item with a sprite selected, remove that item and ignore editing until mouseup
          const newItems = selectedRoom.items.filter(item => item.id !== foundItem.id || item.x !== x || item.y !== y);
          this.props.handleEditRoom(Object.assign({}, selectedRoom, { items: newItems }));
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        } else {
          // clicked on an empty cell with a sprite selected, move that sprite and ignore editing until mouseup
          const selectedSprite = this.props.sprites.filter(sprite => sprite.id === this.props.selectedSpriteId)[0];
          const newSprite = Object.assign({}, selectedSprite, { pos: { id: selectedRoom.id, x, y } });
          this.props.handleEditSprite(newSprite);
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        }
      } else if (itemSelected) {
        if (foundSprite) {
          // clicked on a sprite with an item selected, remove the sprite and ignore editing until mouseup
          const newSprite = Object.assign({}, foundSprite, { pos: null });
          this.props.handleEditSprite(newSprite);
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        } else if (foundItem) {
          // clicked on an item with an item selected, remove that item and ignore editing until mouseup
          const newItems = selectedRoom.items.filter(item => item.id !== foundItem.id || item.x !== x || item.y !== y);
          this.props.handleEditRoom(Object.assign({}, selectedRoom, { items: newItems }));
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        } else {
          // clicked on an empty cell with an item selected, create that item and ignore editing until mouseup
          const selectedItem = this.props.items.filter(item => item.id === this.props.selectedItemId)[0];
          const newItems = [...selectedRoom.items, { id: selectedItem.id, x, y }];
          this.props.handleEditRoom(Object.assign({}, selectedRoom, { items: newItems }));
          this.setState(
            (prevState: State) => ({ ignoreEdits: true }),
          );
        }
      }
    }
  }

  handleEdit(x: number, y: number) {
    if (this.state.ignoreEdits) {
      return;
    }

    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      let tileId: number = 0;
      if (this.state.addingTiles) {
        tileId = this.props.selectedTileId || 0;
      }
      const newTiles = selectedRoom.tiles.slice();
      newTiles[x + y * 16] = tileId;
      this.props.handleEditRoom(Object.assign({}, selectedRoom, { tiles: newTiles }));
    }
  }

  handleEditEnd(x: number, y: number) {
    this.setState({
      addingTiles: false,
      ignoreEdits: false,
    });
  }

  handleInspect(x: number, y: number) {
    const currentTile = this.getTileAtCoords(x, y);
    if (currentTile) {
      this.props.handleSelectTile(currentTile);
    }
  }

  handleEditPalette(evt: React.ChangeEvent<HTMLInputElement>) {
    const newPaletteId = parseInt(evt.target.value, 10);
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    const newRoom = Object.assign({}, selectedRoom, { paletteId: newPaletteId });
    this.props.handleEditRoom(newRoom);
  }

  handleEditName(evt: React.ChangeEvent<HTMLInputElement>) {
    const newName = evt.target.value;
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    const newRoom = Object.assign({}, selectedRoom, { name: newName });
    this.props.handleEditRoom(newRoom);
  }

  getTileAtCoords(x: number, y: number): BitsyTile | null {
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const tileId = selectedRoom.tiles[x + y * 16];
      return this.props.tiles.filter(tile => tile.id === tileId)[0];
    }
    return null;
  }

  getSpriteAtCoords(x: number, y: number): BitsySprite | null {
    const sprites = this.props.sprites.filter(sprite =>
      sprite.pos && (sprite.pos.x === x && sprite.pos.y === y) && sprite.pos.id === this.props.selectedRoomId);
    return sprites[0];
  }

  getItemAtCoords(x: number, y: number): BitsyItem | null {
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const items = selectedRoom.items.filter(item => item.x === x && item.y === y);
      if (items.length > 0) {
        return this.props.items.filter(item => item.id === items[0].id)[0];
      }
    }
    return null;
  }

  getCellInfo(x: number, y: number): React.ReactNode {
    const currentTile = this.getTileAtCoords(x, y);
    if (currentTile) {
      return formatId(currentTile);
    }
    return null;
  }

  renderCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (typeof this.props.selectedRoomId !== 'number') {
      return;
    }

    const currentTile = this.getTileAtCoords(x, y);
    const sprite = this.getSpriteAtCoords(x, y);
    const item = this.getItemAtCoords(x, y);

    if (currentTile || sprite || item) {
      for (let ix = 0; ix < 8; ix++) {
        for (let iy = 0; iy < 8; iy++) {
          const thing = (sprite || item || currentTile) as BitsyDrawable;
          let frameId = thing.frames.length > 1 ? this.state.currentFrame : 0;
          const hasPixel = thing.frames[frameId][ix + iy * 8];
          ctx.fillStyle = (sprite || item) ? this.props.palette.sprite : this.props.palette.tile;
          if (hasPixel) {
            ctx.fillRect(
              x * this.cellSize + ix * this.innerCellSize,
              y * this.cellSize + iy * this.innerCellSize,
              this.innerCellSize,
              this.innerCellSize,
            );
          }
        }
      }
    }
  }

  render() {
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    return (
      <div>
        {selectedRoom ?
          <React.Fragment>
            <ImageEditor
              size={this.props.size}
              tileCount={16}
              bgColour={this.props.palette.bg}
              fgColour={this.props.palette.tile}
              renderCell={this.renderCell}
              handleEditStart={this.handleEditStart}
              handleEdit={this.handleEdit}
              handleEditEnd={this.handleEditEnd}
              handleInspect={this.handleInspect}
              getCellInfo={this.getCellInfo}
            />
            <div style={{ display: 'flex', margin: '10px 0 20px 0', alignItems: 'flex-end' }}>
              <FormGroup htmlFor="spudsy-room__name" label="Name">
                <Input
                  id="spudsy-room__name"
                  type="text"
                  value={selectedRoom.name}
                  placeholder={selectedRoom.id.toString()}
                  onChange={this.handleEditName}
                />
              </FormGroup>

              <FormGroup htmlFor="spudsy-room__palette" label="Palette">
                <Select
                  id="spudsy-room__palette"
                  value={this.props.palette.id}
                  onChange={this.handleEditPalette}
                >
                  {this.props.palettes.map(palette => (
                    <option value={palette.id}>{formatId(palette)}</option>
                  ))}
                </Select>
              </FormGroup>

              {/* <Button type="button">Clone</Button> */}
            </div>
          </React.Fragment> :
          <div
            style={{
              // -4 to account for the border size
              width: this.props.size - 4,
              height: this.props.size - 4,
              border: `2px solid ${colours.bg2}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colours.bg2,
            }}
          >
            No room selected.
          </div>}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '5px',
            maxHeight: '252px',
            overflowY: 'auto'
          }}
        >
          <RoomFilterable
            items={this.props.rooms}
            getKey={room => formatId(room)}
            render={rooms => rooms.map((room: BitsyRoom) => (
              <ListItem
                key={room.id}
                selected={
                  typeof this.props.selectedRoomId === 'number'
                    ? (this.props.selectedRoomId === room.id)
                    : false
                }
                style={{
                  padding: '0 10px',
                  display: 'flex',
                }}
                onClick={this.props.handleSelectRoom.bind(this, room)}
              >
                <div style={{ flexGrow: 1 }}>
                  {formatId(room)}
                </div>
                <ListItemButton
                  onClick={() => null}
                  title="Clone room"
                >
                  <i className="fas fa-clone fa-lg" />
                </ListItemButton>
                <ListItemButton
                  onClick={this.props.handleDeleteRoom.bind(this, room)}
                  title="Delete room"
                >
                  <i className="fas fa-trash-alt fa-lg" />
                </ListItemButton>
              </ListItem>
            ))}
          />
        </div>
      </div>
    );
  }
}

export default RoomEditor;