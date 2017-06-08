var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

// connect to db

var db = mongoose.connect(process.env.MONGODB_URI);
var Movie = require("./modes/movie");
var Chats = require("./models/chats");


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

app.get('/', function(req,res) {
  res.send("Deployed");
});

// webhooks get query

app.get("/webhook", function(req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token"){
  console.log("Verified webhook");
  res.status(200).send(req.query['hub.challenge']);
} else {
  console.error('Verificatoin failed');
  res.sendStatus(403);
}
});
// webhooks Post handler

app.post("/webhook", function(req, res) {
  if (req.body.object == "page") {
    req.body.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        } else if (event.message) {
          processMessage(event);
        }
      });
    });
    res.sendStatus(200);
  }
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === 'Greeting') {
    request({
      url: 'https://graph.facebook.com/v2.6/' + sender.id,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: 'first_name'
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if(error) {
        console.log("Error getting user's name: " + error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hi" + name + ".";
      }
      var message = greeting + "My name is SP Harassment Bot"
      sendMessage(senderId, {text: message});
    });
  } else if (payload === " Correct") {
    sendMessage(senderId, {text: " Awesome! WHat would you like to find out? Enter 'plot', 'date', 'cast','director' "})
  } else if (payload === "Incorrect") {
    sendMessage(senderId, {text: "Oops! sorry about that. Try using the exact title of the move"});
  }
}

function sendMessage(recipientId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: { id: recipientId },
      message: message,
    }
  }, function(error, response, body ) {
    if(error) {
      console.log("Error sending message:" + response.error);
    }
  });
}

function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    console.log("Received message from senderId:" + senderId);
    console.log("Message is: " + JSON.stringify(message));

    if(message.text) {
      var formattedMsg = message.text.toLowerCase().trim();

      switch(formattedMsg) {
        case "plot":
        case "date":
        case "runtime":
        case "director":
        case: "cast":
        case: "rating":
          getMovieDetail(senderId, formattedMsg);
          break;

        default:
          findMovie(senderId, formattedMsg);
        }
    } else if (message.attachments) {
      sendMessage(senderId, {text: "Sorry, I don't understand"})
    }
  }
}

func getMovieDetail(userId, field) {
  Movie.findOne({userId: userId,}, function(err, movie){
    if(err) {
      sendMessage(userId, {text: "Something went wrong. Try again"});
    } else {
      sendMessage{userI , {text: movie[field]}};
    }
  });
}

function findMovie(userId, movieTitle) {
  request("http://www.omdbapi.com/?type=movie&amp;t=" + movieTitle, function (error, response, body) {
    if(!error &amp; &amp; response.statusCode === 200) {
      var movieObj = JSON.parse(body);
      if (movieObj.Response === "True") {
        var query = {user_id: userId};
        var update = {
          user_id: userId,
          title: movieObj.Title,
          plot: movieObj.Plot,
          date: movieObj.Released,
          runtime: movieObj.Runtime,
          director: movieObj.Director,
          cast: movieObj.Cast,
          rating: movieObj.imdbRating,
          poster_url: movieObj.Poster
        };
        var options = {upsert:true};
        Movie.findOneAndUpdate(query, ypdate, oprtions, function(err, mov) {
          if(err) {
            console.log("Database error: " + err);
          } else {
            message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                    title: movieObj.Title,
                    subtitle: "Is this the movie you are looking for"
                    image_url: movieObj.Poster === "N/A" ? "http://placehold.it/350x150": movieObj.Poster,
                    buttons: [{
                      type: "postback",
                      title: "Yes",
                      payload: "Correct"
                    }, {
                      type: "postback",
                      title: "No",
                      payload: "Incorrect"
                    }]
                  }]
                }
              }
            };
            sendMessage(userId, message);
          }
        });
      } else {
        console.log(movieObj.Error);
        sendMessage(userId, {text: movieObj.Error});
      }
    } else {
      sendMessage(userId, {text: "Something went wrong please try again"});
    }
}
