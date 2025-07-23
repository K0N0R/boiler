import { IPosition } from 'frontend/common';

export type TStateMessage = [{ name: 'run-start' }, { name: 'lobby-start' }];
export type TInputMessage = [
    { name: 'resize'; data: { width: number; height: number } },
    { name: 'keyup'; data: string },
    { name: 'keydown'; data: string },
    { name: 'scroll'; data: number },
    { name: 'pointerdown'; data: boolean },
    { name: 'pointerup'; data: boolean },
    { name: 'pointermove'; data: IPosition },
    { name: 'pointer-world-position'; data: IPosition },
    { name: 'contextmenu'; data: boolean },
    { name: 'preload'; data: number },
];

export type TUiMessage = [];

export type TGameMessage = [];

export type TEffectsMessage = [{ name: 'time-scale'; data: { timeScale: number } }];
