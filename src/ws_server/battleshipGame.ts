import { TShipData } from './types';
import { TAllQuery } from './types';

export const getAnserTurn = async (
  currentPlayer: number,
): Promise<TAllQuery> => {
  const resp: TAllQuery = {
    type: 'start_game',
    id: 0,
    data: JSON.stringify({ currentPlayer }),
  };

  return resp;
};

export type TPlayerData = {
  indexPlayer: number;
  ships: TShipData[];
};

export type TPlayesrData = { [key: number]: TPlayerData };

class BattleshipGame {
  status: 'wait' | 'run' | 'win' = 'wait';
  gameId: number;
  playersData: TPlayerData[] = [];
  currentPlayer: number;

  constructor(gameId: number) {
    this.gameId = gameId;

    this.currentPlayer = Math.random() < 0.5 ? 0 : 1;
    // for (let id in gameData) {
    //   this.playersData.push({
    //     indexPlayer: Number(id),
    //     ships: gameData[id]?.ships ?? [],
    //   });
    // }

    // this.currentPlayer = Math.random() < 0.5 ? 0 : 1;
    // console.log('playerData', this.playersData);
  }

  addPlayer(indexPlayer: number, ships: TShipData[]) {
    if (this.playersData.length > 1) throw new Error('wrong player number');

    this.playersData.push({
      indexPlayer,
      ships,
    });

    console.log('addPlayer', this.playersData);
  }

  getGameId() {
    return this.gameId;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getPlayersData() {
    return this.playersData;
  }

  gameCanBeStart() {
    return this.playersData.length === 2;
  }
}

export default BattleshipGame;
