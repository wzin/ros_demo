/*
 * Application code for basic Portal roslibjs example.
 *
 * When the button is pressed on the touchscreen, the wall changes color.
 */
wzinros.onMessage(colorChannel, function(color) {
  $(document.body).css('background-color', color);
});
