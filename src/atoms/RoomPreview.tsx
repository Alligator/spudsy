import * as React from 'react';
import { BitsyRoom, BitsyPalette } from '../bitsy-parser';

type Props = {
  room: BitsyRoom,
  palette: BitsyPalette,
};

const size = 32;

const RoomPreview = (props: Props) => {
  const draw = (ref: HTMLCanvasElement) => {
    if (!ref) {
      return;
    }
    const ctx = ref.getContext('2d');

    if (ctx) {
      ctx.fillStyle = props.palette.bg;
      ctx.fillRect(0, 0, size, size);

      // tiles are 16x16, so draw a 2x2 rect for each tile
      for (let i = 0; i < props.room.tiles.length; i++) {
        const x = i % 16;
        const y = Math.floor(i / 16);
        const foundItem = props.room.items.filter(item => item.x === x && item.y === y)[0];
        if (foundItem) {
          ctx.fillStyle = props.palette.sprite;
        } else if (props.room.tiles[i] > 0) {
          ctx.fillStyle = props.palette.tile;
        } else {
          continue;
        }
        ctx.fillRect(x * 2, y * 2, 2, 2);
      }
    }
  };

  return (
    <canvas
      width={size}
      height={size}
      ref={draw}
    />
  );
};

export default RoomPreview;