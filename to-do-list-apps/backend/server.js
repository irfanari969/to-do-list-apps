const dotenv = require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const app = express()
const port = 3000


app.use(cors())
app.use(express.json())


const db = mysql.createConnection({
    host: process.env.DB_HOST,     
    user: process.env.DB_USER,    
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME   
})

db.connect(err => {
    if (err) console.log('Error koneksi DB:', err)
    else console.log('Terkoneksi ke MySQL!')
})

// --- ROUTES (API) ---

app.get('/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks ORDER BY created_at DESC'
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err)
        res.json(results);
    })
})


app.post('/tasks', (req, res) => {
    const { task_name, due_date, priority } = req.body
    const sql = 'INSERT INTO tasks (task_name, due_date, priority) VALUES (?, ?, ?)'
    
    db.query(sql, [task_name, due_date, priority], (err, result) => {
        if (err) return res.status(500).json(err)
        res.status(201).json({ message: 'Task created', id: result.insertId })
    })
})


app.patch('/tasks/:id/status', (req, res) => {
    const { id } = req.params
    const { completed } = req.body
    
    const sql = 'UPDATE tasks SET completed = ? WHERE id = ?'
    
    db.query(sql, [completed, id], (err, result) => {
        if (err) return res.status(500).json(err)
        res.json({ message: 'Status updated' })
    })
})

app.delete('/tasks/bulk/completed', (req, res) => {
    const sql = 'DELETE FROM tasks WHERE completed = 1'
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err)
        res.json({ message: 'Completed tasks deleted' })
    })
})

app.delete('/tasks/bulk/all', (req, res) => {
    const sql = 'DELETE FROM tasks'
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err)
        res.json({ message: 'All tasks deleted' })
    })
})

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params
    const sql = 'DELETE FROM tasks WHERE id = ?'
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err)
        res.json({ message: 'Task deleted' })
    })
})

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`)
})