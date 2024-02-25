import { TShipData } from 'ws_server/types';
import { botSampleShips } from './const';

export type TBotQueries =
  | 'reg'
  | 'create_room'
  | 'create_game'
  | 'add_ships'
  | 'start_game'
  | 'turn'
  | 'randomAttack';

export type TAllBotQuery = {
  type: TBotQueries;
  id: number;
  data: string;
};

export const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

// let pause = async (): Promise => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('3');
//       resolve();
//     }, 100);
//   });
// };

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
