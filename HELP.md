# 📦 Database Import Guide (MongoDB)

This project includes sample database data inside the `backup-database` folder.

You can import this data into your local MongoDB using either **MongoDB Compass (GUI)** or **CLI tools**.

---

## 📁 Folder Structure

```
backend/
 └── database-data/
     ├── users.json
     ├── laptops.json
     ├── rentals.json
     ├── payments.json
     ├── reviews.json
```

---

## Import using MongoDB Compass (Recommended)

1. Open MongoDB Compass

2. Connect to:

   ```
   mongodb://localhost:27017
   ```

3. Click **Create Database**
   - Database Name: `Laptop-Rental`
   - Collection Name: `users`

4. Open the collection → Click:
   **Add Data → Import File**

5. Select file:

   ```
   backup-database/users.json
   ```

6. Choose format:

   ```
   JSON
   ```

7. Click **Import**

---

### 🔁 Repeat for all files:

| File          | Collection |
| ------------- | ---------- |
| users.json    | users      |
| laptops.json  | laptops    |
| rentals.json  | rentals    |
| payments.json | payments   |
| reviews.json  | reviews    |

---

## 🔧 Final Step

Update your `.env`:

```
MONGO_URI=mongodb://localhost:27017/Laptop-Rental
```

---

## ✅ Done!

Your local database is now ready to use
