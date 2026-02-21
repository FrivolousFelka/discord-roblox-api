require('dotenv').config({ path: '../.env' });
const express = require('express');
const router = express.Router();
const client = require('./bot'); 
const { RobloxUser } = require('./schema');


const GUILD_ID = process.env.GUILD_ID;


router.get('/discord', async (req, res) => {
    const robloxName = req.query.roblox;
      const apiKey = req.query.apikey;
      if (!robloxName) return res.status(400).json({ success: false, error: "Missing 'roblox' parameter" });

      if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ success: false, error: "Invalid or missing API key" });
      }
      
    try {
        let robloxUser = await RobloxUser.findOne({ username: robloxName });
        console.log(`[DiscordAPI] DB lookup for "${robloxName}":`, robloxUser ? "found" : "not found");

        if (!robloxUser) {
            robloxUser = new RobloxUser({ username: robloxName });
            await robloxUser.save();
            return res.json({
                success: false,
                message: `Added **${robloxName}** to database, but no UID yet.`,
            });
        }

        const userId = robloxUser.uid;
        console.log(`[DiscordAPI] UID from DB:`, userId, "| Type:", typeof userId);

        if (!userId) {
            return res.json({
                success: false,
                message: `Roblox username **${robloxName}** is in DB but no UID linked yet.`,
            });
        }

        const mainGuild = await client.guilds.fetch(GUILD_ID);
        console.log(`[DiscordAPI] Guild fetched: ${mainGuild.name} (${mainGuild.id})`);

        const member = await mainGuild.members.fetch({ user: userId, force: true }).catch((err) => {
            console.error(`[DiscordAPI] Member fetch failed: ${err.message} | UID: ${userId}`);
            return null;
        });

        if (!member) return res.status(404).json({ success: false, error: "User not found in primary guild" });
        console.log(`[DiscordAPI] Member found: ${member.user.username} (${member.user.id})`);

        const user = member.user;
        const presence = member.presence || {};
        const clientStatus = presence.clientStatus || {};

        return res.json({
          success: true,
          data: {
          discord_user: {
            id: user.id,
            username: user.username,
            bot: user.bot,
            global_name: user.globalName || user.username,
            display_name: member.displayName,
            discord_status: presence.status || "offline",
            active_on_discord_web: Boolean(clientStatus.web),
            active_on_discord_desktop: Boolean(clientStatus.desktop),
            active_on_discord_mobile: Boolean(clientStatus.mobile),
            active_on_discord_embedded: false
        }
    }
});

    } catch (err) {
        console.error("[DiscordAPI] Internal error:", err);
        return res.status(500).json({ success: false, error: err.message || "Internal error" });
    }
});

module.exports = router;