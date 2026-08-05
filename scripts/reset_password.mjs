import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

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
