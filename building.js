var black;
var white;

function setup() {
    var container = document.getElementById('skyline');
    var canvas = createCanvas(600, 400);
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
        background('#A8C4D0');

        noStroke();
        push();
        fill('#162137');
        this.add_sky('icy');
        // place a landmark 1/4 in and scale down around it
        /*for (var i = 0; i < width; i+=50) {
            var h = (height * 0.3) - Math.abs(i - (width / 4)) * 0.2;
            var elevation = h / 4;
            this.building(i, this.horizon - elevation, h, 50);
        }*/
        var elevation = (height * 0.4) / 4;
        this.landmark(width / 4, this.horizon - elevation);

        /*push();
        for (var i = 0; i < width; i+=50) {
            var h = (height * 0.2) - Math.abs(i - (width / 3)) * 0.1;
            var elevation = h / 7;
            this.building(i, this.horizon + elevation, h, 50);
        }
        pop()*/
    }

    add_sky(pallette) {
        // clouds
        push();
        pallette = [
            '#A5C2D2', '#9ABED4', '#536788', '#B9CCD2', '#6BA5CD',
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

    landmark(x, y) {
        // rectangle with shape accents
        var rwidth = random(width / 8, width / 4);
        var levels = 5;
        // masses can be one exterior with many floors or, if there
        // aren't too many floors, stacked masses
        var min_width = rwidth / 2;
        var width_decrement = min_width / (levels + 1);

        var roof_overhang = 3;
        var roof_lift = 1;

        var level_height = 20;
        for (var l = 0; l < levels; l++) {
            beginShape();
            vertex(x + (l * width_decrement), y - (l * level_height));
            vertex(x + (l * width_decrement), y - ((l + 1) * level_height));
            vertex(x + rwidth - (l * width_decrement), y - ((l + 1) * level_height));
            vertex(x + rwidth - (l * width_decrement), y - (l * level_height));
            endShape(CLOSE);

            beginShape();
            vertex(x + (l * width_decrement) - roof_overhang, y - ((l + 1) * level_height) - roof_lift);
            vertex(x + (l * width_decrement) - roof_overhang, y - ((l + 1) * level_height) - (roof_lift + 2));
            vertex(x + rwidth - (l * width_decrement) + roof_overhang, y - ((l + 1) * level_height) - (roof_lift + 2));
            vertex(x + rwidth - (l * width_decrement) + roof_overhang, y - ((l + 1) * level_height) - roof_lift);

            endShape(CLOSE);
        }

        var peak_height = level_height * levels;
        var peak_width = rwidth - ((levels - 1) * width_decrement);

        // fancy top roof
        ellipse(x + rwidth / 2, y - peak_height, (peak_width / 2));


        // add side structures
    }

    building(x, y, rheight, rwidth) {
        beginShape();
        vertex(x, y);
        vertex(x, y - rheight);
        vertex(x + rwidth, y - rheight);
        vertex(x + rwidth, y);
        endShape(CLOSE);
    }
}

