export type BitsyGame = {
  title: string,
  palettes: Array<BitsyPalette>,
  rooms: Array<BitsyRoom>,
  tiles: Array<BitsyTile>,
};

export type BitsyPalette = {
  id: number,
  name: string,
  bg: string,
  tile: string,
  sprite: string,
};

export type BitsyRoom = {
  id: number,
  name: string,
  tiles: Array<string>,
  exits: Array<BitsyExit>,
  items: Array<{ id: number, x: number, y: number }>,
  paletteId: number,
};

export type BitsyExit = {
  fromX: number,
  fromY: number,
  toRoom: number,
  toX: number,
  toY: number,
};

export type BitsyTile = {
  id: string,
  name: string,
  pixels: Array<boolean>,
  wall: boolean,
};

type ParseResult = {
  game: BitsyGame,
  lines: Array<string>,
  error?: string,
};

function getId(line: string) {
  const args = line.split(' ');
  const last = args[args.length - 1];
  return parseInt(last, 10);
}

function parseTitle(game: BitsyGame, input: Array<string>): ParseResult {
  const title = input[0];
  const newGame = Object.assign({}, game, { title });
  return {
    game: newGame,
    lines: input.slice(1),
  };
}

function parsePal(game: BitsyGame, input: Array<string>): ParseResult {
  const palette: BitsyPalette = {
    id: getId(input[0]),
    name: '',
    bg: '',
    tile: '',
    sprite: '',
  };
  let lines = input.slice(1);

  if (lines[0].startsWith('NAME')) {
    palette.name = lines[0].split(' ', 1)[1];
    lines = lines.splice(1);
  }

  const parseCol = (line: string) => {
    const cols = line.split(',');
    return `rgb(${cols[0]}, ${cols[1]}, ${cols[2]})`;
  };

  palette.bg = parseCol(lines[0]);
  palette.tile = parseCol(lines[1]);
  palette.sprite = parseCol(lines[2]);

  return {
    lines: lines.slice(3),
    game: Object.assign({}, game, { palettes: [palette, ...game.palettes] }),
  };
}

function parseRoom(game: BitsyGame, input: Array<string>): ParseResult {
  const room: BitsyRoom = {
    id: getId(input[0]),
    name: '',
    paletteId: 0,
    tiles: [],
    items: [],
    exits: [],
  };
  let lines = input.slice(1);

  for (let i = 0; i < 16; i++) {
    const lime = lines[i];
    const ids = lime.split(',');
    room.tiles = [...room.tiles, ...ids];
  }

  lines = lines.slice(16);

  let line = lines[0];
  while (line.length > 0) {
    lines = lines.slice(1);
    line = lines[0];
  }

  return {
    lines,
    game: Object.assign({}, game, { rooms: [room, ...game.rooms] }),
  };
}

function parseTile(game: BitsyGame, input: Array<string>): ParseResult {
  let tile: BitsyTile = {
    id: input[0].split(' ')[1],
    name: '',
    pixels: [],
    wall: false,
  };
  let lines = input.slice(1);

  for (let i = 0; i < 8; i++) {
    const l = lines[i].split('').map((s) => s === '1');
    tile.pixels = [...tile.pixels, ...l];
  }

  lines = lines.slice(8);

  let line = lines[0];
  while (line.length > 0) {
    const cmd = line.split(' ')[0];

    switch (cmd) {
      case 'NAME': {
        tile.name = line.substr(line.indexOf(' ')).trim();
        break;
      }
      default: break;
    }
    lines = lines.slice(1);
    line = lines[0];
  }

  return {
    lines,
    game: Object.assign({}, game, { tiles: [tile, ...game.tiles] }),
  };
}

function parseBitsy(input: string): BitsyGame {
  let game: BitsyGame = {
    title: '',
    palettes: [],
    rooms: [],
    tiles: [],
  };
  let lines = input.split('\n');

  const result = parseTitle(game, lines);
  if (result.error) {
    throw new Error('error parsing title');
  } else {
    game = result.game;
    lines = result.lines;
  }

  while (lines.length > 0) {
    const line = lines[0];

    // skip comments and blank lines
    if (line.length === 0 || line.startsWith('#')) {
      lines = lines.slice(1);
      continue;
    }

    const cmd = line.split(' ')[0];
    switch (cmd) {
      case 'PAL': {
        const palResult = parsePal(game, lines);
        if (palResult.error) {
          throw new Error('error parsing pal');
        } else {
          game = palResult.game;
          lines = palResult.lines;
        }
        break;
      }

      case 'ROOM': {
        const roomResult = parseRoom(game, lines);
        if (roomResult.error) {
          throw new Error('error parsing room');
        } else {
          game = roomResult.game;
          lines = roomResult.lines;
        }
        break;
      }

      case 'TIL': {
        const tilResult = parseTile(game, lines);
        if (tilResult.error) {
          throw new Error('error parsing til');
        } else {
          game = tilResult.game;
          lines = tilResult.lines;
        }
        break;
      }

      default: {
        lines = lines.slice(1);
      }
    }
  }

  return game;
}

export default parseBitsy;