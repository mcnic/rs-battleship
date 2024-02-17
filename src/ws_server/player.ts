import { getUser, getWinners } from './db/store';
import { TAllQuery, TRegisterReqData } from './types';

export const loginPlayer = async (
  data: TAllQuery,
  allowAll: boolean = false,
): Promise<TAllQuery> => {
  const realData: TRegisterReqData = JSON.parse(data.data);
  const { name, password } = realData;
  const { type, id } = data;

  console.log('<- loginPlayer', realData);

  const user = await getUser({ name, password });
  const userIsCorrect: boolean = allowAll || (!!user && user === password);

  const resp: TAllQuery = {
    type,
    id,
    data: JSON.stringify({
      name,
      index: 5,
      error: !userIsCorrect,
      errorText: userIsCorrect ? '' : 'user not found',
    }),
  };

  console.log('--> loginPlayer', resp);

  return resp;
};

export const updateWinners = async (): Promise<TAllQuery> => {
  const winners = await getWinners();

  const resp: TAllQuery = {
    type: 'update_winners',
    id: 0,
    data: JSON.stringify(winners),
  };

  console.log('--> updateWinners', resp);

  return resp;
};
