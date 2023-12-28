const express = require("express");
const path = require("path");
const app = express();

app.set("secret", "43dsabreqzggrehj3fds");

app.use(require("cors")());
app.use(express.json());
app.use(
  "/admin",
  express.static(path.posix.join(__dirname, "..", "/admin"))
);
app.use(
  "/",
  express.static(path.posix.join(__dirname, "..", "/web"))
);
app.use(
  "/uploads",
  express.static(path.posix.join(__dirname, "..", "uploads"))
);

require("./plugins/db")(app);
require("./routes/admin")(app);
require("./routes/web")(app);


app.listen(3000, () => {
  console.log("http://localhost:3000");
});
