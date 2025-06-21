const express = require('express');
const app = express();
app.use(express.json());


const VALID_GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography'];

let books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Fiction",
        year: 1925,
        isRead: false,
        rating: null, 
        dateAdded: "2024-01-15"
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Fiction",
        year: 1960,
        isRead: true,
        rating: 5,
        dateAdded: "2024-01-10"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Sci-Fi",
        year: 1949,
        isRead: true,
        rating: 4,
        dateAdded: "2024-01-12"
    }
];

let nextId = 4;
const findBookById = (id) => books.find(book => book.id === parseInt(id));

app.get('/books', (req, res) => {
    const { genre, isRead, author } = req.query;
    
    let filteredBooks = books;
    
    if (genre) {
        filteredBooks = filteredBooks.filter(book => 
            book.genre.toLowerCase() === genre.toLowerCase()
        );
    }
    
    if (isRead !== undefined) {
        const readStatus = isRead === 'true';
        filteredBooks = filteredBooks.filter(book => book.isRead === readStatus);
    }if (author) {
        filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }
    if (filteredBooks.length === 0) {
        return res.json({ 
            message: "No books found", 
            books: [] 
        });
    }
    
    res.json({
        count: filteredBooks.length,
        books: filteredBooks
    });
});

app.get('/books/:id', (req, res) => {
    const book = findBookById(req.params.id);
    
    if (!book) {
        return res.status(404).json({ "message": "Book not found" });
    }
    
    res.json(book);
});

app.post('/books', (req, res) => {
    const { title, author, genre, year } = req.body;
 
    if (!title || !author || !genre || !year) {
        return res.status(400).json({ "message": "Title, author, genre, and year are required" });
    }
    
    if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ "message": "Title must be a non-empty string" });
    }
    
    if (typeof author !== 'string' || author.trim().length === 0) {
        return res.status(400).json({ "message": "Author must be a non-empty string" });
    }
    
    if (!VALID_GENRES.includes(genre)) {
        return res.status(400).json({ 
            "message": `Genre must be one of: ${VALID_GENRES.join(', ')}` 
        });
    }
    
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
        return res.status(400).json({ 
            "message": `Year must be between 1000 and ${currentYear}` 
        });
    }
    
    const duplicate = books.find(book => 
        book.title.toLowerCase() === title.toLowerCase() && 
        book.author.toLowerCase() === author.toLowerCase()
    );
    
    if (duplicate) {
        return res.status(409).json({ "message": "Book with same title and author already exists" });
    }
    
    const newBook = {
        id: nextId++,
        title: title.trim(),
        author: author.trim(),
        genre,
        year,
        isRead: false,
        rating: null,
        dateAdded: new Date().toISOString().split('T')[0]
    };
    
    books.push(newBook);
    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});


app.put('/books/:id', (req, res) => {
    const book = findBookById(req.params.id);
    
if (!book) {
        return res.status(404).json({ "message": "Book not found" });
    }
    
    const { title, author, genre, year, isRead, rating } = req.body;
    if (!title || !author || !genre || !year) {
        return res.status(400).json({ "message": "Title, author, genre, and year are required" });
 }
    
    if (!VALID_GENRES.includes(genre)) {
        return res.status(400).json({ 
            "message": `Genre must be one of: ${VALID_GENRES.join(', ')}` 
        });
    }
    
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
        return res.status(400).json({ 
            "message": `Year must be between 1000 and ${currentYear}` 
        });
}
    if (rating !== null && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return res.status(400).json({ "message": "Rating must be between 1 and 5, or null" });
    }
    
    const updatedBook = {
        id: book.id,
        title: title.trim(),
        author: author.trim(),
        genre,
        year,
        isRead: isRead !== undefined ? isRead : false,
        rating: rating || null,
        dateAdded: book.dateAdded
    };
    
    const bookIndex = books.findIndex(b => b.id === book.id);
    books[bookIndex] = updatedBook;
    
    res.json({
        message: "Book updated successfully",
        book: updatedBook
    });
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(book => book.id === parseInt(req.params.id));
    
    if (bookIndex === -1) {
        return res.status(404).json({ "message": "Book not found" });
    }

    const deletedBook = books.splice(bookIndex, 1)[0];
    res.json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});


app.patch('/books/:id/read', (req, res) => {
    const book = findBookById(req.params.id);
    
    if (!book) {
        return res.status(404).json({ "message": "Book not found" });
    }
    book.isRead = true;
    res.json({
        message: "Book marked as read",
        book: book
    });
});


app.patch('/books/:id/rate', (req, res) => {
    const book = findBookById(req.params.id);
    
    if (!book) {
        return res.status(404).json({ "message": "Book not found" });
    }
    
    const { rating } = req.body;
    
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ "message": "Rating must be a number between 1 and 5" });
    }
    
    book.rating = rating;
    
    res.json({
        message: "Book rated successfully",
        book: book
    });
});


app.get('/stats', (req, res) => {
    const totalBooks = books.length;
    const readBooks = books.filter(book => book.isRead).length;
    const unreadBooks = totalBooks - readBooks;
    
const ratedBooks = books.filter(book => book.rating !== null);
const averageRating = ratedBooks.length > 0 
        ? (ratedBooks.reduce((sum, book) => sum + book.rating, 0) / ratedBooks.length).toFixed(1)
        : 0;
    
    const genreStats = {};
books.forEach(book => {
        genreStats[book.genre] = (genreStats[book.genre] || 0) + 1;});
    

    const mostPopularGenre = Object.keys(genreStats).reduce((a, b) => 
        genreStats[a] > genreStats[b] ? a : b, Object.keys(genreStats)[0]
 );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const recentBooks = books.filter(book => 
        new Date(book.dateAdded) >= thirtyDaysAgo
    ).length;
    
    res.json({
        summary: {
            totalBooks,
            readBooks,
            unreadBooks,
            readingProgress: totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0
        },
        ratings: {
            averageRating: parseFloat(averageRating),
            ratedBooks: ratedBooks.length,
            unratedBooks: totalBooks - ratedBooks.length
        },
    genres: {
            breakdown: genreStats,
            mostPopular: mostPopularGenre || 'None'
        },
    activity: {
            recentlyAdded: recentBooks
        }
    });
});

app.listen(3000, () => {
    console.log('Library API running on port 3000');
});