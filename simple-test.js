const { Client } = require('pg');

const client = new Client({
    user: 'postgres.fymsdmqgqadedohkpgsy',
    host: 'db.fymsdmqgqadedohkpgsy.supabase.co',
    database: 'postgres',
    password: 'Mowasaa2024', // ⚠️ Use the password you just reset!
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅✅✅ CONNECTION WORKS!!!');
        return client.query('SELECT COUNT(*) FROM medicines');
    })
    .then(res => {
        console.log('✅ Medicines in database:', res.rows[0].count);
        client.end();
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        console.error('\n⚠️ Make sure you:');
        console.error('1. Reset your password in Supabase to: Mowasaa2024!');
        console.error('2. Waited 30 seconds after resetting');
    });