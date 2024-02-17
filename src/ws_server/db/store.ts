import { getStore, setStore } from './memoryStore';

type TUser = {
  name: string;
  password: string;
};

type TStoreUsers = { [key: string]: string };

type TRoomUser = {
  name: string;
  index: number;
};

export type TRoom = {
  roomId: number;
  roomUsers: TRoomUser[];
};

export type TWinner = {
  name: string;
  wins: number;
};

export type TStore = {
  users: TStoreUsers;
  rooms: TRoom[];
  winners: TWinner[];
};

const clearDB: TStore = {
  users: {
    '12345': '12345',
  },
  rooms: [
    {
      roomId: 0,
      roomUsers: [
        {
          name: 'user 0',
          index: 0,
        },
      ],
    },
    {
      roomId: 1,
      roomUsers: [
        {
          name: 'user 1',
          index: 0,
        },
      ],
    },
    {
      roomId: 2,
      roomUsers: [
        {
          name: 'user 2',
          index: 0,
        },
      ],
    },
  ],
  winners: [],
};

export const getUser = async ({ name }: TUser): Promise<string | null> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.users[name] ?? null;
};

export const setUser = async ({ name, password }: TUser) => {
  const store = (await getStore(clearDB)) as TStore;

  store.users = { ...store.users, ...{ [name]: password } };

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

export const getWinners = async (): Promise<TWinner[]> => {
  const store = (await getStore(clearDB)) as TStore;

  return store.winners;
};
