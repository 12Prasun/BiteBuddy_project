const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://bitebuddy:project@cluster0.rfeu7is.mongodb.net/bitebuddy?retryWrites=true&w=majority'

const mongoDB = async () => {
    mongoose.set('strictQuery', false);
    mongoose.connect(mongoURI, { useNewUrlParser: true }, async (err, result) => {
        if (err)
            console.log("---", err);
        else {
            console.log("connected");
            const fetched_data = await mongoose.connection.db.collection("food_items");
            fetched_data.find({}).toArray(async function (err, data) {
                const foodCategory = await mongoose.connection.db.collection("foodCategory");
                foodCategory.find({}).toArray(function (err, catData) {
                    if (err) console.log(err);
                    else {
                        global.food_items = data;
                        global.foodCategory = catData;
                    }
                })
                // if (err)   console.log(err);
                // else{
                //     global.food_items = data;
                // }
            })
        }
    });
}

module.exports = mongoDB;