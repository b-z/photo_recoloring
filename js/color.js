var Color = {
    rgb2lab: function(inputColor) {
        var RGB = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
            var v = inputColor[i] / 255;
            if (v > 0.04045) {
                v = Math.pow((v + 0.055) / 1.055, 2.4);
            } else {
                v /= 12.92;
            }
            RGB[i] = 100 * v;
        }

        var X = RGB[0] * 0.4124 + RGB[1] * 0.3576 + RGB[2] * 0.1805;
        var Y = RGB[0] * 0.2126 + RGB[1] * 0.7152 + RGB[2] * 0.0722;
        var Z = RGB[0] * 0.0193 + RGB[1] * 0.1192 + RGB[2] * 0.9505;
        var XYZ = [X, Y, Z];
        XYZ[0] /= 95.047;
        XYZ[1] /= 100.0;
        XYZ[2] /= 108.883;

        for (var i = 0; i < 3; i++) {
            var v = XYZ[i];
            if (v > 0.008856) {
                v = Math.pow(v, 1 / 3);
            } else {
                v *= 7.787;
                v += 16 / 116;
            }
            XYZ[i] = v;
        }

        var L = (116 * XYZ[1]) - 16;
        var a = 500 * (XYZ[0] - XYZ[1]);
        var b = 200 * (XYZ[1] - XYZ[2]);
        var Lab = [L, a, b];
        return Lab;
    }
};
