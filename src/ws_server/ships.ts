import {
  clearDB,
  TPlayerGameData,
  TPlayerGameDataRequest,
  TStore,
} from './db/store';
import { getStore, setStore } from './db/memoryStore';
import { TGame } from './db/store';
import { TAllQuery } from './types';
import { TRoomUser, TGameData } from './db/store';

export const getGames = async (): Promise<TGame> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.games;
};

export const getGameById = async (
  gameId: number,
): Promise<TGameData | undefined> => {
  const games = await getGames();

  return games[gameId];
};

export const addGame = async (roomUsers: TRoomUser[]): Promise<number> => {
  console.log('roomUsers', roomUsers);

  const store = (await getStore(clearDB)) as TStore;

  // create empty game
  const players: TGameData = {};
  roomUsers.forEach((user) => (players[user.index] = {}));
  const gameId = Object.keys(store.games).length;
  store.games[gameId] = players;

  await setStore(store, clearDB);

  console.log('addGame store', store);

  return gameId;
};

export const addShipsToGame = async (data: TAllQuery) => {
  const shipData: TPlayerGameDataRequest = JSON.parse(data.data);
  const store = (await getStore(clearDB)) as TStore;

  const game = store.games[shipData.gameId] ?? {};
  const playerData: TPlayerGameData = game[shipData.indexPlayer] ?? {};
  playerData.ships = shipData.ships;

  await setStore(store, clearDB);
};

export const startGame = async (idPlayer: number): Promise<TAllQuery> => {
  console.log('start', idPlayer);

  const gameData: TPlayerGameData = {
    ships: [],
  };

  const resp: TAllQuery = {
    type: 'create_game',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};

/*
const shipData1 = {
  gameId: 0,
  ships: [
    { position: { x: 1, y: 3 }, direction: true, type: 'huge', length: 4 }, // x= from felt to right, y= from top to bottom
    { position: { x: 5, y: 3 }, direction: false, type: 'large', length: 3 }, // false=horisontal
    { position: { x: 5, y: 5 }, direction: true, type: 'large', length: 3 },
    { position: { x: 0, y: 8 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 1, y: 0 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 5, y: 0 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 5, y: 9 }, direction: true, type: 'small', length: 1 },
    { position: { x: 7, y: 0 }, direction: true, type: 'small', length: 1 },
    { position: { x: 3, y: 5 }, direction: false, type: 'small', length: 1 },
    { position: { x: 7, y: 7 }, direction: true, type: 'small', length: 1 },
  ],
  indexPlayer: 0,
};

const shipData2 = {
  gameId: 0,
  ships: [
    { position: { x: 0, y: 1 }, direction: false, type: 'huge', length: 4 },
    { position: { x: 7, y: 5 }, direction: true, type: 'large', length: 3 },
    { position: { x: 3, y: 6 }, direction: true, type: 'large', length: 3 },
    { position: { x: 3, y: 3 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 1, y: 3 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 0, y: 8 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 7, y: 0 }, direction: true, type: 'small', length: 1 },
    { position: { x: 7, y: 2 }, direction: true, type: 'small', length: 1 },
    { position: { x: 6, y: 9 }, direction: true, type: 'small', length: 1 },
    { position: { x: 9, y: 5 }, direction: true, type: 'small', length: 1 },
  ],
  indexPlayer: 1,
};
*/
