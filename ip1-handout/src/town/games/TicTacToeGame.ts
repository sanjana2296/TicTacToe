import InvalidParametersError, { BOARD_POSITION_NOT_EMPTY_MESSAGE, GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, MOVE_NOT_YOUR_TURN_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, TicTacToeGameState, TicTacToeMove } from '../../types/CoveyTownSocket';
import Game from './Game';


/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class TicTacToeGame extends Game<TicTacToeGameState, TicTacToeMove> {
  // private _gameState: TicTacToeGameState;

  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid (with specific message noted above)
   */
  // public applyMove(move: GameMove<TicTacToeMove>): void {}

  public applyMove(move: GameMove<TicTacToeMove>): void {
    const currentPlayer = this._players.find(player => player.id === move.playerID);
    if (!currentPlayer) {
      throw new Error('PLAYER_NOT_IN_GAME_MESSAGE'); // Assuming PLAYER_NOT_IN_GAME_MESSAGE is defined elsewhere
    }

    if (!this.state.x || !this.state.o || this.state.status !== 'IN_PROGRESS') {
      throw new Error('GAME_NOT_IN_PROGRESS_MESSAGE'); // Assuming GAME_NOT_IN_PROGRESS_MESSAGE is defined elsewhere
    }

    if (currentPlayer.id !== this.state.x && currentPlayer.id !== this.state.o) {
      throw new Error('MOVE_NOT_YOUR_TURN_MESSAGE'); // Assuming MOVE_NOT_YOUR_TURN_MESSAGE is defined elsewhere
    }

    const { row, col } = move.move;
    if (this.state.moves.some(existingMove => existingMove.row === row && existingMove.col === col)) {
      throw new Error('BOARD_POSITION_NOT_EMPTY_MESSAGE'); // Assuming BOARD_POSITION_NOT_EMPTY_MESSAGE is defined elsewhere
    }

    const gamePiece = currentPlayer.id === this.state.x ? 'X' : 'O';
    const updatedMoves = [...this.state.moves, { gamePiece, row, col }];
    this.state = {
      ...this.state,
      moves: updatedMoves as ReadonlyArray<TicTacToeMove>, // Cast to ReadonlyArray if necessary
    };

    if (this._checkForWin(gamePiece, row, col)) {
      this.state.status = 'OVER';
      this.state.winner = currentPlayer.id;
    } else if (this.state.moves.length === 9) {
      // If the board is full and no one has won, it's a tie
      this.state.status = 'OVER';
      this.state.winner = undefined;
    }
  }

    /**
   * Private helper method to check if the current move results in a win.
   * Checks horizontally, vertically, and diagonally for three in a row.
   * @param gamePiece The game piece of the current player
   * @param row The row of the current move
   * @param col The column of the current move
   * @returns True if the move results in a win, false otherwise
   */
    private _checkForWin(gamePiece: 'X' | 'O', row: number, col: number): boolean {
      const checkRow = this.state.moves.filter(move => move.row === row && move.gamePiece === gamePiece).length === 3;
      const checkCol = this.state.moves.filter(move => move.col === col && move.gamePiece === gamePiece).length === 3;
  
      const checkDiagonal1 =
        row === col &&
        this.state.moves.filter(move => move.row === move.col && move.gamePiece === gamePiece).length === 3;
  
      const checkDiagonal2 =
        row + col === 2 &&
        this.state.moves.filter(move => move.row + move.col === 2 && move.gamePiece === gamePiece).length === 3;
  
      return checkRow || checkCol || checkDiagonal1 || checkDiagonal2;
    }
  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  // protected _join(player: Player): void {}

  protected _join(player: Player): void {
    if (this._players.length >= 2) {
      throw new Error('GAME_FULL_MESSAGE'); // Assuming GAME_FULL_MESSAGE is defined elsewhere
    }

    if (this._players.some(p => p.id === player.id)) {
      throw new Error('PLAYER_ALREADY_IN_GAME_MESSAGE'); // Assuming PLAYER_ALREADY_IN_GAME_MESSAGE is defined elsewhere
    }

    if (!this.state.x) {
      this.state.x = player.id;
    } else if (!this.state.o) {
      this.state.o = player.id;
    }

    if (this.state.x && this.state.o) {
      this.state.status = 'IN_PROGRESS';
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  // protected _leave(player: Player): void {}
  protected _leave(player: Player): void {
    const playerIndex = this._players.findIndex(p => p.id === player.id);

    if (playerIndex === -1) {
      throw new Error('PLAYER_NOT_IN_GAME_MESSAGE'); // Assuming PLAYER_NOT_IN_GAME_MESSAGE is defined elsewhere
    }

    this._players.splice(playerIndex, 1);

    if (this._players.length === 1) {
      const remainingPlayer = this._players[0];
      this.state.status = 'OVER';
      this.state.winner = remainingPlayer.id;
    } else {
      this.state.status = 'WAITING_TO_START';
    }
  }
}
