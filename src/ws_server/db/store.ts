import { getStore, setStore } from './memoryStore';

type TUser = {
  name: string;
  password: string;
  index: number;
};

type TStoreUsers = TUser[];

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
  users: [],
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

export const getUser = async ({
  name,
}: Pick<TUser, 'name' | 'password'>): Promise<TUser | null> => {
  const store = (await getStore(clearDB)) as TStore;
  console.log('userData', store.users);
  const userData = store.users.filter((user) => user.name === name);

  return userData[0] ?? null;
};

// todo: for learning project password is unprotected !!!
export const addUser = async ({
  name,
  password,
}: Pick<TUser, 'name' | 'password'>): Promise<number> => {
  const store = (await getStore(clearDB)) as TStore;
  const index = store.users.length;

  store.users.push({
    name,
    password,
    index,
  });

  await setStore(store, clearDB);

  console.log('userData', store.users);
  return index;
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
