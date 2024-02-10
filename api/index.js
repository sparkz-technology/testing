import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/create", (req, res) => {
  const dateArray = req.body;
  console.log(dateArray);
  // create a new UUID for each entry
  const NEW_UUID = uuidv4();
  console.log(NEW_UUID);
  // send a response to the client
  res.status(201).send({ NEW_UUID: NEW_UUID, UUID: dateArray.UUID });
});

app.post("/check", (req, res) => {
  const { NEW_UUID, UUID } = req.body;
  if (!NEW_UUID) {
    return res.status(400).send({ error: "UUID is required" });
  }
  res.status(200).send({ UUID: UUID });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
