const express = require('express')
const app = express();
const xss = require('xss')
const BookarkService = require('./bookmarks-service')
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const logger = require('../logger')

app.use(express.json());

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    BookarkService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
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
  .post(bodyParser, (req, res, next) => {

    const { title, url, rating, description } = req.body;

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

    const bookmark = {
      title,
      url,
      rating,
      description
    };

    BookarksService.insertBookmark(
      req.app.get('db'),
      bookmark
    )
      .then(bookmark => {
        logger.info(`A new bookmark with id ${bookmark.id} has been created`);
        res
          .status(201)
          .json(serializeBookmark(bookmark))
          .location(`http://localhost:800/bookmark/${bookmark.id}`)
      })
      .catch(next)
  })

bookmarkRouter
  .route('/bookmark/:id')
  .get((req, res) => {
    const { id } = req.params;
    BookarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {

        // make sure we found a card
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Sorry, Bookmark Not Found');
        }

        res.json(bookmark);
      })
  })

  .delete((req, res) => {
    const { id } = req.params;

    BookmarkService.deleteBookmark(
      req.app.get('db'),
      id
    )
      .then(rows => {
        logger.info(`Bookmark with id ${id} has been deleted`);
        res
          .status(204)
          .end();
      })

    if (bookmarkIndex === -1) {
      logger.error(`Sorry, bookmark with id ${id} was not found`);
      return res
        .status(404)
        .send(`Sorry, Bookmark Not Found`);
    }
  })

module.exports = bookmarkRouter