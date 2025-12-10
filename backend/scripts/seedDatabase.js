const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bitebuddy';

// Food data with real image URLs
const foodCategories = [
  { _id: "63a1c5f8e9d4b2c3a4f5g6h7", categoryName: "Biryani" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6h8", categoryName: "Breads" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6h9", categoryName: "Curries" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6i0", categoryName: "Desserts" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6i1", categoryName: "Drinks" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6i2", categoryName: "Appetizers" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6i3", categoryName: "Main Course" },
  { _id: "63a1c5f8e9d4b2c3a4f5g6i4", categoryName: "Street Food" }
];

const foodItems = [
  // Biryani
  {
    CategoryName: "Biryani",
    name: "Hyderabadi Chicken Biryani",
    img: "https://images.unsplash.com/photo-1584584867312-29d79140b495?w=400&h=300&fit=crop",
    options: [
      { half: 250, full: 450 }
    ],
    description: "Aromatic rice with tender chicken, fragrant spices, and yogurt. A true Hyderabad specialty."
  },
  {
    CategoryName: "Biryani",
    name: "Mutton Biryani",
    img: "https://images.unsplash.com/photo-1645867941746-a6c60f8ba0a7?w=400&h=300&fit=crop",
    options: [
      { half: 300, full: 550 }
    ],
    description: "Premium mutton cooked with long-grain basmati rice and aromatic spices."
  },
  {
    CategoryName: "Biryani",
    name: "Vegetable Biryani",
    img: "https://images.unsplash.com/photo-1584584867312-29d79140b495?w=400&h=300&fit=crop",
    options: [
      { half: 200, full: 350 }
    ],
    description: "Mixed vegetables with basmati rice, fragrant spices, and yogurt marinade."
  },

  // Breads
  {
    CategoryName: "Breads",
    name: "Naan",
    img: "https://images.unsplash.com/photo-1625944724509-eab1e5f4a8cb?w=400&h=300&fit=crop",
    options: [
      { butter: 40, plain: 30 }
    ],
    description: "Soft, fluffy bread cooked in tandoor. Available plain or with butter."
  },
  {
    CategoryName: "Breads",
    name: "Roti",
    img: "https://images.unsplash.com/photo-1625944724509-eab1e5f4a8cb?w=400&h=300&fit=crop",
    options: [
      { butter: 25, plain: 15 }
    ],
    description: "Thin whole wheat flatbread. Perfect complement to any curry."
  },
  {
    CategoryName: "Breads",
    name: "Garlic Naan",
    img: "https://images.unsplash.com/photo-1625944724509-eab1e5f4a8cb?w=400&h=300&fit=crop",
    options: [
      { single: 60 }
    ],
    description: "Naan topped with fresh garlic and cilantro, cooked to perfection."
  },

  // Curries
  {
    CategoryName: "Curries",
    name: "Butter Chicken",
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    options: [
      { half: 180, full: 320 }
    ],
    description: "Tender chicken in a rich, creamy tomato-based sauce with aromatic spices."
  },
  {
    CategoryName: "Curries",
    name: "Paneer Tikka Masala",
    img: "https://images.unsplash.com/photo-1572826873914-2bb7f72df52d?w=400&h=300&fit=crop",
    options: [
      { half: 150, full: 280 }
    ],
    description: "Cottage cheese cubes in a creamy tomato sauce with Indian spices."
  },
  {
    CategoryName: "Curries",
    name: "Chole Bhature",
    img: "https://images.unsplash.com/photo-1589301760014-d929314c3fe6?w=400&h=300&fit=crop",
    options: [
      { single: 200 }
    ],
    description: "Spiced chickpeas served with deep-fried puffed bread. A North Indian favorite."
  },

  // Desserts
  {
    CategoryName: "Desserts",
    name: "Gulab Jamun",
    img: "https://images.unsplash.com/photo-1585520826029-80a7c1b0c4c5?w=400&h=300&fit=crop",
    options: [
      { qty3: 100, qty6: 180 }
    ],
    description: "Soft milk solids dumplings soaked in rose-flavored sugar syrup."
  },
  {
    CategoryName: "Desserts",
    name: "Kheer",
    img: "https://images.unsplash.com/photo-1633319191627-06f8fa10c0fd?w=400&h=300&fit=crop",
    options: [
      { bowl: 120 }
    ],
    description: "Creamy rice pudding with condensed milk, nuts, and cardamom."
  },
  {
    CategoryName: "Desserts",
    name: "Jalebi",
    img: "https://images.unsplash.com/photo-1585520826029-80a7c1b0c4c5?w=400&h=300&fit=crop",
    options: [
      { qty250g: 150 }
    ],
    description: "Sweet spiral-shaped pastry soaked in sugar syrup. Crispy and delicious!"
  },

  // Drinks
  {
    CategoryName: "Drinks",
    name: "Mango Lassi",
    img: "https://images.unsplash.com/photo-1590080876/lassi?w=400&h=300&fit=crop",
    options: [
      { small: 80, large: 120 }
    ],
    description: "Refreshing yogurt-based drink with fresh mango pulp and cardamom."
  },
  {
    CategoryName: "Drinks",
    name: "Masala Chai",
    img: "https://images.unsplash.com/photo-1597318973606-07346f65f7fa?w=400&h=300&fit=crop",
    options: [
      { cup: 50 }
    ],
    description: "Hot spiced tea with milk, ginger, and aromatic spices."
  },
  {
    CategoryName: "Drinks",
    name: "Sweet Lassi",
    img: "https://images.unsplash.com/photo-1590080876/lassi?w=400&h=300&fit=crop",
    options: [
      { small: 60, large: 90 }
    ],
    description: "Chilled yogurt drink sweetened with honey and cardamom."
  },

  // Appetizers
  {
    CategoryName: "Appetizers",
    name: "Samosa",
    img: "https://images.unsplash.com/photo-1609501676725-7186f017a4b9?w=400&h=300&fit=crop",
    options: [
      { qty2: 60, qty4: 110 }
    ],
    description: "Crispy fried pastry with spiced potato and pea filling."
  },
  {
    CategoryName: "Appetizers",
    name: "Paneer Tikka",
    img: "https://images.unsplash.com/photo-1599599810694-4de5001bb911?w=400&h=300&fit=crop",
    options: [
      { qty4: 180, qty8: 320 }
    ],
    description: "Marinated cottage cheese cubes grilled in tandoor. Served with mint sauce."
  },
  {
    CategoryName: "Appetizers",
    name: "Spring Roll",
    img: "https://images.unsplash.com/photo-1605054067922-60d5b8e0b55e?w=400&h=300&fit=crop",
    options: [
      { qty2: 80, qty4: 140 }
    ],
    description: "Crispy vegetable rolls with sweet and sour dipping sauce."
  },

  // Main Course
  {
    CategoryName: "Main Course",
    name: "Tandoori Chicken",
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    options: [
      { half: 220, full: 420 }
    ],
    description: "Marinated chicken leg grilled in tandoor. Served with lemon and onions."
  },
  {
    CategoryName: "Main Course",
    name: "Fish Fry",
    img: "https://images.unsplash.com/photo-1569718776767-641e00c8beb6?w=400&h=300&fit=crop",
    options: [
      { qty250g: 280, qty500g: 520 }
    ],
    description: "Crispy battered fish fried to golden perfection. Light and delicious."
  },
  {
    CategoryName: "Main Course",
    name: "Shrimp Masala",
    img: "https://images.unsplash.com/photo-1615885226519-d286f6f54a78?w=400&h=300&fit=crop",
    options: [
      { half: 250, full: 450 }
    ],
    description: "Fresh shrimp cooked in aromatic spices and creamy sauce."
  },

  // Street Food
  {
    CategoryName: "Street Food",
    name: "Chaat",
    img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
    options: [
      { single: 120 }
    ],
    description: "Crispy wafers with spiced potatoes, yogurt, and tamarind chutney."
  },
  {
    CategoryName: "Street Food",
    name: "Dosa",
    img: "https://images.unsplash.com/photo-1589001780640-5f44f4ee6be6?w=400&h=300&fit=crop",
    options: [
      { plain: 80, masala: 120 }
    ],
    description: "Crispy South Indian crepe. Available plain or with spiced potato filling."
  },
  {
    CategoryName: "Street Food",
    name: "Vada Pav",
    img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
    options: [
      { qty2: 70 }
    ],
    description: "Fried lentil fritter in spicy bread. A Mumbai street food classic!"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;

    // Drop existing collections to start fresh
    try {
      await db.collection('food_items').deleteMany({});
      console.log('Cleared existing food items');
    } catch (err) {
      // Collection might not exist, that's fine
    }

    try {
      await db.collection('food_category').deleteMany({});
      console.log('Cleared existing food categories');
    } catch (err) {
      // Collection might not exist, that's fine
    }

    // Insert food categories
    const categoryResult = await db.collection('food_category').insertMany(foodCategories);
    console.log(`✅ Inserted ${categoryResult.insertedCount} food categories`);

    // Insert food items
    const foodResult = await db.collection('food_items').insertMany(foodItems);
    console.log(`✅ Inserted ${foodResult.insertedCount} food items`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`Total categories: ${foodCategories.length}`);
    console.log(`Total food items: ${foodItems.length}`);

    // Display sample of inserted data
    const sampleItem = await db.collection('food_items').findOne();
    console.log('\nSample food item:');
    console.log(JSON.stringify(sampleItem, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
