import { TRandomAttack, TShipData } from './types';
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
  currentPlayer: number; // 0 or 1 = index in playersData

  constructor(gameId: number) {
    this.gameId = gameId;

    this.currentPlayer = Math.random() < 0.5 ? 0 : 1;
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

  getNextPlayer(): number {
    this.currentPlayer++;
    if (this.currentPlayer > 1) this.currentPlayer = 0;

    return this.playersData[this.currentPlayer]?.indexPlayer!;
  }

  getStatus() {
    return this.status;
  }

  startGame() {
    if (this.playersData.length === 2) {
      this.status = 'run';
      return true;
    }

    return false;
  }

  getRandomCoord() {
    let coord = Math.round(Math.random() * 10);
    if (coord > 9) coord = 0;

    return coord;
  }

  //todo: coords hasn't repeate, status must checked
  getRandomShoot(): TRandomAttack {
    const playerId = this.currentPlayer === 1 ? 0 : 1;
    const res: TRandomAttack = {
      x: this.getRandomCoord(),
      y: this.getRandomCoord(),
      currentPlayer: this.playersData[playerId]?.indexPlayer!,
      status: 'miss',
    };

    return res;
  }
}

export default BattleshipGame;
