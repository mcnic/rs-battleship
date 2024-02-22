import { WebSocket, WebSocketServer } from 'ws';
import 'dotenv/config';
import { loginOrCreate, getAnserUpdateWinners } from './player';
import { TAllQuery, TShootData, TUser } from './types';
import {
  addUserToRoom,
  getAnswerCreateGame,
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
import {
  getAnsweUpdateWinners,
  getAnswerAttack,
  getAnswerFinishGame,
  getAnswerTurn,
  parseAtack,
  parseRandomAtack,
} from './game';

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

const sendDataToAllUsersInGame = (user: TUser, answer: TAllQuery) => {
  if (user && user.game) {
    user.game.getPlayersData().forEach(async ({ indexPlayer }) => {
      const userToSend = await getUserByIndex(indexPlayer);
      if (userToSend) {
        const userWs = connections[userToSend.connectionId];
        console.log('responce to', userToSend.index, ':', answer);
        if (userWs) userWs.send(JSON.stringify(answer));
      }
    });
  }
};

const doAttack = (
  user: TUser,
  game: BattleshipGame,
  playerId: number,
  shootData: TShootData,
) => {
  let answer: TAllQuery;

  if (playerId === game.getCurrentPlayer())
    throw new Error('wrong player for attack');

  if (game.isGameFinished()) {
    answer = getAnsweUpdateWinners();
    sendDataToAllUsersInGame(user, answer);
    return;
  }

  const attackData = game.getShootResult(playerId, shootData);

  answer = getAnswerAttack(attackData);
  sendDataToAllUsersInGame(user, answer);

  answer =
    attackData.status === 'miss'
      ? getAnswerTurn(game.getNextPlayer())
      : getAnswerTurn(game.getPlayer());
  sendDataToAllUsersInGame(user, answer);

  if (game.isGameFinished()) {
    answer = getAnswerFinishGame(game.getNextPlayer());
    sendDataToAllUsersInGame(user, answer);

    answer = getAnsweUpdateWinners();
    sendDataToAllUsersInGame(user, answer);
  }
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

          const battleGame = new BattleshipGame(gameIdNum++);
          room.roomUsers.forEach((user) =>
            updateUserGame(user.name, battleGame),
          );

          // send only to players in room
          const myGameId = battleGame.getGameId();

          room.roomUsers.forEach(async ({ name }) => {
            const user = await getUserByName(name);
            if (user) {
              answer = getAnswerCreateGame(myGameId, user.index);
              const userWs = connections[user.connectionId];
              if (userWs) userWs.send(JSON.stringify(answer));
            }
          });

          break;

        case 'add_ships':
          if (!user || !user.game) throw new Error('wrong user');

          const { indexPlayer, ships }: TPlayerGameDataRequest = JSON.parse(
            parsedData.data,
          );

          const userGame = user.game;
          userGame.addPlayer(indexPlayer, ships);

          if (userGame.startGame()) {
            for (let playerData of userGame.getPlayersData()) {
              answer = getAnswerStartGame(
                playerData.indexPlayer,
                playerData.ships,
              );

              user = await getUserByIndex(playerData.indexPlayer);
              if (!user) throw new Error('wrong_user');

              const userWs = connections[user.connectionId];
              if (userWs) userWs.send(JSON.stringify(answer));
            }

            answer = await getAnswerTurn(userGame.getNextPlayer());
            sendDataToAllUsersInGame(user, answer);
          }
          break;

        case 'randomAttack':
          if (user && user.game) {
            const { game } = user;
            const playerId = parseRandomAtack(parsedData).indexPlayer;
            const shootData = game.getRandomShootData(playerId);
            doAttack(user, game, playerId, shootData);
          }
          break;

        case 'attack':
          if (user && user.game) {
            const { game } = user;
            const { x, y, indexPlayer } = parseAtack(parsedData);
            const shootData: TShootData = { x, y };
            doAttack(user, game, indexPlayer, shootData);
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
