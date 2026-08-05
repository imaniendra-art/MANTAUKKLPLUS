import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = "mongodb://mantaukklp:makassar123@ac-udrhelw-shard-00-00.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-01.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-02.qlx3gje.mongodb.net:27017/?ssl=true&replicaSet=atlas-nugn23-shard-0&authSource=admin&appName=Cluster0";

async function main() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        console.log(`Connected to database: ${db.databaseName}`);
        
        const usersCol = db.collection('users');
        const mahasiswa = await usersCol.find({ role: 'mahasiswa' }).toArray();
        
        let count = 0;
        for (const mhs of mahasiswa) {
            const defaultPassword = mhs.nim_nidn;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);
            
            await usersCol.updateOne(
                { _id: mhs._id },
                { $set: { password: hashedPassword, isFirstLogin: true } }
            );
            count++;
        }
        
        console.log(`Successfully reset password for ${count} mahasiswa back to their NIM.`);
    } catch (e) {
        console.error("Error during password reset:", e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
