const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/addreadings', (req, res) => { 
    let sql = 'INSERT IGNORE INTO invoicing (client_id, period_from, period_to, period_days, scale_number, scale_type, time_zone, readings_new, readings_old, diff, correction, deduction, total_qty, service, qty, price, value_bgn, type, operator) VALUES ?';
    db.query(sql, [req.body], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Данните за фактуриране са качени в базата');
        return res.send("Данните за фактуриране са качени в базата");
    });
})

router.post('/getClient', (req, res) => {
    let sql = `SELECT * FROM clients WHERE ident_code IN (${req.body.join()})`;
    db.query(sql, req.body.join(), (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Получени са ид-тата на клиентите');
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;