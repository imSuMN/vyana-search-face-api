require("dotenv/config");

const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const { S3Client } = require("@aws-sdk/client-s3");

const config = {
  region: process.env.PB_Region,
  credentials: {
    secretAccessKey: process.env.PB_SecretKey,
    accessKeyId: process.env.PB_AccessKeyId,
  },
};

const rekogClient = new RekognitionClient(config);
const s3Client = new S3Client(config);

module.exports = { rekogClient, s3Client };
