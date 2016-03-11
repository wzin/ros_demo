#!/bin/bash

MACHINE_NAME="wzin-rosdemo"

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

docker-machine ls | cut -d ' ' -f 1 | grep $MACHINE_NAME >/dev/null
if [ $? -eq 0 ]; then
  log_out "Cleaning up an existing $MACHINE_NAME machine..."
  docker-machine kill $MACHINE_NAME
  docker-machine rm $MACHINE_NAME
fi

log_out "Creating the $MACHINE_NAME machine, this may take a minute..."
docker-machine create --driver virtualbox $MACHINE_NAME >/dev/null || exit 1

#log_out "Stopping the $MACHINE_NAME machine..."
#docker-machine stop $MACHINE_NAME >/dev/null || exit 1

#log_out "Setting up USB and filters on $MACHINE_NAME..."
#VBoxManage modifyvm $MACHINE_NAME --usb on --usbehci on || exit 1
#VBoxManage usbfilter add 0 --target $MACHINE_NAME --name "SpaceNavigator" --product "SpaceNavigator" || exit 1
#VBoxManage usbfilter add 0 --target $MACHINE_NAME --name "LEAP" --manufacturer "Leap Motion" || exit 1

#log_out "Starting up $MACHINE_NAME..."
#docker-machine start $MACHINE_NAME >/dev/null || exit 1

log_out "The $MACHINE_NAME machine appears to be ready."
