import { WebSocket, WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginOrCreate, updateWinners } from './player';
import { TAllQuery } from './types';
import { addUserToRoom, createRoom, updateRoom } from './room';
import { getUserNameByConnectionId } from './db/store';

export const wsServer = new WebSocketServer({ port: 3000 });

const sendData = (ws: WebSocket, data: Object) => {
  console.log('responce:', data);
  ws.send(JSON.stringify(data));
};

wsServer.on('connection', function connection(ws, req) {
  console.log('connection established');
  let connectionId = req.headers['sec-websocket-key'] as string;

  ws.on('close', () => {
    console.log('connection closed');
  });

  ws.on('error', console.error);

  ws.on('message', async (data) => {
    const parsedData: TAllQuery = JSON.parse(data.toString());

    const type = parsedData.type;
    let answer: TAllQuery;

    console.log('\nrequest:', parsedData);

    switch (type) {
      case 'reg':
        answer = await loginOrCreate(parsedData, connectionId);
        sendData(ws, answer);

        answer = await updateRoom();
        sendData(ws, answer);

        answer = await updateWinners();
        sendData(ws, answer);

        break;

      case 'update_winners':
        answer = await updateWinners();
        sendData(ws, answer);

        break;

      case 'create_room':
        const name = await getUserNameByConnectionId(connectionId);
        if (name) {
          await createRoom(name);

          answer = await updateRoom();
          sendData(ws, answer);
        }
        break;

      case 'add_user_to_room':
        await addUserToRoom(parsedData);

        answer = await updateRoom();
        sendData(ws, answer);

        //todo create game
        break;

      default:
        console.log('<-- unknown  type', parsedData);
        break;
    }
  });
});
