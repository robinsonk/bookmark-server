const express = require('express')
const app = express();
const uuid = require('uuid/v4');
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const logger = require('../logger')

app.use(express.json());

const bookmarks = [
    {
      id: '1',
      title: "Portfolio",
      url: "https://kileen.codes/",
      rating: "5",
      description: "Kileen's dev portfolio"
    },
    {
      id: '2',
      title: "JOT",
      url: "https://jot-noteapp.netlify.com/",
      rating: "4",
      description: "Jot note-taking app"
    }
]

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.send(bookmarks)
    })

    app.use(function errorHandler(error, req, res, next) {
    let response
        if (NODE_ENV === 'production') {
         response = { error: { message: 'Oops! Server error' } }
       } else {
         console.error(error)
         response = { message: error.message, error }
       }
       res.status(500).json(response)
})

bookmarkRouter
  .route('/bookmark')
  .post(bodyParser, (req, res) => {
    const { title, url, rating, description  } = req.body;
    
    if (!title) {
        logger.error('A title for your bookmark is required');
        return res
        .status(400)
        .send('Invalid data - missing title');
    }
    
    if (!url) {
        logger.error('A URL for your bookmark is required');
        return res
        .status(400)
        .send('Invalid data - missing URL');
    }
    
    if (!rating) {
        logger.error('A rating for your bookmark is required');
        return res
        .status(400)
        .send('Invalid data - missing the rating');
    }
    
    if (!description) {
        logger.error('A description for your bookmark is required');
        return res
        .status(400)
        .send('Invalid data - missing description');
    }

    const id = uuid();

    const bookmark = {
        id,
        title,
        url,
        rating,
        description
    };

    bookmarks.push(bookmark)

    logger.info(`A new bookmark with id ${id} has been created`);
    res
        .status(201)
        .location(`http://localhost:800/bookmark/${id}`)
})

bookmarkRouter
  .route('/bookmark/:id')
  .get((req, res) => {
    const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);

  // make sure we found a card
  if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res
      .status(404)
      .send('Sorry, Bookmark Not Found');
  }

  res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

  const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

  if (bookmarkIndex === -1) {
    logger.error(`Sorry, bookmark with id ${id} was not found`);
    return res  
      .status(404)
      .send(`Sorry, Bookmark Not Found`);
  }

  bookmarks.splice(bookmarkIndex, 1);

  logger.info(`Bookmark with id ${id} has been deleted`);
  res
    .status(204)
    .end();
})

module.exports = bookmarkRouter