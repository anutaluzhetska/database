import dotenv from 'dotenv'
import pg from 'pg';
dotenv.config()

const { Pool } = pg;
const pool = new Pool({
   connectionString: `${process.env.DB_URL}`,
   ssl: {
      rejectUnauthorized: false
   }
});

const initializeDatabase = async () => {
   console.log('Initializing cat database...');

   const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cats (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,              
    breed TEXT DEFAULT 'Метис',        
    age_years INTEGER NOT NULL,       
    weight_kg NUMERIC(4, 2),           
    favorite_food TEXT,                
    has_microchip BOOLEAN DEFAULT FALSE, 
    owner_contact TEXT,                
    character_notes TEXT,              
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
   try {
      await pool.query(createTableQuery);
      console.log('The cat table is ready to go.');
   } catch (error) {
      console.error('Error initializing database:', error.message);
      console.error('Full error:', error);
      throw error;
   }
};
// 2. INSERT — Додавання нового котика
async function addCat(name, age, breed, weight, food, chip, contact, notes) {
   const query = `
        INSERT INTO cats (
            name, age_years, breed, weight_kg, favorite_food, 
            has_microchip, owner_contact, character_notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`;

   const values = [name, age, breed, weight, food, chip, contact, notes];

   try {
      const res = await pool.query(query, values);
      console.log('The cat has been added with all the details:', res.rows[0]);
   } catch (err) {
      console.error('Error:', err.message);
   }

}

// 3. SELECT — Перегляд усіх котиків
async function getAllCats() {
   const res = await pool.query('SELECT * FROM cats ORDER BY id ASC');
   console.log('List of all cats:', res.rows);
}

// 4. UPDATE — Оновлення даних (наприклад, віку)
async function updateCatAge(id, newAge) {
   const query = 'UPDATE cats SET age_years = $1 WHERE id = $2 RETURNING *';
   const res = await pool.query(query, [newAge, id]);
   console.log('Cat data updated:', res.rows[0]);
}

// 5. DELETE — Видалення котика за ID
async function deleteCat(id) {
   await pool.query('DELETE FROM cats WHERE id = $1', [id]);
   console.log(`The cat with ID ${id} has been removed from the database..`);
}

(async () => {
   try {
      await initializeDatabase();
      console.log("Application is running...");

      console.log("Adding new cats...");
      await addCat('Рижуля', 8, 'Домашня', 4, "Будь який дорогий корм ");


      await getAllCats();

      const res = await pool.query('SELECT NOW()');
   } catch (err) {
      console.error("Failed to start application:", err);
   }
})();
