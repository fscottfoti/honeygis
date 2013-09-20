var m = null;
var lastlg = null;
var lastlegend = null;
var lastmark = null;

function initmap() {
  m = L.map("map").setView([37.8202, -122.2801],12);

  L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.png",
    {subdomains: '1234',type:'map',minZoom:10,maxZoom:18}).addTo(m);
}

function recenter(data) {
  var lon = d3.median(data,function(v){return v.x});
  var lat = d3.median(data,function(v){return v.y});
  m.panTo([lat,lon]);
}

function colormap(data,config) {

var nodes = data[config["csvfname"]];
          
var markers = L.markerClusterGroup();
var points = [];
nodes.forEach(function(node) {
    points.push([+node.y, +node.x, +node[config["field"]]]);
    var title = node[config["field"]]
    var marker = L.marker(new L.LatLng(+node.y, +node.x), { title: title });
	marker.bindPopup(title);
    markers.addLayer(marker);
});

var buckets = config["buckets"];
var radius = config["radius"];

var hexbin = d3.hexbin()
    .size([
    	d3.max(points,function(v){return v.x})-d3.min(points,function(v){return v.x}), 
    	d3.max(points,function(v){return v.y})-d3.min(points,function(v){return v.y})])
    .radius(radius);

var hex = hexbin(points);

function myave(h) {return config["agg"](h,function(v){return v[2]});}

if(config["quantile"] == true) {
    var q = d3.scale.quantile()
        .domain(hex.map(function(h){return myave(h)})
        .reduce(function(a,b){if(a.indexOf(b)===-1){a.push(b)};return a;},[])
        .sort(function(a,b){return a-b}))
        .range(d3.range(buckets));
} else {
  var q = d3.scale.quantize()
      .domain(d3.extent(hex.map(function(h){return myave(h)})))
      .range(d3.range(buckets));
}

function hexagon(radius) {
    var x0 = 0, y0 = 0;
    return d3.range(0, 2 * Math.PI, Math.PI / 3).map(function(angle) {
      var x1 = Math.sin(angle) * radius,
          y1 = -Math.cos(angle) * radius,
          dx = x1 - x0,
          dy = y1 - y0;
      x0 = x1, y0 = y1;
      return [dx, dy];
    });
};

var transform = hexagon(radius);

transform.shift();
 
if(lastlg != null) m.removeLayer(lastlg);
if(lastmark != null) m.removeLayer(lastmark);

if (lastlegend != null) lastlegend.removeFrom(m);
lastlegend = null;

if(config["hexagons"]) {
  var lg = L.layerGroup(hex.map(function(h) {
	return L.polygon(transform.map(function(t){
		return [h.x+t[0],h.y+t[1]];
	}),{
		stroke:false,
		color:colorbrewer[config["colorscheme"]][buckets][q(myave(h))],
		fillOpacity:config["opacity"]
	}).bindPopup("Agg value: "+myave(h).toFixed(2));
  }));
  lastlg = lg;
  lg.addTo(m);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = q.range(),
    labels = [],
    from, to;

    for (var i = grades.length-1; i >= 0; i--) {
      var extent = q.invertExtent(grades[i]);
      from = extent[0].toFixed(2);
      to = extent[1].toFixed(2);

      labels.push(
        '<i style="background:' + colorbrewer[config["colorscheme"]][buckets][i] + '"></i>' +
        from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
  };
  lastlegend = legend;
  legend.addTo(m);
}
//color:colorbrewer[config["colorscheme"]][buckets][(buckets-1)-q(myave(h))],
if(config["markers"]) {
  lastmark = markers;
  m.addLayer(markers);
}
}
