import { GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import TicTacToeGame from './TicTacToeGame';

/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see TicTacToeGame
 * @see GameArea
 */
export default class TicTacToeGameArea extends GameArea<TicTacToeGame> {
  protected getType(): InteractableType {
    return 'TicTacToeArea';
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    try {
      switch (command.type) {
        case 'JoinGame':
          this._game?.join(player);
          break;
        case 'LeaveGame':
          if (!this._game || this._game.id.indexOf(player.id) === -1) {
            throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
          }
          this._game?.leave(player);
          break;
        case 'GameMove':
          if (!this._game || this._game.state.status !== 'IN_PROGRESS') {
            throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
          }
          this._game.applyMove({
            playerID: player.id,
            gameID: 'GameMove',
            move: command.move,
          });
          break;
        default:  
          throw new Error(INVALID_COMMAND_MESSAGE);
      }
      this._emitAreaChanged();
      // return null; // Return undefined for successful command
      // return {
      //   commandID: command,
      //   interactableID: this.id,
      // };
      // return undefined || '';
  
    } catch (error) {
      if (
        error === PLAYER_ALREADY_IN_GAME_MESSAGE ||
        error === GAME_FULL_MESSAGE ||
        error === GAME_NOT_IN_PROGRESS_MESSAGE ||
        error === INVALID_COMMAND_MESSAGE
      ) {
        // return error;
        // Rethrow expected errors
        throw new Error(error);
      }
  
      throw new Error('An unexpected error occurred.');
    }
  }
  
}
