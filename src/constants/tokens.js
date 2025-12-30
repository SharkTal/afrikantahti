export const TOKEN_TYPES = {
    STAR: 'star',
    RUBY: 'ruby',
    EMERALD: 'emerald',
    TOPAZ: 'topaz',
    HORSESHOE: 'horseshoe',
    ROBBER: 'robber',
    EMPTY: 'empty',
};

export const TOKEN_VALUES = {
    [TOKEN_TYPES.STAR]: 0, // Win condition item
    [TOKEN_TYPES.RUBY]: 1000,
    [TOKEN_TYPES.EMERALD]: 600,
    [TOKEN_TYPES.TOPAZ]: 300,
    [TOKEN_TYPES.HORSESHOE]: 0,
    [TOKEN_TYPES.ROBBER]: -1, // Special handling: lose all money
    [TOKEN_TYPES.EMPTY]: 0,
};

// Initial distribution counts (Classic rules approximation)
export const TOKEN_COUNTS = {
    [TOKEN_TYPES.STAR]: 1,
    [TOKEN_TYPES.RUBY]: 2,
    [TOKEN_TYPES.EMERALD]: 3,
    [TOKEN_TYPES.TOPAZ]: 4,
    [TOKEN_TYPES.HORSESHOE]: 5,
    [TOKEN_TYPES.ROBBER]: 3,
    [TOKEN_TYPES.EMPTY]: 12,
};
