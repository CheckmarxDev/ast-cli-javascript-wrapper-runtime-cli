#!/bin/bash

release=$1
filename_windows=ast-cli_${release}_windows_x64.zip
filename_linux=ast-cli_${release}_linux_x64.tar.gz
filename_darwin=ast-cli_${release}_darwin_x64.tar.gz

#Windows
echo "Updating windows binary"
wget https://github.com/Checkmarx/ast-cli/releases/download/${release}/${filename_windows}
unzip ${filename_windows} -d tmp
mv ./tmp/cx.exe ./src/main/wrapper/resources/cx.exe
rm -r tmp
rm ${filename_windows}

#linux
echo "Updating linux binary"
wget https://github.com/Checkmarx/ast-cli/releases/download/${release}/${filename_linux}
mkdir ./tmp/
tar -xvzf  ${filename_linux} -C ./tmp/
mv ./tmp/cx ./src/main/wrapper/resources/cx-linux
rm -r tmp
rm ${filename_linux}

#darwin
echo "Updating mac binary"
wget https://github.com/Checkmarx/ast-cli/releases/download/${release}/${filename_darwin}
mkdir ./tmp/
tar -xvzf  ${filename_darwin} -C ./tmp/
mv ./tmp/cx ./src/main/wrapper/resources/cx-mac
rm -r tmp
rm ${filename_darwin}
