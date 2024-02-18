import { getRooms, setRooms } from './db/store';
import { TAddUserToRoomData, TAllQuery } from './types';

export const createRoom = async () => {
  const rooms = await getRooms();

  rooms.push({
    roomId: 1,
    roomUsers: [
      {
        name: 'my',
        index: 0,
      },
    ],
  });

  await setRooms(rooms);
};

export const addUserToRoom = async (data: TAllQuery) => {
  const realData: TAddUserToRoomData = JSON.parse(data.data);
  const { indexRoom } = realData;

  let rooms = await getRooms();
  rooms = rooms.filter(({ roomId }) => roomId === indexRoom);
  if (rooms.length) {
    rooms[0]?.roomUsers.push({
      name: 'my',
      index: 1,
    });
  }

  await setRooms(rooms);
};

export const updateRoom = async (): Promise<TAllQuery> => {
  let rooms = await getRooms();

  // send rooms list, where only one player inside
  rooms = rooms.filter(({ roomUsers }) => roomUsers.length === 1);

  const resp: TAllQuery = {
    type: 'update_room',
    id: 0,
    data: JSON.stringify(rooms),
  };

  return resp;
};
