export const GAME_CONFIG = {
    WORLD: {
        LANE_WIDTH: 2.5,
        PLATFORM_LENGTH: 10,
        FOG_NEAR: 10,
        FOG_FAR: 50,
        FOG_COLOR: 0x87CEEB,
    },
    PLAYER: {
        SPEED_INITIAL: 12, // Slightly faster start
        SPEED_MAX: 40,
        SPEED_INCREMENT: 0.2, // Scaling
        JUMP_FORCE: 14, // Higher jump
        GRAVITY: 35, // Stronger gravity for snappy but high arc
        SLIDE_DURATION: 1.0,
        LANE_SWITCH_SPEED: 20, // Snappy
    },
    INPUT: {
        SWIPE_THRESHOLD: 50, // pixels
    }
};

export const INPUT_ACTIONS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    JUMP: 'JUMP',
    SLIDE: 'SLIDE',
    PAUSE: 'PAUSE',
} as const;

export type InputAction = keyof typeof INPUT_ACTIONS;
