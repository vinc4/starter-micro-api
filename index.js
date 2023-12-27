const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const mongoURI = "mongodb+srv://munashemap95:2NQrwHdnBmSx8OdE@cluster0.d494s66.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoURI);

let db; // Initialize db variable

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('test');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

// Call connectToDatabase before using db
connectToDatabase();

// Test API endpoint to check MongoDB connection status
app.get("/test-connection", async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: 'MongoDB connection is successful.' });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'MongoDB connection failed.' });
  }
});

app.get("/items/:my_item", async (req, res) => {
  let my_item = req.params.my_item;
  let item = await db.collection("my_collection").findOne({ my_item: my_item });
  return res.json(item);
});

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
    const response = await axios.get(`https://api.unsplash.com/search/photos?query=${term}&per_page=${numberOfImages}&client_id=${apiKey}`);
    const data = response.data;

    data.results.forEach(result => {
      const onlineApiResult = {
        term: term,
        content: result.description ? result.description : 'Image from Unsplash',
        imageUrl: result.urls.regular
      };
      onlineApiResults.push(onlineApiResult);
    });
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
  }

  return onlineApiResults;
}

async function saveToDatabase(results) {
  await db.collection('searchResults').insertMany(results);
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
