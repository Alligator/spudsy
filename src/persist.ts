import parseBitsy, { BitsyGame, serializeBitsy } from './bitsy-parser';
import { StoreState } from './state';
import { inflate, deflate } from 'pako';

const KEY = 'bitsyGame';

export const loadGame = (): StoreState | null => {
  const state = localStorage.getItem(KEY);
  if (state) {
    // const parsedGame = parseBitsy(gameData);
    return JSON.parse(inflate(state, { to: 'string' }));
  }
  return null;
};

export const saveGame = (state: StoreState) => {
  localStorage.setItem(KEY, deflate(JSON.stringify(state), { to: 'string' }));
};