// api.js
//
// This should simplify ros stuff for content creators
//

/**
 * @constructor
 * @param {string} wsUrl - default: ws://127.0.0.1:9091
 *       websocket address for rosbridge
 * @author Jacob Minshall <jacob@endpoint.com>
 */
function ROSAccess(wsUrl) {
  // default argument
  if (typeof(wsUrl) === 'undefined') {
    wsUrl = 'ws://127.0.0.1:9091';
  }

  /** Ros connection used for talking to rosbridge
   *  @private */
  this.rosConnection_ = new AlbatRos({
    url: wsUrl
  });

  /** Spacenav topic for handling spacenav messages
   *  @private */
  this.spacenavTopic_ = new ROSLIB.Topic({
    ros: this.rosConnection_,
    name: '/spacenav/twist',
    throttle_rate: 33,
    messageType: ROSAccess.SPACE_MESSAGE_TYPE_
  });

  /** Leapmotion topic for handling leapmotion messages
   *  @private */
  this.leapmotionTopic_ = new ROSLIB.Topic({
    ros: this.rosConnection_,
    name: '/leap_motion/frame',
    throttle_rate: 33,
    messageType: ROSAccess.LEAP_MESSAGE_TYPE_
  });

  /** Dictionary of all topics subscribed / published to
   *  @private */
  this.topics_ = {};
}

/**
 * Ros string message type
 * @private
 */
ROSAccess.STRING_MESSAGE_TYPE_ = 'std_msgs/String';
/**
 * Ros spacenav message type
 * @private
 */
ROSAccess.SPACE_MESSAGE_TYPE_ = 'geometry_msgs/Twist';
/**
 * Ros leapmotion message type
 * @private
 */
ROSAccess.LEAP_MESSAGE_TYPE_ = 'leap_motion/Frame';

/**
 * Calls the desired callback with the actual string from the
 * ros message
 * @param {function} callback
 * @return {function}
 * @private
 */
ROSAccess.wrapRosString_ = function(callback) {
  return function(msg) {
    callback(msg.data);
  };
};

/**
 * Calls the desired callback with a simplified Twist data structure
 * @param {function} callback
 * @return {function}
 * @private
 */
ROSAccess.wrapRosTwist_ = function(callback) {
  return function(msg) {
    var easy_twist = {
      position: { x: msg.linear.x, y: msg.linear.y, z: msg.linear.z },
      rotation: { x: msg.angular.x, y: msg.angular.y, z: msg.angular.z }
    };
    callback(easy_twist);
  };
};

/**
 * Calls the desired callback with a simplified Leap data structure
 * @param {function} callback
 * @return {function}
 * @private
 */
ROSAccess.wrapRosLeap_ = function(callback) {
  return function(msg) {
    var easy_leap = {
      pointables: msg.pointables.slice(), hands: msg.hands.slice()
    };
    callback(easy_leap);
  };
};

/**
 * Defines a callback to handle any messages passed on the channel specified
 * @param {string} channel - channel messages will be on, must be alphanumeric
 * @param {function} callback - callback which is called when messages are
 *        published on <channel>
 */
ROSAccess.prototype.onMessage = function(channel, callback) {
  var topic = this.getTopic_(channel);
  topic.subscribe(ROSAccess.wrapRosString_(callback));
};

/**
 * Finds or creates the topic with the channel passed
 * @param {string} channel
 * @return {ROSLIB.Topic} the topic requested
 * @private
 */
ROSAccess.prototype.getTopic_ = function(channel) {
  if (!(channel in this.topics_)) {
    ROSAccess.validateChannel(channel);
    this.topics_[channel] = new ROSLIB.Topic({
      ros: this.rosConnection_,
      name: channel,
      throttle_rate: 33,
      messageType: ROSAccess.STRING_MESSAGE_TYPE_
    });
  }

  return this.topics_[channel];
};


/**
 * Defines a callback for spacenav messages
 * @param {spacenavCallback} callback - callback takes a {NavMsg} as
 *        its only param
 */
ROSAccess.prototype.onSpaceNavUpdate = function(callback) {
  this.spacenavTopic_.subscribe(ROSAccess.wrapRosTwist_(callback));
};

/**
 * Defines a callback for leapmotion messages
 * @param {LeapMotionCallback} callback - callback takes a {LeapMsg} as
 *        its only param
 */
ROSAccess.prototype.onLeapMotionUpdate = function(callback) {
  this.leapmotionTopic_.subscribe(ROSAccess.wrapRosLeap_(callback));
};

/**
 * Sends a message over the channel supplied
 * @param {string} channel - channel the message will go over, must be
 *    alphanumeric
 * @param {string} msg - the message desired passed as a string
 */
ROSAccess.prototype.sendMessage = function(channel, msg) {
  var topic = this.getTopic_(channel);
  var _msg = new ROSLIB.Message({
    data: msg
  });
  topic.publish(_msg);
};

/**
 * Validates a channel is alphanum or throws an exception
 * @param {string} channel
 */
ROSAccess.validateChannel = function(channel) {
  if (channel.search(/^[a-z0-9_\/]+$/i) == -1) {
    throw 'Invalid channel passed, please keep it alphanumeric';
  }
};

/**
 * @class NavMsg
 * @param {number} position.x - x axis position
 * @param {number} position.y - y axis position
 * @param {number} position.z - z axis position
 * @param {number} rotation.x - x axis rotation
 * @param {number} rotation.y - y axis rotation
 * @param {number} rotation.z - z axis rotation
 */
function NavMsg(rotation_x, rotation_y, rotation_z, position_x, position_y, position_z) {
  this.position = {x: position_x, y: position_y, z: position_z};
  this.rotation = {x: rotation_x, y: rotation_y, z: rotation_z};
}

/** See LeapMotion documentation for a description of Pointables and Hands
 * @class LeapMsg
 * @param {Array} pointables - an array of Pointables
 * @param {Array} hands - an array of Hands
 */
function LeapMsg(pointables, hands) {
  this.pointables = pointables;
  this.hands = hands;
}
