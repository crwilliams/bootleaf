<?
$colours = array(
	'Nature' => '128e4d',
	'Industry' => '265cb2',
	'Offices' => '3875d7',
	'Stores' => '5ec8bd',
	'Tourism' => '66c547',
	'Restaurants-and-Hotels' => '8c4eb8',
	'Transportation' => '9d7050',
	'Media' => 'a8a8a8',
	'Events' => 'c03638',
	'Culture-and-Entertainment' => 'c259b5',
	'Health' => 'f34648',
	'Sports' => 'ff8a22',
	'Education' => 'ffc11f',
);

$cats['Culture-and-Entertainment'] = array(
	'cinema', 'dancinghall', 'museum_art', 'museum_crafts', 'music_classical', 'theater');
$cats['Education'] = array(
	 'computers', 'daycare', 'library', 'tools', 'university');
$cats['Health'] = array(
	'barber', 'drugstore', 'hospital', 'medicine');
$cats['Offices'] = array(
	'atm', 'bank_pound', 'congress', 'disability', 'information', 'police2', 'postal', 'recycle', 'shower',
	'telephone', 'wifi', 'workoffice');
$cats['Restaurants-and-Hotels'] = array(
	'bar', 'coffee', 'hotel_0star', 'lattes', 'lodging_0star', 'restaurant');
$cats['Sports'] = array(
	'squash-2', 'stadium', 'swimming');
$cats['Stores'] = array(
	'conveniencestore', 'library');
$cats['Tourism'] = array(
	'church-2', 'citywalls', 'mosquee', 'prayer', 'sikh', 'synagogue-2', 'templehindu');
$cats['Transportation'] = array(
	'airport', 'bus', 'ferry', 'fillingstation', 'parking', 'parking_bicycle', 'train');

$icons = array(
	'airport' => 2431,
	'atm' => 1337,
	'bank_pound' => 931,
	'bar' => 35905,
	'bar_coktail' => 21,
	'barber' => 17,
	'boatcrane' => 471,
	'bus' => 97,
	'church-2' => 2439,
	'cinema' => 2385,
	'citywalls' => 3836,
	'coffee' => 2391,
	'computers' => 4423,
	'congress' => 15211,
	'conveniencestore' => 48634,
	'dancinghall' => 3959,
	'daycare' => 4281,
	'disability' => 13098,
	'drugstore' => 10042,
	'factory' => 605,
	'family' => 15209,
	'farm-2' => 629,
	'ferry' => 2420,
	'fillingstation' => 2440,
	'foodtruck' => 745,
	'forest' => 2429,
	'garden' => 2424,
	'grass' => 498,
	'hiking' => 385,
	'historicalquarter' => 12390,
	'hospital' => 2384,
	'hotel_0star' => 2427,
	'information' => 45,
	'lattes' => 2391,
	'library' => 191,
	'lodging_0star' => 2427,
	'medicine' => 3815,
	'mosquee' => 2438,
	'museum_art' => 2416,
	'museum_crafts' => 2426,
	'music_classical' => 928,
	'parking' => 27,
	'parking_bicycle' => 2418,
	'police2' => 2407,
	'postal' => 2404,
	'prayer' => 2438,
	'recycle' => 60,
	'restaurant' => 2392,
	'rubbish' => 2410,
	'school' => 2401,
	'shower' => 4336,
	'sikh' => -1,
	'squash-2' => 42487,
	'stadium' => 13872,
	'supermarket' => 35520,
	'swimming' => 2414,
	'synagogue-2' => 319,
	'takeaway' => 4312,
	'teahouse' => 2643,
	'telephone' => 671,
	'templehindu' => 20383,
	'theater' => 2417,
	'tools' => 4684,
	'train' => 4420,
	'truck3' => 471,
	'university' => 2402,
	'wifi' => 824,
	'workoffice' => 51347,
);

foreach($cats as $category => $names)
{
	foreach($names as $name)
	{
		generateIcon($icons[$name], $name, $category, $colours[$category]);
	}
}

function generateIcon($id, $name, $category, $colour)
{
	echo "Processing $id in category $category.\n";
	
	$outputdir="";
	
	@mkdir($outputdir.$category.'/');
	
	$basecolorarr['r'] = hexdec(substr($colour, 0, 2));
	$basecolorarr['g'] = hexdec(substr($colour, 2, 2));
	$basecolorarr['b'] = hexdec(substr($colour, 4, 2));
		
	// Try to load the icon file.
	$im = @imagecreatefrompng('src/icon_'.$id.'.png');

	// Check the size of the icon file.
	if(imagesx($im) != 1200 || imagesy($im) != 1200)
	{
		echo "File is wrong shape.\n";
		return;
	}
	
	// Copy the relevant part of the icon file into a new image object of size 24x24.
	$dst_im = imagecreate(24, 24);
	imagecopy($dst_im, $im, 0, 0, 4, 14, 24, 24);
	
	$color=0;
	
	$maxx = imagesx($im);
	$maxy = imagesy($im);
	for($y = 0; $y < $maxx; $y++)
	{
		for($x = 0; $x < $maxy; $x++)
		{
			$color = imagecolorsforindex($im, imagecolorat($im, $x, $y));
			$sat[(int)($x/50)][(int)($y/50)] += $color['alpha'];
		}
	}
	
	$w = 32;
	$h = 37;
	
	$gs_im = imagecreatetruecolor($w, $h);
	
	clearBackground($gs_im, $w, $h);
	drawBase($gs_im, $w, $h, $basecolorarr);
	drawGradient($gs_im, $w, $h);
	drawBorder($gs_im);
	
	// Save the 'blank' image.
	imagesavealpha($gs_im, true);
	imagepng($gs_im, $outputdir.$category.'/blank.png');
	
	$pl_im = imagecreatetruecolor(24, 24);
	imagealphablending($pl_im,false);
	imagefilledrectangle($pl_im, 0, 0, $w, $h, imagecolorallocatealpha($pl_im, 255, 255, 255, 127));
	imagealphablending($pl_im, true);

	// For all pixels in the icon.
	for($y = 0; $y < 24; $y++)
	{
		for($x = 0; $x < 24; $x++)
		{
			// Get the pixel level.
			$level = max(0, min(127, round(127*$sat[$x][$y]/(50*50*127), 0)));
			
			// Set the pixel colour according to its level.
			imagesetpixel($gs_im, $x+4, $y+4, imagecolorallocatealpha($gs_im, 255, 255, 255, $level));
			imagesetpixel($pl_im, $x, $y, imagecolorallocatealpha($pl_im, 0, 0, 0, $level));
		}
	}
	
	imagesavealpha($pl_im, true);
	imagepng($gs_im, $outputdir.$category.'/'.$name.'.png');
}

function clearBackground($gs_im, $w, $h)
{
	imagealphablending($gs_im,false);
	imagefilledrectangle($gs_im, 0, 0, $w, $h, imagecolorallocatealpha($gs_im, 255, 255, 255, 127));
	imagealphablending($gs_im, true);
}

function drawBase($gs_im, $w, $h, $basecolorarr)
{
	$basecolorobj = imagecolorallocate($gs_im, $basecolorarr['r'], $basecolorarr['g'], $basecolorarr['b']);
	$bh = min($h, 32);
	
	$markershape = array(
		1,0,
		$w-2,0,
		$w-1,1,
		$w-1,$bh-2,
		$w-2,$bh-1,
		1,$bh-1,
		0,$bh-2,
		0,1,
	);
	// Draw the box (base colour only).
	imagefilledpolygon($gs_im, $markershape, count($markershape)/2, $basecolorobj);

	$tailshape = array(
		20,32,
		16,36,
		15,36,
		11,32,
	);
	// Draw the tail (base colour only).
	imagefilledpolygon($gs_im, $tailshape, count($markershape2)/2, $basecolorobj);
}

function drawGradient($gs_im, $w, $h)
{
	// Work out where the box gradient should stop.
	$stoph = 30;
	$stopw = 30;
	
	for($i = 1; $i <= $stoph; $i++)
	{
		// Build up the colour gradient on the box.
		imageline($gs_im, 1, $i, $stopw, $i, imagecolorallocatealpha($gs_im, 0, 0, 0, 127 - $i));
	}

	for($i = 0; $i < 5; $i++)
	{
		// Build up the colour gradient on the tail.
		imageline($gs_im, 11+$i, 31+$i, 20-$i, 31+$i, imagecolorallocatealpha($gs_im, 0, 0, 0, 127 - (31+$i)));
	}
}

function drawBorder($gs_im)
{
	$colour = imagecolorallocatealpha($gs_im, 0, 0, 0, 64);

	// Draw the border.
	imageline($gs_im, 1, 0, 30, 0, $colour);
	imageline($gs_im, 0, 1, 0, 30, $colour);
	imageline($gs_im, 31, 1, 31, 30, $colour);
	imageline($gs_im, 1, 31, 10, 31, $colour);
	imageline($gs_im, 21, 31, 30, 31, $colour);
	imageline($gs_im, 11, 32, 15, 36, $colour);
	imageline($gs_im, 20, 32, 16, 36, $colour);
}
?>