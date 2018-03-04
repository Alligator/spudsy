import * as React from 'react';
import { BitsyTile } from '../bitsy-parser';

type Props = {
  tile: BitsyTile,
  scale: number,
  bgColour: string,
  fgColour: string,
};

const Tile = (props: Props) => {
  const size = 8 * props.scale;

  const draw = (ref: HTMLCanvasElement) => {
    if (!ref) {
      return;
    }
    const ctx = ref.getContext('2d');

    if (ctx) {
      ctx.fillStyle = props.bgColour;
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < props.tile.pixels.length; i++) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const color = props.tile.pixels[i] ? props.fgColour : props.bgColour;
        ctx.fillStyle = color;
        ctx.fillRect(x * props.scale, y * props.scale, props.scale, props.scale);
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

export default Tile;