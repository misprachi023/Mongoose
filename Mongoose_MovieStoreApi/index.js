const express=require ("express");
const PORT = 8080;
const app=express();
const mongoose=require("mongoose");
const {Schema}=mongoose;
app.use(express.json());
const movieSchema=new Schema({
    id:Number,
    title:String,
    rating:Number,
    genre:Array,
    related:Array,
},{versionKey:false});
const Movie= mongoose.model("Movie", movieSchema);
app.get("/", async(req,res)=>{
    try {
        let query = {};
        // Filter by title
        if (req.query.title) {
          query.title = { $regex: new RegExp(req.query.title, "i") };
        }
        // Filter by rating
        if (req.query.rating) {
          query.rating = { $gte: parseFloat(req.query.rating) };
        }
        // Search a movie by name
        if (req.query.q) {
          query.title = { $regex: new RegExp(req.query.q, "i") };
        }
        let sortQuery = {};
        // Sort by a field
        if (req.query.sortBy) {
            const sortOrder=req.query.sortOrder=== 'desc' ? -1:1;
            sortQuery[req.query.sortBy] = sortOrder;
        }
        // Pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Fetch movies with the applied filters, sorting, and pagination
        const movies = await Movie.find(query)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit);
        res.json(movies);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});
app.post("/add", async(req,res)=>{
    try {
        const newMovie= new Movie(req.body)
        const result= await newMovie.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})
app.put('/update/:id', async (req, res) => {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedMovie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
app.delete('/delete/:id', async (req, res) => {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(204).json({message:"movie deleted successfully"});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
app.listen(PORT, async()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/movieStore").then(()=>{
        console.log("mongo db connected")
    }).catch((err)=>{
        console.log(err)
    })
    console.log(`server running on this ${PORT}`)
})