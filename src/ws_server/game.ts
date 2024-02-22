import {
  TAllQuery,
  TAttackReq,
  TRamdomAttackReq,
  TRandomAttack,
} from './types';

export const getAnswerTurn = (currentPlayer: number): TAllQuery => {
  const resp: TAllQuery = {
    type: 'turn',
    id: 0,
    data: JSON.stringify({ currentPlayer }),
  };

  return resp;
};

export const parseAtack = (data: TAllQuery): TAttackReq => {
  const realData: TAttackReq = JSON.parse(data.data);
  return realData;
};

export const parseRandomAtack = (data: TAllQuery): TRamdomAttackReq => {
  const realData: TRamdomAttackReq = JSON.parse(data.data);
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

export const getAnswerFinishGame = (winPlayer: number): TAllQuery => {
  const gameData = {
    winPlayer,
  };

  const resp: TAllQuery = {
    type: 'finish',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};

export const getAnsweUpdateWinners = (): TAllQuery => {
  const gameData = [
    {
      name: '<string>',
      wins: '<number>',
    },
  ];

  const resp: TAllQuery = {
    type: 'update_winners',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};
