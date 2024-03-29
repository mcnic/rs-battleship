import { TRandomAttack, TShipData, TShootData, TShotStatus } from './types';
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
  name: string;
  ships: TShipData[];
  /**  coords [y][x];  value = 0 = clear, 1 = occupied by ship, 2 = missed, 3 = hit part of ship */
  dots: number[][];
};

class BattleshipGame {
  status: 'wait' | 'run' | 'win' = 'wait';
  gameId: number;
  playersData: TPlayerData[] = [];
  /**  0 or 1 = index in playersData */
  _currentPlayer: number;

  constructor(gameId: number) {
    this.gameId = gameId;
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

    if (dots[shootY]![shootX] === 0) {
      dots[shootY]![shootX] = 2;
      return 'miss';
    }

    dots[shootY]![shootX] = 3;
    let status: TShotStatus = 'shot';

    ships.forEach(({ position, direction, length }) => {
      const x = Number(position.x);
      const y = Number(position.y);
      let isThisShipHitted = false;

      if (direction) {
        isThisShipHitted = x === shootX && y <= shootY && shootY <= y + length;
      } else {
        isThisShipHitted = y === shootY && x <= shootX && shootX <= x + length;
      }

      if (isThisShipHitted) {
        let hitPoints = 0;

        if (direction) {
          for (let i = 0; i < length; i++) {
            // console.log(`check (${x}, ${y})`, dots[y + i]![x]!);
            if (dots[y + i]![x]! === 3) hitPoints++;
          }
        } else {
          for (let i = 0; i < length; i++) {
            // console.log(`check2 (${x}, ${y})`, dots[y]![x+i]!);
            if (dots[y]![x + i]! === 3) hitPoints++;
          }
        }

        status = hitPoints === length ? 'killed' : 'shot';
      }
    });

    return status;
  }

  addPlayer(indexPlayer: number, name: string, ships: TShipData[]) {
    if (this.playersData.length > 1) throw new Error('wrong player number');

    this.playersData.push({
      indexPlayer,
      name,
      ships,
      dots: this.getDotsFromShips(ships),
    });
  }

  getCurrentPlayerIndex(): number {
    return this.getCurrentPlayersData()?.indexPlayer!;
  }

  getOppositePlayerIndex(): number {
    return this.getCurrentPlayersData()?.indexPlayer!;
  }

  getPlayerDataByIndexPlayerOrError(indexPlayer: number): TPlayerData {
    const playerData = this.playersData.find(
      (el) => el.indexPlayer === indexPlayer,
    );

    if (!playerData)
      throw new Error(`wrong player data for index ${indexPlayer}`);

    return playerData;
  }

  getGameId() {
    return this.gameId;
  }

  getAllPlayersData() {
    return this.playersData;
  }

  getCurrentPlayersData(): TPlayerData {
    return this.playersData[this._currentPlayer]!;
  }

  getOppositePlayersData(): TPlayerData {
    return this.playersData[this._currentPlayer ? 0 : 1]!;
  }

  changePlayer() {
    this._currentPlayer = this._currentPlayer ? 0 : 1;
  }

  getStatus() {
    return this.status;
  }

  startGame() {
    if (this.playersData.length === 2) {
      this.status = 'run';

      this._currentPlayer = Math.random() < 0.5 ? 0 : 1;

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
    for (let y = 0; y < 10; y++) console.log(dots[y]?.join(' '));
  }

  getRandomShootData(playerId: number): TShootData {
    const { dots } = this.getPlayerDataByIndexPlayerOrError(playerId);
    let x = 0,
      y = 0,
      dot = 0;
    let shottIsOk = true;

    if (shottIsOk) {
      shottIsOk = true;
      x = this.getRandomCoord();
      y = this.getRandomCoord();
      dot = dots[y]![x]!;

      // dot is hitted yet, need getting new coords
      if ([2, 3].includes(dot)) shottIsOk = false;
    }

    return {
      x,
      y,
    };
  }

  getShootResult({ x, y }: TShootData): TRandomAttack {
    const playerData = this.getOppositePlayersData();

    const status: TShotStatus = this.getShipStatusByCoords(playerData, x, y);

    // console.log(`shoot to player '${playerId}': (${x}, ${y})`);
    // this.printPrettyDots(dots);
    // console.log(`status '${status}'`);

    const res: TRandomAttack = {
      x,
      y,
      currentPlayer: this.getCurrentPlayerIndex(),
      status,
    };

    this.checkIsGameOver();

    return res;
  }

  checkIsGameOver() {
    this.playersData.forEach((playerData) => {
      const aliveDots = [...playerData.dots].map((dot) => dot.includes(1));
      if (!aliveDots.includes(true)) this.status = 'win';
    });
  }

  isGameFinished() {
    return this.status === 'win';
  }
}

export default BattleshipGame;
