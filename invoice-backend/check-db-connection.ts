import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    }
  });
}

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...\n');

  // Get database configuration from environment variables
  const dbConfig = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  // Display connection details (without password)
  console.log('📋 Connection Details:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Username: ${dbConfig.username || 'NOT SET'}`);
  console.log(`   Database: ${dbConfig.database || 'NOT SET'}`);
  console.log(`   Password: ${dbConfig.password ? '***' : 'NOT SET'}\n`);

  // Validate required environment variables
  if (!dbConfig.username || !dbConfig.password || !dbConfig.database) {
    console.error('❌ Error: Missing required database environment variables!');
    console.error('   Please ensure the following are set in your .env file:');
    console.error('   - DB_HOST');
    console.error('   - DB_PORT');
    console.error('   - DB_USERNAME');
    console.error('   - DB_PASSWORD');
    console.error('   - DB_DATABASE');
    process.exit(1);
  }

  // Create DataSource
  const dataSource = new DataSource({
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  try {
    console.log('🔄 Attempting to connect...');
    
    // Initialize connection
    await dataSource.initialize();
    
    console.log('✅ Database connection successful!\n');
    
    // Test query to verify connection is working
    const result = await dataSource.query('SELECT version()');
    console.log('📊 Database Information:');
    console.log(`   PostgreSQL Version: ${result[0].version}\n`);
    
    // Get current database name
    const dbNameResult = await dataSource.query('SELECT current_database()');
    console.log(`   Current Database: ${dbNameResult[0].current_database}\n`);
    
    // Close connection
    await dataSource.destroy();
    console.log('🔌 Connection closed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!\n');
    console.error('Error Details:');
    
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      
      // Provide helpful error messages based on common issues
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Suggestion: The database server might not be running or the host/port is incorrect.');
      } else if (error.message.includes('password authentication failed')) {
        console.error('\n💡 Suggestion: Check your DB_USERNAME and DB_PASSWORD in the .env file.');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 Suggestion: The database specified in DB_DATABASE does not exist. Create it first.');
      } else if (error.message.includes('timeout')) {
        console.error('\n💡 Suggestion: Connection timeout. Check if the database server is accessible.');
      }
    } else {
      console.error(`   ${JSON.stringify(error, null, 2)}`);
    }
    
    console.error('\n');
    process.exit(1);
  }
}

// Run the check
checkDatabaseConnection();

