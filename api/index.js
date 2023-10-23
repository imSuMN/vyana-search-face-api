require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { rekogClient, s3Client } = require("../config");

const { SearchFacesByImageCommand } = require("@aws-sdk/client-rekognition");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ parameterLimit: 100000, limit: "50mb", extended: false })
);

app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Api is Running...");
});

app.post("/searchFaces/:eventId", upload.single("faceImage"), async (req, res) => {
  const uploadedImage = req.file;
  const input = {
    CollectionId: process.env.CollectionID,
    Image: {
      Bytes: uploadedImage.buffer,
    },
  };
  try {
    const command = new SearchFacesByImageCommand(input);
    const resp = await rekogClient.send(
      new SearchFacesByImageCommand({
        CollectionId: process.env.CollectionId,
        Image: {
          Bytes: uploadedImage.buffer,
        },
      })
    );

    const images = [];

    for (const face of resp.FaceMatches ?? []) {
      const s3input = {
        Bucket: process.env.BucketName,
        Key: `${eventId}/` + face.Face?.ExternalImageId + ".jpg",
      };
      const s3Command = new GetObjectCommand(s3input);
      const s3Res = await s3Client.send(s3Command);

      const base64 = s3Res.Body?.toString("base64");

      images.push(base64);
    }

    return res.status(200).json({ matchedFaces: res.FaceMatches, images });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Searching photos" });
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started on PORT : ${PORT}`);
});
