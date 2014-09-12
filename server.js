// Dependencies
var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose');

// Set up server
var app = express()
  , server = http.createServer(app);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.bodyParser());
app.use(express.logger());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Models
var QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, index: true } // e.g. "What is 2+4?"
, answer: { type: String }
}), Question = mongoose.model('Question', QuestionSchema);

mongoose.connect('localhost');

// Routes
app.get('/', function(req, res) {
  res.redirect('/list');
});

// render list of questions
app.get('/list', function(req, res) {
  Question.find(function(find_err, questions) {
    if (find_err) {
      console.error(find_err);
      return res.status(500).end();
    }
    res.render('list', {
      questions: questions
    });
  })
});

// render question details
app.get('/question/:_id', function(req, res) {
  var _id = req.params._id;
  if (typeof _id !== 'string') {
    console.error('GET /question route called without _id!');
    return res.status(500).end();
  }
  Question.findById(_id, function(find_err, question) {
    if (find_err) {
      console.error(find_err);
      return res.status(500).end();
    }
    else if (question === null) {
      console.error('No question found with _id ' + _id + '!');
      return res.status(500).end();
    }
    res.render('question', {
      question: question
    });
  });
});

// add a new question
app.post('/question', function(req, res) {
  var text = req.body.text;
  if (typeof text !== 'string') {
    console.error('POST /question route called without text!');
    return res.status(500).end();
  }
  new Question({ text: text }).save(function(save_err) {
    if (save_err) {
      console.error(save_err);
      return res.status(500).end();
    }
    res.redirect('/list');
  });
});

// change a question's answer
app.post('/answer/:_id', function(req, res) {
  var _id = req.params._id
    , answer = req.body.answer;
  if (typeof _id !== 'string') {
    console.error('PUT /question route called without _id!');
    return res.status(500).end();
  }
  else if (typeof answer !== 'string') {
    console.error('PUT /question route called without answer');
    return res.status(500).end();
  }
  Question.findById(_id, function(find_err, question) {
    if (find_err) {
      console.error(find_err);
      return res.status(500).end();
    }
    else if (question === null) {
      console.error('No question found with _id ' + _id + '!');
      return res.status(500).end();
    }
    question.answer = answer;
    question.save(function(save_err) {
      if (save_err) {
        console.error(save_err);
        return res.status(500).end();
      }
      res.redirect('/question/' + _id);
    });
  });
});

// Start server
server.listen(8080);
console.log('server listening on port %d in %s mode',
            server.address().port, app.settings.env);