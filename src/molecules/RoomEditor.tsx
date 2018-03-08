import * as React from 'react';
import { BitsyRoom, BitsyTile, BitsyPalette } from '../bitsy-parser';
import ListItem from '../atoms/ListItem';

type Props = {
  selectedRoomId?: number,
  rooms: Array<BitsyRoom>,
  tiles: Array<BitsyTile>,
  palette: BitsyPalette,
  size: number,
  handleSelectRoom: (room: BitsyRoom) => void,
};

class RoomEditor extends React.PureComponent<Props, {}> {
  canvas: HTMLCanvasElement;

  componentDidUpdate() {
    this.updateCanvas();
  }

  get cellSize() {
    return this.props.size / 16;
  }

  get innerCellSize() {
    return this.cellSize / 8;
  }

  updateCanvas() {
    if (!this.canvas) {
      return;
    }

    const ctx = this.canvas.getContext('2d');

    if (ctx === null) {
      return;
    }

    const { size, palette, rooms, selectedRoomId, tiles } = this.props;
    const selectedRoom = rooms.filter(room => room.id === selectedRoomId)[0];

    if (!selectedRoom) {
      return;
    }

    ctx.save();

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, size, size);

    // draw tiles
    ctx.fillStyle = palette.tile;
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const tileId = selectedRoom.tiles[x + y * 16];
        const currentTile = tiles.filter(tile => tile.id === tileId)[0];

        if (!currentTile) {
          continue;
        }

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

    ctx.restore();
  }

  render() {
    return (
      <div
        // onMouseDown={this.handleMouseDown}
        // onMouseUp={this.handleMouseUp}
        // onMouseMove={this.handleMouseMove}
        // style={{ border: '1px solid black', width: this.props.size, height: this.props.size }}
      >
        <canvas
          ref={(ref: HTMLCanvasElement) => { this.canvas = ref; }}
          width={this.props.size}
          height={this.props.size}
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
          {this.props.rooms.map(room => (
            <ListItem
              key={room.id}
              selected={this.props.selectedRoomId ? (this.props.selectedRoomId === room.id) : false}
              style={{ paddingLeft: '10px' }}
              onClick={this.props.handleSelectRoom.bind(this, room)}
            >
              {room.id} - {room.name}
            </ListItem>
          ))}
        </div>
      </div>
    );
  }
}

export default RoomEditor;