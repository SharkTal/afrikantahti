export function getControlPoint(x1, y1, x2, y2, offsetScale = 0.2) {
    // Midpoint
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    // Vector from P1 to P2
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normal vector (perpendicular)
    // (-dy, dx) is 90 deg rotation
    let nx = -dy;
    let ny = dx;

    // Normalize
    if (dist > 0) {
        nx /= dist;
        ny /= dist;
    }

    // Determine direction: Push AWAY from map center (approx 50, 50)
    // Vector from Center(50,50) to Midpoint
    const cx = 50;
    const cy = 50;
    const centerToMidX = mx - cx;
    const centerToMidY = my - cy;

    // Dot product to align normal with outward direction
    const dot = nx * centerToMidX + ny * centerToMidY;
    if (dot < 0) {
        // Normal is pointing inwards, flip it
        nx = -nx;
        ny = -ny;
    }

    // Scale offset based on distance
    const offset = dist * offsetScale;

    return {
        x: mx + nx * offset,
        y: my + ny * offset
    };
}

export function getBezierPoint(t, p0, p1, p2) {
    const mt = 1 - t;
    return {
        x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
        y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
    };
}
