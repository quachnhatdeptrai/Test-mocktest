/**
 * Define bookSchema and bookModel
 */
const mongoose = require('./mongoose');

//  Define the Book schema
const bookSchema = new mongoose.Schema(
    {
    // Implement bookSchema
        title: {type: String, required: true, trim: true},
        author: {type: String, required: true, trim: true},
        year: {type: Number, required: true, trim: true},
        image: {type: String, required: true, trim: true},
        category: {type: String, required: true, trim: true, enum:['TEXTBOOK', 'PHILOSOPHY', 'NOVEL']},
        description: {type: String, required: true, trim: true}
    },
    {timestamp: true}
);

const readingListSchema = new mongoose.Schema(
    {
    
    // Implement readingListSchema
    name: {type: String, required: true, trim: true},
    books: [{type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true}]
    },
    {timestamp: true}
);

// Create the Book model
const Book = mongoose.model('Book', bookSchema);

// Create readingList model
const ReadingList = mongoose.model('ReadingList', readingListSchema);

module.exports = { ReadingList, Book };
