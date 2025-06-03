# Backend Connectivity Test

## Test 1: Check if backend is running
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/api/auth/profile" -Method GET
```
Expected: Should return "Authentication required" error

## Test 2: Test login endpoint with invalid credentials
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/login" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"wrongpass"}'
```
Expected: Should return "Invalid credentials" error

## Test 3: Test login endpoint with your actual credentials
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/login" -Method POST -ContentType "application/json" -Body '{"email":"your-email@example.com","password":"your-password"}'
```
Expected: Should return success with tokens

## If tests pass but frontend fails:
The issue is likely CORS. Your backend needs to allow requests from http://localhost:3000

## Common Backend CORS Configuration:
```javascript
// For Express.js with cors middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

## Alternative: Test without CORS (for development only)
You can test by disabling web security in Chrome:
1. Close all Chrome instances
2. Start Chrome with: `chrome.exe --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=C:\temp\chrome-temp`
3. Try login again
