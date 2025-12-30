export const TRAVEL_TYPE = {
    LAND: 'land',
    SEA: 'sea',
    AIR: 'air',
};

export const CITIES = {
    // North
    tangier: { id: 'tangier', name: 'Tangier', x: 32, y: 10, type: 'start' },
    cairo: { id: 'cairo', name: 'Cairo', x: 65, y: 12, type: 'start' },
    tunis: { id: 'tunis', name: 'Tunis', x: 48, y: 8, type: 'city' },
    tripoli: { id: 'tripoli', name: 'Tripoli', x: 55, y: 12, type: 'city' },

    // West
    casablanca: { id: 'casablanca', name: 'Casablanca', x: 25, y: 15, type: 'city' },
    canary_islands: { id: 'canary_islands', name: 'Canary Islands', x: 10, y: 20, type: 'city' },
    dakar: { id: 'dakar', name: 'Dakar', x: 8, y: 35, type: 'city' },
    sierra_leone: { id: 'sierra_leone', name: 'Sierra Leone', x: 15, y: 45, type: 'city' },
    gold_coast: { id: 'gold_coast', name: 'Gold Coast', x: 25, y: 50, type: 'city' },
    slave_coast: { id: 'slave_coast', name: 'Slave Coast', x: 35, y: 52, type: 'city' },
    timbuktu: { id: 'timbuktu', name: 'Timbuktu', x: 28, y: 32, type: 'city' },

    // Central / Sahara
    sahara: { id: 'sahara', name: 'Sahara', x: 40, y: 25, type: 'city' },
    ain_galaka: { id: 'ain_galaka', name: 'Ain Galaka', x: 48, y: 30, type: 'city' },
    dar_fur: { id: 'dar_fur', name: 'Dar Fur', x: 60, y: 35, type: 'city' },
    bahr_el_ghazal: { id: 'bahr_el_ghazal', name: 'Bahr el Ghazal', x: 65, y: 42, type: 'city' },
    ocomba: { id: 'ocomba', name: 'Ocomba', x: 55, y: 55, type: 'city' },
    kandjama: { id: 'kandjama', name: 'Kandjama', x: 45, y: 58, type: 'city' },

    // East
    suakin: { id: 'suakin', name: 'Suakin', x: 75, y: 28, type: 'city' },
    addis_abeba: { id: 'addis_abeba', name: 'Addis Abeba', x: 78, y: 40, type: 'city' },
    cape_guardafui: { id: 'cape_guardafui', name: 'Cape Guardafui', x: 92, y: 38, type: 'city' },
    dar_es_salaam: { id: 'dar_es_salaam', name: 'Dar es Salaam', x: 75, y: 60, type: 'city' },
    lake_victoria: { id: 'lake_victoria', name: 'Lake Victoria', x: 68, y: 52, type: 'city' },

    // South
    congo: { id: 'congo', name: 'Congo', x: 42, y: 68, type: 'city' },
    st_helena: { id: 'st_helena', name: 'St. Helena', x: 15, y: 75, type: 'city' },
    whalefish_bay: { id: 'whalefish_bay', name: 'Whalefish Bay', x: 40, y: 80, type: 'city' },
    capetown: { id: 'capetown', name: 'Cape Town', x: 50, y: 95, type: 'city' },
    dragon_mountain: { id: 'dragon_mountain', name: 'Dragon Mountain', x: 60, y: 82, type: 'city' },
    victoria_falls: { id: 'victoria_falls', name: 'Victoria Falls', x: 55, y: 72, type: 'city' },
    mozambique: { id: 'mozambique', name: 'Mozambique', x: 75, y: 75, type: 'city' },
    tamatave: { id: 'tamatave', name: 'Tamatave', x: 92, y: 75, type: 'city' },
    st_marie: { id: 'st_marie', name: 'Cape St. Marie', x: 86, y: 88, type: 'city' },
};

export const ROUTES = [
    // --- LAND ROUTES (Black Dotted) ---
    { from: 'tangier', to: 'casablanca', type: TRAVEL_TYPE.LAND, dots: 3 },
    { from: 'tangier', to: 'tunis', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'tangier', to: 'sahara', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'tunis', to: 'tripoli', type: TRAVEL_TYPE.LAND, dots: 3 },
    { from: 'tripoli', to: 'cairo', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'tripoli', to: 'sahara', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'cairo', to: 'suakin', type: TRAVEL_TYPE.LAND, dots: 4 },
    // Correcting map reading: Cairo -> Bahr el Ghazal? No.
    // Map: Cairo -> Suakin (Land). Cairo -> Sahara (Land).
    { from: 'cairo', to: 'sahara', type: TRAVEL_TYPE.LAND, dots: 6 },

    { from: 'casablanca', to: 'sahara', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'sahara', to: 'timbuktu', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'sahara', to: 'ain_galaka', type: TRAVEL_TYPE.LAND, dots: 2 },
    { from: 'sahara', to: 'dar_fur', type: TRAVEL_TYPE.LAND, dots: 3 },

    { from: 'timbuktu', to: 'dakar', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'timbuktu', to: 'sierra_leone', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'timbuktu', to: 'gold_coast', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'timbuktu', to: 'slave_coast', type: TRAVEL_TYPE.LAND, dots: 5 },

    { from: 'ain_galaka', to: 'slave_coast', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'ain_galaka', to: 'ocomba', type: TRAVEL_TYPE.LAND, dots: 6 },
    { from: 'ain_galaka', to: 'dar_fur', type: TRAVEL_TYPE.LAND, dots: 0 },

    { from: 'dakar', to: 'sierra_leone', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'sierra_leone', to: 'gold_coast', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'gold_coast', to: 'slave_coast', type: TRAVEL_TYPE.LAND, dots: 3 },
    // Slave Coast -> Ocomba? Or Kandjama.
    { from: 'slave_coast', to: 'kandjama', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'dar_fur', to: 'suakin', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'dar_fur', to: 'addis_abeba', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'dar_fur', to: 'bahr_el_ghazal', type: TRAVEL_TYPE.LAND, dots: 3 },

    { from: 'suakin', to: 'addis_abeba', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'addis_abeba', to: 'cape_guardafui', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'addis_abeba', to: 'lake_victoria', type: TRAVEL_TYPE.LAND, dots: 4 }, // ?
    { from: 'addis_abeba', to: 'dar_es_salaam', type: TRAVEL_TYPE.LAND, dots: 5 },

    { from: 'bahr_el_ghazal', to: 'lake_victoria', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'bahr_el_ghazal', to: 'ocomba', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'ocomba', to: 'kandjama', type: TRAVEL_TYPE.LAND, dots: 3 },
    { from: 'ocomba', to: 'lake_victoria', type: TRAVEL_TYPE.LAND, dots: 3 },
    { from: 'ocomba', to: 'congo', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'ocomba', to: 'victoria_falls', type: TRAVEL_TYPE.LAND, dots: 5 },

    { from: 'kandjama', to: 'congo', type: TRAVEL_TYPE.LAND, dots: 3 },

    { from: 'congo', to: 'whalefish_bay', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'congo', to: 'victoria_falls', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'lake_victoria', to: 'dar_es_salaam', type: TRAVEL_TYPE.LAND, dots: 3 },
    { from: 'lake_victoria', to: 'victoria_falls', type: TRAVEL_TYPE.LAND, dots: 4 }, // ?

    { from: 'dar_es_salaam', to: 'mozambique', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'victoria_falls', to: 'dragon_mountain', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'victoria_falls', to: 'mozambique', type: TRAVEL_TYPE.LAND, dots: 5 },

    { from: 'whalefish_bay', to: 'capetown', type: TRAVEL_TYPE.LAND, dots: 5 },
    { from: 'whalefish_bay', to: 'dragon_mountain', type: TRAVEL_TYPE.LAND, dots: 4 },

    { from: 'dragon_mountain', to: 'capetown', type: TRAVEL_TYPE.LAND, dots: 4 },
    { from: 'dragon_mountain', to: 'mozambique', type: TRAVEL_TYPE.LAND, dots: 5 },

    { from: 'capetown', to: 'mozambique', type: TRAVEL_TYPE.LAND, dots: 6 },

    // --- SEA ROUTES (Blue Lines) ---
    // Note: Sea routes in Afrikan Tähti are usually direct "pay to move to next port".
    // The user prompt mentioned "same rules for the blue line on sea" meaning dots?
    // "same rules for the blue line on sea" -> If dots exist, you stop on them?
    // AND "red routes ... blue routes, and railway route"
    // Usually Sea/Air are just pay-to-move. 
    // BUT the user said "same rules for the blue line on sea". 
    // This implies Step-based sea travel? 
    // If I add dots to sea, it becomes free/step-based? Or Pay + Steps?
    // Usually Sea is just "Pay + 1 hop".
    // Let's assume User wants Sea to ALSO be step-based dots?
    // "same rules for the blue line on sea" -> implies valid steps. 
    // Let's look at the Blue lines in the image... they have dots!
    // Okay, I will add dots to Sea routes too.
    // And Red routes? User: "play rules for the red routes, blue routes, and railway route".
    // Usually Red is Air (pay 300, direct).
    // Blue is Sea. 
    // If I add dots to Sea, I need to know if they cost money per step or just to enter?
    // "same rules for the railway" -> Railway is "Dice steps".
    // So Sea is "Dice steps" too?
    // If Sea is dice steps, then it's free? Or maybe Pay 100 per turn?
    // I'll make Sea routes have dots and be traversable by Dice. Travel type SEA.
    // I will REMOVE the "Cost: 100" direct jump logic for Sea and replace with Dots logic if dots > 0.
    // Wait, Air (Red) usually has NO dots.

    // --- SEA ROUTES (Blue Lines) ---
    // West Coast
    { from: 'tangier', to: 'canary_islands', type: TRAVEL_TYPE.SEA, dots: 2, curve: 0.2 },
    { from: 'casablanca', to: 'canary_islands', type: TRAVEL_TYPE.SEA, dots: 2, curve: 0.2 },
    { from: 'canary_islands', to: 'dakar', type: TRAVEL_TYPE.SEA, dots: 3, curve: 0.3 },
    { from: 'dakar', to: 'st_helena', type: TRAVEL_TYPE.SEA, dots: 6, curve: 0.4 }, // Reduced curve to keep on board
    { from: 'gold_coast', to: 'st_helena', type: TRAVEL_TYPE.SEA, dots: 5, curve: 0.4 },
    // Slave Coast link removed to match map
    { from: 'congo', to: 'st_helena', type: TRAVEL_TYPE.SEA, dots: 4, curve: 0.3 },
    { from: 'whalefish_bay', to: 'st_helena', type: TRAVEL_TYPE.SEA, dots: 4, curve: 0.3 },
    { from: 'capetown', to: 'st_helena', type: TRAVEL_TYPE.SEA, dots: 5, curve: 0.5 },

    // East Coast / Madagascar
    // East Coast / Madagascar
    // Cape Town -> Cape St. Marie (The big swoop)
    { from: 'capetown', to: 'st_marie', type: TRAVEL_TYPE.SEA, dots: 6, curve: 0.25 },

    // Connect St. Marie (South) up to Tamatave (East)
    { from: 'st_marie', to: 'tamatave', type: TRAVEL_TYPE.SEA, dots: 3, curve: 0.2 },

    // Channel crossings
    { from: 'mozambique', to: 'tamatave', type: TRAVEL_TYPE.SEA, dots: 3, curve: 0.2 },
    { from: 'mozambique', to: 'st_marie', type: TRAVEL_TYPE.SEA, dots: 4, curve: 0.3 },

    { from: 'dar_es_salaam', to: 'tamatave', type: TRAVEL_TYPE.SEA, dots: 4, curve: 0.3 },
    // Removed Dar es Salaam -> St. Marie (too far south now)

    { from: 'cape_guardafui', to: 'tamatave', type: TRAVEL_TYPE.SEA, dots: 6, curve: -0.25 },
    { from: 'cape_guardafui', to: 'suakin', type: TRAVEL_TYPE.SEA, dots: 3, curve: 0.3 },
    { from: 'suakin', to: 'cairo', type: TRAVEL_TYPE.SEA, dots: 2, curve: 0.2 },

    // --- AIR ROUTES (Red Lines) ---
    // Air is typically direct. Now utilizing curves for aesthetics.
    { from: 'tangier', to: 'cairo', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.2 },
    { from: 'dakar', to: 'cairo', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.5 }, // High arc over Sahara
    { from: 'canary_islands', to: 'capetown', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.6 }, // Huge arc over Atlantic
    { from: 'st_helena', to: 'capetown', type: TRAVEL_TYPE.AIR, cost: 300, curve: 0.3 },
    { from: 'st_helena', to: 'addis_abeba', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.2 },
    { from: 'capetown', to: 'cairo', type: TRAVEL_TYPE.AIR, cost: 300, curve: 0.1 }, // The spine, slight curve
    { from: 'capetown', to: 'addis_abeba', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.2 },
    { from: 'dar_es_salaam', to: 'cairo', type: TRAVEL_TYPE.AIR, cost: 300, curve: -0.3 },
    { from: 'tripoli', to: 'dar_es_salaam', type: TRAVEL_TYPE.AIR, cost: 300, curve: 0.2 },
    { from: 'gold_coast', to: 'cairo', type: TRAVEL_TYPE.AIR, cost: 300, curve: 0.3 },
    { from: 'gold_coast', to: 'capetown', type: TRAVEL_TYPE.AIR, cost: 300, curve: 0.4 }, // NEW ROUTE
];

export const TRAVEL_COSTS = {
    [TRAVEL_TYPE.LAND]: 0,
    [TRAVEL_TYPE.SEA]: 100, // Should this apply per step? Standard rules say "Pay for ticket".
    // If we move by dice on sea, maybe it's free?
    // Let's keep it 0 for step-movement for now to mimic Land.
    // The 'cost' property in ROUTES overrides this for Sea/Air mostly.
    [TRAVEL_TYPE.AIR]: 300,
};

import { getControlPoint, getBezierPoint } from '../utils/geometry';

// ... existing imports

// --- Helper to expand graph with dots ---
export function expandMapGraph() {
    const nodes = { ...CITIES };
    const edges = [];

    ROUTES.forEach(route => {
        if (!route.dots) {
            // Direct route (Air)
            edges.push(route);
            return;
        }

        const startNode = CITIES[route.from];
        const endNode = CITIES[route.to];

        // Calculate Control Point for Curve (if SEA)
        let controlPoint = null;
        if (route.type === TRAVEL_TYPE.SEA) {
            // Curvature: Use configured curve or default 0.3
            const curveScale = route.curve || 0.3;
            controlPoint = getControlPoint(startNode.x, startNode.y, endNode.x, endNode.y, curveScale);
        }

        // Generate dot nodes
        let previousNodeId = route.from;

        for (let i = 1; i <= route.dots; i++) {
            const t = i / (route.dots + 1);
            const dotId = `${route.from}_${route.to}_dot_${i}`;

            let dotX, dotY;

            if (route.type === TRAVEL_TYPE.SEA && controlPoint) {
                // Curved Position
                const point = getBezierPoint(t, startNode, controlPoint, endNode);
                dotX = point.x;
                dotY = point.y;
            } else {
                // Linear Position
                dotX = startNode.x + (endNode.x - startNode.x) * t;
                dotY = startNode.y + (endNode.y - startNode.y) * t;
            }

            nodes[dotId] = {
                id: dotId,
                name: '', // Dots have no name
                x: dotX,
                y: dotY,
                type: 'dot',
                dotType: route.type // Pass 'land' or 'sea'
            };

            // Edge from previous to this dot
            edges.push({
                from: previousNodeId,
                to: dotId,
                type: route.type,
                cost: 0,
                // Pass curvature info to edges? Not strictly needed for logic, only render involves path.
                // But rendered edges are drawn from ROUTES, not expandMapGraph edges (usually).
                // Actually Board.jsx renders visual lines from ROUTES.
            });

            previousNodeId = dotId;
        }

        // Final edge from last dot to destination
        edges.push({
            from: previousNodeId,
            to: route.to,
            type: route.type,
            cost: 0
        });
    });

    return { nodes, edges };
}
