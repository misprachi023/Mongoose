const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/Mongoose.movieStore', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const movieSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  
});
const Movie = mongoose.model('Movie', movieSchema);
app.use(bodyParser.json());


app.post('/movies', async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/movies', async (req, res) => {
  try {
    let query = {};
   
    if (req.query.title) {
      query.title = new RegExp(req.query.title, 'i');
    }
    
    if (req.query.rating) {
      query.rating = req.query.rating;
    }
   
    if (req.query.q) {
      query.title = new RegExp(req.query.q, 'i');
    }
   
    let sortField = req.query.sortBy || 'title';
    let sortOrder = req.query.sortOrder || 'asc';
    let sortObject = {};
    sortObject[sortField] = sortOrder === 'desc' ? -1 : 1;
    const movies = await Movie.find(query).sort(sortObject);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.totalCount = await Movie.countDocuments(query);
    if (endIndex < movies.length) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }
    results.movies = movies.slice(startIndex, endIndex);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/movies/:id', async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/movies/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

