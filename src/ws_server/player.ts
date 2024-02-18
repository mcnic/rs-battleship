import { addUser, getUser, getWinners, updateConnectinId } from './db/store';
import { TAllQuery, TRegisterReqData } from './types';

export const loginOrCreate = async (
  data: TAllQuery,
  connectionId: string,
): Promise<TAllQuery> => {
  const realData: TRegisterReqData = JSON.parse(data.data);
  const { name, password } = realData;
  const { type, id } = data;

  const userDataOrNull = await getUser(name);
  let resp: TAllQuery;

  if (userDataOrNull !== null) {
    if (userDataOrNull.password === password) {
      // user is correct
      await updateConnectinId(name, connectionId);

      resp = {
        type,
        id,
        data: JSON.stringify({
          name,
          index: userDataOrNull.index,
          error: false,
          errorText: undefined,
        }),
      };
    } else {
      // wrong password
      resp = {
        type,
        id,
        data: JSON.stringify({
          name,
          index: userDataOrNull.index,
          error: true,
          errorText: 'wrong password',
        }),
      };
    }
  } else {
    // no user, create new
    const index = await addUser(name, password, connectionId);

    resp = {
      type,
      id,
      data: JSON.stringify({
        name,
        index,
        error: false,
        errorText: undefined,
      }),
    };
  }

  return resp;
};

export const updateWinners = async (): Promise<TAllQuery> => {
  const winners = await getWinners();

  const resp: TAllQuery = {
    type: 'update_winners',
    id: 0,
    data: JSON.stringify(winners),
  };

  return resp;
};
