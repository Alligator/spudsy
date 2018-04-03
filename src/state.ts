import {
  BitsyTile,
  BitsySprite,
  BitsyItem,
  BitsyRoom,
  BitsyGame,
  BitsyDrawable,
  BitsyThing,
  BitsyPalette
} from './bitsy-parser';
import { Reducer, AnyAction } from 'redux';
import { cloneDeep } from 'lodash';
import { INSPECT_MAX_BYTES } from 'buffer';
import { saveGame } from './persist';

export type StoreState = {
  game: BitsyGame,
  undoStack: Array<UndoAction>,
  nextUndoId: number;
};

export type UndoAction = {
  id: number;
  action?: Actions | Undoable,
  game?: string,
  timestamp: number,
};

export const initialState: StoreState = {
  game: {
    title: '',
    palettes: [],
    rooms: [],
    tiles: [],
    sprites: [],
    items: [],
    startingItems: [],
    variables: {},
    dialogs: [],
  },
  undoStack: [],
  nextUndoId: 0,
};

// Actions
enum actions {
  UNDO = 'UNDO',

  SET_GAME = 'SET_GAME',

  CREATE_TILE = 'CREATE_TILE',
  CHANGE_TILE = 'CHANGE_TILE',
  DELETE_TILE = 'DELETE_TILE',

  CREATE_SPRITE = 'CREATE_SPRITE',
  CHANGE_SPRITE = 'CHANGE_SPRITE',
  DELETE_SPRITE = 'DELETE_SPRITE',
  // MOVE_SPRITE = 'MOVE_SPRITE',

  CREATE_ITEM = 'CREATE_ITEM',
  CHANGE_ITEM = 'CHANGE_ITEM',
  DELETE_ITEM = 'DELETE_ITEM',

  CREATE_ROOM = 'CREATE_ROOM',
  CHANGE_ROOM = 'CHANGE_ROOM',
  DELETE_ROOM = 'DELETE_ROOM',
  CLONE_ROOM = 'CLONE_ROOM',

  CREATE_PALETTE = 'CREATE_PALETTE',
  CHANGE_PALETTE = 'CHANGE_PALETTE',
  DELETE_PALETTE = 'DELETE_PALETTE',
  CLONE_PALETTE = 'CLONE_PALETTE',
}

type TileActions = CreateTile | ChangeTile | DeleteTile;
type SpriteActions = CreateSprite | ChangeSprite | DeleteSprite;
type ItemActions = CreateItem | ChangeItem | DeleteItem;
type RoomActions = CreateRoom | ChangeRoom | DeleteRoom | CloneRoom;
type PaletteActions = CreatePalette | ChangePalette | DeletePalette | ClonePalette;

type Actions =
  Undo
  | SetGame
  | TileActions
  | SpriteActions
  | ItemActions
  | RoomActions
  | PaletteActions;

export type Undoable = { undoName: string };

type Undo = { type: actions.UNDO, undoId: number };
export const undo = (undoId: number): Undo => ({
  type: actions.UNDO,
  undoId,
});

type SetGame = { type: actions.SET_GAME, game: BitsyGame };
export const setGame = (game: BitsyGame): SetGame => ({
  type: actions.SET_GAME,
  game,
});

// Tiles
type CreateTile = Undoable & { type: actions.CREATE_TILE };
type ChangeTile = Undoable & { type: actions.CHANGE_TILE, changedTile: BitsyTile };
type DeleteTile = Undoable & { type: actions.DELETE_TILE, tileId: number };

export const createTile = (): CreateTile => ({
  type: actions.CREATE_TILE,
  undoName: 'Created tile',
});
export const changeTile = (changedTile: BitsyTile): ChangeTile => ({
  type: actions.CHANGE_TILE,
  undoName: 'Edited tile',
  changedTile,
});
export const deleteTile = (tileId: number): DeleteTile => ({
  type: actions.DELETE_TILE,
  undoName: 'Deleted tile',
  tileId,
});

// Sprites
type CreateSprite = Undoable & { type: actions.CREATE_SPRITE };
type ChangeSprite = Undoable & { type: actions.CHANGE_SPRITE, changedSprite: BitsySprite };
type DeleteSprite = Undoable & { type: actions.DELETE_SPRITE, spriteId: number };
// type MoveSprite   = { type: actions.MOVE_SPRITE, spriteId: number };

export const createSprite = (): CreateSprite => ({
  type: actions.CREATE_SPRITE,
  undoName: 'Created sprite',
});
export const changeSprite = (changedSprite: BitsySprite): ChangeSprite => ({
  type: actions.CHANGE_SPRITE,
  undoName: 'Edited sprite',
  changedSprite,
});
export const deleteSprite = (spriteId: number): DeleteSprite => ({
  type: actions.DELETE_SPRITE,
  undoName: 'Deleted sprite',
  spriteId,
});

// Items
type CreateItem = Undoable & { type: actions.CREATE_ITEM };
type ChangeItem = Undoable & { type: actions.CHANGE_ITEM, changedItem: BitsyItem };
type DeleteItem = Undoable & { type: actions.DELETE_ITEM, itemId: number };

export const createItem = (): CreateItem => ({
  type: actions.CREATE_ITEM,
  undoName: 'Created item',
});
export const changeItem = (changedItem: BitsyItem): ChangeItem => ({
  type: actions.CHANGE_ITEM,
  undoName: 'Edited item',
  changedItem,
});
export const deleteItem = (itemId: number): DeleteItem => ({
  type: actions.DELETE_ITEM,
  undoName: 'Deleted item',
  itemId,
});

// Rooms
type CreateRoom = Undoable & { type: actions.CREATE_ROOM };
type ChangeRoom = Undoable & { type: actions.CHANGE_ROOM, changedRoom: BitsyRoom };
type DeleteRoom = Undoable & { type: actions.DELETE_ROOM, roomId: number };
type CloneRoom = Undoable & { type: actions.CLONE_ROOM, roomId: number };

export const createRoom = (): CreateRoom => ({
  type: actions.CREATE_ROOM,
  undoName: 'Created room',
});
export const changeRoom = (changedRoom: BitsyRoom): ChangeRoom => ({
  type: actions.CHANGE_ROOM,
  undoName: 'Edited room',
  changedRoom,
});
export const deleteRoom = (roomId: number): DeleteRoom => ({
  type: actions.DELETE_ROOM,
  undoName: 'Deleted room',
  roomId,
});
export const cloneRoom = (roomId: number): CloneRoom => ({
  type: actions.CLONE_ROOM,
  undoName: 'Cloned room',
  roomId,
});

type CreatePalette = Undoable & { type: actions.CREATE_PALETTE };
type ChangePalette = Undoable & { type: actions.CHANGE_PALETTE, changedPalette: BitsyPalette };
type DeletePalette = Undoable & { type: actions.DELETE_PALETTE, paletteId: number };
type ClonePalette  = Undoable & { type: actions.CLONE_PALETTE, paletteId: number };

export const createPalette = (): CreatePalette => ({
  type: actions.CREATE_PALETTE,
  undoName: 'Created palette',
});
export const changePalette = (changedPalette: BitsyPalette): ChangePalette => ({
  type: actions.CHANGE_PALETTE,
  undoName: 'Edited palette',
  changedPalette,
});
export const deletePalette = (paletteId: number): DeletePalette => ({
  type: actions.DELETE_PALETTE,
  undoName: 'Deleted palette',
  paletteId,
});
export const clonePalette = (paletteId: number): ClonePalette => ({
  type: actions.CLONE_PALETTE,
  undoName: 'Cloned palette',
  paletteId,
});

const nextId = (items: Array<BitsyThing>) => (1 + Math.max.apply(Math, items.map(item => item.id))) || 0;

function updateGameState<T>(state: StoreState, property: string, newValue: T): StoreState {
  return {
    ...state,
    game: { ...state.game, [property]: newValue },
  };
}

export const generalReducer: Reducer<StoreState> = (state: StoreState, action: Actions): StoreState => {
  switch (action.type) {
    case actions.SET_GAME: {
      return { ...state, game: action.game, undoStack: [] };
    }
    default:
      return state;
  }
};

const tileReducer: Reducer<Array<BitsyTile>> = (
  tiles: Array<BitsyTile>,
  action: Actions,
): Array<BitsyTile> => {
  switch (action.type) {
    case actions.CREATE_TILE: {
      const newTile: BitsyTile = {
        id: nextId(tiles),
        name: '',
        frames: [[]],
        wall: false,
        isTile: true,
      };
      return [...tiles, newTile];
    }
    case actions.CHANGE_TILE: {
      return tiles.map(tile => tile.id === action.changedTile.id ? action.changedTile : tile);
    }
    case actions.DELETE_TILE: {
      return tiles.filter(tile => tile.id !== action.tileId);
    }
    default:
      return tiles;
  }
};

const spriteReducer: Reducer<Array<BitsySprite>> = (
  sprites: Array<BitsySprite>,
  action: Actions,
): Array<BitsySprite> => {
  switch (action.type) {
    case actions.CREATE_SPRITE: {
      const newSprite: BitsySprite = {
        id: nextId(sprites),
        name: '',
        frames: [[]],
        isPlayer: false,
      };
      return [...sprites, newSprite];
    }
    case actions.CHANGE_SPRITE: {
      return sprites.map(sprite => sprite.id === action.changedSprite.id ? action.changedSprite : sprite);
    }
    case actions.DELETE_SPRITE: {
      return sprites.filter(sprite => sprite.id !== action.spriteId);
    }
    default:
      return sprites;
  }
};

const itemReducer: Reducer<Array<BitsyItem>> = (
  items: Array<BitsyItem>,
  action: Actions,
): Array<BitsyItem> => {
  switch (action.type) {
    case actions.CREATE_ITEM: {
      const newItem: BitsyItem = {
        id: nextId(items),
        name: '',
        frames: [[]],
      };
      return [...items, newItem];
    }
    case actions.CHANGE_ITEM: {
      return items.map(item =>
        item.id === action.changedItem.id ? action.changedItem : item);
    }
    case actions.DELETE_ITEM: {
      return items.filter(item => item.id !== action.itemId);
    }
    default:
      return items;
  }
};

const roomReducer: Reducer<Array<BitsyRoom>> = (
  rooms: Array<BitsyRoom>,
  action: Actions,
): Array<BitsyRoom> => {
  switch (action.type) {
    case actions.CREATE_ROOM: {
      const newRoom: BitsyRoom = {
        id: nextId(rooms),
        name: '',
        tiles: [],
        exits: [],
        items: [],
        endings: [],
        paletteId: 0,
      };
      return [...rooms, newRoom];
    }
    case actions.CHANGE_ROOM: {
      return rooms.map(room => room.id === action.changedRoom.id ? action.changedRoom : room);
    }
    case actions.DELETE_ROOM: {
      return rooms.filter(room => room.id !== action.roomId);
    }
    case actions.CLONE_ROOM: {
      const roomToClone = rooms.filter(room => room.id === action.roomId)[0];

      if (roomToClone) {
        const newRoom = cloneDeep(roomToClone);
        newRoom.id = nextId(rooms);
        return [...rooms, newRoom];
      }

      return rooms;
    }
    default:
      return rooms;
  }
};

const paletteReducer: Reducer<Array<BitsyPalette>> = (
  palettes: Array<BitsyPalette>,
  action: Actions,
): Array<BitsyPalette> => {
  switch (action.type) {
    case actions.CREATE_PALETTE: {
      const newPalette: BitsyPalette = {
        id: nextId(palettes),
        name: '',
        bg: '',
        sprite: '',
        tile: '',
      };
      return [...palettes, newPalette];
    }

    case actions.CHANGE_PALETTE: {
      return palettes.map(palette => palette.id === action.changedPalette.id ? action.changedPalette : palette);
    }

    case actions.DELETE_PALETTE: {
      return palettes.filter(palette => palette.id !== action.paletteId);
    }

    case actions.CLONE_PALETTE: {
      const paletteToClone = palettes.filter(palette => palette.id === action.paletteId)[0];
      if (paletteToClone) {
        const newPalette = cloneDeep(paletteToClone);
        newPalette.id = nextId(palettes);
        return [...palettes, newPalette];
      }
      return palettes;
    }

    default:
      return palettes;
  }
};

const runReducers = (state: StoreState, action: Actions): StoreState => {
  const newGame = {
    ...state.game,
    tiles: tileReducer(state.game.tiles, action),
    sprites: spriteReducer(state.game.sprites, action),
    items: itemReducer(state.game.items, action),
    rooms: roomReducer(state.game.rooms, action),
    palettes: paletteReducer(state.game.palettes, action),
  };
  return generalReducer({ ...state, game: newGame }, action);
};

// Reducer
// TODO: Tidy up rooms after deleting tiles/sprites/items
export const reducer: Reducer<StoreState> = (state: StoreState = initialState, action: Actions): StoreState => {
  // How undo works
  //
  // There are two fields for every item in the undo list, an action and a
  // game. The action is just the action that was run (literally the redux
  // action). The game is the entire serialized and zlib compressed game state
  // (this is like 100x smaller than uncompressed or something wild).
  // 
  // When the user performs an undo, we find the last full game state in the
  // list before the action they chose to undo until and apply all of the
  // actions from that point until we get to the action they chose.
  if (action.type === actions.UNDO) {

    if (state.undoStack.length) {
      // Find the undo and discord everything before that
      let undoStack = state.undoStack.slice();
      let currentUndo = undoStack.pop();

      while (currentUndo && currentUndo.id !== action.undoId) {
        currentUndo = undoStack.pop();
      }

      // Store the undo stack at this point, as this is the stack we want to
      // persist but we're going to keep mutating the one we have to find the
      // next full state.
      const finalUndoStack = undoStack.slice();

      const actionsToReplay = [];
      let foundGame: BitsyGame | null = null;

      while (!foundGame) {
        const nextAction = undoStack.pop();

        if (nextAction && nextAction.game) {
          foundGame = JSON.parse(nextAction.game);
        } else if (nextAction && nextAction.action) {
          actionsToReplay.unshift(nextAction.action);
        } else {
          throw new Error('No game state found in the undo stack!');
        }
      }

      const newState = actionsToReplay.reduce(
        (nextState, nextAction) => runReducers(nextState, (nextAction as Actions)),
        { ...state, game: foundGame },
      );

      return {
        ...newState,
        undoStack: finalUndoStack,
      };
    }

    return state;
  } else {
    const newState = runReducers(state, action);

    if ((action as Undoable).undoName) {
      const clonedAction = cloneDeep(action);
      const timestamp = new Date().getTime();

      if (newState.undoStack.length === 0) {
        // The stack is empty, push a full state to and then this action
        newState.undoStack = [
          {
            timestamp,
            game: JSON.stringify(state.game),
            id: newState.nextUndoId++,
          },
          {
            timestamp,
            action: clonedAction,
            id: newState.nextUndoId++,
          },
        ];
      } else {
        // The stack is not empty, clone the action and add it to the stack
        newState.undoStack.push({
          timestamp,
          action: clonedAction,
          id: newState.nextUndoId++,
        });
      }
    }

    return newState;
  }

};