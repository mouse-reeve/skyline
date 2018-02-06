var oak_tree = function (x, y, plant_size, shadow, pallette) {
    var lerp_value = 0.5 + (shadow || 0);
    var fill_color = lerpColor(color(random(pallette.plants.greens)), color(pallette.building), lerp_value);

    push();
    fill(lerpColor(color(random(pallette.plants.greens)), color(pallette.building), lerp_value));
    beginShape();
    polygon(x + (plant_size / 8), y - plant_size, plant_size * 0.7, random(5, 7));
    endShape(CLOSE);
    pop();

    var trunk_width = random(0.05, 0.2) * plant_size;
    push();
    beginShape();
    fill(lerpColor(color(pallette.trunk), color(pallette.building), lerp_value));
    vertex(x, y);
    vertex(x, y - plant_size / 4);

    vertex(x - 3, y - plant_size);
    vertex(x + (trunk_width / 2), y - (plant_size / 2));
    vertex(x + trunk_width + 3, y - plant_size);

    vertex(x + trunk_width, y - plant_size / 4);
    vertex(x + trunk_width, y);
    endShape(CLOSE);
    pop();

    for (var p = 0; p < 15; p++) {
        var wo = (plant_size / 4) + random(plant_size / -8, plant_size / 8);
        var xo = (plant_size / 8) + random(-0.4 * plant_size, 0.4 * plant_size);
        var yo = plant_size + sin(random(0, TWO_PI)) * xo;
        push();
        fill(lerpColor(fill_color, black, random(0, 0.2)));
        beginShape();
        polygon(x + xo, y - yo, wo, 5);
        endShape(CLOSE);
        if (random() > 0.5) {
            beginShape();
            polygon(x - xo, y - yo, wo, 5);
            endShape(CLOSE);
        }
        pop();
    }
}

var palm_tree = function (x, y, plant_size, shadow, pallette) {
    var lerp_value = 0.5 + (shadow || 0);
    var fill_color = lerpColor(color(random(pallette.plants.greens)), color(pallette.building), lerp_value);

    // trunk
    var lean = random(-1.5, 1.5);
    var trunk_width = random(0.05, 0.1) * plant_size;
    push();
    beginShape();
    fill(lerpColor(color(pallette.trunk), color(pallette.building), lerp_value));
    vertex(x, y);
    vertex(x + (trunk_width * lean), y - plant_size * 1.2);
    vertex(x + trunk_width + (trunk_width * lean), y - plant_size * 1.2);
    vertex(x + trunk_width, y);
    endShape(CLOSE);
    pop();

    var x0 = x + trunk_width + (trunk_width * lean);
    var y0 = y - plant_size * 1.2;
    var angle = PI / 7;
    push();
    fill(fill_color);
    for (var a = 3 * PI / 4; a < 9.5 * PI / 4; a += angle) {
        angle = PI / random(5, 10)
        var frond_radius = plant_size * 0.7 * random(0.9, 1);
        var angle_offset = random(0.8, 1.1) * (a < 3 * HALF_PI ? 1 : -1) * (PI / 7) / 2.5;
        beginShape();
        var sx = x0 + cos(a - (angle_offset / 2)) * frond_radius;
        var sy = y0 + sin(a - (angle_offset / 2)) * frond_radius;

        var hx = x0 + cos(a + (angle_offset / 2)) * (frond_radius * 0.7);
        var hy = y0 + sin(a + (angle_offset / 2)) * (frond_radius * 0.7);

        vertex(x0, y0);
        vertex(sx, sy);
        vertex(hx, hy);
        endShape();
    }
    pop();
}

var pine_tree = function (x, y, plant_size, shadow, pallette) {
    var lerp_value = 0.6 + (shadow || 0);
    var fill_color = lerpColor(color(random(pallette.plants.greens)), color(pallette.building), lerp_value);

    var plant_height = plant_size * 2;

    var trunk_width = random(0.05, 0.1) * plant_size;
    push();
    beginShape();
    fill(lerpColor(color(pallette.trunk), color(pallette.building), lerp_value));
    vertex(x, y);
    vertex(x + (trunk_width / 2), y - plant_height);
    vertex(x + trunk_width, y);
    endShape(CLOSE);
    pop();

    var xo = x + (trunk_width / 2);
    var branch = plant_height ** 0.4;
    for (var p = plant_height * 0.95; p > 0; p -= branch * 0.8) {
        var wo = p ** 0.7 + random(-1 * p ** 0.7 / 10, p ** 0.7 / 10);
        var yo = y - plant_height + p;
        push();
        fill(lerpColor(fill_color, black, random(0, 0.2)));
        beginShape();
        vertex(xo - wo, yo);
        vertex(xo, yo - (branch));
        vertex(xo + wo, yo);
        vertex(xo, yo + (branch / 5));
        endShape(CLOSE);
        pop();
    }
}

var poplar_tree = function (x, y, plant_size, shadow, pallette) {
    var lerp_value = 0.5 + (shadow || 0);
    var fill_color = lerpColor(color(random(pallette.plants.browns)), color(pallette.building), lerp_value);

    // center foliage poly
    push();
    fill(lerpColor(fill_color, color(pallette.building), lerp_value));
    beginShape();
    polygon(x + (plant_size / 8), y - plant_size, plant_size * 0.4, random(5, 7));
    endShape(CLOSE);
    beginShape();
    polygon(x + (plant_size / 8), y - (1.5 * plant_size), plant_size * 0.3, random(5, 7));
    endShape(CLOSE);
    pop();

    // trunk
    var trunk_width = random(0.05, 0.1) * plant_size;
    push();
    beginShape();
    fill(lerpColor(color(pallette.trunk), color(pallette.building), lerp_value));
    vertex(x, y);
    vertex(x, y - plant_size / 4);

    vertex(x - 3, y - plant_size);
    vertex(x + (trunk_width / 2), y - (plant_size / 2));
    vertex(x + trunk_width + 3, y - plant_size);

    vertex(x + trunk_width, y - plant_size / 4);
    vertex(x + trunk_width, y);
    endShape(CLOSE);
    pop();

    // foliage
    for (var p = 0; p < 45; p++) {
        var wo = (plant_size / 16) + random(0, plant_size / 20);
        var yo = (plant_size / 3) + (1.5 * random(0, plant_size));
        var y_max = (plant_size / 3) + (1.5 * plant_size);
        var xo = (plant_size / 8) + random(-0.3 * plant_size, 0.3 * plant_size) / (Math.abs((y_max / 2) - yo) ** 0.2);
        push();
        fill(lerpColor(fill_color, color(random(pallette.plants.browns)), random(0, 0.3)));
        beginShape();
        polygon(x + xo, y - yo, wo, 5);
        endShape(CLOSE);
        if (random() > 0.5) {
            beginShape();
            polygon(x - xo, y - yo, wo, 5);
            endShape(CLOSE);
        }
        pop();
    }
}

var bush = function (x, y, plant_size, pallette) {
    var fill_color = lerpColor(color(random(pallette.plants.greens)), color(pallette.building), 0.6);

    push();
    fill(fill_color);
    beginShape();
    polygon(x - (plant_size / 3), y - plant_size / 2, plant_size * 0.7, random(5, 7));
    polygon(x + (plant_size / 3), y - plant_size / 2, plant_size * 0.7, random(5, 7));
    endShape(CLOSE);
    pop();

    for (var p = 0; p < 15; p++) {
        var wo = (plant_size / 4) + random(plant_size / -8, plant_size / 8);
        var xo = random(-0.9 * plant_size, 0.9 * plant_size);
        var yo = random(0.4 * plant_size, 0.8 * plant_size);
        push();
        fill(lerpColor(fill_color, color(random(pallette.plants.greens)), random(0, 0.3)));
        beginShape();
        polygon(x + xo, y - yo, wo, 5);
        endShape(CLOSE);
        if (random() > 0.5) {
            beginShape();
            polygon(x - xo, y - yo, wo, 5);
            endShape(CLOSE);
        }
        pop();
    }
}
