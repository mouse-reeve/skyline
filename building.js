var black;
var white;

function setup() {
    var container = document.getElementById('skyline');
    var canvas = createCanvas(1165, 600);
    canvas.parent(container);

    var seed = container.getAttribute('data-seed');

    black = color(0);
    white = color(255);

    var skyline = new Skyline(seed);
    skyline.draw_skyline();

    noLoop();
}

class Skyline {
    constructor(seed) {
        seed = seed || (new Date).getTime();
        randomSeed(seed);
        this.horizon = 0.7 * height;
    }

    draw_skyline() {
        this.add_sky();
        this.add_ocean();
        this.add_buildings();
    }

    add_buildings() {
        // place a building 1/4 in and scale down around it

        var pallette = ['#162137'];//, '#1E293D'];
        var secondary_shape = random(['dome', 'triangle', 'quadrilateral']);
        this.building_row(4, secondary_shape, pallette);

        // Landmark
        push();
        noStroke();
        var elevation = (height * 0.5) / 3.5;
        var params = {
            'primary_mass': true,
            'add_secondary': random([true, false]),
            'accent_shape': secondary_shape,
            'levels': 5,
            'fancy_roof': true,
            'roof_overhang': random(0, 4),
            'roof_masses': random([1, 2]) * 2 - 1,
            'dome_start': random(3 * PI / 4, PI),
            'quad_ratio': random(1, 2),
            'level_height': 30,
            'fill_color': color('#2F4260'),
        }
        params.spire_height = params.accent_shape == 'quadrilateral' ? random([0, random(0, 15)]) : random(3, 20);
        params.width_decrement = (150 - (150 / random([1, 1.5, 2]))) / (params.levels + 1);
        params.width = params.width_decrement > 0 ? 150 : 60;
        params.level_recursion = params.width_decrement < 0.2 ? 0 : 2;
        params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
        params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

        this.building(width / 4 - (params.width / 2), this.horizon - elevation, params, secondary_shape);
        pop()

        this.building_row(2, secondary_shape, pallette);
        this.building_row(1, secondary_shape, pallette);
        this.building_row(0, secondary_shape, pallette);
    }

    building_row(layer, secondary_shape, pallette) {
        push();
        noStroke();
        var slope = 0.05 + (layer / 50);
        var base_height = (0.75 * width) * slope + 10

        var fill_color = lerpColor(color(random(pallette)), white, 0.03 * layer);
        for (var i = 0; i < width; i+=building_width - 1) {
            var h = base_height - (Math.abs(i - (width / 4)) * slope);
            var elevation = layer * 10;
            var building_width = random(25, 35) + layer ** 2;
            this.simple_building(i, this.horizon + h / 8, elevation + random(h - 5, h + 5), building_width, fill_color, secondary_shape);
        }
        pop()
    }

    simple_building(x, y, b_height, b_width, fill_color, secondary_shape) {
        var dome_start = secondary_shape == 'dome' ? random(5 * PI / 6, PI) : PI
        var params = {
            'primary_mass': true,
            'add_secondary': false,
            'accent_shape': random([secondary_shape, secondary_shape, secondary_shape, 'dome', 'triangle', 'quadrilateral']),
            'fancy_roof': random() > 0.6,
            'roof_overhang': random(0, 4),
            'roof_masses': random([1, 1, 1, 2]) * 2 - 1,
            'dome_start': dome_start,
            'quad_ratio': random(1, 2),
            'level_height': b_height,
            'levels': 1,
            'fill_color': lerpColor(fill_color, black, random(0, 0.1)),
        }
        params.spire_height = params.accent_shape == 'quadrilateral' ? random([0, random(0, 7)]) : random(3, 10);
        params.width_decrement = 0;
        params.width = b_width;
        params.level_recursion = false,
        params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
        params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

        this.building(x, y, params);
    }

    building(x, y, params) {
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
            this.fancy_roof(x, y, params);
        }

        // level roofing
        if (params.width_decrement > 0) {
            for (var l = 0; l < params.levels; l++) {
                push()
                fill(lerpColor(params.fill_color, black, 0.1));
                this.roof(x, y, l, params);
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
                this.building(x + (l * params.width_decrement),
                              y - (l * params.level_height),
                              new_params);

                var end = x + params.width - (l * params.width_decrement);
                this.building(end - new_params.width,
                              y - (l * params.level_height),
                              new_params);
                if (l > 0 && params.width_decrement > 0) {
                    push();
                    fill(lerpColor(params.fill_color, black, 0.1));
                    this.roof(x, y, l-1, params);
                    pop();
                }
            }
        }

        if (params.primary_mass && params.add_secondary) {
            // additional masses
            this.building(x - mass_params.width - distance, y, mass_params);
            this.building(x + params.width + distance, y, mass_params);
        }
    }

    fancy_roof(x, y, params) {
        // fancy top roof
        var peak_height = params.level_height * params.levels;
        var peak_width = params.width - ((params.levels - 1) * 2 * params.width_decrement);
        var center = Math.floor(params.roof_masses / 2);

        var rx = x + ((params.levels - 1) * params.width_decrement);
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
            if (params.accent_shape == 'dome') {
                this.dome(rx + offset, y - peak_height, roof_width / 2, 100, params.dome_start);
            } else if (params.accent_shape == 'triangle') {
                this.triangle(rx + offset, y - peak_height, roof_width / 2);
            } else if (params.accent_shape == 'quadrilateral') {
                this.quadrilateral(rx + offset, y - peak_height, roof_width / 2, roof_width / 4, roof_width / (2 * params.quad_ratio));
            }
            endShape(CLOSE);

            // spire
            if (params.spire_height) {
                beginShape();
                this.triangle(rx + offset, y - peak_height, roof_width / 10, (roof_width / 2) + params.spire_height);
                endShape(CLOSE);
            }
        }
    }

    roof(x, y, l, params) {
        beginShape();
        vertex(x + (l * params.width_decrement) - params.roof_overhang, y - ((l + 1) * params.level_height) - params.roof_lift);
        vertex(x + (l * params.width_decrement) - params.roof_overhang, y - ((l + 1) * params.level_height) - (params.roof_lift + 2));

        vertex(x + (params.width / 2), y - ((l + 1) * params.level_height) - (params.roof_lift + 2) - params.roof_peak);

        vertex(x + params.width - (l * params.width_decrement) + params.roof_overhang, y - ((l + 1) * params.level_height) - (params.roof_lift + 2));
        vertex(x + params.width - (l * params.width_decrement) + params.roof_overhang, y - ((l + 1) * params.level_height) - params.roof_lift);

        endShape(CLOSE);
    }

    dome(x, y, radius, npoints, start) {
        var start = start || PI;
        var end = TWO_PI + start;
        var y_offset = sin(start) * radius;

        var angle = TWO_PI / npoints;
        for (var a = start; a < end; a += angle) {
            var sx = x + cos(a) * radius;
            var sy = y + (sin(a) * radius) - y_offset;
            vertex(sx, sy);
        }
    }

    triangle(x, y, base, t_height) {
        t_height = t_height || base;
        vertex(x - base, y);
        vertex(x, y - t_height);
        vertex(x + base, y);
    }

    quadrilateral(x, y, base, qheight, min_width) {
        vertex(x - base, y);
        vertex(x - min_width, y - qheight);
        vertex(x + min_width, y - qheight);
        vertex(x + base, y);
    }

    polygon(x, y, radius, npoints) {
        var angle = TWO_PI / npoints;
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = x + cos(a) * radius;
            var sy = y + sin(a) * radius;
            vertex(sx, sy);
        }
    }

    add_sky() {
        // pixel gradients
        push();
        var pallette = [
            '#A5C2D2', '#9ABED4', '#536788', '#B9CCD2', '#6BA5CD', '#9ABDD3', '#CED6D8',
            '#F2D9C5', '#BCABA3', '#A395A4']
        var colors = [];
        for (var c = 0; c < random(3, 6); c++) {
            colors.push(random(pallette));
        }

        var bucket_size = this.horizon / colors.length + (this.horizon / (colors.length ** 1.7));
        for (var y = 0; y < this.horizon; y++) {
            for (var x = 0; x < width; x++) {
                var bucket = Math.floor((y / bucket_size) + (x * 0.0002));
                var distance = y - (bucket * bucket_size) + (x * 0.02);
                var sign = distance / Math.abs(distance) || 1;
                var new_bucket = bucket;

                if (random() < distance / bucket_size) {
                    new_bucket = bucket + sign;
                }
                new_bucket = new_bucket < colors.length ? new_bucket : colors.length - 1;
                stroke(colors[new_bucket]);
                if (random() > 0.0) {
                    point(x, y);
                }
            }
        }
        pop()
    }

    add_ocean() {
        var pallette = ['#ACBAC7', '#808E9B', '#8F9DAA', '#9EABBB'];

        push();
        noStroke();
        fill(pallette[0]);
        beginShape();
        vertex(0, height);
        vertex(0, this.horizon);
        vertex(width, this.horizon);
        vertex(width, height);
        endShape(CLOSE);
        pop();

        for (var x = 0; x < width; x+=15) {
            for (var y = this.horizon; y < height; y+=5) {
                if (random() > 0.1) {
                    var scale = 9 / ((height - y) ** 0.5);
                    push();
                    noStroke();
                    fill(random(pallette.slice(1)));
                    var length = scale * random(30, 150);
                    var wave_height = (scale) * random(3, 6);

                    beginShape();
                    vertex(x, y);
                    vertex(x, y + 1);
                    vertex(x + (length / 2), y + wave_height);
                    vertex(x + length, y + 1);
                    vertex(x + length, y);
                    endShape(CLOSE);
                    pop();
                }
            }
        }
    }
}

