require('dotenv').config({ path: '.env.local' });
const { S3Client, PutBucketPolicyCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT ?? "",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? "",
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
});

const bucketName = process.env.MINIO_BUCKET;

const policy = {
    Version: "2012-10-17",
    Statement: [
        {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${bucketName}/*`
        }
    ]
};

async function setPolicy() {
    try {
        const command = new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(policy),
        });
        await s3Client.send(command);
        console.log("Bucket policy set to public read successfully.");
    } catch (err) {
        console.error("Error setting policy:", err);
    }
}

setPolicy();
