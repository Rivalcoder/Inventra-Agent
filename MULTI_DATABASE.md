# Multi-Database Support

This application now supports multiple database types: **MySQL**, **MongoDB**, and **PostgreSQL**. Users can configure their preferred database during account creation and manage database settings through the application interface.

## Supported Databases

### 1. MySQL
- **Type**: Relational Database
- **Default Port**: 3306
- **Features**: 
  - ACID compliance
  - Excellent performance
  - Wide community support
  - Recommended for most use cases

### 2. MongoDB
- **Type**: NoSQL Document Database
- **Default Port**: 27017
- **Features**:
  - Flexible document storage
  - No authentication required for local development
  - Great for unstructured data
  - Horizontal scaling capabilities

### 3. PostgreSQL
- **Type**: Advanced Relational Database
- **Default Port**: 5432
- **Features**:
  - Advanced features and ACID compliance
  - JSON support
  - Great for complex applications
  - Excellent for data integrity

## Database Configuration

### During Account Creation
1. Navigate to the signup page
2. Complete the account information (Step 1)
3. Configure database settings (Step 2):
   - Select database type (MySQL, MongoDB, or PostgreSQL)
   - Enter connection details (host, port, username, password, database name)
   - Test the connection
   - Save configuration

### After Account Creation
1. Go to Settings → Database
2. View current database configuration
3. Edit settings if needed
4. Test connection before saving

## Database Configuration Fields

### Common Fields
- **Host**: Database server address (default: localhost)
- **Port**: Database port number
- **Database Name**: Name of the database to use
- **Username**: Database user credentials
- **Password**: Database password

### Advanced Options
- **SSL**: Enable secure connections
- **Connection Limit**: Maximum number of connections
- **Character Set**: MySQL-specific character encoding

## Local Development Setup

### MySQL
```bash
# Using Docker
docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=ai_inventory -p 3306:3306 -d mysql:8.0

# Using XAMPP/WAMP
# Install XAMPP or WAMP and start MySQL service
```

### MongoDB
```bash
# Using Docker
docker run --name mongodb-db -e MONGO_INITDB_DATABASE=ai_inventory -p 27017:27017 -d mongo:latest

# Using MongoDB Community Server
# Download and install MongoDB Community Server
```

### PostgreSQL
```bash
# Using Docker
docker run --name postgres-db -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=ai_inventory -p 5432:5432 -d postgres:15

# Using PostgreSQL installer
# Download and install PostgreSQL from official website
```

## Database Schema

The application automatically creates the necessary tables/collections when connecting to a new database:

### Tables/Collections
1. **products**: Product inventory data
2. **sales**: Sales transaction data
3. **settings**: Application settings

### Indexes
- Products: Unique index on name
- Sales: Index on productId
- Settings: Unique index on setting_key

## Security Considerations

### Local Development
- Database credentials are stored in browser localStorage
- Suitable for development and testing
- No encryption by default

### Production Use
- Use environment variables for database credentials
- Enable SSL connections
- Implement proper credential management
- Consider using connection pooling
- Regular security audits recommended

## Migration Between Databases

### Switching Database Types
1. Go to Settings → Database
2. Edit configuration
3. Select new database type
4. Enter new connection details
5. Test connection
6. Save configuration

### Data Migration
- Export data from current database
- Import data to new database
- Verify data integrity
- Update application configuration

## Troubleshooting

### Connection Issues
1. **Check database server**: Ensure database service is running
2. **Verify credentials**: Check username and password
3. **Check port**: Ensure correct port is open
4. **Network issues**: Verify host accessibility
5. **Firewall**: Check firewall settings

### Common Error Messages
- **"Connection refused"**: Database server not running
- **"Access denied"**: Incorrect credentials
- **"Database not found"**: Database doesn't exist
- **"Connection timeout"**: Network or firewall issues

### Performance Issues
- **Connection pooling**: Adjust connection limits
- **Indexes**: Ensure proper indexes are created
- **Query optimization**: Review database queries
- **Resource limits**: Check server resources

## API Endpoints

### Test Connection
```http
POST /api/db/test-connection
Content-Type: application/json

{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "ai_inventory"
}
```

### Database Operations
All existing API endpoints now support multiple database types:
- `/api/db?action=stats` - Get dashboard statistics
- `/api/db?action=products` - Get products
- `/api/db?action=sales` - Get sales
- And more...

## Environment Variables

### Default Configuration
```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ai_inventory
DB_SSL=false
DB_CONNECTION_LIMIT=10
DB_CHARSET=utf8mb4
```

### Override Defaults
Set these environment variables to override default database configuration:
- `DB_TYPE`: Database type (mysql, mongodb, postgresql)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_SSL`: Enable SSL (true/false)
- `DB_CONNECTION_LIMIT`: Connection pool size
- `DB_CHARSET`: Character set (MySQL only)

## Best Practices

### Development
1. Use local databases for development
2. Test with different database types
3. Use connection pooling
4. Implement proper error handling

### Production
1. Use dedicated database servers
2. Enable SSL connections
3. Implement backup strategies
4. Monitor database performance
5. Use environment variables for configuration
6. Regular security updates

### Data Management
1. Regular backups
2. Data validation
3. Migration testing
4. Performance monitoring
5. Index optimization

## Support

For issues related to database configuration:
1. Check the troubleshooting section
2. Verify database server status
3. Test connection manually
4. Review error logs
5. Contact support with detailed error information
