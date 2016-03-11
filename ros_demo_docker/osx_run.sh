#!/bin/bash

MACHINE_NAME="wzin-rosdemo"
CONTAINER_NAME="rosdemo"
ROSLAUNCH_FILE=${1:-rosdemo_backend}
DOCKER_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

function log_out {
  echo -e "\033[32mxXx\033[0m $@"
  tput sgr0
}

function log_err {
  echo -e "\033[31mxXx\033[0m $@"
  tput sgr0
}

log_out "Verifying tools..."

which docker-machine >/dev/null
if [ $? -ne 0 ]; then
  log_err "Could not find the 'docker-machine' executable."
  log_err "Is Docker Toolbox installed?"
  exit 1
fi

which docker >/dev/null
if [ $? -ne 0 ]; then
  log_err "Could not find the 'docker' executable."
  log_err "Is Docker Toolbox installed?"
  exit 1
fi

which VBoxManage >/dev/null
if [ $? -ne 0 ]; then
  log_err "Could not find the 'VBoxManage' executable."
  log_err "Is VirtualBox installed?"
  exit 1
fi

EXTPACK_NAME="Oracle VM VirtualBox Extension Pack"
EXTPACK_URL='http://www.oracle.com/technetwork/server-storage/virtualbox/downloads/index.html#extpack'
VBOX_VERSION=`VBoxManage --version`
VBoxManage list extpacks | grep "$EXTPACK_NAME" >/dev/null
if [ $? -ne 0 ]; then
  log_err "It seems that $EXTPACK_NAME is not installed."
  log_err "Get it for your version of VirtualBox (${VBOX_VERSION%r*}) from:"
  log_err $EXTPACK_URL
#  exit 1
fi

log_out "Starting up $MACHINE_NAME..."
docker-machine start $MACHINE_NAME >/dev/null
docker-machine ip $MACHINE_NAME >/dev/null || exit 1

log_out "Importing environment settings for $MACHINE_NAME..."
eval "$(docker-machine env $MACHINE_NAME)"

log_out "Setting up port forwarding for $MACHINE_NAME..."
VBoxManage controlvm $MACHINE_NAME natpf1 delete webserver 2>/dev/null
VBoxManage controlvm $MACHINE_NAME natpf1 "webserver,tcp,127.0.0.1,8008,,8008" || exit 1
VBoxManage controlvm $MACHINE_NAME natpf1 delete sv_proxy 2>/dev/null
VBoxManage controlvm $MACHINE_NAME natpf1 "sv_proxy,tcp,127.0.0.1,8088,,8088" || exit 1
VBoxManage controlvm $MACHINE_NAME natpf1 delete rosbridge 2>/dev/null
VBoxManage controlvm $MACHINE_NAME natpf1 "rosbridge,tcp,127.0.0.1,9091,,9090" || exit 1

log_out "Rebuilding the $CONTAINER_NAME container, this may take a minute..."
log_out "Building $CONTAINER_NAME with $DOCKER_DIR"
docker build -t $CONTAINER_NAME "$DOCKER_DIR" || exit 1

log_out "Querying host volumes..."
if docker-machine ssh $MACHINE_NAME test -e /dev/bus/usb >/dev/null 2>&1; then
  USB_VOLUME="--volume=/dev/bus/usb:/dev/bus/usb"
fi

log_out "Starting the $CONTAINER_NAME container..."
docker run \
  --rm --name=wzin-rosdemo \
  --publish="8008:8008" --publish="8088:8088" --publish="9091:9090" --publish="9090:9090" \
  ${USB_VOLUME} \
  --device="/dev/input:/dev/input" \
  --volume="${DOCKER_DIR}/configs:/run_config" \
  --env="ROS_MASTER_URI=http://localhost:11311" \
  --env="ROS_HOSTNAME=localhost" \
  --env="ROS_IP=127.0.0.1" \
  --env="ROSLAUNCH_FILE=${ROSLAUNCH_FILE}" \
  -it $CONTAINER_NAME
