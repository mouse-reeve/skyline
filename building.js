var simple_building = function (x, y, b_height, b_width, fill_color, secondary_shape, pallette) {
    var dome_start = secondary_shape == 'dome' ? random(5 * PI / 6, PI) : PI
    var params = {
        'primary_mass': true,
        'add_secondary': false,
        'accent_shape': random([secondary_shape, secondary_shape, secondary_shape, 'dome', 'triangle', 'quadrilateral']),
        'fancy_roof': random() > 0.6,
        'roof_overhang': random(0, 4),
        'roof_masses': random([1, 1, 1, 2]) * 2 - 1,
        'dome_start': dome_start,
        'quad_ratio': random(0.96, 1, 2),
        'level_height': b_height,
        'levels': 1,
        'fill_color': lerpColor(fill_color, black, random(0, 0.1)),
    }
    params.spire_height = params.accent_shape == 'quadrilateral' ? 0 : random(3, 10);
    params.width_decrement = 0;
    params.width = b_width;
    // avoid gigantic roofs
    if (params.width > b_height * 0.7) {
        params.accent_shape = 'quadrilateral';
    }
    if (params.accent_shape != 'quadrilateral' && random() > 0.4) {
        params.roof_color = lerpColor(color(pallette.roof), color(pallette.building), 0.5);
    }
    params.level_recursion = false,
    params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
    params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

    building(x, y, params);
}

var landmark = function (x, y, level_height, levels, secondary_shape, pallette) {
    push();
    noStroke();
    var elevation = (height * 0.5) / 3.5;
    var params = {
        'primary_mass': true,
        'add_secondary': random([true, false, false, false, false]),
        'accent_shape': secondary_shape,
        'levels': levels,
        'fancy_roof': true,
        'roof_color': pallette.roof,
        'roof_overhang': random(0, 4),
        'roof_masses': random([1, 2]) * 2 - 1,
        'dome_start': random(3 * PI / 4, PI),
        'quad_ratio': random(1, 2),
        'level_height': level_height,
        'fill_color': color(pallette.landmark),
    }
    params.spire_height = params.accent_shape == 'quadrilateral' ? 0 : random(8, 20);
    params.width_decrement = params.accent_shape == 'quadrilateral' ? 0 : (150 - (150 / random([1, 1.5, 2]))) / (params.levels + 1);
    params.width = params.width_decrement > 0 ? 150 : 60;
    params.level_recursion = params.width_decrement < 0.2 ? 0 : 2;
    params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
    params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

    x = x - (params.width / 2);
    y = y - elevation;

    building(x, y, params, secondary_shape);
    pop()

}

var building = function (x, y, params, pallette) {
    // large, complicated building
    if (params.recursed && (params.width < 30 || params.levels == 0)) {
        //stop recusion
        return;
    }

    // connecting element for secondary masses needs to be at the back
    if (params.primary_mass && params.add_secondary) {
        // additional masses
        var mass_params = Object.assign({}, params);
        mass_params.level_recursion = 0;
        mass_params.width = 150 * random(0.05, 0.3);
        mass_params.width_decrement *= 0.01;
        mass_params.roof_masses = 1;
        mass_params.roof_overhang *= 0.5;
        mass_params.roof_peak *= 0.5;
        mass_params.primary_mass = false;
        mass_params.level_height *= random(0.3, 1.5);

        var distance = random([-2, params.width * random(0.01, 0.2)]);
        // add connecting element
        push();
        fill(params.fill_color);
        beginShape()
        var connector_height = (mass_params.width / 20) * params.level_height;
        vertex(x - mass_params.width - distance, y);
        vertex(x - mass_params.width - distance, y - connector_height);
        vertex(x + params.width + mass_params.width + distance, y - connector_height);
        vertex(x + params.width + mass_params.width + distance, y);
        endShape(close);
        pop();
    }


    // levels
    fill(params.fill_color);
    for (var l = 0; l < params.levels; l++) {
        beginShape();
        vertex(x + (l * params.width_decrement), y - (l * params.level_height));
        vertex(x + (l * params.width_decrement), y - ((l + 1) * params.level_height) - 1);
        vertex(x + params.width - (l * params.width_decrement), y - ((l + 1) * params.level_height + 1));
        vertex(x + params.width - (l * params.width_decrement), y - (l * params.level_height));
        endShape(CLOSE);
    }

    if (params.fancy_roof) {
        fancy_roof(x, y, params);
    } else if (random() > 0.3) {
        var roof_params = Object.assign({}, params);
        roof_params.spire_height = 0;
        roof_params.accent_shape = 'quadrilateral';
        roof_params.quad_ratio = random(0.97, 1, 1.5);
        fancy_roof(x, y, roof_params);
    }

    // level roofing
    if (params.width_decrement > 0) {
        for (var l = 0; l < params.levels; l++) {
            push()
            fill(lerpColor(params.fill_color, black, 0.1));
            roof(x, y, l, params);
            pop();
        }
    }

    // recursive sub-structures
    for (var l = params.levels - 2; l >= 0; l--) {
        if (l % params.level_recursion == 0) {
            var new_params = Object.assign({}, params);
            new_params.levels = 1;
            new_params.level_recursion += 1;
            new_params.width_decrement *= 0.9;
            new_params.level_height *= 0.8;
            new_params.width = (params.width - (l * params.width_decrement)) / 3;
            new_params.fill_color = lerpColor(params.fill_color, white, 0.05);
            new_params.spire_height *= 0.6;
            new_params.recursed = true;
            new_params.primary_mass = false;
            push();
            building(x + (l * params.width_decrement),
                          y - (l * params.level_height),
                          new_params);

            var end = x + params.width - (l * params.width_decrement);
            building(end - new_params.width,
                          y - (l * params.level_height),
                          new_params);
            if (l > 0 && params.width_decrement > 0) {
                push();
                fill(lerpColor(params.fill_color, black, 0.1));
                roof(x, y, l-1, params);
                pop();
            }
        }
    }

    if (params.primary_mass && params.add_secondary) {
        // additional masses
        building(x - mass_params.width - distance, y, mass_params);
        building(x + params.width + distance, y, mass_params);
    }
}

var fancy_roof = function (x, y, params, pallette) {
    // fancy top roof
    var peak_height = params.level_height * params.levels;
    var peak_width = params.width - ((params.levels - 1) * 2 * params.width_decrement);
    var center = Math.floor(params.roof_masses / 2);

    var rx = x + ((params.levels - 1) * params.width_decrement);
    push();
    if (params.roof_color) {
        fill(params.roof_color);
    }
    for (var i = 0; i < params.roof_masses; i ++) {
        beginShape();
        var scale = center - i;

        var roof_width = ((params.roof_masses - Math.abs(scale)) * 0.5) ** 1.7 * peak_width / params.roof_masses;
        var offset = i * (peak_width / (params.roof_masses - 1));
        if (params.roof_masses == 1) {
            offset = peak_width / 2;
            roof_width = peak_width;
        } else if (scale != 0) {
             offset += roof_width / (scale * 2);
        }

        var roof_height = roof_width / 2;
        if (params.accent_shape == 'dome') {
            dome(rx + offset, y - peak_height, roof_width / 2, 100, params.dome_start);
        } else if (params.accent_shape == 'triangle') {
            triangle(rx + offset, y - peak_height, roof_width / 2);
        } else if (params.accent_shape == 'quadrilateral') {
            roof_height = roof_width / 20;
            quadrilateral(rx + offset, y - peak_height, roof_width / 2, roof_width / 20, roof_width / (2 * params.quad_ratio));
        }
        endShape(CLOSE);

        // spire
        if (params.spire_height) {
            beginShape();
            var spire_width = roof_width < 30 ?  roof_width / 10 : 3
            triangle(rx + offset, y - peak_height, spire_width, roof_height + params.spire_height);
            endShape(CLOSE);
        }
    }
    pop();
}

var roof = function (x, y, l, params, pallette) {
    beginShape();
    vertex(x + (l * params.width_decrement) - params.roof_overhang, y - ((l + 1) * params.level_height) - params.roof_lift);
    vertex(x + (l * params.width_decrement) - params.roof_overhang, y - ((l + 1) * params.level_height) - (params.roof_lift + 2));

    vertex(x + (params.width / 2), y - ((l + 1) * params.level_height) - (params.roof_lift + 2) - params.roof_peak);

    vertex(x + params.width - (l * params.width_decrement) + params.roof_overhang, y - ((l + 1) * params.level_height) - (params.roof_lift + 2));
    vertex(x + params.width - (l * params.width_decrement) + params.roof_overhang, y - ((l + 1) * params.level_height) - params.roof_lift);

    endShape(CLOSE);
}

var dome = function (x, y, radius, npoints, start, pallette) {
    var start = start || PI;
    var end = TWO_PI + start;
    var y_offset = sin(start) * radius;

    var angle = TWO_PI / npoints;
    for (var a = start; a < TWO_PI + (PI - start); a += angle) {
        if (a + angle > TWO_PI + (PI - start)) {
            a = TWO_PI + (PI - start);
        }
        var sx = x + cos(a) * radius;
        var sy = y + (sin(a) * radius) - y_offset;
        vertex(sx, sy);
    }
}

var triangle = function (x, y, base, t_height, pallette) {
    t_height = t_height || base;
    vertex(x - base, y);
    vertex(x, y - t_height);
    vertex(x + base, y);
}

var quadrilateral = function (x, y, base, qheight, min_width, pallette) {
    vertex(x - base, y);
    vertex(x - min_width, y - qheight);
    vertex(x + min_width, y - qheight);
    vertex(x + base, y);
}
