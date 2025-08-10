from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

# MongoDB client and database
client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None

async def connect_to_mongo():
    """Create database connection"""
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.MONGODB_DATABASE]
    
    # Test the connection
    try:
        await client.admin.command('ping')
        print(f"Successfully connected to MongoDB: {settings.MONGODB_DATABASE}")
        logging.info("Connected to MongoDB")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

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
