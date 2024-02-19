import { TGame, TRoom, getRooms, setRooms } from './db/store';
import { TAddUserToRoomData, TAllQuery } from './types';

export const createRoom = async (name: string, index: number) => {
  const rooms = await getRooms();
  const newRoom: TRoom = {
    roomId: rooms.length,
    roomUsers: [
      {
        name,
        index,
      },
    ],
  };
  rooms.push(newRoom);

  await setRooms(rooms);
};

export const addUserToRoom = async (
  data: TAllQuery,
  name: string,
): Promise<number> => {
  const realData: TAddUserToRoomData = JSON.parse(data.data);
  const { indexRoom } = realData;

  let rooms = await getRooms();
  rooms = rooms.filter(({ roomId }) => roomId === indexRoom);
  if (rooms.length) {
    rooms[0]?.roomUsers.push({
      name,
      index: 1,
    });
  }

  await setRooms(rooms);

  return indexRoom;
};

export const updateRoom = async (
  onlyOnePlayer: boolean = false,
): Promise<TAllQuery> => {
  let rooms = await getRooms();

  // send rooms list, where only one player inside
  if (onlyOnePlayer)
    rooms = rooms.filter(({ roomUsers }) => roomUsers.length === 1);

  const resp: TAllQuery = {
    type: 'update_room',
    id: 0,
    data: JSON.stringify(rooms),
  };

  return resp;
};

export const createGame = async (idPlayer: number): Promise<TAllQuery> => {
  const gameData: TGame = {
    idGame: 0,
    idPlayer,
  };

  const resp: TAllQuery = {
    type: 'create_game',
    id: 0,
    data: JSON.stringify(gameData),
  };

  return resp;
};
