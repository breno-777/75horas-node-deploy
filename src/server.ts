const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.get("/", async (re: any, res: any) => {
  return res.json("From backend side");
});

app.get("/updates", async (req: any, res: any) => {
  const sql = "SELECT * FROM updates";
  db.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(process.env.PORT || 8081, () => {
  console.log("listening");
});
