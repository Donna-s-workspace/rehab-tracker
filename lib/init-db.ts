// Database initialization script - runs once on app startup
import { query } from './db';
import bcrypt from 'bcryptjs';

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking database initialization...');
    
    // Check if demo user exists
    const result = await query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      ['demo@rehab.local']
    );
    
    if (result.length === 0) {
      console.log('📝 Creating demo user...');
      
      // Hash the password
      const passwordHash = await bcrypt.hash('Demo2026!', 10);
      
      // Insert demo user
      await query(
        `INSERT INTO users (email, password_hash, display_name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['demo@rehab.local', passwordHash, 'Demo User', 'athlete']
      );
      
      console.log('✅ Demo user created successfully');
    } else {
      console.log('✅ Demo user already exists');
      
      // Update password hash to ensure it's correct
      const passwordHash = await bcrypt.hash('Demo2026!', 10);
      await query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, 'demo@rehab.local']
      );
      console.log('✅ Demo user password updated');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't throw - allow app to start even if init fails
  }
}
