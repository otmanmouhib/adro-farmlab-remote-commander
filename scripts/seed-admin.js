const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

(async () => {
  const uri = 'mongodb+srv://mouhib_db_user:Ge3VFWYMDeAaVchu@farm-cluster-01.mxvp7p0.mongodb.net/';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('adro-farmlab-remote-commander');
    const users = db.collection('users');
    const password = 'Admin@1234';
    const hashed = await bcrypt.hash(password, 12);

    const result = await users.updateOne(
      { email: 'admin@adrofarmlab.com' },
      {
        $set: {
          name: 'Admin',
          email: 'admin@adrofarmlab.com',
          password: hashed,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    console.log('Connected to MongoDB Atlas.');
    console.log('Database:', db.databaseName);
    console.log('Upserted count:', result.upsertedCount || 0);
    console.log('Matched count:', result.matchedCount || 0);
    console.log('Login credentials: email=admin@adrofarmlab.com password=Admin@1234');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
  }
})();
