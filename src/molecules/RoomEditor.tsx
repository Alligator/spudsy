import * as React from 'react';
import { BitsyRoom, BitsyTile, BitsyPalette } from '../bitsy-parser';
import ListItem from '../atoms/ListItem';
import Filterable from '../atoms/Filterable';
import ImageEditor from '../atoms/ImageEditor';

class RoomFilterable extends Filterable<BitsyRoom> { }

type Props = {
  selectedRoomId?: number,
  rooms: Array<BitsyRoom>,
  tiles: Array<BitsyTile>,
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
    const selectedRoom = this.props.rooms.filter(room => room.id === this.props.selectedRoomId)[0];
    if (selectedRoom) {
      const newTiles = selectedRoom.tiles.slice();
      newTiles[x + y * 16] = this.state.addingTiles ? this.props.selectedTile.id : 0;
      this.props.handleEditRoom(Object.assign({}, selectedRoom, { tiles: newTiles }));
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

    if (currentTile) {
      ctx.fillStyle = this.props.palette.tile;
      for (let ix = 0; ix < 8; ix++) {
        for (let iy = 0; iy < 8; iy++) {
          if (currentTile.pixels[ix + iy * 8]) {
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
          id={this.props.selectedRoomId || 0}
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
                selected={this.props.selectedRoomId ? (this.props.selectedRoomId === room.id) : false}
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