const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
// const uid = require('uid');
const uid = require('uniqid');
const PORT = 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);


app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET request for reviews
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err){
      console.error(err);
    }
    else{
      const notes = JSON.parse(data);
      res.status(200).json(notes);
      console.log(`${req.method} request received to get note`)
    }
  })
});

// POST request to add a review
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

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
    res.status(500).json('Error in posting review');
  }})

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

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);