import { createReadStream, constants } from 'fs';
import { writeFile, access } from 'fs/promises';
import { resolve } from 'path';

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
const fileDBPath = resolve(__dirname, 'db.json');

export const testFileDb = async () => {
  try {
    await access(fileDBPath, constants.F_OK);
  } catch (err) {
    await writeFile(fileDBPath, JSON.stringify(clearDB), { flag: 'wx' });
  }
};

export const clearStore = async () => {
  await writeFile(fileDBPath, JSON.stringify(clearDB), { flag: 'wx' });
};

const getStore = async (): Promise<TStore> => {
  await testFileDb();

  return new Promise((res, rej) => {
    const readStream = createReadStream(fileDBPath, { encoding: 'utf8' });

    let body = '';
    readStream.on('data', (chunk) => {
      body += chunk;
    });

    readStream.on('end', () => {
      res(JSON.parse(body));
    });

    readStream.on('error', (err) => rej(err));
  });
};

const setStore = async (users: TStore) => {
  await testFileDb();

  await writeFile(fileDBPath, JSON.stringify(users), {});
};

export const getUser = async ({
  name,
  password,
}: TUser): Promise<string | null> => {
  console.log(name, password);
  const store = await getStore();
  return store.users[name] ?? null;
};

export const setUser = async ({ name, password }: TUser) => {
  console.log(name, password);
  const store = await getStore();
  store.users = { ...store.users, ...{ name: password } };
  await setStore(store);
};
