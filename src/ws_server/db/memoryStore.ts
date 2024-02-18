let store = {};

export const testDb = (clearDB: Object) => {
  if (!Object.keys(store).length) {
    store = { ...clearDB };
    // console.log('clear store:', store);
  }
};

export const clearStore = async (clearDB: Object) => {
  store = { ...clearDB };
};

export const getStore = async (clearDB: Object): Promise<Object> => {
  testDb(clearDB);

  return new Promise((res, _rej) => {
    // console.log('store:', store);

    res(store);
  });
};

export const setStore = async (newStore: Object, clearDB: Object) => {
  testDb(clearDB);

  store = { ...newStore };
  // console.log('set new store:', store);
};
