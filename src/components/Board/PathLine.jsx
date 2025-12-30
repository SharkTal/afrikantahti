import React from 'react';
import { TRAVEL_TYPE } from '../../constants/mapData';

import { getControlPoint } from '../../utils/geometry';

function PathLine({ x1, y1, x2, y2, type, curve }) {
    let strokeColor = '#000000';
    let strokeDasharray = 'none';
    let strokeWidth = 1;

    const curveScale = curve || 0;

    // Curved Lines (Sea + Air)
    if (type === TRAVEL_TYPE.SEA || (type === TRAVEL_TYPE.AIR && curveScale !== 0)) {
        if (type === TRAVEL_TYPE.AIR) {
            strokeColor = '#e74c3c';
            strokeWidth = 0.4; // Very thin
            strokeDasharray = '0.8 0.8';
        } else {
            strokeColor = '#2980b9';
            strokeWidth = 0.8;
            strokeDasharray = 'none';
        }

        const controlPoint = getControlPoint(x1, y1, x2, y2, curveScale || 0.3);
        const d = `M ${x1} ${y1} Q ${controlPoint.x} ${controlPoint.y} ${x2} ${y2}`;

        return (
            <path
                d={d}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                opacity={type === TRAVEL_TYPE.AIR ? 0.9 : 0.6}
            />
        );
    } else {
        // Land (Thematic "Railway/Track")
        // Reverted to default styling
    }

    return (
        <line
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            opacity={0.6}
        />
    );
}


export default PathLine;
