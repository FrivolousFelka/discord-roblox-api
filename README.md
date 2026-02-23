# discord-roblox-api  
Built from scraps in a cave, this is discord-roblox-api. It displays your Discord username live above your head in a Roblox game.  

## Overview  

This project acts as a bridge between Roblox and Discord.

When a player joins the Roblox game, their **Roblox username** is written to the database via:

```
/api/discord?roblox=<username>
```

At this stage, only the Roblox username exists in the database — no Discord account is linked yet.

The user is then prompted to:

1. Join the Discord server  
2. Run `/setup <roblox username>` or `!setup <roblox username>`  

(I wasn't going to wait for Discord slash commands to propagate, so we have !setup)

When `/setup` or `!setup` is executed:

- The bot looks up the provided Roblox username in the database  
- If found, it writes the user’s **Discord ID** to that record  
- The Roblox username is not overwritten — only the Discord ID is attached  

After linking, when the game refetches:

```
/api/discord?roblox=<username>
```

The API now returns:

- Discord username  
- Discord global name  
- Discord Status

This data is then displayed live in the Roblox game above the player’s character.
using "DaCord" in ServerScripts 



---
## notes 
I am half sure that in order for roblox to actually call the api, it needs to be SSL certified.
Your bot will also need Presence Intent, Server Members Intent, Message Content Intent, or actually im not even entirely sure, just toggle it all on, who actually gives a fuck.
This also probably scales really poorly 🤷‍♂️


---

## note notes
Some additional things that are possible, although not demonstrated in this repo is 
For example, you can return user roles, Nitro status, badges (HypeSquad, etc.). That means you could reward people in-game based on things like having the Server Booster role in your Discord.
This is just a proof of concept, really. I understand this execution isn't production-grade.



PROBABLY against Roblox TOS?  
I don’t care. I built this in 3 hours.

I am completely aware of the potential issues with this, but I just don't care.
---

## demo 
<p align="center">
  <img src="/demo.gif" width="600">
</p>
