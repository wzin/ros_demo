/*
 * This script sets up the rosbridge connection and all topics shared between
 * the kiosk and wall.
 */

/*
 * Set this to the rosbridge address.
 */
var wzinros = new ROSAccess('ws://localhost:9091');

/*
 * This defines a ROS topic.
 *
 * Since topic names are arbitrary when using roslib, be sure to namespace with
 * an organization name to avoid collisions.
 *
 * This topic uses the std_msgs/String type:
 * http://docs.ros.org/api/std_msgs/html/msg/String.html
 *
 * When a topic is 'latched' by its publisher, the most recent message
 * published to the topic will be replayed for any client subscribing to the
 * topic.
 */
var colorChannel= '/rosdemo/basic/color';
