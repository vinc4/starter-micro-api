const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI
const mongoURI = "mongodb+srv://munashemap95:2NQrwHdnBmSx8OdE@cluster0.d494s66.mongodb.net/?retryWrites=true&w=majority";

let client;
let db;

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db('test');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

connectToDatabase();

// Test database connection endpoint
app.get('/test-connection', (req, res) => {
  if (db) {
    res.json({ message: 'MongoDB connection is successful.' });
  } else {
    res.status(500).json({ error: 'MongoDB connection failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
