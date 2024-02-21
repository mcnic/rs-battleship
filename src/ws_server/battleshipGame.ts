import { TRandomAttack, TShipData, TShotStatus } from './types';
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
  /**  coords [y][x];  value = 0 = clear, 1 = occupied by ship, 2 = missed, 3 = hit part of ship */
  dots: number[][];
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

  getDotsFromShips(ships: TShipData[]): number[][] {
    const line: number[] = new Array(10);
    line.fill(0);
    let dots: number[][] = [];
    for (let i = 0; i < 10; i++) dots.push([...line]);

    ships.forEach(({ position, direction, length }) => {
      const { x, y } = position;
      if (direction) {
        for (let i = 0; i < length; i++) {
          dots[y + i]![x]! = 1;
        }
      } else {
        for (let i = 0; i < length; i++) {
          dots[y]![x + i]! = 1;
        }
      }
    });

    return dots;
  }

  getShipStatusByCoords(
    playerData: TPlayerData,
    shootX: number,
    shootY: number,
  ): TShotStatus {
    const { dots, ships } = playerData;
    if (dots[shootY]![shootX] === 0) return 'miss';

    let status: TShotStatus = 'shot';

    ships.forEach(({ position, direction, length }) => {
      const { x, y } = position;
      let isThisShipHitted = false;

      if (direction) {
        isThisShipHitted = x === shootX && y <= shootY && shootY <= y + length;
      } else {
        isThisShipHitted = y === shootY && x <= shootX && shootX <= x + length;
      }

      console.log('isThisShipHitted', isThisShipHitted);

      if (isThisShipHitted) {
        let hitPoints = 0;
        if (direction) {
          for (let i = 0; i < length; i++) {
            if (dots[x]![y + i]!) hitPoints++;
          }
        } else {
          for (let i = 0; i < length; i++) {
            if (dots[x + i]![y]!) hitPoints++;
          }
        }

        return hitPoints === length ? 'killed' : 'shot';
      }
    });

    return status;
  }

  addPlayer(indexPlayer: number, ships: TShipData[]) {
    if (this.playersData.length > 1) throw new Error('wrong player number');

    this.playersData.push({
      indexPlayer,
      ships,
      dots: this.getDotsFromShips(ships),
    });

    console.log(
      'addPlayer',
      this.playersData[this.playersData.length - 1]?.indexPlayer,
      this.playersData[this.playersData.length - 1]?.ships,
    );
    this.printPrettyDots(this.playersData[this.playersData.length - 1]?.dots!);
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

  printPrettyDots(dots: number[][]) {
    console.log('dots:');
    for (let y = 0; y < 10; y++) console.log(dots[y]?.join(' '));
  }

  getRandomShoot(): TRandomAttack {
    const playerId = this.currentPlayer === 1 ? 0 : 1;
    const { dots, indexPlayer } = this.playersData[playerId]!;
    let x = 0,
      y = 0,
      dot = 0;

    // const dots = this.playersData[playerId]?.dots!;
    let shottIsOk = true;

    // console.log('dots', dots);

    if (shottIsOk) {
      shottIsOk = true;
      x = this.getRandomCoord();
      y = this.getRandomCoord();
      dot = dots[y]![x]!;

      // console.log('dot status', dot);

      // dot is hitted yet, need getting new coords
      if ([2, 3].includes(dot)) shottIsOk = false;
    }

    const status: TShotStatus = this.getShipStatusByCoords(
      this.playersData[playerId]!,
      x,
      y,
    );

    dots[y]![x] = status === 'miss' ? 2 : 3;

    console.log('shoot', x, y);
    this.printPrettyDots(dots);

    const res: TRandomAttack = {
      x: this.getRandomCoord(),
      y: this.getRandomCoord(),
      currentPlayer: indexPlayer,
      status,
    };

    return res;
  }
}

export default BattleshipGame;

// const t = [
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 1, 1, 1, 0, 0, 0, 1, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
//   [1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
//   [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
//   [0, 1, 1, 1, 0, 0, 0, 0, 1, 1],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// ];
