const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5090;

app.use(cors());
app.use(express.json());

const connectToDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

const getMaterialFieldName = (doc) => {
  const possibleFieldNames = ['MATERIAL', 'Material', 'material'];
  return possibleFieldNames.find((fieldName) => fieldName in doc);
};

const normalizeMonth = (month) => {
  const monthMap = {
    'JANUARY': 'JAN', 'FEBRUARY': 'FEB', 'MARCH': 'MAR', 'APRIL': 'APR',
    'MAY': 'MAY', 'JUNE': 'JUN', 'JULY': 'JUL', 'AUGUST': 'AUG',
    'SEPTEMBER': 'SEP', 'OCTOBER': 'OCT', 'NOVEMBER': 'NOV', 'DECEMBER': 'DEC',
    'JAN': 'JAN', 'FEB': 'FEB', 'MAR': 'MAR', 'APR': 'APR', 'JUN': 'JUN',
    'JUL': 'JUL', 'AUG': 'AUG', 'SEP': 'SEP', 'OCT': 'OCT', 'NOV': 'NOV', 'DEC': 'DEC',
    'January': 'JAN', 'February': 'FEB', 'March': 'MAR', 'April': 'APR', 'May': 'MAY',
    'June': 'JUN', 'July': 'JUL', 'August': 'AUG', 'September': 'SEP', 'October': 'OCT',
    'November': 'NOV', 'December': 'DEC', 'Jan': 'JAN', 'Feb': 'FEB', 'Mar': 'MAR',
    'Apr': 'APR', 'Jun': 'JUN', 'Jul': 'JUL', 'Aug': 'AUG', 'Sep': 'SEP', 'Oct': 'OCT',
    'Nov': 'NOV', 'Dec': 'DEC', 'january': 'JAN', 'february': 'FEB', 'march': 'MAR',
    'april': 'APR', 'may': 'MAY', 'june': 'JUN', 'july': 'JUL', 'august': 'AUG',
    'september': 'SEP', 'october': 'OCT', 'november': 'NOV', 'december': 'DEC',
    'jan': 'JAN', 'feb': 'FEB', 'mar': 'MAR', 'apr': 'APR', 'jun': 'JUN',
    'jul': 'JUL', 'aug': 'AUG', 'sep': 'SEP', 'oct': 'OCT', 'nov': 'NOV', 'dec': 'DEC'
  };
  return monthMap[month] || month;
};

app.get('/api/options', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collections = await db.db.listCollections().toArray();
    let years = collections.map(collection => collection.name);
    years.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    res.json({ years });
  } catch (error) {
    console.error('Error retrieving options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/materials', async (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  try {
    const db = await connectToDatabase();
    const collection = db.collection(year);
    const data = await collection.find({}).toArray();
    const materialField = getMaterialFieldName(data[0]);
    let materials = [...new Set(data.map(item => item[materialField]))];
    materials.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    res.json({ materials });
  } catch (error) {
    console.error('Error retrieving materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/months', async (req, res) => {
  const { year, material } = req.query;
  if (!year || !material) {
    return res.status(400).json({ error: 'Year and material are required' });
  }
  try {
    const db = await connectToDatabase();
    const collection = db.collection(year);
    const materialField = getMaterialFieldName(await collection.findOne({}));
    const data = await collection.find({ [materialField]: material }).toArray();
    const months = data.reduce((acc, item) => {
      Object.keys(item).forEach(key => {
        const normalizedKey = normalizeMonth(key);
        if (['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].includes(normalizedKey)) {
          acc.add(key); // Use the original month key
        }
      });
      return acc;
    }, new Set());
    res.json({ months: Array.from(months) });
  } catch (error) {
    console.error('Error retrieving months:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/data', async (req, res) => {
  const { year, material } = req.query;
  if (!year || !material) {
    return res.status(400).json({ error: 'Year and material are required' });
  }
  try {
    const db = await connectToDatabase();
    const collection = db.collection(year);
    const materialField = getMaterialFieldName(await collection.findOne({}));
    const data = material === 'All' ? await collection.find({}).toArray() : await collection.find({ [materialField]: material }).toArray();
    const monthlyData = data.reduce((acc, item) => {
      Object.keys(item).forEach(key => {
        const normalizedKey = normalizeMonth(key);
        if (['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].includes(normalizedKey)) {
          acc[normalizedKey] = (acc[normalizedKey] || 0) + item[key];
        }
      });
      return acc;
    }, {});
    res.json({ data: monthlyData });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/compare', async (req, res) => {
  const { year, month1, month2 } = req.query;
  try {
    const db = await connectToDatabase();
    const collection = db.collection(year);
    const documents = await collection.find().toArray();
    const materialField = getMaterialFieldName(documents[0]);

    const percentageDifferences = documents.map((doc) => {
      const value1 = doc[month1] || 0;
      const value2 = doc[month2] || 0;
      const percentageDifference = ((value2 - value1) / value1) * 100;
      return {
        material: doc[materialField],
        percentageDifference: percentageDifference.toFixed(2),
      };
    });

    res.json(percentageDifferences);
  } catch (error) {
    console.error('Error comparing data:', error);
    res.status(500).json({ error: 'Error comparing data' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});