<?php
require '../inc/sparqllib.php';

function startsWith($str, $prefix) {
	return substr($str, 0, strlen($prefix)) == $prefix;
}

function wrap($array) {
	$json = array();
	foreach($array as $item) {
		$json[] = '"'.$item.'"';
	}
	return implode(',', $json);
}

function outputAllPoints($points, $datasets=array()) {
	$result = '';
	$result .= '{ "type": "FeatureCollection", "datasets": ['.wrap($datasets).'], "features": [ ';
	$features = array();
	foreach($points as $point) {
		$label = str_replace('\\', '', $point['label']);
		$feature = "\n".'{';
		$feature .= '"type":"Feature",';
		$feature .= '"id":"'.$point['id'].'",';
		$icon = '';
		if(isset($point['icon'])) {
			$icon .= ',"ICON":"'.$point['icon'].'"';
		}
		if(isset($point['offerings'])) {
			$icon .= ',"OFFERS":['.wrap(explode(';', $point['offerings'])).']';
		}
		$feature .= '"properties":{"NAME":"'.$label.'"'.$icon.',"CONTENT":"'.$label.'"},';
		if(isset($point['outline'])) {
			$feature .= '"geometry":{"type":"Polygon","coordinates":[[';
			$coordinates = explode(',', str_replace(array('POLYGON((', '))'), '', $point['outline']));
			$geojsoncoordinates = array();
			foreach($coordinates as $coordinate) {
				$geojsoncoordinates[] = '['.str_replace(' ', ',', $coordinate).']';
			}
			$feature .= implode(',', $geojsoncoordinates);
			$feature .= ']]}';
		} else {
			$feature .= '"geometry":{"type":"Point","coordinates":['.round($point['long'], 4).','.round($point['lat'], 4).']}';
		}
		$feature .= '}';
		$features[$label] = $feature;
	}
	ksort($features);
	$result .= implode(', ', $features);
	$result .= ' ] }';
	return $result;
}

function reject($point) {
	if(startsWith($point['id'], 'http://id.southampton.ac.uk/vending-machine/')) {
		return true;
	}
	return false;
}

function getSouthampton() {
	$datasets = array();
	$points = array();
$q = '
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX spacerel: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
                PREFIX org: <http://www.w3.org/ns/org#>
                PREFIX gr: <http://purl.org/goodrelations/v1#>
                
                SELECT DISTINCT ?id ?lat ?long ?label ?icon ?g1 ?g2 ?g3 ?g4 ?g5 WHERE {
                  GRAPH ?g1 {?id a gr:LocationOfSalesOrServiceProvisioning .}
                  GRAPH ?g2 {?id rdfs:label ?label .}
                  OPTIONAL { GRAPH ?g3 {?id spacerel:within ?b .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?b geo:lat ?lat .
                               ?b geo:long ?long .
                               ?b a <http://vocab.deri.ie/rooms#Building> .
                             }
                           }
                  OPTIONAL { GRAPH ?g3 {?id spacerel:within ?s .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?s geo:lat ?lat .
                               ?s geo:long ?long .
                               ?s a org:Site .
                             }
                           }
                  OPTIONAL { GRAPH ?g5 {
                               ?id geo:lat ?lat .
                               ?id geo:long ?long .
                             }
                           }
                  GRAPH ?g4 {?id <http://purl.org/openorg/mapIcon> ?icon .}
                  FILTER ( BOUND(?long) && BOUND(?lat) )
                } ORDER BY ?label
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$cat = getCategory($p['icon']);
		if(!isset($p['g5'])) {
			$p['g5'] = 'http://id.southampton.ac.uk/dataset/places/latest';
		}
		$datasets[$cat][$p['g1']] = true; unset($p['g1']);
		$datasets[$cat][$p['g2']] = true; unset($p['g2']);
		$datasets[$cat][$p['g3']] = true; unset($p['g3']);
		$datasets[$cat][$p['g4']] = true; unset($p['g4']);
		$datasets[$cat][$p['g5']] = true; unset($p['g5']);
		$p['icon'] = str_replace('http://data.southampton.ac.uk/map-', '', $p['icon']);
		$points[$cat][] = $p;
	}
$q = '
                PREFIX soton: <http://id.southampton.ac.uk/ns/>
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX org: <http://www.w3.org/ns/org#>
                PREFIX spacerel: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
                PREFIX gr: <http://purl.org/goodrelations/v1#>
                PREFIX oo: <http://purl.org/openorg/>
                
                SELECT DISTINCT ?id ?label ?lat ?long ?icon ?g1 ?g2 ?g3 ?g4 ?g5 WHERE {
                  GRAPH ?g1 {?offering gr:includes <http://id.southampton.ac.uk/generic-products-and-services/iSolutionsWorkstations> .
                             ?offering <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> gr:Offering .
                             ?offering gr:availableAtOrFrom ?id .}
                  GRAPH ?g2 {?id rdfs:label ?label .}
                  GRAPH ?g3 {?id oo:mapIcon ?icon .}
                  OPTIONAL { GRAPH ?g4 {?id spacerel:within ?b .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?b geo:lat ?lat .
                               ?b geo:long ?long .
                               ?b a <http://vocab.deri.ie/rooms#Building> .
                             }
                           }
                  OPTIONAL { GRAPH ?g4 {?id spacerel:within ?s .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?s geo:lat ?lat .
                               ?s geo:long ?long .
                               ?s a org:Site .
                             }
                           }
                  OPTIONAL { GRAPH ?g5 {?id geo:lat ?lat .
                                        ?id geo:long ?long .}
                           }
                  FILTER ( BOUND(?long) && BOUND(?lat) )
                } ORDER BY ?label
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$cat = getCategory($p['icon']);
		if(!isset($p['g5'])) {
			$p['g5'] = 'http://id.southampton.ac.uk/dataset/places/latest';
		}
		$datasets[$cat][$p['g1']] = true; unset($p['g1']);
		$datasets[$cat][$p['g2']] = true; unset($p['g2']);
		$datasets[$cat][$p['g3']] = true; unset($p['g3']);
		$datasets[$cat][$p['g4']] = true; unset($p['g4']);
		$datasets[$cat][$p['g5']] = true; unset($p['g5']);
		$p['icon'] = str_replace('http://data.southampton.ac.uk/map-', '', $p['icon']);
		$points[$cat][] = $p;
	}
	$q = '
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT ?id ?lat ?long ?label WHERE {
                  GRAPH <http://id.southampton.ac.uk/dataset/wifi/latest> {
                    ?id geo:lat ?lat .
                    ?id geo:long ?long .
                    ?id rdfs:label ?label .
                  }
                }
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$p['icon'] = 'http://data.southampton.ac.uk/map-icons/Offices/wifi.png';
		$cat = getCategory($p['icon']);
		$datasets[$cat]['http://id.southampton.ac.uk/dataset/wifi/latest'] = true;
		$p['icon'] = str_replace('http://data.southampton.ac.uk/map-', '', $p['icon']);
		$points[$cat][] = $p;
	}
	$q = '
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX spacerel: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
                PREFIX org: <http://www.w3.org/ns/org#>
                PREFIX gr: <http://purl.org/goodrelations/v1#>
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                
                SELECT DISTINCT ?id ?lat ?long ?label WHERE {
                  GRAPH ?g1 {?id <http://purl.org/openorg/hasFeature> ?f .
                             ?f a <http://id.southampton.ac.uk/location-feature/Shower> .}
                  GRAPH ?g2 {?f rdfs:label ?label .}
                  OPTIONAL { GRAPH ?g4 {?id spacerel:within ?b .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?b geo:lat ?lat .
                               ?b geo:long ?long .
                               ?b a <http://vocab.deri.ie/rooms#Building> .
                             }
                           }
                  OPTIONAL { GRAPH ?g4 {?id spacerel:within ?s .}
                             GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                               ?s geo:lat ?lat .
                               ?s geo:long ?long .
                               ?s a org:Site .
                             }
                           }
                  OPTIONAL { GRAPH ?g5 {?id geo:lat ?lat .
                                        ?id geo:long ?long .}
                           }
                  GRAPH ?g3 {?id <http://purl.org/openorg/mapIcon> ?icon .}
                  FILTER ( BOUND(?long) && BOUND(?lat) )
                } ORDER BY ?label
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$cat = getCategory($p['icon']);
		if(!isset($p['g5'])) {
			$p['g5'] = 'http://id.southampton.ac.uk/dataset/places/latest';
		}
		$datasets[$cat][$p['g1']] = true; unset($p['g1']);
		$datasets[$cat][$p['g2']] = true; unset($p['g2']);
		$datasets[$cat][$p['g3']] = true; unset($p['g3']);
		$datasets[$cat][$p['g4']] = true; unset($p['g4']);
		$datasets[$cat][$p['g5']] = true; unset($p['g5']);
		$p['icon'] = str_replace('http://data.southampton.ac.uk/map-', '', $p['icon']);
		$points[$cat][] = $p;
	}

	return array(prepareDatasets($datasets), $points);
}

function prepareDatasets($datasets) {
	$alldatasets = array();
	foreach($datasets as $cat => $catdatasets) {
		foreach(array_keys($catdatasets) as $dataset) {
			if($dataset == '') continue;
			$alldatasets[$dataset] = true;
		}
	}
	
	$q = '
	SELECT * WHERE {
	  ?d a <http://www.w3.org/ns/dcat#Dataset> .
	  ?d <http://purl.org/dc/terms/license> ?license .
	  ?d <http://purl.org/dc/terms/title> ?title .
	  ?d <http://rdfs.org/ns/void#dataDump> ?dd .
	} ORDER BY ?t
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if($p['license'] == 'http://reference.data.gov.uk/id/open-government-licence') {
			$p['license'] = ' (available under the <a href=\'' . $p['license'] . '\'>Open Government Licence</a>)';
		}
		$datasetinfo[$p['dd']] = $p;
	}
	
	foreach(array_keys($alldatasets) as $dataset) {
		if($dataset == '') continue;
		if(array_key_exists($dataset, $datasetinfo)) {
			$alldatasets[$dataset] = '<a href=\''.$datasetinfo[$dataset]['d'].'\'>'.$datasetinfo[$dataset]['title'].'</a>'.$datasetinfo[$dataset]['license'];
		} else {
			$alldatasets[$dataset] = strtoupper($dataset);
		}
	}

	$datasetshtml = array();
	foreach($datasets as $cat => $catdatasets) {
		foreach(array_keys($catdatasets) as $dataset) {
			if($dataset == '') continue;
			$datasetshtml[$cat][] = $alldatasets[$dataset];
		}
	}
	return $datasetshtml;
}

function getCategory($icon) {
	foreach(array('Transportation', 'Restaurants-and-Hotels', 'Offices', 'Culture-and-Entertainment', 'Health',
			'Tourism', 'Stores', 'Education', 'Sports', 'Media') as $filter) {
		if(startsWith($icon, 'http://data.southampton.ac.uk/map-icons/'.$filter.'/')) {
			return $filter;
		}
	}
	return 'Other';
}

function getSouthamptonBuildings() {
	$q = '
                PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                SELECT DISTINCT ?id ?label ?outline ?lat ?long ?num ?g1 ?g2 ?g3 ?g4 WHERE {
                  GRAPH ?g1 {?id a <http://id.southampton.ac.uk/ns/UoSBuilding> .}
                  OPTIONAL { GRAPH ?g2 {?id <http://purl.org/dc/terms/spatial> ?outline .} }
                  GRAPH <http://id.southampton.ac.uk/dataset/places/latest> {
                    ?id geo:lat ?lat .
                    ?id geo:long ?long .
                  }
                  GRAPH ?g3 {?id <http://www.w3.org/2000/01/rdf-schema#label> ?label .}
                  OPTIONAL { GRAPH ?g4 {?id <http://www.w3.org/2004/02/skos/core#notation> ?num .} }
                } ORDER BY ?num
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$p['g5'] = 'http://id.southampton.ac.uk/dataset/places/latest';
		$datasets[''][$p['g1']] = true; unset($p['g1']);
		@$datasets[''][$p['g2']] = true; unset($p['g2']);
		$datasets[''][$p['g3']] = true; unset($p['g3']);
		@$datasets[''][$p['g4']] = true; unset($p['g4']);
		$datasets[''][$p['g5']] = true; unset($p['g5']);
		$points[''][] = $p;
	}
	return array(prepareDatasets($datasets), $points);
}

function getSouthamptonSites() {
	$q = '
                SELECT DISTINCT ?id ?label ?outline ?g1 ?g2 ?g3 WHERE {
                  GRAPH ?g1 {?id a <http://www.w3.org/ns/org#Site> .}
                  GRAPH ?g2 {?id <http://purl.org/dc/terms/spatial> ?outline .}
                  GRAPH ?g3 {?id <http://www.w3.org/2000/01/rdf-schema#label> ?label .}
                } ORDER BY ?id
';
	$d = sparql_get('http://sparql.data.southampton.ac.uk', $q);
	foreach($d as $p) {
		if(reject($p)) continue;
		$datasets[''][$p['g1']] = true; unset($p['g1']);
		$datasets[''][$p['g2']] = true; unset($p['g2']);
		$datasets[''][$p['g3']] = true; unset($p['g3']);
		$points[''][] = $p;
	}
	return array(prepareDatasets($datasets), $points);
}

function store($points, $filename, $datasets=array()) {
	@mkdir(dirname($filename), 0777, true);
	file_put_contents($filename.'.geojson', outputAllPoints($points, $datasets));
}

list($datasets, $points) = getSouthampton();
foreach($points as $cat => $catpoints) {
	store($catpoints, 'data/southampton/'.$cat, $datasets[$cat]);
}

list($datasets, $points) = getSouthamptonBuildings();
store($points[''], 'data/southampton/buildings', $datasets['']);

list($datasets, $points) = getSouthamptonSites();
store($points[''], 'data/southampton/sites', $datasets['']);
?>
