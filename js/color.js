/**
 * @author Zhou Bowei
 */

var Color = {
	rgb2lab: function(inputColor) {
		if (typeof(inputColor) != 'object') {
			return inputColor;
		}
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

		// console.log(RGB);
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
	},
	lab2rgb: function(inputColor) {
		if (typeof(inputColor) != 'object') {
			return inputColor;
		}
		var L = inputColor[0];
		var a = inputColor[1];
		var b = inputColor[2];

		var d = 6 / 29;
		var fy = (L + 16) / 116;
		var fx = fy + a / 500;
		var fz = fy - b / 200;
		var Y = fy > d ? fy * fy * fy : (fy - 16 / 116) * 3 * d * d;
		var X = fx > d ? fx * fx * fx : (fx - 16 / 116) * 3 * d * d;
		var Z = fz > d ? fz * fz * fz : (fz - 16 / 116) * 3 * d * d;

		X *= 95.047;
		Y *= 100.0;
		Z *= 108.883;
		// var R = 2.5623 * X + (-1.1661) * Y + (-0.3962) * Z;
		// var G = (-1.0215) * X + 1.9778 * Y + 0.0437 * Z;
		// var B = 0.0752 * X + (-0.2562) * Y + 1.1810 * Z;
		var R = 3.2406 * X + (-1.5372) * Y + (-0.4986) * Z;
		var G = (-0.9689) * X + 1.8758 * Y + 0.0415 * Z;
		var B = 0.0557 * X + (-0.2040) * Y + 1.0570 * Z;

		var RGB = [R, G, B];
		// console.log(RGB);
		for (var i = 0; i < 3; i++) {
			var v = RGB[i] / 100;
			if (v > 0.0405 / 12.92) {
				v = Math.pow(v, 1 / 2.4);
				v *= 1.055;
				v -= 0.055;
			} else {
				v *= 12.92;
			}
			RGB[i] = Math.round(v * 255);
		}

		return RGB;
	},
	txt2rgb: function(str) {
		if (typeof(str) != 'string') {
			return str;
		}
		var s = str.split(/[rgba(,) ]/);
		var c = [];
		for (var i = 0; i < s.length; i++) {
			if (s[i].length) {
				c.push(s[i] - 0);
			}
		}
		return c;
	},
	txt2lab: function(str) {
		return this.rgb2lab(this.txt2rgb(str));
	},
	isOutRGB: function(RGB) {
		for (var i = 0; i < 3; i++) {
			if (RGB[i] < 0 || RGB[i] > 255) {
				return true;
			}
		}
		return false;
	},
	isOutLab: function(Lab) {
		return this.isOutRGB(this.lab2rgb(Lab));
	},
	isEqual: function(c1, c2) {
		for (var i = 0; i < c1.length; i++) {
			if (c1[i] != c2[i]) {
				return false;
			}
		}
		return true;
	},
	labBoundary: function(pin, pout) {
		var mid = [];
		for (var i = 0; i < pin.length; i++) {
			mid.push((pin[i] + pout[i]) / 2);
		}
		var RGBin = this.lab2rgb(pin);
		var RGBout = this.lab2rgb(pout);
		var RGBmid = this.lab2rgb(mid);
		if (Palette.distance2(pin,pout)<0.001||this.isEqual(RGBin, RGBout)) {
			return mid;
		}
		if (this.isOutRGB(RGBmid)) {
			return this.labBoundary(pin, mid);
		} else {
			return this.labBoundary(mid, pout);
		}
	},
	labIntersect: function(p1, p2) {
		if (this.isOutLab(p2)){
			return this.labBoundary(p1,p2);
		}else{
			return this.labIntersect(p2,Palette.add(p2,Palette.sub(p2,p1)));
		}
	}

};
