// Migration script to move data from user-specific collections to single collections with userId field
// Run this script in MongoDB shell or MongoDB Compass

// Configuration
const databaseName = 'ai_inventory'; // Change this to your database name

// Get database reference
const db = db.getSiblingDB(databaseName);

print('Starting migration to single collections structure...');

// Function to migrate data from user-specific collection to main collection
function migrateCollection(userSpecificCollectionName, mainCollectionName, userId) {
  print(`Migrating ${userSpecificCollectionName} to ${mainCollectionName} for user ${userId}...`);
  
  // Check if user-specific collection exists
  const userCollection = db.getCollection(userSpecificCollectionName);
  const mainCollection = db.getCollection(mainCollectionName);
  
  if (userCollection.countDocuments() === 0) {
    print(`  No data found in ${userSpecificCollectionName}, skipping...`);
    return;
  }
  
  // Get all documents from user-specific collection
  const documents = userCollection.find({}).toArray();
  
  // Add userId to each document and insert into main collection
  let migratedCount = 0;
  documents.forEach(doc => {
    // Add userId field
    doc.userId = userId;
    
    // Remove _id to avoid conflicts
    delete doc._id;
    
    try {
      mainCollection.insertOne(doc);
      migratedCount++;
    } catch (error) {
      if (error.code === 11000) {
        print(`  Skipping duplicate document in ${mainCollectionName}`);
      } else {
        print(`  Error inserting document: ${error.message}`);
      }
    }
  });
  
  print(`  Migrated ${migratedCount} documents from ${userSpecificCollectionName} to ${mainCollectionName}`);
}

// Function to find all user-specific collections
function findUserCollections() {
  const collections = db.listCollections().toArray();
  const userCollections = [];
  
  collections.forEach(collection => {
    const name = collection.name;
    // Match pattern: collectionname_user_username_timestamp
    const match = name.match(/^(.+)_user_(.+)_(\d+)$/);
    if (match) {
      const [, collectionType, username, timestamp] = match;
      const userId = `user_${username}_${timestamp}`;
      
      userCollections.push({
        userSpecificName: name,
        mainCollectionName: collectionType,
        userId: userId,
        username: username
      });
    }
  });
  
  return userCollections;
}

// Main migration logic
const userCollections = findUserCollections();

if (userCollections.length === 0) {
  print('No user-specific collections found. Migration not needed.');
} else {
  print(`Found ${userCollections.length} user-specific collections to migrate:`);
  userCollections.forEach(uc => {
    print(`  - ${uc.userSpecificName} (user: ${uc.username})`);
  });
  
  // Group by user
  const users = {};
  userCollections.forEach(uc => {
    if (!users[uc.userId]) {
      users[uc.userId] = {
        userId: uc.userId,
        username: uc.username,
        collections: []
      };
    }
    users[uc.userId].collections.push(uc);
  });
  
  print(`\nFound ${Object.keys(users).length} unique users to migrate:`);
  Object.values(users).forEach(user => {
    print(`  - ${user.username} (${user.userId})`);
  });
  
  // Migrate each user's data
  Object.values(users).forEach(user => {
    print(`\nMigrating data for user: ${user.username} (${user.userId})`);
    
    user.collections.forEach(collection => {
      migrateCollection(
        collection.userSpecificName,
        collection.mainCollectionName,
        collection.userId
      );
    });
  });
  
  print('\nMigration completed!');
  print('\nYou can now safely drop the old user-specific collections if desired:');
  userCollections.forEach(uc => {
    print(`  db.${uc.userSpecificName}.drop()`);
  });
}

print('\nMigration script finished.');
