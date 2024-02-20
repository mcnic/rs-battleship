import BattleshipGame from 'ws_server/battleshipGame';

export type TQueries =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'update_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'add_ships'
  | 'start_game'
  | 'turn'
  | 'attack'
  | 'randomAttack'
  | 'finish';

export type TAllQuery = {
  type: TQueries;
  id: number;
  data: string;
};

export type TRegisterReqData = {
  name: string;
  password: string;
};

export type TAddUserToRoomData = {
  indexRoom: number;
};

export type TCreateGameData = {
  idGame: number;
  idPlayer: number;
};

export type TStoreUsers = { [key: string]: TUser };

export type TRoomUser = {
  name: string;
  index: number;
};

export type TRoom = {
  roomId: number;
  roomUsers: TRoomUser[];
};

export type TWinner = {
  name: string;
  wins: number;
};

export type TShipData = {
  position: { x: number; y: number };
  direction: boolean;
  type: 'small' | 'medium' | 'large' | 'huge';
  length: number;
};

export type TPlayerGameDataRequest = {
  gameId: number;
  indexPlayer: number;
  ships: TShipData[];
};

export type TUser = {
  password: string;
  index: number;
  connectionId: string;
  game?: BattleshipGame;
};
