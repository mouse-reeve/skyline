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
        // place a landmark 1/4 in and scale down around it
        push();
        noStroke();
        fill('#162137');
        for (var i = 0; i < width; i+=40) {
            var h = Math.abs((height * 0.25) - Math.abs(i - (width / 4)) * 0.18);
            var elevation = h / 4;
            this.building(i, this.horizon - elevation, random(h - 5, h + 5), 40);
        }
        pop();

        push();
        noStroke();
        var elevation = (height * 0.5) / 4;
        var params = {
            'levels': 5,
            'roof_overhang': random(0, 4),
            'roof_masses': random([1, 2]) * 2 - 1,
            'dome_start': random(3 * PI / 4, PI),
            'level_height': 30,
            'width': 150,
            'fill_color': color('#2F4260'),
        }
        params.width_decrement = (150 - (150 / random([1, 1.5, 2]))) / (params.levels + 1);
        params.level_recursion = params.width_decrement < 0.2 ? 0 : 2;
        params.roof_peak = params.width_decrement < 0.2 ? 0 : Math.floor(random(-1, 5));
        params.roof_lift = params.roof_peak == 0 && params.width_decrement != 0 ? random([0, 1]) : 0;

        this.landmark(width / 4 - (params.width / 2), this.horizon - elevation, params);
        pop()

        push();
        noStroke();
        fill('#1E293D');
        for (var i = 0; i < width; i+=20) {
            var h = (height * 0.2) - Math.abs(i - (width / 3.2)) * 0.1;
            var elevation = h / 7;
            this.building(i, this.horizon + elevation, random(h - 5, h + 5), 30);
        }
        pop()
    }

    landmark(x, y, params) {
        // rectangle with shape accents
        if (params.width < 30 || params.levels == 0) {
            //stop recusion
            return;
        }
        // masses can be one exterior with many floors or, if there
        // aren't too many floors, stacked masses

        fill(params.fill_color);
        for (var l = 0; l < params.levels; l++) {
            beginShape();
            vertex(x + (l * params.width_decrement), y - (l * params.level_height));
            vertex(x + (l * params.width_decrement), y - ((l + 1) * params.level_height));
            vertex(x + params.width - (l * params.width_decrement), y - ((l + 1) * params.level_height));
            vertex(x + params.width - (l * params.width_decrement), y - (l * params.level_height));
            endShape(CLOSE);
        }

        // fancy top roof
        var peak_height = params.level_height * params.levels;
        var peak_width = params.width - ((params.levels - 1) * 2 * params.width_decrement);
        var center = Math.floor(params.roof_masses / 2);

        beginShape();
        if (params.roof_masses > 1) {
            var rx = x + ((params.levels - 1) * params.width_decrement);
            for (var i = 0; i < params.roof_masses; i ++) {
                var scale = center - i;

                var roof_width = ((params.roof_masses - Math.abs(scale)) * 0.5) ** 1.7 * peak_width / params.roof_masses;
                var offset = i * (peak_width / (params.roof_masses - 1));
                if (scale != 0) {
                     offset += (roof_width / (scale * 2));
                }
                this.dome(rx + offset, y - peak_height, roof_width / 2, 100, params.dome_start);
            }
        } else {
            this.dome(x + params.width / 2, y - peak_height, (peak_width / 2), 100, params.dome_start);
        }
        endShape(CLOSE);

        // level roofing
        if (params.width_decrement > 0) {
            for (var l = 0; l < params.levels; l++) {
                push()
                fill(lerpColor(params.fill_color, black, 0.2));
                this.roof(x, y, l, params);
                pop();

            }
        }
        for (var l = params.levels - 2; l >= 0; l--) {
            if (l % params.level_recursion == 0) {
                var new_params = Object.assign({}, params);
                new_params.levels = 1;
                new_params.level_recursion += 1;
                new_params.width_decrement *= 0.9;
                new_params.level_height *= 0.8;
                new_params.width = (params.width - (l * params.width_decrement)) / 3;
                new_params.fill_color = lerpColor(params.fill_color, white, 0.1);
                push();
                this.landmark(x + (l * params.width_decrement),
                              y - (l * params.level_height),
                              new_params);

                var end = x + params.width - (l * params.width_decrement);
                this.landmark(end - new_params.width,
                              y - (l * params.level_height),
                              new_params);
                if (l > 0 && params.width_decrement > 0) {
                    pop();
                    push()
                    fill(lerpColor(params.fill_color, black, 0.2));
                    this.roof(x, y, l-1, params);
                    pop()
                }
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


    building(x, y, rheight, rwidth) {
        beginShape();
        vertex(x, y);
        vertex(x, y - rheight);
        vertex(x + rwidth, y - rheight);
        vertex(x + rwidth, y);
        endShape(CLOSE);
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

