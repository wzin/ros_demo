# ROS and Snappy Ubuntu Core demo

## Requirements

Install Vagrant from https://www.vagrantup.com/

Install Docker from https://docs.docker.com/engine/installation/

## Making it running

- snappy ubuntu core:

(in snappy_ubuntu_core_demo directory)

```bash
vagrant up
```

and them

```bash
vagrant ssh
```

- ROS javasript + websocket rosbridge demo
(in ros_demo_docker)

only once:
```bash
./osx_bootstrap.sh
```

then run it:
```bash
./osx_run.sh
```

Point your browser to http://127.0.0.1:8008/basic/a.html and open
another browser with with this URL http://127.0.0.1:8008/basic/b.html

# Authors

Most of the demo code was developed by Matt Vollrath <matt@endpoint.com> and
Jacob Minshall <jacob@endpoint.com>
