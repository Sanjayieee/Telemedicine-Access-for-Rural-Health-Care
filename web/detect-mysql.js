// Script to detect MySQL installation and port
const mysql = require('mysql2/promise');
require('dotenv').config();

async function detectMySQL() {
  console.log('🔍 Detecting MySQL configuration...\n');
  
  const commonPorts = [3306, 3307, 3308, 3309];
  const commonUsers = ['root', 'mysql'];
  const commonPasswords = ['', '9090', 'root', 'password'];
  
  for (const port of commonPorts) {
    for (const user of commonUsers) {
      for (const password of commonPasswords) {
        try {
          console.log(`Testing: ${user}@localhost:${port} (password: ${password || 'empty'})`);
          
          const connection = await mysql.createConnection({
            host: 'localhost',
            user: user,
            password: password,
            port: port,
            connectTimeout: 2000
          });
          
          console.log(`✅ SUCCESS! MySQL found at:`);
          console.log(`   Host: localhost`);
          console.log(`   Port: ${port}`);
          console.log(`   User: ${user}`);
          console.log(`   Password: ${password || 'empty'}\n`);
          
          // Test if we can create database
          try {
            await connection.execute('CREATE DATABASE IF NOT EXISTS healthcare_db_test');
            await connection.execute('DROP DATABASE healthcare_db_test');
            console.log('✅ Database creation permissions: OK');
          } catch (e) {
            console.log('⚠️ Database creation permissions: Limited');
          }
          
          await connection.end();
          
          console.log('\n📝 Update your .env file with:');
          console.log(`DB_HOST=localhost`);
          console.log(`DB_USER=${user}`);
          console.log(`DB_PASSWORD=${password}`);
          console.log(`DB_PORT=${port}`);
          
          return true;
          
        } catch (error) {
          // Continue trying other combinations
        }
      }
    }
  }
  
  console.log('❌ No MySQL connection found on common ports/users');
  console.log('\n🔧 Try these steps:');
  console.log('1. Start MySQL service as administrator');
  console.log('2. Check MySQL Workbench for connection details');
  console.log('3. Verify MySQL is installed and running');
  
  return false;
}

detectMySQL();