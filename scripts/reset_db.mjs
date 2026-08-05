import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

async function main() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        console.log(`Connected to database: ${db.databaseName}`);
        
        // 1. Reset mahasiswa accounts
        const updateRes = await db.collection('users').updateMany(
            { role: 'mahasiswa' },
            { 
                $set: { isFirstLogin: true },
                $unset: { kegiatan: "", posisi: "", kelompok: "" }
            }
        );
        console.log(`Reset ${updateRes.modifiedCount} mahasiswa accounts.`);

        // 2. Delete non-admin and non-mahasiswa accounts
        const deleteRes = await db.collection('users').deleteMany({
            role: { $nin: ['mahasiswa', 'admin'] }
        });
        console.log(`Deleted ${deleteRes.deletedCount} non-mahasiswa/non-admin accounts.`);

        // 3. Drop all other collections except 'users' and 'systemsettings'
        const collections = await db.listCollections().toArray();
        const keepCollections = ['users', 'systemsettings', 'mitrakkls'];
        
        for (let colInfo of collections) {
            if (!keepCollections.includes(colInfo.name.toLowerCase())) {
                await db.dropCollection(colInfo.name);
                console.log(`Dropped collection: ${colInfo.name}`);
            }
        }
        
        console.log("Database reset complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
