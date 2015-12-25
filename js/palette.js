// read-only function
var Palette = {};

Palette.init = function(img) {
    this.bins = {};
    this.bin_range = 16;
    this.bin_size = 256 / this.bin_range;
    this.channels = 4;
    this.dataArray = img.data;

    for (var i = 0; i < this.bin_range; i++) {
        for (var j = 0; j < this.bin_range; j++) {
            for (var k = 0; k < this.bin_range; k++) {
                this.bins['r' + i + 'g' + j + 'b' + k] = {
                    color: {
                        r: (i + 0.5) * this.bin_size,
                        g: (j + 0.5) * this.bin_size,
                        b: (k + 0.5) * this.bin_size
                    },
                    count: 0
                };
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
        if (this.bins['r' + ri + 'g' + gi + 'b' + bi].count == 10000){
            console.log(this.bins['r' + ri + 'g' + gi + 'b' + bi].color);
        }
        // var Lab = Color.rgb2lab([R, G, B]);
    }
}
