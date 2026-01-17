export const GAME_CONFIG = {
    WORLD: {
        LANE_WIDTH: 2.5,
        PLATFORM_LENGTH: 20,
        FOG_NEAR: 1000, // Effectively removed
        FOG_FAR: 5000,
        FOG_COLOR: 0x87CEEB,
        SKY_COLOR_TOP: 0x00BFFF, // Deep Sky Blue
        SKY_COLOR_BOTTOM: 0x87CEEB,
        CAMERA: {
            FOV: 65,
            HEIGHT: 2.5, // Low (Eye level ~2.5m)
            DISTANCE: 4.5, // Close behind
            LOOK_AT_HEIGHT: 1.0, // Look slightly down/forward
        }
    },
    PLAYER: {
        SPEED_INITIAL: 15, // Faster start
        SPEED_MAX: 50,
        SPEED_INCREMENT: 0.5,
        JUMP_FORCE: 16, // Snappier
        GRAVITY: 45, // Heavy gravity for quick landings
        SLIDE_DURATION: 0.8,
        LANE_SWITCH_SPEED: 25,
    },
    INPUT: {
        SWIPE_THRESHOLD: 50,
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
