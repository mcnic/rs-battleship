import { createReadStream, constants } from 'fs';
import { writeFile, access } from 'fs/promises';
import { resolve } from 'path';

const fileDBPath = resolve(__dirname, 'db.json');

export const testFileDb = async (clearDB: Object) => {
  try {
    await access(fileDBPath, constants.F_OK);
  } catch (err) {
    await writeFile(fileDBPath, JSON.stringify(clearDB), { flag: 'wx' });
  }
};

export const clearStore = async (clearDB: Object) => {
  await writeFile(fileDBPath, JSON.stringify(clearDB), { flag: 'wx' });
};

export const getStore = async (clearDB: Object): Promise<Object> => {
  await testFileDb(clearDB);

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

export const setStore = async (newStore: Object, clearDB: Object) => {
  await testFileDb(clearDB);

  await writeFile(fileDBPath, JSON.stringify(newStore), {});
};
