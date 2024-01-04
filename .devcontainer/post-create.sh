#!/bin/bash
sudo apt-get install -y pulseaudio
pulseaudio -D --exit-idle-time=-1
cd wasmaudioworklet
yarn install
yarn playwright install-deps 
yarn playwright install

