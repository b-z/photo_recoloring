// read-only function
var Palette = {};

Palette.init = function(img) {
    this.bins = {};
    this.bin_range = 16;
    this.bin_size = 256 / this.bin_range;
    this.channels = 4;
    this.dataArray = img.data;
    this.kmeans_iteration = 15;
    this.K = 4;
    this.kmeans_centers = [];

    for (var i = 0; i < K + 1; i++) {
        this.kmeans_centers.push({
            color: null,
            weight: 0,
            acc: [0, 0, 0]
        });
    }

    for (var i = 0; i < this.bin_range; i++) {
        for (var j = 0; j < this.bin_range; j++) {
            for (var k = 0; k < this.bin_range; k++) {
                var tmp = {
                    color: [(i + 0.5) * this.bin_size, (j + 0.5) * this.bin_size, (k + 0.5) * this.bin_size],
                    count: 0
                };
                tmp.Lab = Color.rgb2lab(tmp.color);
                this.bins['r' + i + 'g' + j + 'b' + k] = tmp;
            }
        }
    }
}

Palette.palette = function() {
    var l = this.dataArray.length;
    for (var i = 0; i < l; i += this.channels) {
        var R = this.dataArray[i];
        var G = this.dataArray[i + 1];
        var B = this.dataArray[i + 2];
        var ri = Math.floor(R / this.bin_size);
        var gi = Math.floor(G / this.bin_size);
        var bi = Math.floor(B / this.bin_size);
        this.bins['r' + ri + 'g' + gi + 'b' + bi].count++;
        if (this.bins['r' + ri + 'g' + gi + 'b' + bi].count == 10000) {
            console.log(this.bins['r' + ri + 'g' + gi + 'b' + bi].color);
        }
        // var Lab = Color.rgb2lab([R, G, B]);
    }
}

Palette.distance2 = function(c1, c2) {
    var res = 0;
    for (var i = 0; i < c1.length; i++) {
        res += (c1[i] - c2[i]) * (c1[i] - c2[i]);
    }
    return res;
}

Palette.kmeans = function() {

}
