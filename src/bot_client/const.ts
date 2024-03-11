import { TShipData } from 'ws_server/types';

export const BOT_DATA = {
  name: 'battle_bot',
  password: 'battle_bot',
};

export const botSampleShips: TShipData[] = [
  { position: { x: 2, y: 9 }, direction: false, type: 'huge', length: 4 },
  { position: { x: 6, y: 4 }, direction: false, type: 'large', length: 3 },
  { position: { x: 5, y: 1 }, direction: false, type: 'large', length: 3 },
  { position: { x: 0, y: 0 }, direction: false, type: 'medium', length: 2 },
  { position: { x: 1, y: 2 }, direction: true, type: 'medium', length: 2 },
  { position: { x: 3, y: 4 }, direction: true, type: 'medium', length: 2 },
  { position: { x: 7, y: 8 }, direction: true, type: 'small', length: 1 },
  { position: { x: 0, y: 6 }, direction: false, type: 'small', length: 1 },
  { position: { x: 5, y: 6 }, direction: false, type: 'small', length: 1 },
  { position: { x: 3, y: 0 }, direction: false, type: 'small', length: 1 },
];
