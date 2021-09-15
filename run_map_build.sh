#!/bin/bash

for f in ./content/maps/*.vmap
do
    fileName="${f//.\/content\/maps\//}"
    fileName="${fileName//.vmap/}"
    fullPath="d:/steamlibrary/steamapps/common/dota 2 beta/content/dota_addons/mystical_maze/${f//content/.}"
    echo "Processing $fullPath"
    echo "$fileName"

    "D:\SteamLibrary\steamapps\common\dota 2 beta\game\bin\win64\resourcecompiler.exe" -fshallow -maxtextureres 256 -dxlevel 110 -quiet -html -unbufferedio -noassert -i "$fullPath"  -world -phys -vis -gridnav -breakpad  -nompi  -nop4 -outroot "C:\Users\Pascal2\AppData\Local\Temp\valve\hammermapbuild\game"

    mv "C:\\Users\\Pascal2\\AppData\\Local\\Temp\\valve\\hammermapbuild\\game\\dota_addons\\mystical_maze\\maps\\$fileName.vpk" "C:\\Users\\Pascal\\Documents\\Projects\\DotaMods\\mystical_maze\\game\\maps"
done
