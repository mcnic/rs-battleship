import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginPlayer, updateWinners } from './player';
import { TAllQuery } from './types';
import { addUserToRoom, createRoom, updateRoom } from './room';

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
          process.env.ALLOW_ALL_USERS === 'true',
        );
        ws.send(JSON.stringify(answer));

        answer = await updateRoom();
        ws.send(JSON.stringify(answer));

        answer = await updateWinners();
        ws.send(JSON.stringify(answer));

        break;

      case 'update_winners':
        answer = await updateWinners();
        ws.send(JSON.stringify(answer));

        break;

      case 'create_room':
        await createRoom(parsedData);

        answer = await updateRoom();
        ws.send(JSON.stringify(answer));

        break;

      case 'add_user_to_room':
        await addUserToRoom(parsedData);

        answer = await updateRoom();
        ws.send(JSON.stringify(answer));

        //todo create game
        break;

      default:
        console.log('<-- unknown  type', parsedData);
        break;
    }
  });
});
