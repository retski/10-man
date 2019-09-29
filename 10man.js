const Discord = require('discord.js')
const client = new Discord.Client()
const Enmap = require("enmap");
client.elo = new Enmap({name: "elo"});
gameVar = 0;

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
	// List servers the bot is connected to
    console.log("Servers:")
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name)


	var generalChannel = client.channels.get("549019354029752351") // Replace with known channel ID
    generalChannel.send({embed: {
    color: 11347133,
    author: {
      name: client.user.username,
    },
    title: "Beginning a game",
    description: "Type +join to join the current game.",
    fields: [{
        name: "Leaving",
        value: "You can also leave the current game by doing +leave"
      },
    ],
    footer: {
      text: "by retski#8282"
    }
  }
});

    })
})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
        return
    }

    if (receivedMessage.guild) {
      client.elo.ensure(`${receivedMessage.guild.id}-${receivedMessage.author.id}`, {
        user: receivedMessage.author.id,
        guild: receivedMessage.guild.id,
        elo: 0,
      });

    if (receivedMessage.content.startsWith("+")) {
        processCommand(receivedMessage)
    }
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand)

  if (primaryCommand == "leave") {
    if(receivedMessage.member.roles.find("name", "In-Game")){
      let role = receivedMessage.guild.roles.find(t => t.name == 'In-Game')
      gameVar--
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "You have left the current game",
      fields: [{
          name: "Players Remaining",
          value: gameVar
        },
      ],
      footer: {
        text: "by retski#8282"
      }
    }
  });
      receivedMessage.member.removeRole(role.id);

    }
    else {
      receivedMessage.channel.send("You aren't in the on-going game, do +join.")
    }
  }
	if (primaryCommand == "join") {
		joinCommand(arguments, receivedMessage)
		}
  if (primaryCommand == "reset") {
    if (receivedMessage.member.hasPermission('ADMINISTRATOR')) {
      gameVar = 0;
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "Resetting Game",
      description: "Game Total: " + gameVar,
      footer: {
        text: "by retski#8282"
      }
    }
  });
      let role = receivedMessage.guild.roles.find(t => t.name == 'In-Game')
      receivedMessage.guild.members.forEach(member => {
      if(!member.roles.find(t => t.name == 'In-Game')) return;
      member.removeRole(role.id);
          console.log(`Removed role from user ${member.user.tag}!`);
       })
    }
    else {
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "Error",
      description: "+reset is admin only",
      footer: {
        text: "by retski#8282"
      }
    }
  });
    }
  }
  if (primaryCommand == "current") {
    receivedMessage.channel.send({embed: {
    color: 11347133,
    author: {
      name: client.user.username,
    },
    title: "Current",
    description: "Waiting to play: " + gameVar,
    footer: {
      text: "by retski#8282"
    }
  }
});
    }
  if (primaryCommand == "help") {
      receivedMessage.author.send("Commands\n+join - Connects you to the current queue.\n +leave - Makes you leave the current queue.\n+elo - displays your current elo standings.\n+addelo - adds x elo to specified player. : admin only\n+takeelo - removes x elo from specified player. : admin only\n+reset - Resets the current queue. : admin only\n+done - removes all the permissions related to game channels : admin only")
    }
  if (primaryCommand == "elo") {
     const key = `${receivedMessage.guild.id}-${receivedMessage.author.id}`;
     return receivedMessage.channel.send(`ELO: ${client.elo.get(key, "elo")}`);
  }
  if (primaryCommand == "done") {
    if(!receivedMessage.member.hasPermission('ADMINISTRATOR')) return
     let role = receivedMessage.guild.roles.find(t => t.name == 'In-Game')
     receivedMessage.guild.members.forEach(member => {
     if(!member.roles.find(t => t.name == 'In-Game')) return;
     member.removeRole(role.id);
         console.log(`Removed role from user ${member.user.tag}!`);
      })
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "Game Finished",
      description: "Removing all roles",
      footer: {
        text: "by retski#8282"
      }
    }
  });
    }
  if (primaryCommand == "addelo") {
    if (receivedMessage.member.hasPermission('ADMINISTRATOR')) {
      const user = receivedMessage.mentions.users.first() || client.users.get(arguments[0]);
      client.elo.ensure(`${receivedMessage.guild.id}-${user.id}`, {
          user: receivedMessage.author.id,
          guild: receivedMessage.guild.id,
          elo: 0,
   });
      if(!user) return receivedMessage.reply("You must mention a user.");

      const eloToAdd = parseInt(arguments[1], 10);
      if(!eloToAdd)
        return receivedMessage.reply("Input an amount.")
   let userElo = client.elo.get(`${receivedMessage.guild.id}-${user.id}`, "elo");
   userElo += eloToAdd;

  client.elo.set(`${receivedMessage.guild.id}-${user.id}`, userElo, "elo")
  receivedMessage.channel.send(`${user.tag} has been given ${eloToAdd} elo and now stands at ${userElo}.`);
 }
}
  if (primaryCommand == "takeelo") {
    if (receivedMessage.member.hasPermission(`ADMINISTRATOR`)) {
      const user = receivedMessage.mentions.users.first() || client.users.get(arguments[0]);
      if(!user) return receivedMessage.reply("You must mention someone or give their ID.");

      const eloToRemove = parseInt(arguments[1], 10);
      if(!eloToRemove)
        return receivedMessage.reply("Input an ammount.")

        client.elo.ensure(`${receivedMessage.guild.id}-${user.id}`, {
            user: receivedMessage.author.id,
            guild: receivedMessage.guild.id,
            elo: 0,
   });
   let userElo = client.elo.get(`${receivedMessage.guild.id}-${user.id}`, "elo");
   userElo -= eloToRemove;

   client.elo.set(`${receivedMessage.guild.id}-${user.id}`, userElo, "elo")
   receivedMessage.channel.send(`${user.tag} has lost ${eloToRemove} elo and now stands at ${userElo}.`);
    }
  }
  if (primaryCommand == "leaderboard") {
    const filtered = client.elo.filter( p => p.guild === receivedMessage.guild.id ).array();
     const sorted = filtered.sort((a, b) => b.elo - a.elo);

     const top10 = sorted.splice(0, 10);
     const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard")
    .setAuthor(client.user.username, client.user.avatarURL)
    .setDescription("Top 10 players with the highest ELO")
    .setColor(0x00AE86);
  for(const data of top10) {
    embed.addField(client.users.get(data.user).tag, `${data.elo} ELO`);
  }
  return receivedMessage.channel.send({embed});
    }
		else {
			return
		}



	function joinCommand(arguments, receivedMessage) {
    let ingame = receivedMessage.guild.roles.get("603710551935287326");
    let member = receivedMessage.author.id;
    if (receivedMessage) {
		if (gameVar == 0) {
			gameVar++
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "Creating a new game",
      description: "Added 1 to the game.",
      footer: {
        text: "by retski#8282"
      }
    }
  });
      receivedMessage.member.addRole(ingame).catch(console.error);
		}
		else if (gameVar == 9){
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "10 Players Ready",
      description: "Join Waiting to Play VC.",
      footer: {
        text: "by retski#8282"
      }
    }
  });
			gameVar = 0;
      receivedMessage.member.addRole(ingame).catch(console.error);
		}
		else {
			gameVar++
      receivedMessage.channel.send({embed: {
      color: 11347133,
      author: {
        name: client.user.username,
      },
      title: "Added 1 to the game.",
      description: "Total Players: " + gameVar,
      footer: {
        text: "by retski#8282"
      }
    }
  });
      receivedMessage.member.addRole(ingame).catch(console.error);
		}
	} else {
		}
}
}

bot_secret_token = "NjAyOTc1ODAzNzEzNzgxODEw.XTYseQ.JvFlkTGx1G27d9WT5Qj0pW5Abgw"

client.login(bot_secret_token)
