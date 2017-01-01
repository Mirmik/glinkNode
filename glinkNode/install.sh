#!/usr/bin/env sh
#coding: utf-8

sudo rm -rf /usr/glink

sudo cp ./src/glink /usr/bin/glink
sudo chmod +x /usr/bin/glink
sudo mkdir /usr/glink
sudo cp -r src/lib /usr/glink
sudo cp -r src/classes /usr/glink
sudo cp ./src/glinkBase.js /usr/glink