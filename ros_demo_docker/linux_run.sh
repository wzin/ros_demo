#!/bin/bash

ROSLAUNCH_FILE=${1:-portal_backend}
CONTAINER_NAME="portal"
DOCKER_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

docker build -t $CONTAINER_NAME "$DOCKER_DIR"
docker run \
  --rm --name=portaldev \
  --publish="9090:9090" --publish="9091:9090" --publish="8088:8088" --publish="8008:8008" \
  --device="/dev/bus/usb:/dev/bus/usb" \
  --device="/dev/input:/dev/input" \
  --volume="${DOCKER_DIR}/configs:/run_config" \
  --env="ROS_MASTER_URI=http://localhost:11311" \
  --env="ROS_HOSTNAME=localhost" \
  --env="ROS_IP=127.0.0.1" \
  --env="ROSLAUNCH_FILE=${ROSLAUNCH_FILE}" \
  -it $CONTAINER_NAME
