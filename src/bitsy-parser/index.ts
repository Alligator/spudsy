import serializeBitsy from './serialize';

function assert(invariant: boolean, msg: string) {
  if (!invariant) {
    throw new Error(msg);
  }
}

export interface BitsyGame {
  title: string;
  palettes: Array<BitsyPalette>;
  rooms: Array<BitsyRoom>;
  tiles: Array<BitsyTile>;
  sprites: Array<BitsySprite>;
  items: Array<BitsyItem>;
  startingItems: Array<BitsyVariables>;
  variables: BitsyVariables;
  dialogs: Array<BitsyDialog>;
}

export interface BitsyVariables {
  [name: string]: number;
}

export interface BitsyThing {
  id: number;
  name: string;
  dialogId?: string;
}

export interface BitsyPalette extends BitsyThing {
  bg: string;
  tile: string;
  sprite: string;
}

export interface BitsyRoom extends BitsyThing {
  tiles: Array<number>;
  exits: Array<BitsyExit>;
  items: Array<{ id: number; x: number, y: number }>;
  endings: Array<BitsyPosition>;
  paletteId: number;
}

export interface BitsyExit {
  fromX: number;
  fromY: number;
  toRoom: number;
  toX: number;
  toY: number;
}

export interface BitsyDrawable extends BitsyThing {
  frames: Array<Array<boolean>>;
}

export interface BitsyTile extends BitsyThing, BitsyDrawable {
  wall: boolean;
  isTile: boolean;
}

export interface BitsySprite extends BitsyThing, BitsyDrawable {
  isPlayer: boolean;
  pos?: BitsyPosition;
  dialogId?: string;
}

export interface BitsyItem extends BitsyThing, BitsyDrawable {
  dialogId?: string;
}

export interface BitsyDialog {
  id: string;
  content: Array<string>;
}

export interface BitsyPosition {
  id: number;
  x: number;
  y: number;
}

function getArg(line: string): string {
  return line.substr(line.indexOf(' ')).trim();
}

function getId(line: string): number {
  return parseInt(getArg(line), 36);
}

function getPos(line: string): BitsyPosition {
  const [, id, x, y] = line.split(/ |,/);
  return {
    id: parseInt(id, 10),
    x: parseInt(x, 10),
    y: parseInt(y, 10),
  };
}

function getExit(line: string): BitsyExit {
  const [fromX, fromY, toRoom, toX, toY] = line.split(/ |,/).slice(1).map(x => parseInt(x, 10));
  return {
    fromX,
    fromY,
    toRoom,
    toX,
    toY,
  };
}

function getFrames(lines: Array<string>): [Array<string>, Array<Array<boolean>>] {
  const frames: Array<Array<boolean>> = [];
  while (true) {
    let frame: Array<boolean> = [];
    for (let i = 0; i < 8; i++) {
      const l = lines[i].split('').map((s) => s === '1');
      frame = frame.concat(l);
    }

    frames.push(frame);
    lines = lines.slice(8);
    if (!lines[0].startsWith('>')) {
      break;
    }
    // consume the '>\n'
    lines = lines.slice(1);
  }
  return [lines, frames];
}

function parseTitle(game: BitsyGame, input: Array<string>): Array<string> {
  game.title = input[0];
  return input.slice(1);
}

function parsePal(game: BitsyGame, input: Array<string>): Array<string> {
  const palette: BitsyPalette = {
    id: getId(input[0]),
    name: '',
    bg: '',
    tile: '',
    sprite: '',
  };
  let lines = input.slice(1);

  if (lines[0].startsWith('NAME')) {
    palette.name = getArg(lines[0]);
    lines = lines.slice(1);
  }

  const parseCol = (line: string) => {
    const cols = line.split(',');
    return `rgb(${cols[0]}, ${cols[1]}, ${cols[2]})`;
  };

  palette.bg = parseCol(lines[0]);
  palette.tile = parseCol(lines[1]);
  palette.sprite = parseCol(lines[2]);

  game.palettes.push(palette);
  return lines.slice(3);
}

function parseRoom(game: BitsyGame, input: Array<string>): Array<string> {
  const room: BitsyRoom = {
    id: getId(input[0]),
    name: '',
    paletteId: 0,
    tiles: [],
    items: [],
    exits: [],
    endings: [],
  };
  let lines = input.slice(1);

  for (let i = 0; i < 16; i++) {
    const lime = lines[i];
    const ids = lime.split(',').map(item => parseInt(item, 36));
    room.tiles = room.tiles.concat(ids);
  }

  lines = lines.slice(16);

  let line = lines[0];
  while (line.length > 0) {
    switch (line.split(' ')[0]) {
      case 'NAME': {
        room.name = getArg(line);
        break;
      }
      case 'PAL': {
        room.paletteId = getId(line);
        break;
      }
      case 'ITM': {
        room.items.push(getPos(line));
        break;
      }
      case 'EXT': {
        room.exits.push(getExit(line));
        break;
      }
      case 'END': {
        room.endings.push(getPos(line));
        break;
      }
      default: break;
    }
    lines = lines.slice(1);
    line = lines[0];
  }

  game.rooms.push(room);
  return lines;
}

function parseTile(game: BitsyGame, input: Array<string>): Array<string> {
  let tile: BitsyTile = {
    id: getId(input[0]),
    name: '',
    frames: [],
    wall: false,
    isTile: true,
  };
  let lines = input.slice(1);

  [lines, tile.frames] = getFrames(lines);

  let line = lines[0];
  while (line.length > 0) {
    const cmd = line.split(' ')[0];

    switch (cmd) {
      case 'NAME': {
        tile.name = getArg(line);
        break;
      }
      case 'WAL': {
        if (getArg(line) === 'true') {
          tile.wall = true;
        }
        break;
      }
      default: break;
    }
    lines = lines.slice(1);
    line = lines[0];
  }

  game.tiles.push(tile);
  return lines;
}

function parseSprite(game: BitsyGame, input: Array<string>): Array<string> {
  let sprite: BitsySprite = {
    id: getId(input[0]),
    name: '',
    frames: [],
    isPlayer: false,
  };

  if (getArg(input[0]) === 'A') {
    sprite.isPlayer = true;
    sprite.id = -1;
  }

  let lines = input.slice(1);

  [lines, sprite.frames] = getFrames(lines);

  let line = lines[0];
  while (line.length > 0) {
    const cmd = line.split(' ')[0];

    switch (cmd) {
      case 'NAME': {
        sprite.name = getArg(line);
        break;
      }
      case 'POS': {
        sprite.pos = getPos(line);
        break;
      }
      case 'DLG': {
        sprite.dialogId = getArg(line);
        break;
      }
      case 'ITM': {
        assert(sprite.isPlayer, 'found an item on a non player sprite!!');
        const [itemId, count] = getArg(line).split(' ').map(x => parseInt(x, 10));
        game.startingItems.push({ [itemId]: count });
        break;
      }
      default: break;
    }
    lines = lines.slice(1);
    line = lines[0];
  }

  game.sprites.push(sprite);
  return lines;
}

function parseItem(game: BitsyGame, input: Array<string>): Array<string> {
  const item: BitsyItem = {
    id: getId(input[0]),
    name: '',
    frames: [],
  };
  let lines = input.slice(1);
  [lines, item.frames] = getFrames(lines);

  let line = lines[0];
  while (line.length > 0) {
    const cmd = line.split(' ')[0];

    switch (cmd) {
      case 'NAME': {
        item.name = getArg(line);
        break;
      }
      case 'DLG': {
        item.dialogId = getArg(line);
        break;
      }
      default: break;
    }
    lines = lines.slice(1);
    line = lines[0];
  }

  game.items.push(item);
  return lines;
}

function parseVar(game: BitsyGame, input: Array<string>): Array<string> {
  const name = getArg(input[0]);
  let lines = input.slice(1);

  const value = parseInt(lines[0], 10);
  lines = lines.slice(1);

  game.variables[name] = value;
  return lines;
}

function parseDialog(game: BitsyGame, input: Array<string>): Array<string> {
  const dialog: BitsyDialog = {
    id: getArg(input[0]),
    content: [],
  };
  let lines = input.slice(1);

  if (lines[0] === '"""') {
    // multi-line

    // consume the opening """
    lines = lines.slice(1);

    while (lines[0] !== '"""') {
      dialog.content.push(lines[0]);
      lines = lines.slice(1);
    }

    // consume the closing """
    lines = lines.slice(1);
  } else {
    // single line
    dialog.content = [lines[0]];
    lines = lines.slice(1);
  }

  game.dialogs.push(dialog);
  return lines;
}

function parseBitsy(input: string): BitsyGame {
  let game: BitsyGame = {
    title: '',
    palettes: [],
    rooms: [],
    tiles: [],
    sprites: [],
    items: [],
    startingItems: [],
    variables: {},
    dialogs: [],
  };
  let lines = input.split('\n');

  lines = parseTitle(game, lines);

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
        lines = parsePal(game, lines);
        break;
      }
      case 'ROOM': {
        lines = parseRoom(game, lines);
        break;
      }
      case 'TIL': {
        lines = parseTile(game, lines);
        break;
      }
      case 'SPR': {
        lines = parseSprite(game, lines);
        break;
      }
      case 'ITM': {
        lines = parseItem(game, lines);
        break;
      }
      case 'VAR': {
        lines = parseVar(game, lines);
        break;
      }
      case 'DLG': {
        lines = parseDialog(game, lines);
        break;
      }
      default: {
        lines = lines.slice(1);
      }
    }
  }

  return game;
}

export {
  parseBitsy as default,
  serializeBitsy,
};