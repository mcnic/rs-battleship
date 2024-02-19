import { WebSocket, WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginOrCreate, updateWinners } from './player';
import { TAllQuery } from './types';
import {
  addUserToRoom,
  getAnserCreateGame,
  createRoom,
  getAnswerUpdateRoom,
} from './room';
import { getRoomByIndex, getUser, getUserNameByConnectionId } from './db/store';
import { addGame, addShipsToGame } from './ships';

export const wsServer = new WebSocketServer({ port: 3000 });

const connections: { [key: string]: WebSocket } = {};

const sendData = (ws: WebSocket, data: Object) => {
  console.log('responce:', data);
  ws.send(JSON.stringify(data));
};

//todo: async?
const sendDataToAllClients = (data: Object) => {
  console.log('responce to all:', data);
  const stringData = JSON.stringify(data);
  wsServer.clients.forEach((client) => client.send(stringData));
};

wsServer.on('connection', function connection(ws, req) {
  let connectionId = req.headers['sec-websocket-key'] as string;
  console.log('connection established with', connectionId);
  connections[connectionId] = ws;
  //todo: add User to subscribers
  // wsServer.clients.forEach((client)=> client.send());

  ws.on('close', () => {
    console.log('connection closed with', connectionId);
    delete connections[connectionId];
    // let connectionId = req.headers['sec-websocket-key'] as string;
    // todo: remove User from subscribers
    // todo: remove from room?
  });

  ws.on('error', console.error);

  ws.on('message', async (data) => {
    const parsedData: TAllQuery = JSON.parse(data.toString());
    const name = await getUserNameByConnectionId(connectionId);
    const type = parsedData.type;
    let answer: TAllQuery;

    console.log('\nrequest:', parsedData);

    switch (type) {
      case 'reg':
        answer = await loginOrCreate(parsedData, connectionId);
        sendData(ws, answer);

        answer = await getAnswerUpdateRoom();
        sendDataToAllClients(answer);

        answer = await updateWinners();
        sendDataToAllClients(answer);
        break;

      case 'update_winners':
        answer = await updateWinners();
        sendDataToAllClients(answer);
        break;

      case 'create_room':
        const userData = await getUser(name ?? '');
        if (name && userData) {
          await createRoom(name, userData.index);

          answer = await getAnswerUpdateRoom();
          sendDataToAllClients(answer);
        }
        break;

      case 'add_user_to_room':
        const indexRoom = await addUserToRoom(parsedData, name ?? 'noname');

        answer = await getAnswerUpdateRoom();
        sendDataToAllClients(answer);

        const room = await getRoomByIndex(indexRoom);
        console.log('room', room);

        // send only to players in room
        if (room?.roomUsers.length === 2) {
          const idGame = await addGame(room?.roomUsers ?? []);

          room?.roomUsers.forEach(async ({ name }) => {
            const user = await getUser(name);
            if (user) {
              // const idGame = (await getGames()).length;
              answer = await getAnserCreateGame(idGame, user.index);
              const userWs = connections[user.connectionId];
              if (userWs) userWs.send(JSON.stringify(answer));
            }
          });
        }
        break;

      case 'add_ships':
        await addShipsToGame(parsedData);
        break;

      default:
        console.log('<-- unknown  type', parsedData);
        break;
    }
  });
});
