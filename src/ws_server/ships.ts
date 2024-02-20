import {
  clearDB,
  TPlayerGameData,
  TPlayerGameDataRequest,
  TShipData,
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

export const addShipsToGame = async (
  data: TAllQuery,
): Promise<TPlayerGameDataRequest> => {
  const shipData: TPlayerGameDataRequest = JSON.parse(data.data);
  const store = (await getStore(clearDB)) as TStore;

  const game = store.games[shipData.gameId] ?? {};
  const playerData: TPlayerGameData = game[shipData.indexPlayer] ?? {};
  playerData.ships = shipData.ships;

  await setStore(store, clearDB);

  return shipData;
};

export const getAnserStartGame = (
  currentPlayerIndex: number,
  ships: TShipData[],
): TAllQuery => {
  const gameData = { currentPlayerIndex, ships };

  const resp: TAllQuery = {
    type: 'start_game',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};
