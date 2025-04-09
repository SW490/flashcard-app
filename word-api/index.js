const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cardRoutes = require("./routes/cards");

const app = express();
const PORT = 8421;

app.use(cors());
app.use(bodyParser.json());
app.use("/cards", cardRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
