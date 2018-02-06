var polygon = function(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    var start = (3 * PI) / 4;
    for (var a = start; a < TWO_PI + start; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
}


