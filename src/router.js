import { app } from "./config";
import { getPlayers } from "./services/PlayerService";

// https://kaffeine.herokuapp.com/
app.get("/", async (req, res) => {
  console.log("!! jee index");
  res.send("OK");
});

app.get("/players", async (req, res) => {
  console.log("!! jee");
  const players = await getPlayers();
  res.json(players);
});
