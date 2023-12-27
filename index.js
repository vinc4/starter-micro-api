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

// Call connectToDatabase before using db
connectToDatabase();

// Frontend search API endpoint
app.get('/search', async (req, res) => {
  const term = req.query.term;

  try {
    // Check local database first
    const localResult = await searchLocalDatabase(term);

    if (localResult) {
      res.json(localResult);
    } else {
      // If not found locally, search online
      const onlineResult = await searchOnlineAPI(term);

      // Save online result to local database
      if (onlineResult) {
        await saveToDatabase(onlineResult);
      }

      res.json(onlineResult);
    }
  } catch (err) {
    console.error('Error processing search request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


async function searchLocalDatabase(term) {
  try {
    const results = await db.collection('searchResults').find({ term }).toArray();

    if (results.length > 0) {
      console.log(`Found data for term "${term}":`, results);
      return results;
    } else {
      console.log(`No data found for term "${term}".`);
      return null;
    }
  } catch (error) {
    console.error('Error while searching local database:', error);
    throw error; 
  }
}


async function searchOnlineAPI(term) {
  const apiKey = 'hVsVe3x4PSwWTr9aEongv2eW1RF75RPbzjFmlFxYhM0'; // Replace with your actual Unsplash API key
  const numberOfImages = 9;
  const onlineApiResults = [];

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${term}&per_page=${numberOfImages}&client_id=${apiKey}`);
    const data = await response.json();

    data.results.forEach(result => {
      const onlineApiResult = {
        term: term,
        content: result.description ? result.description : 'Image from Unsplash', // Use description if available, otherwise default text
        imageUrl: result.urls.regular
      };
      onlineApiResults.push(onlineApiResult);
    });
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    // Handle errors appropriately, e.g., display an error message to the user
  }

  return onlineApiResults;
}



function saveToDatabase(results) {
  db.collection('searchResults').insertMany(results);
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
