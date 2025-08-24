# Laravel Backend Setup Guide

## Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL/PostgreSQL
- Node.js (for frontend assets)

## Installation Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Configure database in .env:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=investpro
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. **Run migrations:**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional):**
   ```bash
   php artisan db:seed
   ```

8. **Start the server:**
   ```bash
   php artisan serve
   ```

## API Endpoints

The backend provides these main endpoints:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout (requires auth)
- `GET /api/profile` - Get user profile (requires auth)
- `POST /api/update` - Update user profile (requires auth)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (requires auth)
- `GET /api/about` - Get about page data (requires auth)

### Investment
- `GET /api/investment_plan` - Get investment plans (requires auth)
- `GET /api/investment` - Get user investments (requires auth)

### Deposits
- `POST /api/deposits/{plan_id}` - Create deposit (requires auth)

### Withdrawals
- `POST /api/withdrawal` - Create withdrawal (requires auth)

### Transactions
- `GET /api/single-transaction` - Get user transactions (requires auth)
- `GET /api/all-transaction` - Get all transactions (requires auth)

### Contact
- `POST /api/contact` - Send contact message (requires auth)

## Important Notes

1. **CORS Configuration:** Make sure to configure CORS in `config/cors.php` to allow requests from your React Native app.

2. **API Base URL:** Update the `BASE_URL` in `src/utils/apiConfig.ts` to match your Laravel server URL.

3. **Authentication:** The API uses Laravel Sanctum for authentication. Tokens are automatically handled by the React Native app.

4. **File Uploads:** For file uploads (like deposit proofs), the backend expects multipart/form-data.

## Troubleshooting

1. **CORS Issues:** Add your app's domain to the allowed origins in `config/cors.php`
2. **Database Issues:** Make sure your database is running and credentials are correct
3. **Token Issues:** Check if Sanctum is properly configured in `config/sanctum.php`

## Development

To run in development mode with auto-reload:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

This will make the API accessible from your React Native app running on a device or simulator.
