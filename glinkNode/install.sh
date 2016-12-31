#!/usr/bin/env sh
#coding: utf-8

sudo rm -rf /usr/glink

sudo cp ./glink /usr/bin/glink
sudo chmod +x /usr/bin/glink
sudo mkdir /usr/glink
sudo cp -r lib /usr/glink
sudo cp -r classes /usr/glink
sudo cp ./glinkBase.js /usr/glink