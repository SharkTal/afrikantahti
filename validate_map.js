import { CITIES, ROUTES, expandMapGraph } from './src/constants/mapData.js';

console.log('Validating Map Data...');

let errors = 0;

ROUTES.forEach((route, index) => {
    if (!CITIES[route.from]) {
        console.error(`ERROR: Route #${index} references invalid 'from' city: '${route.from}'`);
        errors++;
    }
    if (!CITIES[route.to]) {
        console.error(`ERROR: Route #${index} references invalid 'to' city: '${route.to}'`);
        errors++;
    }
});

if (errors === 0) {
    console.log('All routes reference valid cities.');
} else {
    console.log(`Found ${errors} errors in routes.`);
}

try {
    console.log('Testing expandMapGraph()...');
    const { nodes, edges } = expandMapGraph();
    console.log(`Expansion successful. Generated ${Object.keys(nodes).length} nodes and ${edges.length} edges.`);
} catch (e) {
    console.error('CRASH in expandMapGraph:', e);
}
