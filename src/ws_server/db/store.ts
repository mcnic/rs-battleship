// only func using getStore() or setStore()
import BattleshipGame from 'ws_server/battleshipGame';
import { getStore, setStore } from './memoryStore';
import { TStoreUsers, TRoom, TWinners } from 'ws_server/types';
import { TUser } from 'ws_server/types';

export type TStore = {
  users: TStoreUsers;
  rooms: TRoom[];
  winners: TWinners;
};

export const clearDB: TStore = {
  users: {},
  rooms: [],
  winners: {},
};

export const getAllUsers = async (): Promise<TStoreUsers> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.users;
};

export const getUserByName = async (name: string): Promise<TUser | null> => {
  const store = (await getStore(clearDB)) as TStore;

  // console.log('users', store.users);

  return store.users[name] ?? null;
};

export const getUserByIndex = async (
  indexPlayer: number,
): Promise<TUser | null> => {
  const store = (await getStore(clearDB)) as TStore;
  for (let key in store.users) {
    if (store.users[key]?.index === indexPlayer)
      return store.users[key] ?? null;
  }

  return null;
};

// todo: for learning project password is unprotected !!!
export const addUser = async (
  name: string,
  password: string,
  connectionId: string,
): Promise<number> => {
  const store = (await getStore(clearDB)) as TStore;
  const index = Object.keys(store.users).length;

  store.users[name] = {
    password,
    index,
    connectionId,
  };

  await setStore(store, clearDB);

  // console.log('users', store.users);

  return index;
};

export const updateUserConnectinId = async (
  name: string,
  connectinId: string,
) => {
  const store = (await getStore(clearDB)) as TStore;

  const user = store.users[name];
  if (user) {
    user.connectionId = connectinId;
    store.users = { ...store.users, [name]: user };
    // console.log('users', store.users);

    await setStore(store, clearDB);
  }
};

export const updateUserGame = async (name: string, game: BattleshipGame) => {
  const store = (await getStore(clearDB)) as TStore;

  const user = store.users[name];
  if (user) {
    user.game = game;
    store.users = { ...store.users, [name]: user };
    // console.log('users', store.users);

    await setStore(store, clearDB);
  }
};

export const getUserNameByConnectionId = async (
  connectinId: string,
): Promise<string | null> => {
  const store = (await getStore(clearDB)) as TStore;

  const foundUsersKey = Object.keys(store.users).filter(
    (name) => store.users[name]?.connectionId === connectinId,
  );
  return foundUsersKey[0] ?? null;
};

export const setUser = async (name: string, userData: TUser) => {
  const store = (await getStore(clearDB)) as TStore;

  store.users[name] = userData;

  await setStore(store, clearDB);
};

export const getRooms = async (): Promise<TRoom[]> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.rooms;
};

export const setRooms = async (rooms: TRoom[]) => {
  const store = (await getStore(clearDB)) as TStore;

  store.rooms = rooms;

  await setStore(store, clearDB);
};

export const getWinners = async (): Promise<TWinners> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.winners;
};

export const addWinner = async (name: string) => {
  const store = (await getStore(clearDB)) as TStore;

  store.winners[name] = (store.winners[name] ?? 0) + 1;

  await setStore(store, clearDB);
};
