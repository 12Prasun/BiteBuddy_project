const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bitebuddy';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop existing collections if they exist
    try {
      await db.collection('food_items').deleteMany({});
      await db.collection('foodCategory').deleteMany({});
      console.log('Cleared existing collections');
    } catch (err) {
      console.log('Collections might not exist yet, continuing...');
    }

    // Food Categories
    const categories = [
      { CategoryName: 'Biryani' },
      { CategoryName: 'Breads' },
      { CategoryName: 'Curries' },
      { CategoryName: 'Desserts' },
      { CategoryName: 'Drinks' },
      { CategoryName: 'Appetizers' },
      { CategoryName: 'Main Course' },
      { CategoryName: 'Street Food' }
    ];

    // Food Items
    const foodItems = [
      {
        CategoryName: 'Biryani',
        name: 'Hyderabadi Chicken Biryani',
        img: 'https://via.placeholder.com/300?text=Chicken+Biryani',
        options: [
          { half: '250', full: '450' }
        ],
        description: 'Aromatic basmati rice cooked with tender chicken and spices',
        price: 450
      },
      {
        CategoryName: 'Biryani',
        name: 'Mutton Biryani',
        img: 'https://via.placeholder.com/300?text=Mutton+Biryani',
        options: [
          { half: '300', full: '550' }
        ],
        description: 'Tender mutton biryani with fragrant basmati rice',
        price: 550
      },
      {
        CategoryName: 'Biryani',
        name: 'Vegetable Biryani',
        img: 'https://via.placeholder.com/300?text=Veg+Biryani',
        options: [
          { half: '200', full: '350' }
        ],
        description: 'Mixed vegetables cooked with aromatic basmati rice',
        price: 350
      },
      {
        CategoryName: 'Breads',
        name: 'Naan',
        img: 'https://via.placeholder.com/300?text=Naan',
        options: [
          { quantity: '1', price: '40' },
          { quantity: '2', price: '80' }
        ],
        description: 'Soft and fluffy Indian bread baked in tandoor',
        price: 40
      },
      {
        CategoryName: 'Breads',
        name: 'Roti',
        img: 'https://via.placeholder.com/300?text=Roti',
        options: [
          { quantity: '1', price: '30' },
          { quantity: '2', price: '60' }
        ],
        description: 'Thin wheat bread cooked on tawa',
        price: 30
      },
      {
        CategoryName: 'Breads',
        name: 'Paratha',
        img: 'https://via.placeholder.com/300?text=Paratha',
        options: [
          { quantity: '1', price: '50' },
          { quantity: '2', price: '100' }
        ],
        description: 'Layered Indian flatbread with ghee',
        price: 50
      },
      {
        CategoryName: 'Curries',
        name: 'Butter Chicken',
        img: 'https://via.placeholder.com/300?text=Butter+Chicken',
        options: [
          { portion: '250ml', price: '350' },
          { portion: '500ml', price: '650' }
        ],
        description: 'Creamy tomato-based chicken curry',
        price: 350
      },
      {
        CategoryName: 'Curries',
        name: 'Chole Bhature',
        img: 'https://via.placeholder.com/300?text=Chole+Bhature',
        options: [
          { size: '1', price: '120' },
          { size: '2', price: '240' }
        ],
        description: 'Spiced chickpeas with deep-fried bread',
        price: 120
      },
      {
        CategoryName: 'Curries',
        name: 'Paneer Tikka Masala',
        img: 'https://via.placeholder.com/300?text=Paneer+Tikka+Masala',
        options: [
          { portion: '250ml', price: '320' },
          { portion: '500ml', price: '600' }
        ],
        description: 'Cottage cheese in creamy tomato sauce',
        price: 320
      },
      {
        CategoryName: 'Appetizers',
        name: 'Samosa',
        img: 'https://via.placeholder.com/300?text=Samosa',
        options: [
          { quantity: '2', price: '50' },
          { quantity: '4', price: '100' }
        ],
        description: 'Crispy triangular pastry with spiced filling',
        price: 50
      },
      {
        CategoryName: 'Appetizers',
        name: 'Pakora',
        img: 'https://via.placeholder.com/300?text=Pakora',
        options: [
          { quantity: '6', price: '80' },
          { quantity: '12', price: '150' }
        ],
        description: 'Crispy battered vegetable fritters',
        price: 80
      },
      {
        CategoryName: 'Appetizers',
        name: 'Paneer Tikka',
        img: 'https://via.placeholder.com/300?text=Paneer+Tikka',
        options: [
          { quantity: '4', price: '180' },
          { quantity: '8', price: '350' }
        ],
        description: 'Grilled cottage cheese cubes with spices',
        price: 180
      },
      {
        CategoryName: 'Main Course',
        name: 'Tandoori Chicken',
        img: 'https://via.placeholder.com/300?text=Tandoori+Chicken',
        options: [
          { portion: '250g', price: '280' },
          { portion: '500g', price: '520' }
        ],
        description: 'Yogurt-marinated chicken cooked in tandoor',
        price: 280
      },
      {
        CategoryName: 'Main Course',
        name: 'Fish Curry',
        img: 'https://via.placeholder.com/300?text=Fish+Curry',
        options: [
          { portion: '250ml', price: '320' },
          { portion: '500ml', price: '600' }
        ],
        description: 'Fresh fish in aromatic coconut curry',
        price: 320
      },
      {
        CategoryName: 'Main Course',
        name: 'Lamb Korma',
        img: 'https://via.placeholder.com/300?text=Lamb+Korma',
        options: [
          { portion: '250ml', price: '380' },
          { portion: '500ml', price: '700' }
        ],
        description: 'Tender lamb in creamy yogurt sauce',
        price: 380
      },
      {
        CategoryName: 'Street Food',
        name: 'Chaat',
        img: 'https://via.placeholder.com/300?text=Chaat',
        options: [
          { size: 'Regular', price: '80' },
          { size: 'Large', price: '120' }
        ],
        description: 'Crispy snack with tamarind and mint chutney',
        price: 80
      },
      {
        CategoryName: 'Street Food',
        name: 'Dosa',
        img: 'https://via.placeholder.com/300?text=Dosa',
        options: [
          { type: 'Plain', price: '100' },
          { type: 'Masala', price: '120' }
        ],
        description: 'Crispy South Indian crepe',
        price: 100
      },
      {
        CategoryName: 'Street Food',
        name: 'Pav Bhaji',
        img: 'https://via.placeholder.com/300?text=Pav+Bhaji',
        options: [
          { quantity: '1 Pav', price: '60' },
          { quantity: '2 Pav', price: '120' }
        ],
        description: 'Spicy vegetable curry with bread',
        price: 60
      },
      {
        CategoryName: 'Desserts',
        name: 'Gulab Jamun',
        img: 'https://via.placeholder.com/300?text=Gulab+Jamun',
        options: [
          { quantity: '4', price: '80' },
          { quantity: '8', price: '150' }
        ],
        description: 'Soft milk solids in sugar syrup',
        price: 80
      },
      {
        CategoryName: 'Desserts',
        name: 'Kheer',
        img: 'https://via.placeholder.com/300?text=Kheer',
        options: [
          { size: '250ml', price: '60' },
          { size: '500ml', price: '110' }
        ],
        description: 'Rice pudding with milk and nuts',
        price: 60
      },
      {
        CategoryName: 'Desserts',
        name: 'Jalebi',
        img: 'https://via.placeholder.com/300?text=Jalebi',
        options: [
          { quantity: '200g', price: '100' },
          { quantity: '500g', price: '250' }
        ],
        description: 'Crispy spiral sweet in sugar syrup',
        price: 100
      },
      {
        CategoryName: 'Drinks',
        name: 'Mango Lassi',
        img: 'https://via.placeholder.com/300?text=Mango+Lassi',
        options: [
          { size: '250ml', price: '80' },
          { size: '500ml', price: '150' }
        ],
        description: 'Creamy yogurt drink with mango',
        price: 80
      },
      {
        CategoryName: 'Drinks',
        name: 'Chai',
        img: 'https://via.placeholder.com/300?text=Chai',
        options: [
          { size: '200ml', price: '30' },
          { size: '400ml', price: '50' }
        ],
        description: 'Hot Indian spiced tea',
        price: 30
      },
      {
        CategoryName: 'Drinks',
        name: 'Masala Soda',
        img: 'https://via.placeholder.com/300?text=Masala+Soda',
        options: [
          { size: '250ml', price: '40' },
          { size: '500ml', price: '70' }
        ],
        description: 'Spiced cold beverage',
        price: 40
      }
    ];

    // Insert categories
    const insertedCategories = await db.collection('foodCategory').insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.insertedCount} food categories`);

    // Insert food items
    const insertedItems = await db.collection('food_items').insertMany(foodItems);
    console.log(`✅ Inserted ${insertedItems.insertedCount} food items`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nFood categories added:');
    categories.forEach(cat => console.log(`  - ${cat.CategoryName}`));
    
    console.log('\nSample food items added:');
    foodItems.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name} (${item.CategoryName}) - ₹${item.price}`);
    });
    console.log(`  ... and ${foodItems.length - 5} more items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
