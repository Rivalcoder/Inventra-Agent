# Authentication System

This application supports dual authentication modes: **Cloud (Airtable)** and **Local** authentication. Users can choose their preferred authentication method during sign-in and sign-up.

## Authentication Modes

### 1. Cloud Authentication (Airtable)
- **Data Storage**: User data stored securely in Airtable cloud database
- **Internet Required**: Requires internet connection
- **Features**: 
  - Cloud-based user management
  - Cross-device synchronization
  - Professional-grade security
  - Backup and recovery options

### 2. Local Authentication
- **Data Storage**: User data stored locally in browser's localStorage
- **Offline Capable**: Works without internet connection
- **Features**:
  - Privacy-focused (data stays on your device)
  - Fast authentication
  - No external dependencies
  - Perfect for development and testing

## Environment-Based Configuration

The authentication mode can be configured based on the environment:

### Development Environment
- Automatically detects localhost/development environments
- Enables demo mode features
- Shows both authentication options
- Defaults to local authentication for faster development

### Production Environment
- Can be configured via environment variables
- Defaults to cloud authentication for production
- Demo features disabled

## Configuration

### Environment Variables
```bash
# Authentication Mode (local | airtable)
AUTH_MODE=airtable

# Airtable Configuration (for cloud mode)
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here

# Demo Mode (true | false)
ENABLE_DEMO_MODE=true

# Default Database Type
DEFAULT_DATABASE_TYPE=sqlite
```

### Runtime Configuration
The authentication mode can be changed at runtime through the UI:
1. Go to the sign-in or sign-up page
2. Use the "Authentication Mode" selector
3. Choose between "Cloud (Airtable)" or "Local"
4. The selection is saved and persists across sessions

## Demo Credentials

When running in development mode, demo credentials are available:

### Cloud Mode Demo
- **Email**: `demo@airtable.com`
- **Password**: `demo123`

### Local Mode Demo
- **Email**: `demo@local.com`
- **Password**: `demo123`

## Usage

### Sign In
1. Navigate to `/auth/signin`
2. Select your preferred authentication mode
3. Enter your credentials
4. Click "Sign In"

### Sign Up
1. Navigate to `/auth/signup`
2. Select your preferred authentication mode
3. Fill in account information
4. Configure database settings
5. Click "Create Account"

## Data Storage

### Cloud Mode (Airtable)
- User accounts stored in Airtable database
- Database configurations stored with user profiles
- Session data stored in browser localStorage
- Authentication state persists across browser sessions

### Local Mode
- User accounts stored in browser localStorage
- Database configurations stored locally
- All data remains on the user's device
- Data is lost if browser data is cleared

## Security Considerations

### Cloud Mode
- Passwords should be hashed in production
- API keys should be stored securely
- HTTPS required for production
- Regular security audits recommended

### Local Mode
- Data is not encrypted by default
- Suitable for development and testing
- Not recommended for sensitive production data
- Consider implementing local encryption for sensitive data

## Migration Between Modes

Users can switch between authentication modes:
1. Sign out of current account
2. Go to sign-in page
3. Select different authentication mode
4. Sign in with existing credentials (if available)

**Note**: Data does not automatically sync between modes. Users need to recreate accounts if switching from local to cloud mode.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (optional)
4. Run development server: `npm run dev`
5. Access the application at `http://localhost:3000`

## Production Deployment

1. Set `AUTH_MODE=airtable` for cloud authentication
2. Configure Airtable API credentials
3. Set `ENABLE_DEMO_MODE=false`
4. Deploy with proper environment variables
5. Ensure HTTPS is enabled

## Troubleshooting

### Common Issues

1. **Local mode not working**: Check if localStorage is enabled in browser
2. **Cloud mode errors**: Verify Airtable API credentials
3. **Demo mode not showing**: Ensure you're running in development environment
4. **Authentication state lost**: Check browser localStorage settings

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see detailed authentication logs in the browser console. 