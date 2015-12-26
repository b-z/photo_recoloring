/**
 * @author Zhou Bowei
 */

var Palette = {};

Palette.init = function(img, ctx) {
	this.bins = {};
	this.bin_range = 16;
	this.bin_size = 256 / this.bin_range;
	this.channels = 4;
	this.img = img;
	this.img_copy = new ImageData(img.width, img.height);
	this.dataArray = img.data;
	this.ctx = ctx;
	this.K = 5;

	for (var i = 0; i < this.bin_range; i++) {
		for (var j = 0; j < this.bin_range; j++) {
			for (var k = 0; k < this.bin_range; k++) {
				var tmp = {
					color: [(i + 0.5) * this.bin_size, (j + 0.5) * this.bin_size, (k + 0.5) * this.bin_size],
					count: 0,
					idx: -1
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
	}
}

Palette.distance2 = function(c1, c2) {
	var res = 0;
	for (var i = 0; i < c1.length; i++) {
		res += (c1[i] - c2[i]) * (c1[i] - c2[i]);
	}
	return res;
}

Palette.add = function(c1, c2) {
	var res = [];
	for (var i = 0; i < c1.length; i++) {
		res.push(c1[i] + c2[i]);
	}
	return res;
}

Palette.sca_mul = function(c, k) {
	var res = [];
	for (var i = 0; i < c.length; i++) {
		res.push(c[i] * k);
	}
	return res;
}

Palette.kmeansFirst = function() {
	var centers = []; //rgb format
	var centers_lab = [];
	centers.push([this.bin_size / 2, this.bin_size / 2, this.bin_size / 2]); // black
	centers_lab.push(Color.rgb2lab(centers[0]));
	var bins_copy = {};
	for (var i in this.bins) {
		bins_copy[i] = this.bins[i].count;
	}
	// console.log(bins_copy);

	for (var p = 0; p < this.K; p++) {
		var tmp;
		var maxc = -1;
		for (var i in bins_copy) {
			//    if (p > 0) {
			var d2 = this.distance2(this.bins[i].Lab, centers_lab[p]);
			var factor = 1 - Math.exp(-d2 / 6400); // sigma_a:80
			bins_copy[i] *= factor;
			//    }
			if (bins_copy[i] > maxc) {
				maxc = bins_copy[i];
				tmp = [];
				for (var j = 0; j < 3; j++) {
					tmp.push(this.bins[i].color[j]);
				}
			}
		}
		centers.push(tmp);
		centers_lab.push(Color.rgb2lab(tmp));
	}
	return centers_lab;
}

Palette.kmeans = function() {
	var centers = this.kmeansFirst(); //lab
	var no_change = false;
	while (!no_change) {
		no_change = true;
		var sum = [];
		for (var i = 0; i < this.K + 1; i++) {
			sum.push({
				color: [0, 0, 0],
				count: 0
			});
		}
		for (var i = 0; i < this.bin_range; i++) {
			for (var j = 0; j < this.bin_range; j++) {
				for (var k = 0; k < this.bin_range; k++) {
					var tmp = this.bins['r' + i + 'g' + j + 'b' + k];
					if (tmp.count == 0) {
						continue;
					}

					var lab = tmp.Lab;
					var mind = Infinity;
					var mini = -1;
					for (var p = 0; p < this.K + 1; p++) {
						var d = this.distance2(centers[p], lab);
						if (mind > d) {
							mind = d;
							mini = p;
						}
					}
					if (mini != tmp.idx) {
						tmp.idx = mini;
						no_change = false;
					}
					var m = this.sca_mul(tmp.Lab, tmp.count);
					sum[mini].color = this.add(sum[mini].color, m);
					sum[mini].count += tmp.count;
				}
			}
		}

		for (var i = 1; i < this.K + 1; i++) {
			if (sum[i].count) {
				for (var j = 0; j < 3; j++) {
					centers[i][j] = sum[i].color[j] / sum[i].count;
				}
			}
		}
		// console.log(no_change);
	}
	var centers_rgb = [];
	for (var i = 0; i < this.K + 1; i++) {
		centers_rgb.push(Color.lab2rgb(centers[i]));
		// console.log(centers[i]);
		// console.log(centers_rgb[i]);
	}
	return centers_rgb;
}

Palette.colorTransform = function(colors1, colors2) {
	var l = this.dataArray.length;
	var out_array = this.img_copy.data;
	for (var i = 0; i < l; i += this.channels) {
		var R = this.dataArray[i];
		var G = this.dataArray[i + 1];
		var B = this.dataArray[i + 2];
		var alpha = this.dataArray[i + 3];

		var Lab = Color.rgb2lab([R, G, B]);
		var L = Lab[0];
		var a = Lab[1];
		var b = Lab[2];
		var out_lab = Lab;

		// TODO: our_lab=transform(colors1,clors2,L,a,b)

		var out_rgb = Color.lab2rgb(out_lab);
		out_array[i] = out_rgb[0];
		out_array[i + 1] = out_rgb[1];
		out_array[i + 2] = out_rgb[2];
		out_array[i + 3] = alpha;
	}
	return out_array;
}

Palette.putImage = function(img) {
	this.ctx.putImageData(img, 0, 0);
}
