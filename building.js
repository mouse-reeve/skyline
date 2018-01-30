var black;
var white;

function setup() {
    var container = document.getElementById('skyline');
    var canvas = createCanvas(1165, 600);
    canvas.parent(container);

    var seed = container.getAttribute('data-seed');

    black = color(0);
    white = color(255);

    // options are: arctic, tropical, arid, temperate
    var skyline = new Skyline('tropical', seed);
    skyline.draw_skyline();

    noLoop();
}

class Skyline {
    constructor(climate, seed) {
        seed = seed || (new Date).getTime();
        randomSeed(seed);
        this.horizon = 0.7 * height;
        this.pallette = {
            'building': '#162137',
            'landmark': '#2F4260',
            'sky': [
                '#A5C2D2', '#9ABED4', '#536788', '#B9CCD2', '#6BA5CD', '#9ABDD3', '#CED6D8',
                '#F2D9C5', '#BCABA3', '#A395A4'],
            'water': ['#ACBAC7', '#808E9B', '#8F9DAA', '#9EABBB'],
            'beach': ['#C09E9C', '#D1AEAC', '#A1897F'],
            'plants': ['#575403', '#615D02', '#7B6E06', '#503C01', '#4D6100', '#818B1B'],
            'trunk': '#A1897F',
        }
        //this.pallette = pallettes.arctic;
        if (climate == 'tropical') {
            this.tree = this.oak_tree;
            this.pallette.building = '#263844',
            this.pallette.landmark = '#606E79',
            this.pallette.sky = [
                '#90C4F4', '#B0D7F8', '#81BCF6', '#D0E9FF', '#A3C7F7', '#AFD6F7',
                '#F2D9C5', '#EAE6DA', '#FFF7C3', '#FFE2AC']
            var waters = [];
            for (var c = 0; c < this.pallette.water.length; c++) {
                waters.push(lerpColor(color(this.pallette.water[c]), color('#0084D6'), 0.3));
            }
            this.pallette.water = waters;
        }
    }

    draw_skyline() {
        this.add_sky();
        this.add_ocean();
        this.add_buildings();
        this.add_coastline();
    }

    add_coastline() {
        var slope = 0.015;
        var base_height = (0.75 * width) * slope;
        var h = 2;
        for (var x = 0; x < width + 5; x += block_width) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var block_width = Math.abs(h / 2 + 5) + random(-0.5, 0.5);

            push();
            fill(lerpColor(color(this.pallette.beach[0]), color(this.pallette.building), 0.8));
            noStroke();
            beginShape();
            this.polygon(x, this.horizon + h - (block_width * 0.05), block_width, 4);
            endShape(CLOSE);
            pop();
        }
        for (var x = 0; x < width + 20; x += 2 * block_width / h) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var block_width = random(2, 4);

            push();
            fill(lerpColor(color(random(this.pallette.beach)), color(this.pallette.building), 0.9));
            noStroke();
            beginShape();
            this.polygon(x + random(h / -2, h / 2), this.horizon + h - (block_width * 0.3) + random(h / -2, h / 2), block_width, random(9, 20));
            endShape(CLOSE);
            pop();
        }

        push();
        noStroke();

        for (var x = 0; x < width + 5; x += plant_width) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var plant_width = Math.abs(h / 2 + 5) * random(1, 3);
            if (random() > 0.5) {
                this.tree(x, this.horizon + (h/2) - 2, plant_width);
            }
            if (random() > 0.7) {
                this.shrub(x, this.horizon + (h/2) - 2, plant_width / 3);
                this.shrub(x + plant_width / 2, this.horizon + (h/2) - 2, plant_width / 3);
            }
        }
        pop()
    }

    oak_tree(x, y, plant_width, shadow) {
        var lerp_value = 0.5 + (shadow || 0);
        var fill_color = lerpColor(color(random(this.pallette.plants)), color(this.pallette.building), lerp_value);

        push();
        fill(lerpColor(color(random(this.pallette.plants)), color(this.pallette.building), lerp_value));
        beginShape();
        this.polygon(x + (plant_width / 8), y - plant_width, plant_width * 0.7, random(5, 7));
        endShape(CLOSE);
        pop();

        var trunk_width = random(0.05, 0.2) * plant_width;
        push();
        beginShape();
        fill(lerpColor(color(this.pallette.trunk), color(this.pallette.building), lerp_value));
        vertex(x, y);
        vertex(x, y - plant_width / 4);

        vertex(x - 3, y - plant_width);
        vertex(x + (trunk_width / 2), y - (plant_width / 2));
        vertex(x + trunk_width + 3, y - plant_width);

        vertex(x + trunk_width, y - plant_width / 4);
        vertex(x + trunk_width, y);
        endShape(CLOSE);
        pop();

        for (var p = 0; p < 15; p++) {
            var wo = (plant_width / 4) + random(plant_width / -8, plant_width / 8);
            var xo = (plant_width / 8) + random(-0.4 * plant_width, 0.4 * plant_width);
            var yo = plant_width + sin(random(0, TWO_PI)) * xo;
            push();
            fill(lerpColor(fill_color, black, random(0, 0.2)));
            beginShape();
            this.polygon(x + xo, y - yo, wo, 5);
            endShape(CLOSE);
            if (random() > 0.5) {
                beginShape();
                this.polygon(x - xo, y - yo, wo, 5);
                endShape(CLOSE);
            }
            pop();
        }
    }

    shrub(x, y, plant_width) {
        var fill_color = lerpColor(color(random(this.pallette.plants)), color(this.pallette.building), 0.6);

        push();
        fill(fill_color);
        beginShape();
        this.polygon(x - (plant_width / 3), y - plant_width / 2, plant_width * 0.7, random(5, 7));
        this.polygon(x + (plant_width / 3), y - plant_width / 2, plant_width * 0.7, random(5, 7));
        endShape(CLOSE);
        pop();

        for (var p = 0; p < 15; p++) {
            var wo = (plant_width / 4) + random(plant_width / -8, plant_width / 8);
            var xo = random(-0.9 * plant_width, 0.9 * plant_width);
            var yo = random(0.4 * plant_width, 0.8 * plant_width);
            push();
            fill(lerpColor(fill_color, color(random(this.pallette.plants)), random(0, 0.3)));
            beginShape();
            this.polygon(x + xo, y - yo, wo, 5);
            endShape(CLOSE);
            if (random() > 0.5) {
                beginShape();
                this.polygon(x - xo, y - yo, wo, 5);
                endShape(CLOSE);
            }
            pop();
        }
    }

    add_buildings() {
        // place a building 1/4 in and scale down around it

        var base_color = color(this.pallette.building);
        var secondary_shape = random(['dome', 'triangle', 'quadrilateral']);
        this.building_row(4, secondary_shape, base_color);
        this.building_row(3, secondary_shape, base_color);

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
            'fill_color': color(this.pallette.landmark),
        }
        params.spire_height = params.accent_shape == 'quadrilateral' ? random([0, random(0, 15)]) : random(3, 20);
        params.width_decrement = (150 - (150 / random([1, 1.5, 2]))) / (params.levels + 1);
        params.width = params.width_decrement > 0 ? 150 : 60;
        params.level_recursion = params.width_decrement < 0.2 ? 0 : 2;
        params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
        params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

        this.building(width / 4 - (params.width / 2), this.horizon - elevation, params, secondary_shape);
        pop()

        this.building_row(2, secondary_shape, base_color);
        this.building_row(1, secondary_shape, base_color);
        this.building_row(0, secondary_shape, base_color);
    }

    building_row(layer, secondary_shape, base_color) {
        push();
        noStroke();
        var slope = 0.05 + (layer / 50);
        var base_height = (0.75 * width) * slope + 20

        var fill_color = lerpColor(base_color, white, 0.03 * layer);
        for (var i = 0; i < width; i+=building_width - 1) {
            var h = base_height - (Math.abs(i - (width / 4)) * slope);
            var elevation = layer * 10;
            var building_width = random(45, 65) - layer ** 2;
            this.simple_building(i, this.horizon + h / 8, elevation + random(h - 5, h + 5), building_width, fill_color, secondary_shape);
            if (layer && random() > 0.7) {
                this.tree(i, this.horizon - (h * 0.7), 10 + (h / 4), layer ** 0.3 / 4.5);
            }
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
        } else if (random() > 0.3) {
            var roof_params = Object.assign({}, params);
            roof_params.spire_height = 0;
            roof_params.accent_shape = 'quadrilateral';
            roof_params.quad_ratio = random(1, 1.5);
            this.fancy_roof(x, y, roof_params);
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
        var start = (3 * PI) / 4;
        for (var a = start; a < TWO_PI + start; a += angle) {
            var sx = x + cos(a) * radius;
            var sy = y + sin(a) * radius;
            vertex(sx, sy);
        }
    }

    add_sky() {
        // pixel gradients
        push();
        var pallette = this.pallette.sky;
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
        var pallette = this.pallette.water;

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

