var map;

var sparql = ""

$(document).ready(function(){
	initMap();

	//Selectタグの変化
	$("select").change(function() {
		if (this.value === "知事") {
			//SPARQLの変更と問合せ
			sparql = "PREFIX dbpedia: <http://ja.dbpedia.org/resource/> PREFIX dbpedia-­owl: <http://dbpedia.org/ontology/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX prop-ja: <http://ja.dbpedia.org/property/> SELECT distinct * WHERE { ?pref rdf:type dbpedia-owl:Place; dbpedia-owl:wikiPageWikiLink category-ja:日本の都道府県; dbpedia-owl:leaderName ?o; prop-ja:所在地 ?place. FILTER (?place != 220). FILTER (?place != 180). FILTER (?place != 10). }"
			d3sparql.query("http://ja.dbpedia.org/sparql", sparql, render)
		} else if(this.value !== "-選択してください-") {
			sparql = "PREFIX dbpedia: <http://ja.dbpedia.org/resource/> PREFIX dbpedia-­owl: <http://dbpedia.org/ontology/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX prop-ja: <http://ja.dbpedia.org/property/> SELECT distinct * WHERE {?pref rdf:type dbpedia-owl:Place; dcterms:subject category-ja:日本の都道府県; prop-ja:" + this.value + " ?o; prop-ja:所在地 ?place. FILTER (?place != 220). ?o rdf:type dbpedia-owl:Species. FILTER (?place != 180). FILTER (?place != 10).}"
			d3sparql.query("http://ja.dbpedia.org/sparql", sparql, render)
		}
	});
});


//Mapへのマーカー描画
function render(json) {
	initMap();

	var infoWindow = {};
	var marker = {};
	var geocoder = new google.maps.Geocoder();

	$.each(json["results"]["bindings"], function(key, result) {
		lat = 0
		lng = 0

		$.each(latlnglist["marker"], function(pref, latlng) {
			if(latlng["pref"] === result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]) {
				lat = latlng["lat"]
				lng = latlng["lng"]
				return false;
			}
		});

		marker[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]] = new google.maps.Marker({
			map: map,
			position: {
				lat: lat,
				lng: lng
			}
		});

		infoWindow[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]] = new google.maps.InfoWindow({
			content: "<span>" + result["o"]["value"].split("http://ja.dbpedia.org/resource/")[1] + "</span>"
		});

		marker[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]].addListener('mouseover', function() {
			infoWindow[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]].open(map, marker[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]]);
		});

		marker[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]].addListener('mouseout', function() {
			infoWindow[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]].close(map, marker[result["pref"]["value"].split("http://ja.dbpedia.org/resource/")[1]]);
		});
	});

	var config = {
		"selector": "#result"
	}
}

//Mapの初期化
function initMap() {
	map = new google.maps.Map(document.getElementById('gmap'), {
		center: {lat: 35.691, lng: 139.751},
		zoom: 8
	});
}