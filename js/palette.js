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

Palette.normalize = function(v) {
	var d = Math.sqrt(this.distance2(v, [0, 0, 0]));
	var res = [];
	for (var i = 0; i < v.length; i++) {
		res.push(v[i] / d);
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

Palette.sub = function(c1, c2) {
	var res = [];
	for (var i = 0; i < c1.length; i++) {
		res.push(c1[i] - c2[i]);
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
	}
	centers=this.sort(centers);
	var centers_rgb = [];
	for (var i = 0; i < this.K + 1; i++) {
		centers_rgb.push(Color.lab2rgb(centers[i]));
	}
	return centers_rgb;
}

Palette.sort=function(colors){
	var l=colors.length;
	for (var i=l-1;i>0;i--){
		for (var j=0;j<i;j++){
			if (colors[j][0]>colors[j+1][0]){
				var tmp=colors[j];
				colors[j]=colors[j+1];
				colors[j+1]=tmp;
			}
		}
	}
	return colors;
}

Palette.colorTransform = function(colors1, colors2) {
	this.L1=[0];
	this.L2=[0];
	for (var i=1;i<colors1.length;i++){
		this.L1.push(colors1[i][0]);
		this.L2.push(colors2[i][0]);
	}
	this.L1.push(100);
	this.L2.push(100);
	var l = this.dataArray.length;
	var out_array = this.img_copy.data;

	var cs1 = [];
	var cs2 = [];
	var k = 0;
	for (var i = 0; i < this.K + 1; i++) {
		if (colors2[i] != false) {
			cs1.push(colors1[i]);
			cs2.push(colors2[i]);
			k++;
		}
	}
	this.sigma = this.getSigma(colors1);
	this.lambda = this.getLambda(cs1);
	// console.log(this.lambda);

	for (var i = 0; i < l; i += this.channels) {
		var R = this.dataArray[i];
		var G = this.dataArray[i + 1];
		var B = this.dataArray[i + 2];
		var alpha = this.dataArray[i + 3];

		var Lab = Color.rgb2lab([R, G, B]);
		var out_lab = [0, 0, 0];

		// TODO: our_lab=transform(cs1,cs2,L,a,b)

		var L = this.colorTransformSingleL(Lab[0]);
		// console.log(L);
		for (var p = 0; p < k; p++) {
			var v = this.colorTransformSingleAB([cs1[p][1],cs1[p][2]], [cs2[p][1],cs2[p][2]], Lab[0], Lab);
			v[0]=L;
			var omega = this.omega(cs1, Lab, p);
			v = this.sca_mul(v, omega);
			out_lab = this.add(out_lab, v);
		}

		var out_rgb = Color.lab2rgb(out_lab);
		out_array[i] = out_rgb[0];
		out_array[i + 1] = out_rgb[1];
		out_array[i + 2] = out_rgb[2];
		out_array[i + 3] = alpha;
	}
	return out_array;
}

Palette.colorTransformSingleL = function(l){
	var i;
	for (i=0;i<this.L1.length-1;i++){
		if (l>=this.L1[i]&&l<=this.L1[i+1]){
			break;
		}
	}
	var l1=this.L1[i];
	var l2=this.L1[i+1];
	var s=(l1==l2?1:(l-l1)/(l2-l1));
	var L1=this.L2[i];
	var L2=this.L2[i+1];
	var L=(L2-L1)*s+L1;
	return L;
}

Palette.colorTransformSingleAB = function(ab1, ab2, L, x) {
	var color1 = [L, ab1[0], ab1[1]];
	var color2 = [L, ab2[0], ab2[1]];
	if (this.distance2(color1,color2)<0.0001){
		return color1;
	}
	var d = this.sub(color2, color1);
	var x0 = this.add(x, d);
	var Cb = Color.labIntersect(color1, color2);
	// x--->x0
	var xb;
	if (Color.isOutLab(x0)) {
		xb = Color.labBoundary(color2, x0);
	} else {
		xb = Color.labIntersect(x, x0);
	}
	var dxx = this.distance2(xb, x);
	var dcc = this.distance2(Cb, color1);
	var l2 = Math.min(1, dxx / dcc);
	var xbn = this.normalize(this.sub(xb, x));
	var x_x = Math.sqrt(this.distance2(color1, color2) * l2);
	// console.log(x_x);
	return this.add(x, this.sca_mul(xbn, x_x));
}

Palette.omega = function(cs1, Lab, i) {
	var sum = 0;
	for (var j = 0; j < cs1.length; j++) {
		sum += this.lambda[j][i] * this.phi(Math.sqrt(this.distance2(cs1[j], Lab)));
	}
	return sum;
}

Palette.getLambda = function(cs1) {
	var s = [];
	var k = cs1.length;
	for (var p = 0; p < k; p++) {
		var tmp = [];
		for (var q = 0; q < k; q++) {
			tmp.push(this.phi(Math.sqrt(this.distance2(cs1[p], cs1[q]))));
		}
		s.push(tmp);
	}
	var lambda = math.inv(s);
	return lambda;
}

Palette.phi = function(r) {
	return Math.exp(-r * r / (2 * this.sigma * this.sigma));
}

Palette.getSigma = function(colors) {
	var sum = 0;
	for (var i = 0; i < this.K + 1; i++) {
		for (var j = 0; j < this.K + 1; j++) {
			if (i == j) continue;
			sum += Math.sqrt(this.distance2(colors[i], colors[j]));
		}
	}
	return sum / (this.K * (this.K + 1));
}

Palette.putImage = function(img) {
	this.ctx.putImageData(img, 0, 0);
}
