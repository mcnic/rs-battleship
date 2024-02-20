import { WebSocket, WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginOrCreate, getAnserUpdateWinners } from './player';
import { TAllQuery } from './types';
import {
  addUserToRoom,
  getAnserCreateGame,
  createRoom,
  getAnswerUpdateRoom,
} from './room';
import {
  getUserByIndex,
  getUserByName,
  getUserNameByConnectionId,
  updateUserGame,
} from './db/store';
import { TPlayerGameDataRequest } from './types';
import { getRoomByIndex } from './room';
import { getAnserStartGame as getAnswerStartGame } from './ships';
import BattleshipGame from './battleshipGame';

export const wsServer = new WebSocketServer({ port: 3000 });

const connections: { [key: string]: WebSocket } = {};

let gameIdNum = 0;

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
    const type = parsedData.type;
    const name = await getUserNameByConnectionId(connectionId);
    let user = await getUserByName(name ?? '');
    let answer: TAllQuery;

    console.log('\nrequest:', parsedData);

    try {
      switch (type) {
        case 'reg':
          answer = await loginOrCreate(parsedData, connectionId);
          sendData(ws, answer);

          answer = await getAnswerUpdateRoom();
          sendDataToAllClients(answer);

          answer = await getAnserUpdateWinners();
          sendDataToAllClients(answer);
          break;

        case 'update_winners':
          answer = await getAnserUpdateWinners();
          sendDataToAllClients(answer);
          break;

        case 'create_room':
          const userData = await getUserByName(name ?? '');
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

          if (room === undefined) throw new Error('wronngroom');
          if (room.roomUsers.length !== 2)
            throw new Error('wronng players number');

          const newBattleGame = new BattleshipGame(gameIdNum++);
          room.roomUsers.forEach((user) =>
            updateUserGame(user.name, newBattleGame),
          );

          // send only to players in room
          const myGameId = newBattleGame.getGameId();

          room.roomUsers.forEach(async ({ name }) => {
            const user = await getUserByName(name);
            if (user) {
              answer = await getAnserCreateGame(myGameId, user.index);
              const userWs = connections[user.connectionId];
              if (userWs) userWs.send(JSON.stringify(answer));
            }
          });

          break;

        case 'add_ships':
          if (!user || !user.game) throw new Error('wrong user');

          // const { indexPlayer, gameId, ships } = await addShipsToGame(parsedData);
          const { indexPlayer, ships }: TPlayerGameDataRequest = JSON.parse(
            parsedData.data,
          );

          const userGame = user.game;
          userGame.addPlayer(indexPlayer, ships);

          if (userGame.gameCanBeStart()) {
            for (let pleyerData of userGame.getPlayersData()) {
              answer = getAnswerStartGame(
                pleyerData.indexPlayer,
                pleyerData.ships,
              );

              user = await getUserByIndex(pleyerData.indexPlayer);

              if (user && user.game) {
                const userWs = connections[user.connectionId];
                if (userWs) userWs.send(JSON.stringify(answer));
              }
            }
          }
          break;

        default:
          console.log('<-- unknown  type', parsedData);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  });
});
