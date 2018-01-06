'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {
    DATABASE_URL,
    PORT
} = require('./config');
const {
    BlogPost
} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());





//if any of the endpoints fail because of an internal server error, they should log the error and return a 500 status code along with a message like "Internal server error".
//use git and github yo track changes





//Get /posts
//send back all posts in database
//each post should be an object that looks like: {
//          "title": "some title",
//          "content": "a bunch of amazing words",
//          "author": "Sarah Clarke",
//          "created": "1481322758429"
// }
app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .then(posts => {
            res.json({
                posts: post.map(
                    (post) => post.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});



//GET /posts/:id
//send back a single post with :id if it exists, using the schema desrcirbed above
app.get('/post/:id', (req, res) => {
    BlogPost.
    findById(req.params.id)
        .then(post => res.json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            })
        });
});


//POST /posts
//endpoint for creating new blog psots
//expects request body to contain a JSON object like this:   {
//              "title": "some title",
//              "content": "a bunch of amazing words",
//              "author": {
//              "firstName": "Sarah",
//              "lastName": "Clarke"
//        }
//  }
//validates the request body includes title, content, and author, returns a 400 status code and helpful error message if one of these is missing
//should return the new post(using same key/value pairs as the posts returned by GET /posts)

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requriedFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message)
        }
    }
    BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(blogPost => res.status(201).json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            })
        });
});

//PUT /posts/:id
//endpoint that allows you to update the title, content, snd author fields.
//expects request body to contain a JSON object like this (note that this would only update the title — if you wanted to update content or author, you'd have to send those over too):

//{
//    "id": "ajf9292kjf0",
//        "title": "New title"
//}
//the id property in the request body must be there.
//if the id in the URL path (/posts/:id) and the one in the request body don't match, it should return a 400 status code with a helpful error message.
//it should return the updated object, with a 200 status code.
app.put('/posts', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (`Request path id (${req.params.id}) and request body id ` + `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpate[field] = req.body[field];
        }
    });

    BlogPost
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

//DELETE /posts/:id
//allows you to delete a post with a given id.
//responds with a 204 status code, but no content.

app.delete('/post/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});



app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

//closeServer needs access to a server object, but that only gets created
//when "runServer" runs, so we declare "server" HERE, then assign a value to it in run
let server;

//create function that connects to our database
//then start the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, {
            useMongoClient: true
        }, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log('Your app is listening on port ${port}');
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}


// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {
    runServer,
    app,
    closeServer
};





//app.get('/posts', (req, res) => {
//  BlogPost
//    .find()
//    .then(posts => {
//      res.json(posts.map(post => post.serialize()));
//    })
//    .catch(err => {
//      console.error(err);
//      res.status(500).json({ error: 'something went terribly wrong' });
//    });
//});
//
//app.get('/posts/:id', (req, res) => {
//  BlogPost
//    .findById(req.params.id)
//    .then(post => res.json(post.serialize()))
//    .catch(err => {
//      console.error(err);
//      res.status(500).json({ error: 'something went horribly awry' });
//    });
//});


//
//app.post('/posts', (req, res) => {
//  const requiredFields = ['title', 'content', 'author'];
//  for (let i = 0; i < requiredFields.length; i++) {
//    const field = requiredFields[i];
//    if (!(field in req.body)) {
//      const message = `Missing \`${field}\` in request body`;
//      console.error(message);
//      return res.status(400).send(message);
//    }
//  }
//
//  BlogPost
//    .create({
//      title: req.body.title,
//      content: req.body.content,
//      author: req.body.author
//    })
//    .then(blogPost => res.status(201).json(blogPost.serialize()))
//    .catch(err => {
//      console.error(err);
//      res.status(500).json({ error: 'Something went wrong' });
//    });
//
//});
//
//
//app.delete('/posts/:id', (req, res) => {
//  BlogPost
//    .findByIdAndRemove(req.params.id)
//    .then(() => {
//      res.status(204).json({ message: 'success' });
//    })
//    .catch(err => {
//      console.error(err);
//      res.status(500).json({ error: 'something went terribly wrong' });
//    });
//});
//
//
//app.put('/posts/:id', (req, res) => {
//  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//    res.status(400).json({
//      error: 'Request path id and request body id values must match'
//    });
//  }
//
//  const updated = {};
//  const updateableFields = ['title', 'content', 'author'];
//  updateableFields.forEach(field => {
//    if (field in req.body) {
//      updated[field] = req.body[field];
//    }
//  });
//
//  BlogPost
//    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
//    .then(updatedPost => res.status(204).end())
//    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
//});
//
//app.delete('/:id', (req, res) => {
//  BlogPost
//    .findByIdAndRemove(req.params.id)
//    .then(() => {
//      console.log(`Deleted blog post with id \`${req.params.ID}\``);
//      res.status(204).end();
//    });
//});
//
//
//app.use('*', function (req, res) {
//  res.status(404).json({ message: 'Not Found' });
//});
//
//// closeServer needs access to a server object, but that only
//// gets created when `runServer` runs, so we declare `server` here
//// and then assign a value to it in run
//let server;
//
//// this function connects to our database, then starts the server
//function runServer(databaseUrl = DATABASE_URL, port = PORT) {
//  return new Promise((resolve, reject) => {
//    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
//      if (err) {
//        return reject(err);
//      }
//      server = app.listen(port, () => {
//        console.log(`Your app is listening on port ${port}`);
//        resolve();
//      })
//        .on('error', err => {
//          mongoose.disconnect();
//          reject(err);
//        });
//    });
//  });
//}
//
// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {
    runServer,
    app,
    closeServer
};
