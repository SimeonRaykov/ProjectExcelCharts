const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/getAllClients', (req, res) => {

    let sql = `SELECT clients.id, client_name, ident_code, metering_type, erp_type FROM clients`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/filterClients/:erp_type/:metering_type', (req, res) => {
    let erpType = req.params.erp_type;
    let meteringType = req.params.metering_type;
    let sql = `SELECT clients.id, client_name, ident_code, metering_type, erp_type FROM clients
    WHERE 1=1 `;
    if (erpType != 'all') {
        const splitedERPTypes = erpType.split(',');
        sql += ` AND ( erp_type = ${splitedERPTypes[0]} `;
        for (let i = 1; i < erpType.length; i += 1) {
            if (splitedERPTypes[i] && splitedERPTypes[i] != null) {
                sql += ` OR erp_type = ${splitedERPTypes[i]} `;
            }
        }
        sql += ` )`;
    }
    if (meteringType != 'all') {
        if (meteringType.length != 2) {
            sql += ` AND metering_type = ${meteringType}`;
        }
    }

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/data-listings/all-clients', (req, res) => {
    let sql = `SELECT DISTINCT clients.ident_code, clients.client_name
     FROM clients`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/data-listings/ident-codes/:clientName', (req, res) => {
    let {
        clientName
    } = req.params;
    let sql = `SELECT DISTINCT clients.ident_code
     FROM clients
     WHERE clients.client_name LIKE '%${clientName}%'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;