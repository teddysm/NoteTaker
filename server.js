// import required libraries and dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
// npm package for generating unique ids
const uid = require('uniqid');
// make program deployable with Heroku
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET request for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET request when user wants to start adding notes
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET request for notes
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err){
      console.error(err);
    }
    else{
      const notes = JSON.parse(data);
      res.status(200).json(notes);
      console.log(`${req.method} request received to retrieve notes`)
    }
  })
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If both note title and note text exists, we will save that note
  if (title && text) {
    const newNote = {
      title,
      text,
      id: uid()
    }
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if(err){
        console.error(err)
      }
      else{
        const parsedNote = JSON.parse(data);
        parsedNote.push(newNote);
        fs.writeFile('./db/db.json', JSON.stringify(parsedNote, null, 4), (writeErr) => 
          writeErr ? console.error(writeErr) : console.info('Notes updated!'));
      }
    });
    const response = {
      status: 'success',
      body: newNote,
    };
    console.log(response);
    res.status(201).json(response);
  } else{
    res.status(500).json('Error in adding a note');
  }})

// DELETE request to delete a note
app.delete('/api/notes/:id', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err){
      console.error(err);
      res.sendStatus(500);
      return;
    }
    const notes = JSON.parse(data);
    const filteredNotes = notes.filter(note => note.id !== req.params.id);
    fs.writeFile('./db/db.json', JSON.stringify(filteredNotes), err => {
      if(err){
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});

// tell the server to listen in on port 3001
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);