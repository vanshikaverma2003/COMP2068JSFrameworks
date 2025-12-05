const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('📊 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log(`📊 Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('📊 Mongoose disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📊 Mongoose connection closed through app termination');
    process.exit(0);
});

module.exports = { connectDB };