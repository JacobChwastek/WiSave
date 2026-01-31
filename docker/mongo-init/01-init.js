// Initialize wisave database with collections
db = db.getSiblingDB('wisave');

// Create collections for projections
db.createCollection('incomes');
db.createCollection('expenses');
db.createCollection('budgets');

print('MongoDB initialized with wisave collections and indexes');
