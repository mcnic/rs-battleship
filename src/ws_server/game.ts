import { TAllQuery, TAttackResp, TRandomAttack } from './types';

export const getAnswerTurn = async (
  currentPlayer: number,
): Promise<TAllQuery> => {
  const resp: TAllQuery = {
    type: 'turn',
    id: 0,
    data: JSON.stringify({ currentPlayer }),
  };

  return resp;
};

export const parseRandomAtack = (data: TAllQuery): TAttackResp => {
  const realData: TAttackResp = JSON.parse(data.data) as TAttackResp;
  return realData;
};

export const getAnswerAttack = ({
  x,
  y,
  currentPlayer,
  status,
}: TRandomAttack): TAllQuery => {
  const gameData = {
    position: {
      x,
      y,
    },
    currentPlayer,
    status,
  };

  const resp: TAllQuery = {
    type: 'attack',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};
