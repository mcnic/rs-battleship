export type TQueries = 'reg' | 'update_winners' | 'create_room';

export type TAllQuery = {
  type: TQueries;
  id: number;
  data: string;
};

export type TRegisterReqData = {
  name: string;
  password: string;
};

export type TRegisterRespData = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export type TWinnerRespData = {
  name: string;
  wins: number;
};
