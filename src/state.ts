import { BitsyTile, BitsySprite, BitsyItem, BitsyRoom, BitsyGame, BitsyDrawable, BitsyThing } from './bitsy-parser';
import { Reducer, AnyAction } from 'redux';
import { cloneDeep } from 'lodash';

export type StoreState = {
  game: BitsyGame,
};

const initialState: StoreState = {
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

  CHANGE_PALETTE = 'CHANGE_PALETTE',
}

type Actions =
  SetGame
  | CreateRoom
  | CloneRoom;

type Undoable = { name: string };

type SetGame = { type: actions.SET_GAME, game: BitsyGame };
export const setGame = (game: BitsyGame): SetGame => ({
  type: actions.SET_GAME,
  game,
});

// Tiles
type CreateTile = Undoable & { type: actions.CREATE_TILE, newTile: BitsyTile };
type ChangeTile = Undoable & { type: actions.CHANGE_TILE, changedTile: BitsyTile };
type DeleteTile = Undoable & { type: actions.DELETE_TILE, tileId: number };

export const createTile = (newTile: BitsyTile): CreateTile => ({
  type: actions.CREATE_TILE,
  name: 'Created tile',
  newTile,
});
export const changeTile = (changedTile: BitsyTile): ChangeTile => ({
  type: actions.CHANGE_TILE,
  name: 'Edited tile',
  changedTile,
});
export const deleteTile = (tileId: number): DeleteTile => ({
  type: actions.DELETE_TILE,
  name: 'Deleted tile',
  tileId,
});

// Sprites
type CreateSprite = Undoable & { type: actions.CREATE_SPRITE, newSprite: BitsySprite };
type ChangeSprite = Undoable & { type: actions.CHANGE_SPRITE, changedSprite: BitsySprite };
type DeleteSprite = Undoable & { type: actions.DELETE_SPRITE, spriteId: number };
// type MoveSprite   = { type: actions.MOVE_SPRITE, spriteId: number };

export const createSprite = (newSprite: BitsySprite): CreateSprite => ({
  type: actions.CREATE_SPRITE,
  name: 'Created sprite',
  newSprite,
});
export const changeSprite = (changedSprite: BitsySprite): ChangeSprite => ({
  type: actions.CHANGE_SPRITE,
  name: 'Edited sprite',
  changedSprite,
});
export const deleteSprite = (spriteId: number): DeleteSprite => ({
  type: actions.DELETE_SPRITE,
  name: 'Deleted sprite',
  spriteId,
});

// Items
type CreateItem = Undoable & { type: actions.CREATE_ITEM, newItem: BitsyItem };
type ChangeItem = Undoable & { type: actions.CHANGE_ITEM, changedItem: BitsyItem };
type DeleteItem = Undoable & { type: actions.DELETE_ITEM, itemId: number };

export const createItem = (newItem: BitsyItem): CreateItem => ({
  type: actions.CREATE_ITEM,
  name: 'Created item',
  newItem,
});
export const changeItem = (changedItem: BitsyItem): ChangeItem => ({
  type: actions.CHANGE_ITEM,
  name: 'Edited item',
  changedItem,
});
export const deleteItem = (itemId: number): DeleteItem => ({
  type: actions.DELETE_ITEM,
  name: 'Deleted item',
  itemId,
});

// Rooms
type CreateRoom = Undoable & { type: actions.CREATE_ROOM };
type ChangeRoom = Undoable & { type: actions.CHANGE_ROOM, changedRoom: BitsyRoom };
type DeleteRoom = Undoable & { type: actions.DELETE_ROOM, roomId: number };
type CloneRoom  = Undoable & { type: actions.CLONE_ROOM, roomId: number };

export const createRoom = (): CreateRoom => ({
  type: actions.CREATE_ROOM,
  name: 'Created room',
});
export const changeRoom = (changedRoom: BitsyRoom): ChangeRoom => ({
  type: actions.CHANGE_ROOM,
  name: 'Edited room',
  changedRoom,
});
export const deleteRoom = (roomId: number): DeleteRoom => ({
  type: actions.DELETE_ROOM,
  name: 'Deleted room',
  roomId,
});
export const cloneRoom = (roomId: number): CloneRoom => ({
  type: actions.CLONE_ROOM,
  name: 'Cloned room',
  roomId,
});

const nextId = (items: Array<BitsyThing>) => (1 + Math.max.apply(Math, items.map(item => item.id))) || 0;

// Reducer
export const reducer: Reducer<StoreState> = (state: StoreState = initialState, action: Actions): StoreState => {
  switch (action.type) {
    case actions.SET_GAME: {
      return { ...state, game: action.game };
    }

    case actions.CREATE_ROOM: {
      const newRoom: BitsyRoom = {
        id: nextId(state.game.rooms),
        name: '',
        tiles: [],
        exits: [],
        items: [],
        endings: [],
        paletteId: 0,
      };

      const newRooms = [newRoom, ...state.game.rooms];
      const newGame = { ...state.game, rooms: newRooms };
      return { ...state, game: newGame };
    }

    case actions.CLONE_ROOM: {
      const roomToClone = state.game.rooms.filter(room => room.id === action.roomId)[0];

      if (roomToClone) {
        const newRoom = cloneDeep(roomToClone);
        newRoom.id = nextId(state.game.rooms);
        return {
          ...state,
          game: { ...state.game, rooms: [...state.game.rooms, newRoom] },
        };
      }

      return state;
    }

    default:
      return state;
  }
};