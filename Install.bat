@echo off
title Install
npm i --save node-emoji flatfile life-db node-twitchbot tmi.js twitch-bot
cls
echo Do you want to start the bot right now, or wait? [Y/n]
set /p yn=
if %yn% == Y ( goto yes)
if %yn% == y ( goto yes)
if %yn% == N ( exit )
if %yn% == n ( exit )
:yes
node index
