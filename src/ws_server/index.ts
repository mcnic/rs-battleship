import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginPlayer, updateWinners } from './player';
import { TAllQuery } from './types';
import { createRoom } from './room';

export const wsServer = new WebSocketServer({ port: 3000 });

wsServer.on('connection', function connection(ws) {
  console.log('connection established');

  ws.on('close', () => {
    console.log('connection closed');
  });

  ws.on('error', console.error);

  ws.on('message', async (data) => {
    const parsedData: TAllQuery = JSON.parse(data.toString());

    const type = parsedData.type;
    let answer: TAllQuery;

    switch (type) {
      case 'reg':
        answer = await loginPlayer(
          parsedData,
          Boolean(process.env.ALLOW_ALL_USERS),
        );
        ws.send(JSON.stringify(answer));
        break;

      case 'update_winners':
        answer = await updateWinners(parsedData);

        ws.send(JSON.stringify(answer));
        break;

      case 'create_room':
        answer = await createRoom(parsedData);
        console.log('answer', JSON.stringify(answer));

        ws.send(JSON.stringify(answer));
        break;
      default:
        console.log(' unknown  type', parsedData);
        break;
    }
  });
});
