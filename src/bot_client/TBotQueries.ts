export type TBotQueries =
  | 'reg'
  | 'create_room'
  | 'create_game'
  | 'add_ships'
  | 'start_game'
  | 'turn'
  | 'randomAttack'
  | 'update_winners';

export type TAllBotQuery = {
  type: TBotQueries;
  id: number;
  data: string;
};
