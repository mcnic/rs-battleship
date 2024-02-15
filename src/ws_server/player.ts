import { getUser } from './db/store';
import {
  TAllQuery,
  TRegisterReqData,
  TRegisterRespData,
  TWinnerRespData,
} from './types';

export const loginPlayer = async (data: TAllQuery): Promise<TAllQuery> => {
  const realData: TRegisterReqData = JSON.parse(data.data);
  const { name, password } = realData;
  const { type, id } = data;

  const user = await getUser({ name, password });
  const userIsCorrect: boolean = !!user && user === password;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name,
      index: 5,
      error: !userIsCorrect,
      errorText: userIsCorrect ? '' : 'user not found',
    } as TRegisterRespData),
  };

  return resp;
};

// todo
export const updateWinners = async (data: TAllQuery): Promise<TAllQuery> => {
  console.log('updateWinners', data);

  // const realData: TDataRegisterReq = JSON.parse(data.data);
  const { type, id } = data;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name: 'fsdf',
      wins: 0,
    } as TWinnerRespData),
  };
  return resp;
};
