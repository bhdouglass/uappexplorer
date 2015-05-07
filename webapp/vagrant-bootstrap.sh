#!/bin/bash

sed -i 's/#force_color_prompt/force_color_prompt/g' ~/.bashrc
sed -i 's/# deb/deb/g' /etc/apt/sources.list

export DEBIAN_FRONTEND=noninteractive

dpkg --add-architecture i386
add-apt-repository ppa:ubuntu-sdk-team/ppa

apt-get update
apt-get install -y ubuntu-desktop git ubuntu-sdk ubuntu-emulator
apt-get dist-upgrade -y

apt-get autoremove -y
