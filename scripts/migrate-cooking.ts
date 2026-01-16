import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
    console.log('Starting manual migration for cooking tables...');

    const migrationSQL = fs.readFileSync(
        path.join(__dirname, '../drizzle/0001_brown_fixer.sql'),
        'utf8'
    );

    console.log('Migration SQL:');
    console.log(migrationSQL);

    try {
        // Split by statement-breakpoint and execute each statement
        const statements = migrationSQL
            .split('-->statement-breakpoint')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`\nExecuting: ${statement.substring(0, 100)}...`);
            await db.execute(statement);
            console.log('✓ Success');
        }

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    } finally {
        db.close();
    }
}

migrate().catch(console.error);
