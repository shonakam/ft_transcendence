curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "alice",
    "password": "Passw0rd<!?>"
}'