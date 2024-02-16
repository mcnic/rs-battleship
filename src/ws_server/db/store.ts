import { getStore, setStore } from './memoryStore';

type TUser = {
  name: string;
  password: string;
};

type TStoreUsers = { [key: string]: string };

export type TStore = {
  users: TStoreUsers;
};

const clearDB: TStore = {
  users: {
    '12345': '12345',
  },
};

export const getUser = async ({
  name,
  password,
}: TUser): Promise<string | null> => {
  console.log(name, password);
  const store = (await getStore(clearDB)) as TStore;
  return store.users[name] ?? null;
};

export const setUser = async ({ name, password }: TUser) => {
  console.log(name, password);
  const store = (await getStore(clearDB)) as TStore;
  store.users = { ...store.users, ...{ name: password } };
  await setStore(store, clearDB);
};
