# MySQL Database Setup Guide 🗄️

## Current Status: Hybrid Database System ✅

Your application now uses a **hybrid database system** that automatically:
- ✅ **Tries MySQL first** - If MySQL is running, it uses the MySQL database
- ✅ **Falls back to in-memory** - If MySQL is unavailable, it uses in-memory storage
- ✅ **No code changes needed** - All your existing API calls work the same way

## Quick Status Check

Visit: `http://localhost:9002/api/db-status` to see which database is currently active.

## MySQL Setup Instructions

### Step 1: Start MySQL Service (Administrator Required)

**Option A: Using PowerShell (Run as Administrator)**
```powershell
net start MYSQL80
```

**Option B: Using Services Manager**
1. Press `Win + R`, type `services.msc`
2. Find "MYSQL80" service
3. Right-click → Start

**Option C: Using MySQL Workbench**
- Open MySQL Workbench and start the server from there

### Step 2: Create Database & Tables

Once MySQL is running, run the setup script:

```bash
# Navigate to your project
cd "d:\SIH Hackathon\web"

# Run the MySQL setup
node test-mysql.js
```

This script will:
- ✅ Test MySQL connection
- ✅ Create `healthcare_db` database
- ✅ Create all required tables
- ✅ Insert sample data

### Step 3: Restart Your Application

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

The application will automatically detect MySQL and switch to using it.

## Database Configuration

Your `.env` file contains:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=9090
DB_NAME=healthcare_db
DB_PORT=3306
```

## Troubleshooting

### MySQL Service Won't Start
```bash
# Check MySQL service status
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# If stopped, start as administrator:
# Right-click PowerShell → "Run as Administrator"
net start MYSQL80
```

### Connection Refused (Error 10061)
- MySQL service is not running
- Wrong port (check if MySQL is on 3306)
- Firewall blocking the connection

### Access Denied (Error 1045)
- Wrong username/password in `.env`
- User doesn't have necessary permissions

### Database Doesn't Exist
The setup script automatically creates the database, but you can also do it manually:
```sql
CREATE DATABASE healthcare_db;
USE healthcare_db;
```

## Database Schema

The system creates these tables:

### `patients`
- `id` (VARCHAR 255, PRIMARY KEY)
- `name` (VARCHAR 255)
- `age` (INT)
- `gender` (ENUM: Male, Female, Other)
- `chronic` (BOOLEAN)
- `created_at`, `updated_at` (BIGINT timestamps)

### `patient_records`
- `id` (VARCHAR 255, PRIMARY KEY) 
- `patient_id` (VARCHAR 255, FOREIGN KEY)
- `note` (TEXT)
- `type` (ENUM: visit, lab, prescription, followup)
- `vitals` (JSON)
- `symptoms` (JSON)
- `created_by`, `created_at`

### `prescriptions`
- `id` (VARCHAR 255, PRIMARY KEY)
- `patient_id` (VARCHAR 255, FOREIGN KEY)
- `medication`, `dosage`, `frequency`, `duration`
- `delivered` (BOOLEAN)
- `created_by`, `created_at`

### `stock_items`
- `id` (VARCHAR 255, PRIMARY KEY)
- `name`, `category`, `unit`
- `current_stock`, `min_threshold` (INT)
- `updated_at`

## Sample Data

The setup automatically includes:
- 3 sample patients (Rajesh Kumar, Priya Sharma, Amit Singh)
- 2 sample prescriptions
- 3 sample stock items (Paracetamol, Amoxicillin, Ibuprofen)

## Benefits of MySQL vs In-Memory

### MySQL Database ✅
- **Persistent** - Data survives server restarts
- **Scalable** - Handle thousands of records
- **Concurrent** - Multiple users can access simultaneously
- **Backup-able** - Regular database backups
- **Query-able** - Complex SQL queries and reports

### In-Memory Storage ⚠️
- **Temporary** - Data lost on server restart
- **Limited** - Suitable for development/demo only
- **Fast** - Very quick for small datasets
- **Simple** - No setup required

## Current Files

- `src/lib/db.ts` - Hybrid database layer (main interface)
- `src/lib/db-mysql.ts` - MySQL implementation
- `src/lib/db-memory.ts` - In-memory fallback
- `src/lib/database.ts` - MySQL connection pool
- `test-mysql.js` - Setup and test script

## Next Steps

1. **Start MySQL** (requires admin privileges)
2. **Run setup script** (`node test-mysql.js`)
3. **Restart application** (`npm run dev`)
4. **Verify status** (visit `/api/db-status`)

The toolbar system will work seamlessly with both database types! 🎉

---

**Need Help?** 
- Check MySQL service: `Get-Service MYSQL80`
- Test connection: `mysql -u root -p9090`
- View logs in the terminal when starting the app