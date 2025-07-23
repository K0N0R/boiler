import { Bus } from './bus';

type TGameState = 'lobby' | 'game' | 'pause' | 'end';

export class GameStateBase {
    state: TGameState = 'pause';
    lobby() {
        this.state = 'lobby';
    }

    update(deltaMS: number) {}
}
export const GameState = new GameStateBase();
