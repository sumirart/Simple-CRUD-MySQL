require('dotenv').config()

// import dependencies that you want to use
const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const logger = require('morgan')
const mysql = require('mysql')

// use module
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// initialize mysql connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
connection.connect(err => {
    if(err) throw err;
})

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})

app.get('/', function(req, res){
    connection.query('SELECT * FROM `laptop`', function(err, results, fields){
        if(err) {
            console.log(err)
        } else {
            res.status(200).json({
                status: 200,
                error: false,
                message: 'Successfully get all data!',
                data: results
            })
        }
    })
})
app.get('/:id', function(req, res){
    connection.query('SELECT * FROM `laptop` WHERE `id` = ?', req.params.id, function(err, results, fields){
        if(err) {
            console.log(err)
        } else {
           if(results.length > 0) {
            res.status(200).json({
                status: 200,
                error: false,
                message: 'Successfully get single data!',
                data: results
            })
           } else {
            res.status(400).json({
                status: 400,
                error: true,
                message: 'No data found!',
                data: results
            })
           }
        }
    })
})
app.post('/', (req, res) => {
    // const name = req.body.name ? req.body.name : 'no data' || ternary operator
    // const desc = req.body.desc ? req.body.desc : 'no data'
    // const price = req.body.price ? req.body.price : 'no data'
    const { name, description, price } = req.body

    connection.query('INSERT INTO `laptop` (name, description, price) values (?, ?, ?)',
    [name, description, price], function(err, results){
        if(err) {
            console.log(err)
            res.status(400).json({
                status: 400,
                message: 'Error add new data!', 
            })
        } else {
            res.status(200).json({
                status: 200,
                error: false,
                message: 'Successfully add new data!',
                data: req.body
            })
        }
    })
    // res.status(200).json({
    //     status: 200,
    //     message: 'You have successfully add new data!',
    //     data: name
    // })
})

app.put('/:id', function(req, res){
    const { name, description, price } = req.body;

    if(!name || !description || !price) {
        res.status(300).json({
            status: 300,
            error: true,
            message: 'name, description and price needed for update!',
        })
    } else {
        connection.query('UPDATE `laptop` SET name = ?, description = ?, price = ?',
    [ name, description, price],
    function(err, results) {
        if(err) {
            console.log(err)
        } else {
            res.status(200).json({
                status: 200,
                error: false,
                message: 'Successfully update data with id: ' + req.params.id,
                data: req.body
            })
        }
    })
    }
})

app.delete('/:id', function(req, res){
    connection.query('DELETE from `laptop` WHERE `id` = ?',
    [ req.params.id ],
    function(err, results) {
        if(err) {
            console.log(err)
        } else {
            if(results.affectedRows > 0 ){
                res.status(200).json({
                    status: 200,
                    error: false,
                    message: 'Successfully delete data with id: ' + req.params.id,
                })
            } else {
                res.status(400).json({
                    status: 400,
                    error: true,
                    message: 'Cannot delete data with id: ' + req.params.id,
                })
            }
        }
    })
})

app.get('*', function(req, res){
    console.log('someone access 404')
    res.send('404 Not Found!')
})
