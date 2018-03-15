import * as React from 'react';
import { BitsyRoom, BitsyTile, BitsyPalette, BitsySprite, BitsyDrawable } from '../bitsy-parser';
import ListItem from '../atoms/ListItem';
import Filterable from '../atoms/Filterable';
import ImageEditor from '../atoms/ImageEditor';

class RoomFilterable extends Filterable<BitsyRoom> { }

type Props = {
  selectedRoomId?: number,
  rooms: Array<BitsyRoom>,
  tiles: Array<BitsyTile>,
  sprites: Array<BitsySprite>,
  selectedTile: BitsyTile,
  palette: BitsyPalette,
  size: number,
  handleSelectRoom: (room: BitsyRoom) => void,
  handleEditRoom: (newRoom: BitsyRoom) => void,
  handleSelectTile: (tile: BitsyTile) => void,
};

type State = {
  addingTiles: boolean,
};

class RoomEditor extends React.PureComponent<Props, State> {
  canvas: HTMLCanvasElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      addingTiles: false,
    };

    this.handleEditStart = this.handleEditStart.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleInspect = this.handleInspect.bind(this);
    this.getCellInfo = this.getCellInfo.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  get cellSize() {
    return this.props.size / 16;
  }

  get innerCellSize() {
    return this.cellSize / 8;
  }

  handleEditStart(x: number, y: number) {
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom && this.props.selectedTile) {
      const tileId = selectedRoom.tiles[x + y * 16];
      this.setState(
        (prevState: State) => ({ addingTiles: tileId !== this.props.selectedTile.id }),
        () => this.handleEdit(x, y),
      );
    }
  }

  handleEdit(x: number, y: number) {
    /*
    TODO: rewrite this entire function to make sense

    This needs to handle these cases:

    - Clicking on an empty cell with a tile selected.
      Start drawing that tile at the cell.

    - Clicking on an empty cell with a sprite selected.
    - Clicking on a cell containing a tile with a sprite selected.
      Move that sprite to the cell.

    - Clicking on a cell containing a tile with a tile selected.
      Start removing tiles at the cell.

    - Clicking on a cell containing a sprite with a sprite selected.
      Remove that sprite from that cell.

    - Clicking on a cell containing a sprite with a tile selected
      Ignore the sprite, do the above behaviour depending on if there's a tile there or not.
    */
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const foundTile = this.getTileAtCoords(x, y);
      const foundSprite = this.getSpriteAtCoords(x, y);

      if (foundTile) {
        const newTiles = selectedRoom.tiles.slice();
        newTiles[x + y * 16] = this.state.addingTiles ? this.props.selectedTile.id : 0;
        this.props.handleEditRoom(Object.assign({}, selectedRoom, { tiles: newTiles }));
      } else if (foundSprite) {
        const newSprite = Object.assign(
          {},
          foundSprite,
          {
            pos: { roomId: this.props.selectedRoomId, x, y }
          },
        );
        const newSprites = this.props.sprites.map(sprite => sprite.id === foundSprite.id ? newSprite : sprite);
        this.props.handleEditRoom(Object.assign({}, selectedRoom, { sprites: newSprites }));
      }
    }
  }

  handleInspect(x: number, y: number) {
    const currentTile = this.getTileAtCoords(x, y);
    if (currentTile) {
      this.props.handleSelectTile(currentTile);
    }
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
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const sprites = this.props.sprites.filter(sprite =>
        sprite.pos && (sprite.pos.x === x && sprite.pos.y === y));
      return sprites[0];
    }
    return null;
  }

  getCellInfo(x: number, y: number): React.ReactNode {
    const currentTile = this.getTileAtCoords(x, y);
    if (currentTile) {
      return `${currentTile.id} - ${currentTile.name}`;
    }
    return null;
  }

  renderCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (typeof this.props.selectedRoomId !== 'number') {
      return;
    }

    const currentTile = this.getTileAtCoords(x, y);
    const sprite = this.getSpriteAtCoords(x, y);

    if (currentTile || sprite) {
      for (let ix = 0; ix < 8; ix++) {
        for (let iy = 0; iy < 8; iy++) {
          // TODO: multiple frames!!!
          const thing = (sprite ? sprite : currentTile) as BitsyDrawable;
          const hasPixel = thing.frames[0][ix + iy * 8];
          ctx.fillStyle = sprite ? this.props.palette.sprite : this.props.palette.tile;
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
    return (
      <div>

        <ImageEditor
          size={this.props.size}
          tileCount={16}
          bgColour={this.props.palette.bg}
          fgColour={this.props.palette.tile}
          renderCell={this.renderCell}
          handleEditStart={this.handleEditStart}
          handleEdit={this.handleEdit}
          handleInspect={this.handleInspect}
          getCellInfo={this.getCellInfo}
          canInspect={true}
        />

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
            getKey={room => `${room.id} - ${room.name}`}
            render={rooms => rooms.map((room: BitsyRoom) => (
              <ListItem
                key={room.id}
                selected={
                  typeof this.props.selectedRoomId === 'number'
                    ? (this.props.selectedRoomId === room.id)
                    : false
                }
                style={{ paddingLeft: '10px' }}
                onClick={this.props.handleSelectRoom.bind(this, room)}
              >
                {room.id} - {room.name}
              </ListItem>
            ))}
          />
        </div>
      </div>
    );
  }
}

export default RoomEditor;