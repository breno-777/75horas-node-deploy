const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");

const app = express();

app.use(compression());
app.use(bodyParser.json({ limit: "6mb" }));
app.use(bodyParser.urlencoded({ limit: "6mb", extended: true }));
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

const dbGuestUpdates = mysql.createConnection({
  host: process.env.DB_HOST,
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

// Get Updates from data table with guest
app.get("/updates", async (req: any, res: any) => {
  const sql = "SELECT * FROM updates";
  dbGuestUpdates.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Get Collaborators from data table with guest
app.get("/collaborators", async (req: any, res: any) => {
  const sql = "SELECT * FROM collaborators";
  dbGuestCollaborators.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Get Updates from data table with admin
app.get("/admin/updates", async (req: any, res: any) => {
  const sql = "SELECT * FROM updates";
  dbAdminUpdates.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Get Collaborators from data table with admin
app.get("/admin/collaborators", async (req: any, res: any) => {
  const sql = "SELECT * FROM collaborators";
  dbAdminCollaborators.query(sql, (err: any, data: any) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Post Update from data table with admin
app.post("/admin/updates/post", cors(), async (req: any, res: any) => {
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

// Post Collaborator from data table with admin
app.post("/admin/collaborators/post", cors(), async (req: any, res: any) => {
  const newData = req.body;
  if (!newData.banner || !newData.title) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const values = [
    newData.banner,
    newData.title,
    newData.url,
    newData.participating || false,
  ];

  const sql = `INSERT INTO collaborators(banner, title, participating, url) VALUES (?, ?, ?, ?)`;
  dbAdminCollaborators.query(sql, values, (err: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error inserting data" });
    }
  });
});

// Delete Update from data table with admin
app.delete("/admin/updates/delete", cors(), async (req: any, res: any) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing required field: id" });
  }

  try {
    const sql = `DELETE from updates WHERE id = ?`;
    await dbAdminUpdates.query(sql, [id]);
    res.json({ message: "Update deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting update from data" });
  }
});

// Delete Collaborator from data table with admin
app.delete(
  "/admin/collaborators/delete",
  cors(),
  async (req: any, res: any) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing required field: id" });
    }

    try {
      const sql = `DELETE from collaborators WHERE id = ?`;
      await dbAdminCollaborators.query(sql, [id]);
      res.json({ message: "Collaborator deleted successfully" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error deleting collaborator from data" });
    }
  }
);

app.listen(process.env.PORT, () => {
  console.log("listening");
});