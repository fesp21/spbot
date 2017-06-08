var mongoose = requrie('mongoose');
var Schema = mongoose.Schema();

var ChatSchema = newSchema({
  user_id: {type: String},
  text: {type: String},
  date: {type: String},
  answer: {type: String},
  emojis: {type: String}
});

module.exports = mongoose.mode("Chats", ChatSchema);
