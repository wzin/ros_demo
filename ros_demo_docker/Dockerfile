# Build from https://github.com/osrf/docker_images/tree/master/ros/indigo/indigo-ros-core
FROM ros:indigo-ros-core
MAINTAINER Wojciech Ziniewicz <wojciech.ziniewicz@gmail.com>

# Install misc system dependencies.
RUN \
  apt-get update && \
  apt-get -y install --no-install-recommends \
    build-essential \
    bc \
    dbus-x11 \
    dconf-cli \
    wget \
    apt-transport-https \
    libglu1-mesa \
    libnss3-tools \
    htop \
    vim-nox \
    tmux \
    curl \
    telnet \
    netcat \
  && rm -rf /var/lib/apt/lists/*


RUN \
  apt-get update && \

  apt-get -y --force-yes --no-install-recommends install \
    ros-indigo-rosbridge-suite \
    ros-indigo-rosbridge-library \
    ros-indigo-rosbridge-server \

  && rm -rf /var/lib/apt/lists/*

# Install helper scripts.
RUN mkdir -p /home/lg/bin && \
    mkdir -p /home/lg/examples && \
    mkdir -p /home/lg/etc

COPY image_scripts/* /home/lg/bin/
COPY configs/ros_demo.xml /home/lg/etc/
COPY examples /home/lg/examples

RUN \
  useradd -G video lg && \
  chown -R lg:lg /home/lg && \
  echo "lg ALL=NOPASSWD: ALL" >> /etc/sudoers.d/lg
USER lg

EXPOSE 8008 8088 9091 9090

# Start the application as configured.
CMD /bin/bash /home/lg/bin/run_ros_demo.sh 2>&1 >/dev/null & \
    cd /home/lg/examples; python -m SimpleHTTPServer 8008 & \
    bash
