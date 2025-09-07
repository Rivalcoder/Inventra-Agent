// Script to fix MongoDB indexes for proper user isolation
// Run this script in MongoDB shell or MongoDB Compass

// Configuration
const databaseName = 'ai_inventory'; // Change this to your database name

// Get database reference
const db = db.getSiblingDB(databaseName);

print('Starting MongoDB index fix for user isolation...');

// Function to drop and recreate indexes for a collection
function fixCollectionIndexes(collectionName, indexes) {
  print(`\nFixing indexes for collection: ${collectionName}`);
  
  const collection = db.getCollection(collectionName);
  
  // Get existing indexes
  const existingIndexes = collection.getIndexes();
  print(`  Found ${existingIndexes.length} existing indexes`);
  
  // Drop problematic indexes (those without userId for unique constraints)
  existingIndexes.forEach(index => {
    const indexName = index.name;
    const indexKey = index.key;
    
    // Skip the default _id index
    if (indexName === '_id_') {
      return;
    }
    
    // Check if this is a unique index that doesn't include userId
    if (index.unique && !indexKey.userId) {
      print(`  Dropping problematic index: ${indexName} (${JSON.stringify(indexKey)})`);
      try {
        collection.dropIndex(indexName);
        print(`    ✓ Dropped index: ${indexName}`);
      } catch (error) {
        print(`    ✗ Error dropping index ${indexName}: ${error.message}`);
      }
    }
  });
  
  // Create new indexes with proper user isolation
  indexes.forEach(indexDef => {
    const { keys, options = {} } = indexDef;
    const indexName = options.name || Object.keys(keys).map(k => `${k}_${keys[k]}`).join('_');
    
    try {
      collection.createIndex(keys, options);
      print(`    ✓ Created index: ${indexName} (${JSON.stringify(keys)})`);
    } catch (error) {
      if (error.code === 85) {
        print(`    - Index already exists: ${indexName}`);
      } else {
        print(`    ✗ Error creating index ${indexName}: ${error.message}`);
      }
    }
  });
}

// Define the proper indexes for each collection
const collectionIndexes = {
  products: [
    {
      keys: { userId: 1, name: 1 },
      options: { unique: true, name: 'userId_name_unique' }
    }
  ],
  
  sales: [
    {
      keys: { userId: 1, productId: 1 },
      options: { name: 'userId_productId' }
    },
    {
      keys: { userId: 1, date: -1 },
      options: { name: 'userId_date_desc' }
    }
  ],
  
  settings: [
    {
      keys: { userId: 1, setting_key: 1 },
      options: { unique: true, name: 'userId_setting_key_unique' }
    }
  ],
  
  customers: [
    {
      keys: { userId: 1, email: 1 },
      options: { unique: true, name: 'userId_email_unique' }
    }
  ],
  
  suppliers: [
    {
      keys: { userId: 1, name: 1 },
      options: { unique: true, name: 'userId_name_unique' }
    }
  ],
  
  categories: [
    {
      keys: { userId: 1, name: 1 },
      options: { unique: true, name: 'userId_name_unique' }
    }
  ],
  
  users: [
    {
      keys: { username: 1 },
      options: { unique: true, name: 'username_unique' }
    },
    {
      keys: { userId: 1 },
      options: { unique: true, name: 'userId_unique' }
    }
  ]
};

// Fix indexes for each collection
Object.entries(collectionIndexes).forEach(([collectionName, indexes]) => {
  fixCollectionIndexes(collectionName, indexes);
});

print('\nIndex fix completed!');
print('\nSummary of changes:');
print('- Dropped old indexes that didn\'t include userId for unique constraints');
print('- Created new indexes with proper user isolation');
print('- Each user can now have their own settings, products, etc. without conflicts');

print('\nYou can verify the indexes by running:');
print('db.products.getIndexes()');
print('db.settings.getIndexes()');
print('etc.');
