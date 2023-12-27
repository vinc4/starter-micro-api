const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const mongoURI = "mongodb+srv://munashemap95:2NQrwHdnBmSx8OdE@cluster0.d494s66.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoURI);

app.get("/items/:my_item", async (req, res) => {
    let my_item = req.params.my_item;
    let item = await client.db("test")
                .collection("searchResults")
                .findOne({my_item: my_item})

    return res.json(item);
});

client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
    // Connection to MongoDB is successful, listen for requests
    app.listen(PORT, () => {
        console.log("Server is running on http://localhost:" + PORT);
    });
});
