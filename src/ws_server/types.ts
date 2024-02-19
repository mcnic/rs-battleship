export type TQueries =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'update_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'add_ships';

export type TShipType = 'huge' | 'large' | 'medium' | 'small';

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

// export type TRegisterRespData = {
//   name: string;
//   index: number;
//   error: boolean;
//   errorText: string;
// };

// export type TWinnerRespData = {
//   name: string;
//   wins: number;
// };

// export type TUpdateRoomRespData = {
//   roomId: number;
//   roomUsers: [
//     {
//       name: string;
//       index: number;
//     },
//   ];
// };

// export type TUpdateWinnersRespData = [
//   {
//     name: string;
//     wins: number;
//   },
// ];
