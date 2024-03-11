import WebSocket from 'ws';
import { getBotAnser, getBotShips, wait } from './botHelper';
import { TAllBotQuery, TBotQueries } from './TBotQueries';
import { BOT_DATA } from './const';

const sendAsJson = (socket: WebSocket, data: any) => {
  console.log('\n=== bot send:', data);
  socket.send(JSON.stringify(data));
};

const battleshipBot = async () => {
  const socket = new WebSocket('ws://localhost:3000');
  let resp: TAllBotQuery;
  let gameId: number, indexPlayer: number, currentPlayerIndex: Number;

  socket.addEventListener('open', (_event) => {
    console.log('=== bot:  connection established');
  });

  socket.on('close', () => {
    console.log('=== bot:  connection closed');
  });

  socket.on('error', console.error);

  await wait(2000);
  resp = getBotAnser('reg', {
    name: BOT_DATA.name,
    password: BOT_DATA.password,
  });
  sendAsJson(socket, resp);

  socket.addEventListener('message', (event) => {
    try {
      console.log('\n=== bot: Message from server ', event.data);

      const parsedQuery: TAllBotQuery = JSON.parse(event.data.toString());
      const type: TBotQueries = parsedQuery.type;
      const parsedData = JSON.parse(parsedQuery.data);

      switch (type) {
        case 'reg':
          if (parsedData.error === 'true') throw new Error('wrong reg process');

          resp = getBotAnser('create_room', '');
          sendAsJson(socket, resp);
          break;

        case 'create_game':
          gameId = parsedData.idGame;
          indexPlayer = parsedData.idPlayer;

          const ships = getBotShips();
          resp = getBotAnser('add_ships', {
            gameId,
            ships,
            indexPlayer,
          });
          sendAsJson(socket, resp);
          break;

        case 'start_game':
          currentPlayerIndex = parsedData.currentPlayerIndex;
          console.log('currentPlayerIndex', currentPlayerIndex);
          break;

        case 'turn':
          if (currentPlayerIndex !== parsedData.currentPlayer) break;

          resp = getBotAnser('randomAttack', {
            gameId,
            indexPlayer,
          });
          sendAsJson(socket, resp);
          break;

        case 'update_winners':
          resp = getBotAnser('create_room', '');
          sendAsJson(socket, resp);

        default:
          break;
      }
    } catch (error) {
      console.log('== bot error', error);
    }
  });
};

export default battleshipBot;
