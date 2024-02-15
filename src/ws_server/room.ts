import { TAllQuery } from './types';

// todo
export const createRoom = async (data: TAllQuery): Promise<TAllQuery> => {
  console.log('createRoom', data);

  // const realData: TDataRegisterReq = JSON.parse(data.data);
  const { type, id } = data;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name: 'fsdf',
      wins: 0,
    }),
  };
  return resp;
};

// todo
export const addUserToRoom = (data: TAllQuery): TAllQuery => {
  console.log('addUserToRoom', data);

  // const realData: TDataRegisterReq = JSON.parse(data.data);
  const { type, id } = data;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name: 'fsdf',
      wins: 0,
    }),
  };
  return resp;
};

// todo
export const updateRoom = (data: TAllQuery): TAllQuery => {
  console.log('updateRoom', data);

  // const realData: TDataRegisterReq = JSON.parse(data.data);
  const { type, id } = data;

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name: 'fsdf',
      wins: 0,
    }),
  };
  return resp;
};
