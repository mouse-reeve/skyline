var black;
var white;

function setup() {
    var container = document.getElementById('skyline');
    var canvas = createCanvas(1165, 600);
    canvas.parent(container);

    var seed = container.getAttribute('data-seed') || Math.floor(Math.random() * 10000);
    // options are: arctic, tropical, arid, temperate
    var climate = container.getAttribute('data-climate') || random(['arctic', 'tropical', 'arid', 'temperate']);

    black = color(0);
    white = color(255);

    var skyline = new Skyline(climate, seed);
    skyline.draw_skyline();
}

class Skyline {
    constructor(climate, seed) {
        seed = seed || (new Date).getTime();
        randomSeed(seed);
        this.horizon = 0.7 * height;
        this.pallette = {
            'building': '#162137',
            'landmark': '#2F4260',
            'sky': {
                'blues': ['#A5C2D2', '#9ABED4', '#536788', '#B9CCD2', '#6BA5CD', '#9ABDD3', '#CED6D8'],
                'accents': ['#F2D9C5', '#BCABA3', '#A395A4']
            },
            'stone': '#5F6D78',
            'water': ['#ACBAC7', '#808E9B', '#8F9DAA', '#9EABBB'],
            'beach': ['#C09E9C', '#D1AEAC', '#A1897F'],
            'plants': {
                'greens': ['#575403', '#615D02', '#7B6E06', '#4D6100', '#818B1B'],
                'browns': ['#503C01', '#461801', '#B5942B', '#643D00', '#3A2D00'],
            },
            'trunk': '#A1897F',
        }
        this.tree = [oak_tree];
        this.shrub = bush;
        if (climate == 'tropical') {
            this.pallette.building = random(['#CB9C66', '#886F50', '#DBDDD5', '#C3CDC2']);
            this.pallette.landmark = lerpColor(color(this.pallette.building), white, 0.2);
            this.pallette.sky = {
                'blues': ['#90C4F4', '#B0D7F8', '#81BCF6', '#D0E9FF', '#A3C7F7', '#AFD6F7'],
                'accents': ['#F2D9C5', '#FFF7C3', '#FFE2AC', '#FAE98D']
            }
            var waters = [];
            for (var c = 0; c < this.pallette.water.length; c++) {
                waters.push(lerpColor(color(this.pallette.water[c]), color('#0084D6'), 0.2));
            }
            this.pallette.water = waters;
            this.tree.push(palm_tree);
            this.foliage_level = 0.4;
        } else if (climate == 'temperate') {
            this.pallette.building = random(['#CB9C66', '#886F50', '#DBDDD5', '#C3CDC2', '#8898A7']);
            this.pallette.landmark = lerpColor(color(this.pallette.building), white, 0.2);
            this.pallette.sky = {
                'blues': ['#90C4F4', '#B0D7F8', '#81BCF6', '#D0E9FF', '#A3C7F7', '#AFD6F7'],
                'accents': ['#F2D9C5', '#FFF7C3', '#FFE2AC', '#FAE98D']
            }
            this.foliage_level = 0.3;
        } else if (climate == 'arctic') {
            this.tree = [poplar_tree, poplar_tree, oak_tree];
            this.shrub = false;
            this.foliage_level = 0.6;
        } else if (climate == 'arid') {
            this.tree = [palm_tree];
            this.shrub = false;
            this.foliage_level = 0.8;
            this.pallette.building = random(['#FFE7C1', '#FBC88F']);
            this.pallette.landmark = lerpColor(color(this.pallette.building), white, 0.2);
            this.pallette.stone = lerpColor(color(this.pallette.building), color('#91715C'), 0.5);
            this.pallette.sky.blues = ['#A5C2D2', '#9ABED4', '#B9CCD2', '#6BA5CD', '#9ABDD3', '#CED6D8'];
            this.pallette.sky.accents = ['#FFCDC2', '#FFE0DF', '#F9F3E7', '#FFEFEE'];
        }
        this.pallette.roof = lerpColor(color(this.pallette.landmark), black, 0.05);
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
        for (var x = 0; x < width + 2; x += block_width) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var block_width = Math.abs(h / 2 + 5) + random(-0.5, 0.5);

            push();
            fill(lerpColor(color(this.pallette.beach[0]), color(this.pallette.stone), 0.8));
            noStroke();
            beginShape();
            polygon(x, this.horizon + h - (block_width * 0.05), block_width, 4);
            endShape(CLOSE);
            pop();
        }
        for (var x = 0; x < width + 20; x += 2 * block_width / h) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var block_width = random(2, 4);

            push();
            fill(lerpColor(color(random(this.pallette.beach)), color(this.pallette.stone), 0.9));
            noStroke();
            beginShape();
            polygon(x + random(h / -2, h / 2), this.horizon + h - (block_width * 0.3) + random(h / -2, h / 2), block_width, random(9, 20));
            endShape(CLOSE);
            pop();
        }

        push();
        noStroke();

        for (var x = 0; x < width + 5; x += plant_size) {
            var h = base_height - (Math.abs(x - (width / 4)) * slope);
            var plant_size = Math.abs(h / 2 + 5) * random(3, 4);
            if (random() > this.foliage_level) {
                random(this.tree)(x, this.horizon + (h/2) - 2, plant_size, 0, this.pallette);
            }
            if (this.shrub && random() > 0.7) {
                this.shrub(x, this.horizon + (h/2) - 2, plant_size / 3, this.pallette);
                this.shrub(x + plant_size / 2, this.horizon + (h/2) - 2, plant_size / 3, this.pallette);
            }
        }
        pop()
    }

    add_buildings() {
        // place a building 1/4 in and scale down around it

        var base_color = color(this.pallette.building);
        var secondary_shape = random(['dome', 'triangle', 'quadrilateral']);
        this.building_row(4, secondary_shape, base_color);
        this.building_row(3, secondary_shape, base_color);

        // Landmark
        var lm_x = width / 4;
        var lm_y = this.horizon;
        landmark(lm_x, lm_y, 30, 5, secondary_shape, this.pallette);

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
            var building_width = random(45, 65) + random([0, 0, 0, 0, 0, 0, 0, 100]) - layer ** 2;
            simple_building(i, this.horizon + h / 8, elevation + random(h - 5, h + 5), building_width, fill_color, secondary_shape, this.pallette);
            if (layer && random() > this.foliage_level ** 0.4) {
                random(this.tree)(i, this.horizon - (h * 0.7), 10 + (h / 4), layer ** 0.3 / 8, this.pallette);
            }
        }
        pop()
    }

    add_sky() {
        // pixel gradients
        push();
        var pallette = this.pallette.sky;
        var colors = [];
        var color_count = Math.round(random(3, 6));
        for (var c = 0; c < color_count; c++) {
            var pallette = this.pallette.sky.blues;
            if (c > Math.floor(color_count / 3)) {
                pallette = pallette.concat(this.pallette.sky.accents);
                pallette = pallette.concat(this.pallette.sky.accents);
                pallette = pallette.concat(this.pallette.sky.accents);
            }
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

