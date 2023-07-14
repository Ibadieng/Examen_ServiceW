const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 8080;

// Configuration de la connexion à la base de données
const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dayfinder",
});

app.use(express.json());

app.post("/dayfinder", async (req, res) => {
  const { date } = req.body;

  try {
    const formattedDate = formatDate(date);
    const dayOfWeek = getDayOfWeek(date);
    await saveHistory(formattedDate, dayOfWeek);

    res.json({
      date: formattedDate,
      dayOfWeek: dayOfWeek,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur s'est produite." });
  }
});


app.get("/dayfinder/historique", async (req, res) => {
  try {
    const history = await getHistory();

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur s'est produite." });
  }
});

function formatDate(date) {
  const [day, month, year] = date.split("-");

  return `${day}/${month}/${year}`;
}

function getDayOfWeek(date) {
  const [day, month, year] = date.split("-");
  const dayOfWeek = new Date(year, month - 1, day).toLocaleString("fr-FR", {
    weekday: "long",
  });

  return dayOfWeek;
}

async function saveHistory(date, dayOfWeek) {
  await connection.execute(
    "INSERT INTO historique (searchDate, request, responseDate, responseDay) VALUES (?, ?, ?, ?)",
    [new Date(), date, date, dayOfWeek]
  );

  
}

async function getHistory() {
  const [rows] = await connection.execute("SELECT * FROM historique");

  return rows.map((row) => ({
    id: row.id,
    searchDate: row.searchDate,
    searchItems: {
      request: row.request,
      response: {
        date: row.responseDate,
        day: row.responseDay,
      },
    },
  }));
}

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});
