# Healthcare Management System - Database Setup

## 🚀 Database Migration from In-Memory to MySQL

### Current Setup
The application now supports both **in-memory storage** (for development) and **MySQL database** (for production).

### Configuration

#### 1. Environment Variables
Set these variables in your `.env` file:

```env
# Database Configuration
# Choose your database type: mysql or memory  
DB_TYPE=mysql

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=healthcare_db
DB_PORT=3306
```

#### 2. Database Types

**In-Memory Storage (Default)**
```env
DB_TYPE=memory
```
- ✅ No setup required
- ✅ Works immediately 
- ❌ Data lost on server restart
- ❌ Not suitable for production

**MySQL Database**
```env
DB_TYPE=mysql
```
- ✅ Persistent data storage
- ✅ Production ready
- ✅ Supports large datasets
- ✅ ACID compliance
- ⚠️ Requires MySQL installation

### 🛠️ MySQL Setup Instructions

#### Option 1: Local MySQL Installation

1. **Install MySQL** (Windows)
   ```bash
   # Download from https://dev.mysql.com/downloads/mysql/
   # Or use Chocolatey:
   choco install mysql
   ```

2. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE healthcare_db;
   ```

3. **Update .env file**
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=healthcare_db
   DB_PORT=3306
   ```

#### Option 2: Docker MySQL

1. **Run MySQL Container**
   ```bash
   docker run --name healthcare-mysql \
     -e MYSQL_ROOT_PASSWORD=your_password \
     -e MYSQL_DATABASE=healthcare_db \
     -p 3306:3306 \
     -d mysql:8.0
   ```

2. **Update .env file**
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=healthcare_db
   DB_PORT=3306
   ```

#### Option 3: Cloud MySQL (AWS RDS, Google Cloud SQL, etc.)

1. **Create MySQL instance** in your cloud provider
2. **Update .env file** with cloud credentials:
   ```env
   DB_TYPE=mysql
   DB_HOST=your-cloud-host.amazonaws.com
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=healthcare_db
   DB_PORT=3306
   ```

### 📊 Database Schema

The MySQL version includes these tables:

#### Patients Table
```sql
CREATE TABLE patients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other'),
  chronic BOOLEAN DEFAULT FALSE,
  last_risk_score DECIMAL(3,2),
  last_risk_level ENUM('low', 'moderate', 'high'),
  last_risk_updated_at BIGINT,
  last_risk_model_version VARCHAR(50),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
```

#### Patient Records Table
```sql
CREATE TABLE patient_records (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  type ENUM('visit', 'lab', 'prescription', 'followup'),
  created_by VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  vitals_systolic INT,
  vitals_diastolic INT,
  vitals_pulse INT,
  vitals_spo2 INT,
  vitals_temp_c DECIMAL(4,2),
  symptoms JSON,
  attachment_ids JSON,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### Prescriptions Table
```sql
CREATE TABLE prescriptions (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  doctor VARCHAR(255) NOT NULL,
  meds JSON NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### Stock Table
```sql
CREATE TABLE stock (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL
);
```

### 🔄 Migration Process

1. **Set `DB_TYPE=mysql`** in `.env`
2. **Start your application** - tables will be created automatically
3. **Seed demo data** using the admin dashboard or API endpoint
4. **All existing API endpoints** work identically with both storage types

### 🧪 Testing Database Connection

```bash
# Start the application
npm run dev

# Check console output for:
# ✅ Database connected successfully
# ✅ Database tables initialized successfully
```

### 📈 Performance Considerations

**In-Memory vs MySQL Performance:**

| Operation | In-Memory | MySQL |
|-----------|-----------|--------|
| Create Patient | ~1ms | ~5-15ms |
| List Patients | ~1ms | ~10-50ms |
| Complex Queries | ~1-5ms | ~20-100ms |
| Data Persistence | ❌ | ✅ |

**Recommended Usage:**
- **Development/Demo**: In-memory storage (`DB_TYPE=memory`)
- **Production**: MySQL database (`DB_TYPE=mysql`)

### 🔧 Troubleshooting

#### Common Issues:

1. **Connection Failed**
   ```bash
   ❌ Database connection failed: Error: connect ECONNREFUSED
   ```
   **Solution**: Check if MySQL is running and credentials are correct

2. **Database Not Found**
   ```bash
   ❌ Database connection failed: Error: Unknown database 'healthcare_db'
   ```
   **Solution**: Create the database first:
   ```sql
   CREATE DATABASE healthcare_db;
   ```

3. **Access Denied**
   ```bash
   ❌ Database connection failed: Error: Access denied for user
   ```
   **Solution**: Check username/password in `.env` file

4. **Port Already in Use**
   ```bash
   ❌ Error: listen EADDRINUSE :::3306
   ```
   **Solution**: Change `DB_PORT` in `.env` or stop conflicting service

### 🚀 Next Steps

1. **Set up production database** (AWS RDS, Google Cloud SQL, etc.)
2. **Configure backup strategy** for production data
3. **Add database monitoring** and performance optimization
4. **Implement database migrations** for schema updates
5. **Add connection pooling** optimization for high traffic

---

## File Structure

```
src/
├── lib/
│   ├── db.ts              # Database abstraction layer
│   ├── db-mysql.ts        # MySQL implementation  
│   ├── database.ts        # Connection utilities
│   └── db-backup.ts       # Backup of original in-memory version
```

The application automatically chooses the appropriate database based on the `DB_TYPE` environment variable, ensuring seamless switching between development and production environments.