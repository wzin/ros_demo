/*
 * Application code for basic roslibjs example.
 *
 * When the button is pressed, the color changes and is published to ROS.
 */

var COLORS = ['red', 'green', 'blue'];
var colorIndex = 0;


function changeColor() {
  var color = COLORS[colorIndex];
  colorIndex = (colorIndex + 1) % COLORS.length;

  $('#aParagraph').html('Looking {}!'.replace('{}', color));
  $('#aParagraph').css('color', color);

  /*
   * Publish the color message.
   */
  wzinros.sendMessage(colorChannel, color);
}

$('#aButton').click(changeColor);
