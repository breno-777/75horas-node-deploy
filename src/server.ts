const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const dbGuestUpdates = mysql.createConnection({
  host: "ns96.hostgator.com.br",
  user: process.env.DB_GUEST,
  password: process.env.DB_GUEST_PASSWORD,
  database: process.env.DB_UPDATES,
});

const dbGuestCollaborators = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_GUEST,
  password: process.env.DB_GUEST_PASSWORD,
  database: process.env.DB_COLLABORATORS,
});

const dbAdminUpdates = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_ADMIN,
  password: process.env.DB_ADMIN_PASSWORD,
  database: process.env.DB_UPDATES,
});

const dbAdminCollaborators = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_ADMIN,
  password: process.env.DB_ADMIN_PASSWORD,
  database: process.env.DB_COLLABORATORS,
});

app.get("/", async (re: any, res: any) => {
  return res.json("From backend side");
});

app.get("/updates", async (req: any, res: any) => {
  const sql = "SELECT * FROM updates";
  dbGuestUpdates.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/collaborators", async (req: any, res: any) => {
  const sql = "SELECT * FROM collaborators";
  dbGuestCollaborators.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/updates", async (req: any, res: any) => {
  const sql = "SELECT * FROM updates";
  dbAdminUpdates.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/collaborators", async (req: any, res: any) => {
  const sql = "SELECT * FROM collaborators";
  dbAdminCollaborators.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/admin/updates/post", async (req: any, res: any) => {
  const newData = req.body;
  console.log(newData);

  if (!newData || !newData.title || !newData.description || !newData.banner) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const values = [
    newData.title,
    newData.description,
    newData.date,
    newData.steam || false,
    newData.epicgames || false,
    newData.xbox || false,
    newData.playstation || false,
    newData.banner,
    newData.url || "",
  ];

  const sql = `INSERT INTO updates(title, description, date, steam, epicgames, xbox, playstation, banner, url ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  dbAdminUpdates.query(sql, values, (err: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error inserting data" });
    }
  });
});

app.post("/admin/collaborators/post", async (req: any, res: any) => {
  const newData = req.body;
  if (!newData.banner || !newData.title) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const values = [
    newData.banner,
    newData.title,
    newData.participating || false,
  ];

  const sql = `INSERT INTO collaborators(banner, title, participating) VALUES (?, ?, ?)`;
  dbAdminCollaborators.query(sql, values, (err: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error inserting data" });
    }
  });
});

app.listen(process.env.PORT || 8081, () => {
  console.log("listening");
});
