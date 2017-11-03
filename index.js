/** Don't edit this line **/ const emoji = require('node-emoji'); /** Don't edit this line **/
/////////////////////
//Bot Login Options//
/////////////////////
const user = "input your bot's tusername here";
const oauth = "input your oauth token here";
const channels = ["#name"]; //Your channel name here.
const owner = "kd8lvt";
const streamer = "fate78"; //Your name here

/////////////////
//Databse Files//
/////////////////

const pointFile = "point.db.json"; //Probably don't mess with these
const commandFile = "command.db.json"; //Probably don't mess with these
const quoteFile = "quote.db.json"; //Probably don't mess with these
const clipFile = "clip.db.json"; //Probably don't mess with these
const fightFile = "fights.db.json"; //Probably don't mess with these
const arenaFile = "arena.db.json"; //Probably don't mess with these

const configuration = {
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Variable//////////////Description//////////////////////////////////////////////////////////////////////////////Accepted Value(s)///////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	prefix: "!", //Command prefix. Example: (prefix)command//////////////////////////////////////////////////////////(Word/Character)////////////////
	banWords: false,
	pointPrefix: emoji.get(":crystal_ball:"), //Prefix for your point system. Example: You bet (pointPrefix)100 on the match!/////////////////(Word/Character)///////////////
	pointName: "karma", //Singular word used for your point system. Example: You earned 1 (pointName)!///////////////(Word(s))//////////////////////
	pointNamePlural: "karma", //Plural word used for your point system. Example: You earned 200 (pointNamePlural)!//(Word(s))//////////////////////
	pointPluralModifier: "is", //Word after a plural usage of your points. Generally is/are.
	paycheck: 10, //Points to pay all (non AFK) users every 'paycheckInterval' minutes.///////////////////////////////(integer)//////////////////////
	paycheckInterval: 5, //Minutes. If a user is afk, they will not get their paycheck.///////////////////////////////(non-zero, positive integer)///
	initialPaycheck: 50, //Amount paid on first money check.///////////////////////////////////////////////////////////(positive ingteger)///////////
	useAfkTimer: true, //Activates/deactivates the AFK timer.////////////////////////////////////////////////////////(true/false)///////////////////
	afkTimer: 5, //Minutes of lurking. Does nothing if "useAfkTimer" is false.///////////////////////////////////////(non-zero, positive integer)///
	toss: {
		minMultiplier: 0, //Minimum multiplier. For example, if a player bet 2, and your maxMultiplier was 0.25, the max they could get would be 1. (It rounds up the final total)
		maxMultiplier: 2, //Maximum multiplier. For example, if a player bet 2, and your maxMultiplier was 2, the max they could get would be 4. (It rounds up the final total)
		delay: 30, //In seconds. Delay between uses.
		lines: {
			tossed: "toss",
			duplicates: "it duplicates"
		}
	},
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////NOT YET IMPLEMENTED OPTIONS BELOW////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////NOT YET IMPLEMENTED OPTIONS BELOW////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////NOT YET IMPLEMENTED OPTIONS BELOW////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	bankheist: {
		label: "bankheist", //What your bankheist is called. ONE WORD!
		timeBetweenRounds: 1, //In minutes. Time between heists.
		timeWaitingForPlayers: 1, //In minutes. Time to wait for players to join.
		messages: { //Messages for the heist. Take note of what the hardcoded variables are, and make sure you use them like shown!
			recruiting: "Some romours are going around that %user% is planning a %bankheistName%! Will you join them? Type !%bankheistName% <bet> to join in!",
			recruited: "%user% was recruited for %pointPrefix%%bhBet%!",
			noMoreRecruits: "%user% has gathered their team, and is no longer looking for recruits! Let the %bankheistName% begin!",
			finishers: {
				success: "The %bankheistName% was a sucess! Everyone got their fair-share of %pointNamePlural#! The totals are as such: ",
				minorFail: "Most of you made it out alive, but a few did fall. Here are the totals:",
				fail: "The cops were waiting for us! Who was the snitch!?",
				megaFail: "SWAT was there waiting for us! Who tipped them!?"
			},
			totalTally: "Here's your rewards: %bankheistWinnings%"
		},
		chances: {
			chanceSuccess: 50,
			chanceMinorFail: 40,
			chanceFail: 10,
			chanceMegaFail: 5
		},
		multipliers: {
			success: 2,
			minorFail: 1.5,
			fail: 0,
			megaFail: 0
		}
	},
	useBetaFeatures: true
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

var bannedWords = ["fuck","shit","tits","hell","bitch","bastard","motherfucker","dick","penis","cunt","vagina"];
//Sorry D:

/////////////////////////////////////////////////////////////
//DO NOT FOR ANY REASON EDIT PAST HERE UNLESS TOLD TO DO SO//
/////////////////////////////////////////////////////////////
const tmi = require('tmi.js');
const low = require('lowdb');
const rand = require("random-js");
const fs = require('fs');
const FileSync = require('lowdb/adapters/FileSync');

const pointAdapter = new FileSync(pointFile);
var pointDb = low(pointAdapter);

const commandAdapter = new FileSync(commandFile);
var commandDb = low(commandAdapter);

const quoteAdapter = new FileSync(quoteFile);
var quoteDb = low(quoteAdapter);

const clipAdapter = new FileSync(clipFile);
var clipDb = low(clipAdapter);

const fightAdapter = new FileSync(fightFile);
var fightDb = low(fightAdapter);

const arenaAdapter = new FileSync(arenaFile);
var arenaDb = low(arenaAdapter);

var lastUse = {
	toss: Date.now()
}

pointDb.defaults({ users: {}})
	.write();


commandDb.defaults({commands: []})
	.write();

quoteDb.defaults({quotes: []})
	.write();

clipDb.defaults({clips: []})
	.write();
	
fightDb.defaults({fights: []})
	.write();
	
arenaDb.defaults({arenas: []})
	.write();
	
const engine = rand.engines.nativeMath;

var afk = [];
var online = [];
var afkTimers = {};

var options = {
	options: {
		debug: true
	},
	connection: {
		reconnect: true
	},
	identity: {
		username: user,
		password: oauth
	},
	channels: channels
};
/////////////
//BOT STUFF//
/////////////
var bot = new tmi.client(options);
bot.connect();

bot.on('chat', function (channel,userstate,msg,self) {
	//console.log(userstate);
	if (self) return
	parseMessage(msg,userstate,channel);
	if (configuration.useAfkTimer) {
		if (afk.indexOf(userstate.username) > -1) {
			for (i=afk.length;i>=0;i--) {
				if (afk[i] == userstate.username) {
					afk.splice(i,1);
					online.push(userstate.username);
				}
			}
		} else {
			if (afkTimers[userstate.username] != null) {
				clearTimeout(afkTimers[userstate.username]);
				afkTimers[userstate.username] = setTimeout(function() {addToAfk()},((configuration.afkTimer*1000)*60),userstate.username);
			} else {
				afkTimers[userstate.username] = setTimeout(function() {addToAfk()},((configuration.afkTimer*1000)*60),userstate.username);
			}
		}
	}
});

bot.on('join', function (channel,username, self) {
	if (self) {
		setInterval(function() {givePaycheck()},(configuration.paycheckInterval*1000)*60);
		crashed();
		return;
	}
	online.push(username);
});

bot.on('part', function (channel,username,self) {
	if (self) return;
	for (i=online.length;i>=0;i--) {
		if (online[i] == username) {
			online.splice(i,1);
		}
	}
});

/////////////
//FUNCTIONS//
/////////////

function startsWith(msg,word,reqPre) {
	//console.log("[DEBUG] STARTS WITH");
	var splitMsg = msg.split(" ");
	if (reqPre == true) {
		if (splitMsg[0] == configuration.prefix+word) {
			return true;
		} else {
			return false;
		}
	} else {
		if (splitMsg[0] == word) {
			return true;
		} else {
			return false;
		}
	}
}

function contains(msg,word) {
	if (msg.indexOf(word) > -1) {
		return true;
	} else {
		return false;
	}
}

function replaceVars(msg,user,channel,whisper,bhWinnings) {
	pts = getPts(user.username)
	var newMsg = msg;
	while (contains(newMsg,"%")) {
		newMsg = newMsg.replace("%user%",user.username);
		newMsg = newMsg.replace("%pointPrefix%",configuration.pointPrefix);
		newMsg = newMsg.replace("%points%",pts.toString());
		newMsg = newMsg.replace("%pntName%",configuration.pointName);
		newMsg = newMsg.replace("%pntNamePlural%",configuration.pointNamePlural);
		newMsg = newMsg.replace("%bankheistName%",configuration.bankheist.label);
		if (bhWinnings != null) {
			newMsg.replace("%bankheistWinnings%",bhWinnings.winnings);
			newMsg.replace("%bhBet%",bhWinnings.bet);
		}
	}
	if (whisper) {
		bot.say(channel,newMsg);
	} else {
		bot.say(channel,newMsg);
	}
}

function parseMessage(msg,user,channel) {
	//console.log(msg);
	var msgLc = msg.toLowerCase();
	var done = false;
	var newCommands = reloadCommandDB();
	//console.log(commands);
	if (user.username == "craaazy_gam1ng") {
		if (startsWith(msgLc,configuration.pointNamePlural,true)) {
			done = true;
			var crazy = getPts("craaazy_gam1ng")
			var yaz = getPts("yaz12321");
			var difference = yaz-crazy;
			
			if (difference < 0) {
				var difference = crazy-yaz;
				replaceVars("You currently have %pointPrefix%%points%, %user%, which is more than Yaz's total by %pointPrefix%"+difference,user,channel);
			} else {
				replaceVars("You currently have %pointPrefix%%points%, %user%, which is less than Yaz's total by %pointPrefix%"+difference,user,channel);
			}
		}
	}
	for (i=0;i<=newCommands.length;i=i+1) {
		if (newCommands[i] == null) return;
		if (!done) {
			if (newCommands[i].functionToRun != null) {
				var args = [];
				args.push(user);
				args.push(channel);
				var splitMsg = msg.split(" ");
				for (j=1;j<splitMsg.length;j=j+1) {
					args.push(splitMsg[j]);
				}
				//console.log(args);
				if (startsWith(msgLc,newCommands[i].name,newCommands[i].requiresPrefix)) {
					if (newCommands[i].requiresAdmin != null) {
						if (newCommands[i].requiresAdmin) {
							if (user.mod || user.username == owner || user.username == streamer) {
								//console.log("Got to admin user");
								newCommands[i].functionToRun(args);
								//console.log("This happens after the function");
								done = true;
							}
						} else {
							if (newCommands[i].requiresSub != null && !done) {
								if (newCommands[i].requiresSub) {
									if (user.subscriber) {
										//console.log("Got to normal subscriber");
										newCommands[i].functionToRun(args);
										//console.log("This happens after the function");
										done=true;
									}
								}
							} else if (!done) {
								//console.log("Got to normal user");
								newCommands[i].functionToRun(args);
								//console.log("This happens after the function");
							}
						}
					}
				} else if (newCommands[i].aliases != null) {
					for (j=0;j<newCommands[i].aliases.length;j=j+1) {
						if (startsWith(msgLc,newCommands[i].aliases[j],newCommands[i].requiresPrefix)) {
							if (newCommands[i].requiresAdmin != null) {
								if (newCommands[i].requiresAdmin) {
									if (user.mod || user.username == owner || user.username == streamer) {
										replaceVars(newCommands[i].response,user,channel);
										done = true;
									}
								} else {
									if (newCommands[i].requiresSub != null && !done) {
										if (newCommands[i].requiresSub) {
											if (user.subscriber) {
												replaceVars(newCommands[i].response,user,channel);
												done = true;
											}
										}
									} else if (!done){
										replaceVars(newCommands[i].response,user,channel);
									}
								}
							}
						}
					}
				}
			} else {			
				if (startsWith(msgLc,newCommands[i].name,newCommands[i].requiresPrefix)) {
					if (newCommands[i].requiresAdmin != null) {
						if (newCommands[i].requiresAdmin) {
							if (user.mod || user.username == owner || user.username == streamer) {
								replaceVars(newCommands[i].response,user,channel);
								done = true;
							}
						} else {
							if (newCommands[i].requiresSub != null && !done) {
								if (newCommands[i].requiresSub) {
									if (user.subscriber) {
										replaceVars(newCommands[i].response,user,channel);
										done=true;
									}
								}
							} else if (!done) {
								replaceVars(newCommands[i].response,user,channel);
							}
						}
					}
				} else if (newCommands[i].aliases != null) {
					for (j=0;j<newCommands[i].aliases.length;j=j+1) {
						if (startsWith(msgLc,newCommands[i].aliases[j],newCommands[i].requiresPrefix)) {
							if (newCommands[i].requiresAdmin != null) {
								if (newCommands[i].requiresAdmin) {
									if (user.mod || user.username == owner || user.username == streamer) {
										replaceVars(newCommands[i].response,user,channel);
										done = true;
									}
								} else {
									if (newCommands[i].requiresSub != null && !done) {
										if (newCommands[i].requiresSub) {
											if (user.subscriber) {
												replaceVars(newCommands[i].response,user,channel);
												done = true;
											}
										}
									} else if (!done){
										replaceVars(newCommands[i].response,user,channel);
									}
								}
							}
						}
					}
				}
			}
			if (configuration.banWords) {
				for (i=0;i<bannedWords.length;i=i+1) {
					if (contains(msgLc,bannedWords[i])) {
						bot.say(channel,replaceVars("Hey! You used a banned word, %user%!"));
						bot.timeout(channel,user.username,replaceVars("You used a banned word: "+bannedWords[i]+"!",30));
					} else if (contains(user.username,bannedWords[i])) {
						bot.say(channel,replaceVars("Hey! Your name has a banned word in it!"));
						bot.timeout(channel,user.username,replaceVars("You have a banned word in your name: "+bannedWords[i]+"!",30));
					}
				}
			}
		}
	}
}

function addPoints(user,change) {
	reloadPointDB();
	var pts = getPts(user);
	var newPts = pts + change;
	pointDb.set('users.'+user+'.points',newPts).write();
}

function removePoints(user,change) {
	reloadPointDB();
	var pts = getPts(user);
	var newPts = pts - change;
	pointDb.set('users.'+user+'.points',newPts).write();
}

function getPts(user) {
	reloadPointDB();	
	var pts = pointDb.get('users.'+user+'.points').value();
	if (pointDb.get('users.'+user+'.name').value() == null) {
		pointDb.set('users.'+user+'.name',user).write();
	}
	if (pts != null) {
		return pts;
	} else {
		pointDb.set('users.'+user+".points",50).write();
		var bleh = pointDb.get('users.'+user+'.points').value();
		return bleh;
	}
}

function addToAfk(user) {
	for (i=online.length;i>=0;i--) {
		if (online[i] == user) {
			online.splice(i,1);
			afk.push(user);
		}
	}
}

function randomFloatBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function toss(args) {
	//bot.say(args[1],"Hi!");
	//console.log("Hi!");
	var now = Date.now();
	var timeBetween = ((now - lastUse.toss)/1000);
	if (timeBetween >= configuration.toss.delay) {
		if (args.length <= 1) {
			bot.say(args[1],"Invalid syntax! Correct Syntax: !toss <bet>");
		} else if (args[2] > 0) {
			if (args[2] == 1) {
				replaceVars("@"+args[0].username+", You have to toss more than one %pntName%, %user%!",args[0],args[1]);
			} else if (args[2] > getPts(args[0].username)) {
				replaceVars("@"+args[0].username+", You don't have enough %pntNamePlural% to bet that much, %user%!",args[0],args[1]);
			} else if (args[2] == null) {
				replaceVars("@"+args[0].username+", You need to specify an amount of %pointNamePlural% to toss!",args[0],args[1]);
			} else {
				var bet = parseInt(args[2]);
				removePoints(args[0].username,bet);
				replaceVars("@"+args[0].username+", You "+configuration.toss.lines.tossed+" "+bet+" %pntNamePlural% into the air!",args[0],args[1],true);
				var total = Math.ceil(randomFloatBetween(bet*configuration.toss.minMultiplier,bet*configuration.toss.maxMultiplier));
				if (total > 1) {
					setTimeout(function() {addPoints(args[0].username,total)},4000);
					if (total > bet) {
						setTimeout(function() {replaceVars("@"+args[0].username+", %pointPrefix%"+total+" %pntNamePlural% fell into your cup! So it's true, %pntNamePlural% "+configuration.pointPluralModifier+" magical!",args[0],args[1],true)},4000);
					} else if (total == bet) {
						setTimeout(function() {replaceVars("@"+args[0].username+", %pointPrefix%"+total+" %pntNamePlural% fell into your cup! Well, at least you didn't lose any! That's actually really rare %user%!",args[0],args[1],true)},4000);
					} else {
						
						setTimeout(function() {replaceVars("@"+args[0].username+", %pointPrefix%"+total+" %pntNamePlural% fell into your cup! Awh, that sucks %user%. Try again next time :/",args[0],args[1],true)},4000);
					}
				} else {
					setTimeout(function() {replaceVars("@"+args[0].username+", Only %pointPrefix%"+total+" %pntName% fell into your cup!",args[0],args[1],true)},4000);
					setTimeout(function() {addPoints(args[0].username,total)},4000);
				}
			}
		} else {
			bot.say(args[1],"Invalid syntax! Correct Syntax: !toss <bet>");
		}
		lastUse.toss = Date.now();
	} else {
		bot.say(args[1],"You can only use toss once every "+configuration.toss.delay+" seconds! ("+Math.ceil(configuration.toss.delay - timeBetween)+" seconds left)");
	}
}

function reloadPointDB() {
	pointDb = low(pointAdapter);
}

function givePaycheck() {
	for (i=0;i<online.length;i=i+1) {
		if (online[i].username == "nightbot") return;
		if (online[i] != null) {
			addPoints(online[i],configuration.paycheck);
		}
	}
}

function bankheist(args) {
	bot.say(args[1],"Not yet implemented, sorry!");
}

function reloadQuoteDB() {
	quoteDb = low(quoteAdapter);
	var quotesInt = quoteDb.get('quotes').value();
	return quotesInt;
}

function quote(args) {
	intQuotes = reloadQuoteDB()
	if (args.length > 2) {
		if (intQuotes.length >= parseInt(args[2])) {
			var quote = intQuotes[parseInt(args[2])-1];
			bot.say(args[1],'Your Quote: "'+quote.quote+'" -'+quote.speaker+" "+quote.date);
		} else {
			bot.say(args[1],'That quote does not exist!');
		}
	} else {
		if (intQuotes.length > 1) {
			var random = rand.integer(0,intQuotes.length)(engine);
			var quote = intQuotes[random];
			if (quote == null) {
				quote(args)
			} else {
				bot.say(args[1],'Random Quote: "'+quote.quote+'" -'+quote.speaker+" "+quote.date);
			}
		} else {
			bot.say(args[1],'Random Quote: "'+quotes[0].quote+'" -'+quotes[0].speaker+" "+quotes[0].date);
		}
	}
}


function fight(args) {
	var user = args[0].username;
	var channel = args[1];
	var target = args[2];
	var bet = args[3];
	if (bet == null) {
		bot.say(channel,"You need to specify an amount of "+configuration.pointNamePlural+" to bet!");
	} else if (parseInt(bet) <= 1) {
		bot.say(channel,"You have to bet more than one "+configuration.pointName+" that you will win! DO you not have any confidence in yourself?");
	} else if (getPts(user) < bet) {
		bot.say(channel,"You don't have enough "+configuration.pointNamePlural+" to bet that much, no matter HOW much you think you'll win!");
	} else if (target == null) {
		bot.say(channel,"You need to specify someone to fight!");
	} else if (getPts(target) < bet) {
		bot.say(channel,"Your opponent does not have enough to pay your bet, if you win, that is. Try something lower!");	
	} else {
		var fightDbInt = low(fightAdapter);
		var fightInt = fightDbInt.get('fights').value();
		
		var list = [user,target];
		
		var winner = rand.pick(engine,list);
		
		for (var i in list) {
			if (list[i] != winner) {
				var loser = list[i];
			}
		}
		
		fightInt.push({"fighter":user,"target":target,"winner":winner,"loser":loser,"bet":parseInt(bet)});
		fightDbInt.set('fights',fightInt).write();
		if (rand.bool(0.1)) {
			bot.say(channel,user+" challenges "+target+" to a One-on-One fight! Type !accept "+user+" to accept!");
		} else {
			bot.say(channel,"It's time to D-D-D-D-D-D-DUEL! "+user+" challenges "+target+" to a duel! Type !accept "+user+" to accept!");
		}
	}
}

function acceptFight(args) {
	var user = args[0].username;
	var channel = args[1];
	var target = args[2];
	if (target == null) {
		bot.say(channel,"Who's fight request do you want to accept? Proper syntax: '!accept <name>' (no <>)");
	} else {
		var fightDbInt = low(fightAdapter);
		var fightdbInternal = fightDbInt.get('fights').value();
		var fightInt = fightDbInt.get('fights')
		.filter({fighter: target, target: user})
		.sortBy('bet')
		.reverse()
		.take(1)
		.value()[0];
		
		if (fightInt == null) {
			bot.say(channel,"I can't find a fight request from that user! Perhaps you spelled their name wrong?");
			return;
		}
		
		console.log(fightInt);
		
		bot.say(channel,"A cloud of dust rises as "+fightInt.fighter+" takes on "+fightInt.target+" in a One-on-One fight!");
		setTimeout(function() {
			removePoints(fightInt.loser,fightInt.bet);
			addPoints(fightInt.winner,fightInt.bet);
			bot.say(channel,"As the cloud of dust settles, "+fightInt.winner+" is found to be the winner! They take "+fightInt.bet+" "+configuration.pointNamePlural+" from "+fightInt.loser+" as their prize!");
			for (var i in fightdbInternal) {
				if (fightdbInternal[i] == fightInt) {
					fightdbInternal.splice(i,1);
					fightDbInt.set('fights',fightdbInternal).write();
					break;
				}
			}
		},1000);
	}
}

function arena(args) {
	var user = args[0];
	var channel = args[1];
	
}

function getClip(args) {
	intClips = reloadClipDB()
	if (args.length > 2) {
		for (var i=0;i<intClips.length;i++) {
			if (intClips[i].name == args[2]) {
				var clip = intClips[i];
				break;
			}
		}
		if (clip != null) {
			bot.say(args[1],'Your Requested Clip: "'+clip.name+'": http://clips.twitch.tv/'+clip.link);
		} else {
			bot.say(args[1],'That clip does not exist! Check your spelling?');
		}
	} else {
		bot.say(args[1],"Not enough arguments! Syntax: !clip <name>");
	}
}

function reloadClipDB() {
	clipDb = low(clipAdapter);
	var clipsInt = clipDb.get('clips').value();
	return clipsInt;
}

function reloadFightDB() {
	fightDb = low(fightAdapter);
	var fightInt = fightDb.get('fights').value();
	return fightInt;
}

function addCom(args) {
	console.log("ADDING COMMAND");
	//console.log(args);
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	var cmdText = "";
	if (args.length < 5) {
		bot.say(channel,"Not enough arguments! Syntax: !addC <name> <require Admin (true/false)> <require Prefix (true/false)> <response>");
		return;
	}
	var commandDbInt = low(commandAdapter);
	var commandsInt = commandDbInt.get('commands').value();
	
	cmdName = args[2];
	
	cmdName = cmdName.toLowerCase();
	
	for (var i = 0;i<commandsInt.length;i++) {
		if (commandsInt[i].name == cmdName) {
			bot.say(channel,"That command already exists!");
			return;
		}
	}
	
	for (var i=5;i<args.length;i++) {
		if (cmdText == "") {
			cmdText = args[i];
		} else {
			cmdText = cmdText + " " + args[i];
		}
	}
	
	if (args[4]) {
		args[4] = true;
	} else {
		args[4] = false;
	}
	
	if (args[3]) {
		args[3] = true;
	} else {
		args[3] = false;
	}
	
	//console.log({"name":cmdName,"requiresPrefix":args[4],"requiresAdmin":args[3],"response":cmdText})
	
	commandsInt.push({"name":cmdName,"requiresPrefix":args[4],"requiresAdmin":args[3],"response":cmdText});
	
	commandDbInt.set('commands',commandsInt).write();
	
	
	bot.say(channel,"Added command! Test it out first, this is a beta feature, so it might be buggy!");
}

function removeCom(args) {
	console.log("REMOVING COMMAND");
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	var cmdText = "";
	if (args.length < 3) {
		bot.say(channel,"Not enough arguments! Syntax: !remC <name>");
		return;
	}
	
	var commandDbInt = low(commandAdapter);
	var commandsInt = commandDbInt.get('commands').value();
	
	for (var i = 0;i<commandsInt.length;i++) {
		if (commandsInt[i].name == args[2]) {
			commandsInt.splice(i,1);
			commandDbInt.set('commands',commandsInt).write();
			bot.say(channel,"Removed command: "+args[2]);
			return;
		}
	}
	bot.say(channel,"Couldn't find command '"+args[2]+"'! Did you spell it right?");
}

var compliments = [
	"%user% thinks %target% is cute!",
	"%user% says %target% is awesome!",
	"%user% hugs %target% <3",
	"%user% gives %target% a kiss on the cheeck <3",
	"%user% runs around like a crazy person... No idea why."
]

function compliment(args) {
	ccompliment = rand.pick(engine,compliments);
	split = ccompliment.split(" ");
	concat = ""
	for (var i=0;i<split.length;i++) {
		if (split[i] == "%user%") {
			split[i] = args[0].username;
		} else if (split[i] == "%target%") {
			split[i] = args[2];
		}
		if (concat == "") {
			concat = split[i];
		} else {
			concat = concat + " " + split[i];
		}
	}
	bot.say('#'+streamer,concat);
}

function addQuote(args) {
	console.log("ADDING QUOTE");
	//console.log(args);
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	var quoteText = "";
	if (args.length < 5) {
		bot.say(channel,"Not enough arguments! Syntax: !addQ <Speaker> <Date (Month/Day/Year format)> <Quote Text>");
		return;
	}
	var quoteDbInt = low(quoteAdapter);
	var quotesInt = quoteDbInt.get('quotes').value();
	
	for (var i=4;i<args.length;i++) {
		if (quoteText == "") {
			quoteText = args[i];
		} else {
			quoteText = quoteText + " " + args[i];
		}
	}
	
	//console.log({"name":cmdName,"requiresPrefix":args[4],"requiresAdmin":args[3],"response":cmdText})
	
	quotesInt.push({"speaker":args[2],"date":args[3],"quote":quoteText});
	
	quoteDbInt.set('quotes',quotesInt).write();
	
	
	bot.say(channel,"Added quote! It has ID number "+quotesInt.length+"!");
}

function removeQuote(args) {
	console.log("REMOVING QUOTE");
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	if (args.length < 3) {
		bot.say(channel,"Not enough arguments! Syntax: !remQ <number>");
		return;
	}
	
	var quoteDbInt = low(quoteAdapter);
	var quotesInt = quoteDbInt.get('quotes').value();
	
	if (quotesInt[args[2]-1] != null) {
		quotesInt.splice(args[2]-1,1);
		quoteDbInt.set('quotes',quotesInt).write();
		bot.say(channel,"Removed quote number "+args[2]+"!");
		return;
	}
	bot.say(channel,"Couldn't find quote number "+args[2]+"!");
	return;
}

function addClip(args) {
	console.log("ADDING CLIP");
	//console.log(args);
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	var quoteText = "";
	if (args.length < 4) {
		bot.say(channel,"Not enough arguments! Syntax: !addV <Name> <Link>");
		return;
	}
	var clipDbInt = low(clipAdapter);
	var clipsInt = clipDbInt.get('clips').value();
	
	var clipName = args[2];
	clipName = clipName.toLowerCase();
	var clipLink = args[3];
	
	clipsInt.push({"name":clipName,"link":clipLink});
	
	clipDbInt.set('clips',clipsInt).write();
	
	
	bot.say(channel,"Added clip! It has the name "+clipName+"!");
}

function removeClip(args) {
	console.log("REMOVING CLIP");
	var channel = args[1];
	var user = args[0];
	var username = args[0].username;
	if (args.length < 3) {
		bot.say(channel,"Not enough arguments! Syntax: !remV <Name>");
		return;
	}
	
	var clipName = args[2];
	clipName = clipName.toLowerCase();
	
	var clipDbInt = low(clipAdapter);
	var clipsInt = clipDbInt.get('clips').value();
	
	if (clipsInt[args[2]-1] != null) {
		clipsInt.splice(args[2]-1,1);
		clipDbInt.set('clips',clipsInt).write();
		bot.say(channel,"Removed clip with name "+clipName+"!");
		return;
	}
	bot.say(channel,"Couldn't find clip with name "+clipName+"!");
	return;
}

function multistream(args) {
	var userstate = args[0];
	var channel = args[1];
	
	var concat = '';
	
	if (args.length < 2) {
		bot.say(channel,"You have to specify at least one other streamer! Syntax: !multistream name(s)");
	}
	
	for (var i=2;i<args.length;i++) {
		concat = concat + "/"+args[i];
	}
	
	bot.say(channel,"Fate is currently streaming with other people! Watch them all here: https://multistre.am/fate78"+concat);
}

function topUsers(args) {
	var user = args[0];
	var channel = args[1];
	var ptsDbInt = low(pointAdapter);
	
	var ptsInt = ptsDbInt.get('users')
	.sortBy('points')
	.reverse()
	.take(args[2])
	.value();
	
	var msg = ""
	
	for (var i=0;i<ptsInt.length;i++) {
		iadded = i+1
		if (msg == "") {
			msg = "Top users: "+iadded+". "+ptsInt[i].name+": "+ptsInt[i].points;
		} else {
			msg = msg + " II "+iadded+". "+ptsInt[i].name+": "+ptsInt[i].points;
		}
	}
	
	bot.say(channel,msg);
}

function purgeUsers(args) {
	var user = args[0];
	var channel = args[1];
	var ptsDbInt = low(pointAdapter);
	
	bot.say('#'+streamer,"Purging...");
	
	var oldSize = ptsDbInt.get('users')
	.size()
	.value();
	
	var userlist = ptsDbInt.get('users').value();
	
	for (var key in userlist) {
		if (userlist.hasOwnProperty(key)) {
			if (userlist[key].points < 80) {
				console.log('Removed user #'+i+'. They had '+userlist[key].points+' points.');
				ptsDbInt.unset('users['+key+']').write();
			}
		}
	}
	
	var newSize = ptsDbInt.get('users')
	.size()
	.value();
	
	bot.say('#'+streamer,"Purged all users with under 80 "+configuration.pointNamePlural+"! This is done periodically to save on disk space!");
	bot.say('#'+streamer,"Went from "+oldSize+" entries to "+newSize+" entries!");
}

function getSpecificPts(args) {
	var user = args[0];
	var channel = args[1];
	var target = args[2];
	
	var targetPts = getPts(target);
	if (targetPts == 1) {
		bot.say('#'+streamer,target+" has "+targetPts+" "+configuration.pointName+"!");
	} else {
		bot.say('#'+streamer,target+" has "+targetPts+" "+configuration.pointNamePlural+"!");
	}
}

function reloadCommandDB() {
	commandDb = low(commandAdapter);
	internalCommands = commandDb.get('commands').value();
	internalCommands.push({"name": configuration.pointNamePlural,"requiresAdmin": false,"requiresPrefix": true,"response": "You currently have %pointPrefix%%points%, %user%!"});
	internalCommands.push({"name": "toss","requiresAdmin": false,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": toss});
	internalCommands.push({"name": "quote","requiresAdmin": false,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": quote});
	internalCommands.push({"name": configuration.bankheist.label,"requiresAdmin": false,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": bankheist});
	internalCommands.push({"name": "addc","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": addCom});
	internalCommands.push({"name": "remc","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": removeCom});
	internalCommands.push({"name": "addq","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": addQuote});
	internalCommands.push({"name": "remq","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": removeQuote});
	internalCommands.push({"name": "addv","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": addClip});
	internalCommands.push({"name": "remv","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": removeClip});
	internalCommands.push({"name": "clip","requiresAdmin": false,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": getClip});
	internalCommands.push({"name": "multi","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": multistream});
	internalCommands.push({"name": "top","requiresAdmin": true,"requiresPrefix": true,"response": "You should not be seeing this!","functionToRun": topUsers});
	internalCommands.push({"name": "purgepts","requiresAdmin": true,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": purgeUsers});
	internalCommands.push({"name": "compliment","requiresAdmin": false,"requiresPrefix": true,"response": "You shouldn't be seeing this!","functionToRun": compliment});
	internalCommands.push({"name": "getpts","requiresAdmin": true,"requiresPrefix": true,"response": "You should not be seeing this!","functionToRun": getSpecificPts});
	internalCommands.push({"name": "fight","requiresAdmin": false,"requiresPrefix": true,"response": "You should not be seeing this!","functionToRun": fight});
	internalCommands.push({"name": "accept","requiresAdmin": false,"requiresPrefix": true,"response": "You should not be seeing this!","functionToRun": acceptFight});
	
	return internalCommands;
}

//I crashed lines
var crashlines = [
	"Hi, I'm kd8bot, and I'm a crashaholic!",
	"Someone set us up the derp!",
	"Sorry I crashed! Here's one hug-ticket to redeem at your nearest Kd: [~~HUG~~]",
	"U wot m8? You just crashed me!",
	"Sorry D: I didn't mean to crash!",
	"<-- ded",
	"I'm sorry, but I can't do that Dave.",
	"KdBot has experienced a fatal error, and has crashed. Please leave a bug report at 'ERR: undefined'.",
	"Error: Unknown behaviour detected in nearby hooman beans. Rebooting...",
	"Did you... Di- did you just CRASH me!? How DARE you!?!?",
	"Error 404: Crash report not found!",
	"How to Create a bot: Do the opposite of whatever Kd is doing.",
	"How to crash a bot: Do whatever you just did again. Thanks,",
	"Stop it! That tickles!",
	"KdBot has encountered an unexpected error, and has been shut down to prevent further damage to your chat. Please contact Kd with this code: 0x1689354",
	"You know the error message with the one code? Yeah that means nothing. This was a crash, by the way.",
	"Error 404: Evil plans not found. Generating new...",
	"Error: "+configuration.pointName+" database file not found. Generating new! Kappa (I crashed!)",
	"Kd was here!",
	"Minecraft-style 'Witty Comment' not available :("
]

procArgs = process.argv;
function crashed() {
	if (procArgs[2]) {
		if (Number(procArgs[2]) <= 3) {
			var line = rand.pick(engine,crashlines);
			bot.say('#'+streamer,line);
		}
	}
}
