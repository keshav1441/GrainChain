from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

# MongoDB client and database
client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None

async def connect_to_mongo():
    """Connect to MongoDB database."""
    global client, database
    try:
        # Add connection timeout and retry settings for better error handling
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            maxPoolSize=10,
            retryWrites=True
        )
        database = client[settings.MONGODB_DATABASE]
        
        # Test the connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {settings.MONGODB_DATABASE}")
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("💡 Solutions:")
        print("   1. Install and start local MongoDB: https://www.mongodb.com/try/download/community")
        print("   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas")
        print("   3. Update MONGODB_URL in .env file with your connection string")
        raise e

async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")
        logging.info("Disconnected from MongoDB")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return database

# Collection getters for easy access
def get_collection(collection_name: str):
    """Get a specific collection"""
    return database[collection_name]

# Dependency to get database
async def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency"""
    return database
