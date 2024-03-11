import { TShipData } from 'ws_server/types';
import { botSampleShips } from './const';
import { TBotQueries, TAllBotQuery } from './types';

export const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const getBotAnser = (
  type: TBotQueries,
  data: Object | string,
): TAllBotQuery => {
  const resp: TAllBotQuery = {
    type,
    id: 0,
    data: JSON.stringify(data),
  };

  return resp;
};

export const getBotShips = (): TShipData[] => {
  return botSampleShips;
};
