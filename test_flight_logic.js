
const ROUTES = [
    { from: 'tangier', to: 'cairo', type: 'air', cost: 300 },
    { from: 'dakar', to: 'cairo', type: 'air', cost: 300 },
    { from: 'canary_islands', to: 'capetown', type: 'air', cost: 300 },
    { from: 'st_helena', to: 'capetown', type: 'air', cost: 300 },
    { from: 'st_helena', to: 'addis_abeba', type: 'air', cost: 300 },
    { from: 'capetown', to: 'cairo', type: 'air', cost: 300 },
    { from: 'capetown', to: 'addis_abeba', type: 'air', cost: 300 },
    { from: 'dar_es_salaam', to: 'cairo', type: 'air', cost: 300 },
    { from: 'tripoli', to: 'dar_es_salaam', type: 'air', cost: 300 },
    { from: 'gold_coast', to: 'cairo', type: 'air', cost: 300 },
];

const AIRPORTS = [
    'tangier', 'cairo', 'dakar', 'canary_islands', 'st_helena', 'capetown',
    'addis_abeba', 'dar_es_salaam', 'tripoli', 'gold_coast'
];

function getFlightMoves(currentNodeId, money) {
    const moves = [];
    ROUTES.filter(r => r.type === 'air' && (r.from === currentNodeId || r.to === currentNodeId)).forEach(route => {
        const targetId = route.from === currentNodeId ? route.to : route.from;
        const cost = 300;
        if (money >= cost) {
            moves.push({
                to: targetId,
                type: 'air',
                cost: cost,
                canAfford: true
            });
        }
    });
    return moves;
}

console.log('--- Testing All Airports with 999 Money ---');
AIRPORTS.forEach(city => {
    const moves = getFlightMoves(city, 999);
    console.log(`${city}: ${moves.length} moves`);
    if (moves.length === 0) console.error(`ERROR: No moves for ${city}`);
    moves.forEach(m => console.log(`  -> ${m.to}`));
});
