/* globals GAME_VERSION, GAME_STAGES, GAME_TILESET_IMAGES */
export const getGlobals = (globalName = null) => ({
    GAME_VERSION,
    GAME_STAGES,
    GAME_TILESET_IMAGES,
});

export const getGlobal = (globalName) => getGlobals()?.[globalName];
