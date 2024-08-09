#!/bin/sh
sed -i "s~__PDA_API__~${KLAVE_API_URL}~g" ui/index.html
sed -i "s~__SECRETARIUM_ID__~${SECRETARIUM_ID_URL}~g" ui/index.html
npx -y serve ui