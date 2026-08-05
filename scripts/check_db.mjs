import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

async function main() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        console.log(`Connected to database: ${db.databaseName}`);
        
        const collections = await db.listCollections().toArray();
        for (let colInfo of collections) {
            const count = await db.collection(colInfo.name).countDocuments();
            console.log(`Collection ${colInfo.name}: ${count} documents`);
        }
        
        const mhsCount = await db.collection('users').countDocuments({ role: 'mahasiswa' });
        console.log(`\nTotal Mahasiswa in users collection: ${mhsCount}`);
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
