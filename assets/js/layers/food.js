function createFoodLayer(layername, name)
{
  createLayer(
    'food/en-gb/southampton/' + layername,
    name,
    'http://opendatamap.ecs.soton.ac.uk/modules/food/icons/fhrs_' + layername + '_en-gb/blank.png',
    '<p>This layer makes use of the following datasets:<ul><li><a href="http://ratings.food.gov.uk/open-data/en-GB">Food Hygiene Rating Scheme</a> (available under the <a href="http://www.food.gov.uk/ratings-terms-and-conditions">FHRS/FHIS Brand Standard, terms and conditions</a>)</li></ul></p>'
  );
}

createFoodLayer('0', 'Food-Hygiene-Rating-0');
createFoodLayer('1', 'Food-Hygiene-Rating-1');
createFoodLayer('2', 'Food-Hygiene-Rating-2');
createFoodLayer('3', 'Food-Hygiene-Rating-3');
createFoodLayer('4', 'Food-Hygiene-Rating-4');
createFoodLayer('5', 'Food-Hygiene-Rating-5');

setTitle('Food Hygiene Map');
