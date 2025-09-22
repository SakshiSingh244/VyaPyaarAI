const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { scrape_meesho_prices } = require('./scraper');
const User = require('./userModel');

const app = express();


app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect("mongodb+srv://sakshx:test1234@vyapyaar-cluster.k3c5gvz.mongodb.net/vyapyaarDB?retryWrites=true&w=majority")
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });



app.get('/', (req, res) => {
  res.send('VyapyaarAI backend is running');
});

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.json({ success: true, message: 'Registration successful!', user: { username, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    res.json({ success: true, message: 'Login successful!', user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/scrape-prices', async (req, res) => {
  try {
    const { productName } = req.body;
    console.log(`Scraping prices for: ${productName}`);
    const prices = await scrape_meesho_prices(productName);
    res.json(prices);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Playwright scraper ready');
});
