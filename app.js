/**
* RMIT University Vietnam
* Course: COSC3060 Web Programming Studio
* Semester: 2025B
* Assessment: Fullstack in-class Lab Test
* Author: Your names (e.g. Nguyen Van Minh)
* ID: Your student ids (e.g. s1234567)
* Acknowledgement: Acknowledge the resources that you use here.
*/

// Declare packages used for this server file
const express = require('express');
require('dotenv').config();
const path = require('path');
const { ReadingList, Book } = require('./db/bookModel');

// Setup server
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'materials/public')));
app.use(express.urlencoded({ extended: true }));

const readingOrder = [
    { day: 'Monday-Wednesday', category: 'TEXTBOOK' },
    { day: 'Thursday-Friday', category: 'PHILOSOPHY' },
    { day: 'Saturday-Sunday', category: 'NOVEL' }
];

const createSlug = (title) => title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getRandomReadingList(excludeId = null) {
    const matchStage = excludeId ? { _id: { $ne: excludeId } } : {};
    const [sampledList] = await ReadingList.aggregate([
        { $match: matchStage },
        { $sample: { size: 1 } }
    ]);

    if (!sampledList) {
        return null;
    }

    return ReadingList.findById(sampledList._id).populate('books').lean();
}

/** Routes */
// Homepage endpoint that when accessed will produce a random reading list for a week
app.get('/', async function (req, res) {
    try {
        const readingList = await getRandomReadingList();
        const booksByCategory = readingList?.books?.reduce((acc, book) => {
            acc[book.category] = { ...book, slug: createSlug(book.title) };
            return acc;
        }, {}) || {};

        const readingDays = readingOrder.map(({ day, category }) => ({
            day,
            category,
            book: booksByCategory[category]
        }));

        res.render('list', {
            readingDays,
            listId: readingList?._id?.toString() || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading reading list');
    }
});

app.post('/', async function (req, res) {
    try {
        const excludeId = req.body.listId || null;
        const readingList = await getRandomReadingList(excludeId);
        const booksByCategory = readingList?.books?.reduce((acc, book) => {
            acc[book.category] = { ...book, slug: createSlug(book.title) };
            return acc;
        }, {}) || {};

        const readingDays = readingOrder.map(({ day, category }) => ({
            day,
            category,
            book: booksByCategory[category]
        }));

        res.render('list', {
            readingDays,
            listId: readingList?._id?.toString() || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error refreshing reading list');
    }
});

// Book endpoint that when accessed will show detail information about a book and related books found in the database
app.get('/book/:title', async function (req, res) {
    try {
        const rawTitle = decodeURIComponent(req.params.title).replace(/-/g, ' ');
        const book = await Book.findOne({ title: new RegExp(`^${escapeRegex(rawTitle)}$`, 'i') }).lean();

        if (!book) {
            return res.status(404).send('Book not found');
        }

        const relatedBooks = await Book.find({
            category: book.category,
            _id: { $ne: book._id }
        })
            .limit(6)
            .lean();

        res.render('book', {
            book: { ...book, slug: createSlug(book.title) },
            relatedBooks: relatedBooks.map((related) => ({
                ...related,
                slug: createSlug(related.title)
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading book details');
    }
});

// Port number
const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
    console.log(`Server started and is running on: http://localhost:${port}`);
});