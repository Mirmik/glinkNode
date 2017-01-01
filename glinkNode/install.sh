#!/usr/bin/env bash
#coding: utf-8

#VARIABLES
executable=/usr/local/bin/glink
installdir=/usr/share/glink/

arg=$1

function apt-installIfNeeded {
	if [ "$arg" == "--without-check" ]; then return; fi 
	if dpkg-query -W $1 > /dev/null 2> /dev/null
	then 
		echo apt-checked $1
	else 
		sudo apt-get install $1 -y
	fi
}  

function npm-installIfNeeded {
	if [ "$arg" == "--without-check" ]; then return; fi 
	if npm-check $1 -g > /dev/null 2> /dev/null
	then 
		echo npm-checked $1
	else 
		sudo npm install $1 -g 
	fi
}  

apt-installIfNeeded nodejs

if [ -f /usr/bin/node ]; then [ ]; else sudo ln -s /usr/bin/nodejs /usr/bin/node; fi

apt-installIfNeeded npm
npm-installIfNeeded npm-check
npm-installIfNeeded minimist

echo coping files ...

sudo mkdir -p $installdir
sudo cp -r ./src/lib $installdir
sudo cp -r ./src/classes $installdir
sudo cp ./src/glinkBase.js $installdir

sudo cp ./src/glink $executable
sudo sed -i 's|INSTALLDIR|'$installdir'|g' $executable
sudo chmod +x $executable