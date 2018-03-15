import * as React from 'react';
import { BitsyDrawable } from '../bitsy-parser';

type Props = {
  tile: BitsyDrawable,
  frame: number,
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

      for (let i = 0; i < props.tile.frames[props.frame].length; i++) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const color = props.tile.frames[props.frame][i] ? props.fgColour : props.bgColour;
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