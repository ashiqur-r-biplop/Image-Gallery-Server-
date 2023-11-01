require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@cluster0.klmvqmu.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const UploadedImagesCollection = client
      .db("Ollyo")
      .collection("Uploaded-image");
    // post image
    app.post("/upload_image", async (req, res) => {
      try {
        const body = req.body;
        const query = await UploadedImagesCollection.insertOne(body);
        res.send(query);
      } catch (error) {
        console.log(error);
      }
    });
    // get image
    app.get("/all_images", async (req, res) => {
      try {
        const images = await UploadedImagesCollection.find().toArray();
        res.send(images);
      } catch (error) {
        console.log(error);
      }
    });
    // checked
    app.patch("/update_uploaded_images/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const body = req.body;
        console.log(body);
        const options = { upsert: true };
        const updateUploadedImage = {
          $set: {
            imgURL: body?.imgURL,
            isChecked: body?.isChecked,
          },
        };
        const result = await UploadedImagesCollection.updateOne(
          query,
          updateUploadedImage,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // delete images
    app.delete("/delete_images", async (req, res) => {
      try {
        const filter = { isChecked: true };
        const result = await UploadedImagesCollection.deleteMany(filter);
        if (result.deletedCount > 0) {
          res.send({
            result: result,
            massage: ` ${result.deletedCount} Files deleted successfully.`,
          });
        } else {
          res.send("No Files deleted.");
        }
      } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting Files.");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Ollyo tesing server");
});
app.listen(port, () => {
  console.log(`Ollyo is sitting on port ${port}`);
});
