import {
  TAllQuery,
  TRegisterReqData,
  TRegisterRespData,
  TWinnerRespData,
} from './types';

// todo
export const loginPlayer = async (data: TAllQuery): Promise<TAllQuery> => {
  console.log('loginPlayer', data);

  const realData: TRegisterReqData = JSON.parse(data.data);
  const { type, id } = data;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name: realData.name,
      index: 5,
      error: false,
      errorText: 'user not found',
    } as TRegisterRespData),
  };

  console.log('resp', resp);

  return resp;
};

// todo
export const updateWinners = (data: TAllQuery): TAllQuery => {
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
