// read-only function
var Palette = {};

Palette.init=function(img){
    this.bins={};
    this.bin_size=16;
    this.channels=4;
    this.dataArray=img.data;
}

Palette.palette= function() {
    var l = this.dataArray.length;

    for (var i = 0; i < this.bin_size; i++) {
        for (var j = 0; j < this.bin_size; j++) {
            for (var k = 0; k < this.bin_size; k++) {
                this.bins['r' + i + 'g' + j + 'b' + k] = 0;
            }
        }
    }

    for (var i = 0; i < l; i += this.channels) {
        var R = this.dataArray[i];
        var G = this.dataArray[i + 1];
        var B = this.dataArray[i + 2];
        var Lab = Color.rgb2lab([R, G, B]);
    }
}
