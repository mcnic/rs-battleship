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
  addWinner,
  getUserByIndex,
  getUserByName,
  getUserNameByConnectionId,
  getWinners,
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

const sendDataToAllUsersInGame = async (user: TUser, answer: TAllQuery) => {
  if (user && user.game) {
    const playersData = user.game.getAllPlayersData();
    for (let key in playersData) {
      const { indexPlayer } = playersData[key]!;
      const userToSend = await getUserByIndex(indexPlayer);
      if (userToSend) {
        const userWs = connections[userToSend.connectionId];
        console.log('responce to', userToSend.index, ':', answer);
        if (userWs) userWs.send(JSON.stringify(answer));
      }
    }
  }
};

const doAttack = async (
  user: TUser,
  game: BattleshipGame,
  playerId: number,
  shootData: TShootData,
) => {
  let answer: TAllQuery;

  if (playerId !== game.getCurrentPlayerIndex()) {
    console.log(
      `*** wrong player for attack: ${playerId} '${typeof playerId}' instead ${game.getCurrentPlayerIndex()}`,
    );

    return;
  }

  if (game.isGameFinished()) {
    answer = getAnsweUpdateWinners(await getWinners());
    sendDataToAllUsersInGame(user, answer);
    return;
  }

  const attackData = game.getShootResult(playerId, shootData);

  answer = getAnswerAttack(attackData);
  sendDataToAllUsersInGame(user, answer);

  if (attackData.status === 'miss') game.changePlayer();

  answer = getAnswerTurn(game.getCurrentPlayerIndex());
  sendDataToAllUsersInGame(user, answer);

  if (game.isGameFinished()) {
    answer = getAnswerFinishGame(game.getOppositePlayerIndex());
    sendDataToAllUsersInGame(user, answer);

    addWinner(game.getOppositePlayersData()?.name ?? 'noname');

    answer = getAnsweUpdateWinners(await getWinners());
    sendDataToAllUsersInGame(user, answer);
  }
};

wsServer.on('connection', function connection(ws, req) {
  let connectionId = req.headers['sec-websocket-key'] as string;
  console.log('connection established with', connectionId);
  connections[connectionId] = ws;

  ws.on('close', () => {
    console.log('connection closed with', connectionId);
    delete connections[connectionId];
  });

  ws.on('error', console.error);

  ws.on('message', async (data) => {
    try {
      const parsedData: TAllQuery = JSON.parse(data.toString());
      const type = parsedData.type;
      const name = (await getUserNameByConnectionId(connectionId)) ?? '';
      let user = await getUserByName(name ?? '');
      let answer: TAllQuery;

      console.log('\nrequest:', parsedData);

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

          if (room === undefined) throw new Error('wrong room');
          if (room.roomUsers.length !== 2)
            throw new Error('wrong players number');

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
          userGame.addPlayer(indexPlayer, name, ships);

          if (userGame.startGame()) {
            const playersData = userGame.getAllPlayersData();
            for (let key in playersData) {
              const playerData = playersData[key]!;
              answer = getAnswerStartGame(
                playerData.indexPlayer,
                playerData.ships,
              );

              user = await getUserByIndex(playerData.indexPlayer);
              if (!user) throw new Error('wrong_user');

              const userWs = connections[user.connectionId];
              console.log('responce to', playerData.indexPlayer, ':', answer);
              if (userWs) userWs.send(JSON.stringify(answer));
            }

            answer = getAnswerTurn(userGame.getCurrentPlayerIndex());
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
