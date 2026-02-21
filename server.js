const express = require("express");
const app = express();
const PORT = 3000;

const client = require('./routes/bot');
const discordRoute = require('./routes/discord');
const { RobloxUser } = require('./routes/schema'); 


app.use("/api", discordRoute);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);

});
