import { TShipData } from './types';
import { TAllQuery } from './types';

export const getAnserStartGame = (
  currentPlayerIndex: number,
  ships: TShipData[],
): TAllQuery => {
  const gameData = { currentPlayerIndex, ships };

  const resp: TAllQuery = {
    type: 'start_game',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};
