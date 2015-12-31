# photo_recoloring
实现了**Huiwen Chang** et al. 的论文"Palette-based Photo Recoloring, ACM SIGGRAPH 2015" 

Zhou Bowei  
2015.12.26

***

### 一、使用方法
直接打开[index.html](index.html)或者访问<http://b-z.github.io/photo_recoloring>。  
从相册中选择合适图片上传，程序将自动计算调色板。  
待计算完成，可点击调色板编辑变换的目标颜色。  
编辑完后，点击CONFIRM按钮开始重着色。

### 二、算法实现
##### 2.1 调色板计算
* 将RGB颜色空间均匀分成$16\times 16\times 16$个bins，统计图像中属于各个bin的颜色个数。每个bin的RGB空间均值为其代表色  
(注: 原文为Lab空间均值，但求该均值较复杂，故使用了差别不大的RGB均值)。
* 对bin进行聚类，使用的方法是改进的K-means算法。
* 在聚类前，规定黑色为调色板颜色之一，这样可避免生成的调色板中有很多暗色。 
* 将聚类得到的调色板颜色按照Lab亮度升序排序。

##### 2.2 重着色
* 单个的颜色变换可以看成颜色在L通道与a、b通道单独变换的组合。
* L通道的变换由对调色板亮度线性插值得到。
* ab通道的变换(左下图)由颜色在Lab空间内平移得到。其中对于超出Lab边界的情况做了特殊处理
* 一组颜色变换可以看做是若干个单独颜色变换的组合(右下图)，文章给出了使用径向基函数分配权重的方法:
$$f(x)=\sum_i^k \omega _i(x) f_i(x)$$
$$\omega _i(x)=\sum_j^k\lambda_{ij}\phi(\parallel x-C_j\parallel)$$
$$\phi(r)=e^{-\frac{r^2}{2\sigma_r^2}}$$
<div style="text-align:center">
<img src="img/report/p1.png" height=200>&nbsp;&nbsp;&nbsp;<img src="img/report/p1.png" height=200>
</div>

### 三、主要函数及说明
函数 | 位置 | 说明
----|------|-----
`Color.lab2rgb(InputColor)` | color.js | 将RGB颜色转换为Lab颜色($RGB\to XYZ\to Lab$)
`Color.rgb2lab(InputColor)` | color.js | 将Lab颜色转换为RGB颜色
`Color.labBoundary(pin, pout)`| color.js | 在Lab空间内，求颜色pin与pout连线与Lab边界的交点(二分查找)
`Palette.palette()`| palette.js | 统计图像颜色属于各个bin的颜色个数
`Palette.kmeansFirst()`| palette.js | 聚类，由统计好的bins数据得到调色板
`Palette.kmeans()`| palette.js | 调整上一步聚类得到的颜色，直到调色板不再变化
`Palette.colorTransformSingleL(l)`| palette.js | 根据调色板颜色亮度，确定新图像亮度的变化
`Palette.colorTransformSingleAB(ab1,ab2,L,x)`| palette.js | 在Lab空间某一亮度的层内，根据论文方法，由$ab1\to ab2$这一对颜色变换，对x做a、b通道的颜色变换
`Palette.colorTransform(colors1,colors2)`| palette.js | 综合几组颜色变换的结果，得到新的图片







### Gallery

<div style="text-align:center">
<img src="img/gallery/p1.png" height=400><img src="img/gallery/p2.png" height=400>
</div>
<div style="text-align:center">
<img src="img/gallery/p3.png" height=400><img src="img/gallery/p4.png" height=400>
</div>

---

<div style="text-align:center">
<img src="img/gallery/p5.png" height=400><img src="img/gallery/p6.png" height=400>
</div>
<div style="text-align:center">
<img src="img/gallery/p7.png" height=400><img src="img/gallery/p8.png" height=400>
</div>


---
<div style="text-align:center">
<img src="img/gallery/p9.png" height=400><img src="img/gallery/p10.png" height=400>
</div>





























两天写完 都是DDL逼的（╯－＿－）╯╧╧
