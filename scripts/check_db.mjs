import mongoose from 'mongoose';

const uri = "mongodb://mantaukklp:makassar123@ac-udrhelw-shard-00-00.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-01.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-02.qlx3gje.mongodb.net:27017/?ssl=true&replicaSet=atlas-nugn23-shard-0&authSource=admin&appName=Cluster0";

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
