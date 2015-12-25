/**
 * @author Zhou Bowei
 */

var ZImage = {
	img: null,
	canvas: null,
	ctx: null,
	width: null,
	height: null,
	imgr: [],
	imgg: [],
	imgb: [],
	imga: [],
	imgv: []
};

/****************************************************************
 * Base Functions
 */

ZImage.loadImage = function(image) {
	this.img = image;
	this.width = image.width;
	this.height = image.height;
	// this.imgrgba = [];
	this.imgr = [];
	this.imgg = [];
	this.imgb = [];
	this.imga = [];
	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			var c = this.getPixelRGB(this.img.data, j, i);
			this.imgr.push(c.r);
			this.imgg.push(c.g);
			this.imgb.push(c.b);
			this.imga.push(c.a);
			this.imgv.push(c.r * 0.3 + c.g * 0.59 + c.b * 0.11);
		}
	}
}

ZImage.loadContext = function(canv, context) {
	this.canvas = canv;
	this.ctx = context;
}

ZImage.getImageFromCanvas = function() {
	this.img = this.ctx.getImageData(0, 0, this.width, this.height);
}

ZImage.putImageToCanvas = function() {
	this.img.data = [];
	for (var i = 0; i < this.imgr.length; i++) {
		this.img.data[i * 4] = this.imgr[i];
		this.img.data[i * 4 + 1] = this.imgg[i];
		this.img.data[i * 4 + 2] = this.imgb[i];
		this.img.data[i * 4 + 3] = this.imga[i];
	}
	this.ctx.putImageData(this.img, 0, 0);
}

ZImage.save = function(type) {
	if (type == undefined) {
		type = 'image/png';
	}
	var imgsrc = this.canvas.toDataURL(type).replace(type, "image/octet-stream");
	var img = new Image();
	img.src = imgsrc;
	window.location.href = imgsrc;
}

ZImage.getPixelRGB = function(dataArray, x, y) {
	if (x < 0) return this.getPixel(dataArray, 0, y);
	if (y < 0) return this.getPixel(dataArray, x, 0);
	if (x >= this.width) return this.getPixel(dataArray, this.width - 1, y);
	if (y >= this.height) return this.getPixel(dataArray, x, this.height - 1);
	return {
		r: dataArray[y * this.width * 4 + x * 4],
		g: dataArray[y * this.width * 4 + x * 4 + 1],
		b: dataArray[y * this.width * 4 + x * 4 + 2],
		a: dataArray[y * this.width * 4 + x * 4 + 3]
	}
}

ZImage.setPixelRGB = function(dataArray, x, y, color) {
	dataArray[y * this.width * 4 + x * 4] = color.r;
	dataArray[y * this.width * 4 + x * 4 + 1] = color.g;
	dataArray[y * this.width * 4 + x * 4 + 2] = color.b;
	dataArray[y * this.width * 4 + x * 4 + 3] = color.a;
}

ZImage.getPixelSingle = function(dataArray, x, y) {
	if (x < 0) return this.getPixelSingle(dataArray, 0, y);
	if (y < 0) return this.getPixelSingle(dataArray, x, 0);
	if (x >= this.width) return this.getPixelSingle(dataArray, this.width - 1, y);
	if (y >= this.height) return this.getPixelSingle(dataArray, x, this.height - 1);
	return dataArray[y * this.width + x];
}

/****************************************************************
 * Blur
 */

ZImage.medianBlurSingle = function(filterWidth, filterHeight, dataArray) {
	var width = this.width;
	var height = this.height;
	var temp = [];
	for (var i = 0; i < dataArray.length; i++) {
		temp.push(dataArray[i]);
	}
	var count = 0;
	for (var x = (filterWidth - 1) / 2; x < width - (filterWidth - 1) / 2; x++) {
		for (var y = (filterHeight - 1) / 2; y < width - (filterHeight - 1) / 2; y++) {
			var tempArray = [];
			for (var i = -(filterWidth - 1) / 2; i <= (filterWidth - 1) / 2; i++) {
				for (var j = -(filterHeight - 1) / 2; j <= (filterHeight - 1) / 2; j++) {
					// [(j + y) * width + i + x]
					tempArray.push(temp[(j + y) * width + i + x]);
					// count++;
				}
			}
			do {
				var loop = 0;
				for (var i = 0; i < tempArray.length - 1; i++) {
					if (tempArray[i] > tempArray[i + 1]) {
						var tempChange = tempArray[i];
						tempArray[i] = tempArray[i + 1];
						tempArray[i + 1] = tempChange;
						loop = 1;
						// count++;
					}
				}
			} while (loop);
			dataArray[y * width + x] = tempArray[Math.round(tempArray.length / 2)];
		}
	}
	// console.log(count);
	return dataArray;
}

ZImage.convolute = function(mask, dataArray, center) {
	var len = dataArray.length;
	var res = [];
	for (var i = 0; i < len; i++) {
		res.push(0);
	}
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			for (var my = 0; my < mask.length; my++) {
				for (var mx = 0; mx < mask[my].length; mx++) {
					// var dx=mx-center.x;
					// var dy=my-center.y;
					res[j * this.width + i] += mask[my][mx] * this.getPixelSingle(dataArray, i + mx - center.x, j + my - center.y);
				}
			}
		}
	}
	return res;
}

ZImage.generateGussianBlurKernel = function(size, sigma) {
	var s = 2 * size - 1;
	var center = {
		x: size - 1,
		y: size - 1
	};
	var mask = [];
	for (var i = 0; i < s; i++) {
		var tmp = [];
		for (var j = 0; j < s; j++) {
			var r2 = Math.pow(i - center.x, 2) + Math.pow(j - center.y, 2);
			tmp.push(Math.exp(-r2 / 2 / Math.pow(sigma, 2)) / 2 / Math.PI / Math.pow(sigma, 2));
		}
		mask.push(tmp);
	}
	return {
		mask: mask,
		center: center
	};
}

/****************************************************************
 * USM
 */

ZImage.usm = function(dataArray, amount, radius, threshold) {
	var len = dataArray.length;
	var res = [];
	for (var i = 0; i < len; i++) {
		res.push(0);
	}
	var kernel = this.generateGussianBlurKernel(radius, (radius - 1) / 3);
	var smoothArray = this.convolute(kernel.mask, dataArray, kernel.center);
	// console.log(smoothArray);
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			var n = j * this.width + i;
			var value = dataArray[n] - smoothArray[n];
			if (Math.abs(value) > threshold) {
				value = dataArray[n] + amount * value / 100;
				value = value > 255 ? 255 : value;
				value = value < 0 ? 0 : value;
				value = Math.round(value);
				res[n] = value; //(value | ((255 - value) >> 15)) & ~value >> 15;
			} else {
				res[n] = dataArray[n];
			}
		}
	}
	return res;
}

/****************************************************************
 * Saturation
 */
ZImage.rgb2hsl = function(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	var max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		h, s, l = (max + min) / 2;
	if (max === min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h: h,
		s: s,
		l: l
	};
};

ZImage.hsl2rgb = function(h, s, l) {
	var r, g, b,
		hue2rgb = function(p, q, t) {
			if (t < 0) {
				t += 1;
			}
			if (t > 1) {
				t -= 1;
			}
			if (t < 1 / 6) {
				return p + (q - p) * 6 * t;
			}
			if (t < 1 / 2) {
				return q;
			}
			if (t < 2 / 3) {
				return p + (q - p) * (2 / 3 - t) * 6;
			}
			return p;
		};
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		var
			q = l < 0.5 ? l * (1 + s) : l + s - l * s,
			p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return {
		r: r * 0xFF,
		g: g * 0xFF,
		b: b * 0xFF
	};
};

ZImage.setSaturation = function(amount) {
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			var p = this.getPixelRGB(this.img.data, i, j);
			var hsl = this.rgb2hsl(p.r, p.g, p.b);
			hsl.s *= amount / 100;
			hsl.s = hsl.s > 1 ? 1 : hsl.s;
			hsl.s = hsl.s < 0 ? 0 : hsl.s;
			var rgb = this.hsl2rgb(hsl.h, hsl.s, hsl.l);
			rgb.a = p.a;
			this.setPixelRGB(this.img.data, i, j, rgb);
		}
	}
	this.ctx.putImageData(this.img, 0, 0);
}

/****************************************************************
 * Liquify
 */
ZImage.liquify = function(dataArray, radius, point1, point2) {
	var len = dataArray.length;
	var res = [];
	for (var i = 0; i < len; i++) {
		res.push(dataArray[i]);
	}
	var x = point1.x;
	var y = point1.y;
	var x2 = point2.x;
	var y2 = point2.y;
	for (var i = -radius; i <= radius; i++) {
		for (var j = -radius; j <= radius; j++) {
			var n = j * this.width + i;
			var dis2 = i * i + j * j;
			var radius2 = radius * radius;
			if (dis2 > radius2) {
				// console.log(2);
				continue;
			}
			if (x + i < 0 || x + i >= this.width || y + j < 0 || y + j >= this.height) {
				// console.log(x+' '+y+' '+i+' '+j);
				continue;
			}
			// console.log(1);
			var n = (y + j) * this.width + (x + i);
			// res[n] *= dis2 / radius2;
			var ux, uy;
			var s = Math.pow((radius2 - dis2) / ((radius2 - dis2) + Math.pow(x - x2, 2) + Math.pow(y - y2, 2)), 2);
			ux = Math.round(x + i - s * (x2 - x));
			uy = Math.round(y + j - s * (y2 - y));
			// var u = uy * this.width + ux;
			// console.log(ux+' '+uy);
			// res[n] = dataArray[u];
			res[n] = ZImage.getPixelSingle(dataArray, ux, uy);
		}
	}
	return res;
}
