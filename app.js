const express = require('express');
const app = express();
const path = require('path');
const alert = require('alert');
var db = require('./database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'imgs')));//for using images
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/bloodbank', (req, res) => {
    res.render('home');
})
app.get('/bloodbank/login', (req, res) => {
    res.render('login');
})

async function getData(sql) {
    try {
        const x = await query(sql);
        try {
            return x[0].emp_id;
        } catch (e) {
            return 0;
        }
    } catch (e) {
        console.log(e);
    }
}

app.post('/bloodbank/login', async (req, res) => {
    var i = req.body;
    var id = i.id;
    var role = i.r;
    var pass = i.pass;
    var sql = `SELECT emp_id from receptionist WHERE emp_id = "${id}"`;
    r = await getData(sql);
    var sql = `SELECT emp_id from checker WHERE emp_id = "${id}"`;
    c = await getData(sql);
    var sql = `SELECT emp_id from administrator WHERE emp_id = "${id}"`;
    a = await getData(sql);
    if (role == "receptionist" && pass == "Reception@123" && id == r) {
        res.redirect(`/bloodbank/reception/${id}`);
    } else if (role == "checker" && pass == "Checker@123" && id == c) {
        res.redirect(`/bloodbank/checker/${id}`);
    } else if (role == "administrator" && pass == "Admin@123" && id == a) {
        res.redirect(`/bloodbank/administrator`);
    } else {
        alert("Invalid Login :(")
        res.redirect("/bloodbank/login");
    }
})

app.get('/bloodbank/reception/:emp_id', (req, res) => {
    var { emp_id } = req.params;
    res.render('reception', { emp_id });
})

app.post('/bloodbank/reception/:emp_id', (req, res) => {
    var { emp_id } = req.params;
    var i = req.body;
    var id = i.aadhar;
    var name = i.name;
    var gender = i.gender;
    var dob = i.dob;
    var phone = i.phone;
    var email = i.email;
    var address = i.address;
    var sql = `INSERT INTO donor1 VALUES ("${id}", "${name}", "${gender}","${dob}", "${phone}", "${email}", "${address}")`;
    try {
        query(sql);
    } catch (e) {
        console.log(e);
        pass;
    }
    var sql = `INSERT INTO donor2 VALUES ("${id}", CURRENT_DATE(),"${emp_id}","0")`;
    db.query(sql, function (err, data) {
        if (err) throw err;
    });
    res.redirect(`/bloodbank/reception/${emp_id}`);
})

app.get('/bloodbank/checker/:emp_id', (req, res) => {
    var { emp_id } = req.params;
    var sql = `SELECT donor2.donor_id,c_date,donor_name,gender FROM donor1 NATURAL JOIN donor2 where is_done="0"`;
    db.query(sql, function (err, data) {
        var donors = data;
        if (err) throw err;
        res.render('checker_display', { donors, emp_id });
    });
})

// convert date
function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
}

app.get('/bloodbank/:id/:name/:date/checker_form/:emp_id', (req, res) => {
    var { id, name, date, emp_id } = req.params;
    date = convert(date)
    res.render('checker_form', { id, name, date, emp_id });
})

app.post('/bloodbank/checker_form/:date/:emp_id', (req, res) => {
    var { date, emp_id } = req.params;
    var i = req.body;
    var id = i.aadhar;
    var bg = i.bg;
    var iron = i.iron;
    var quantit = i.quantity;
    var good = i.good
    if (good == 'y') {
        good = 1;
    } else {
        good = 0;
    }
    var sql = `INSERT INTO blood VALUES ("${id}", "${date}", "${bg}", "${iron}", "${quantit}", "${emp_id}", "${good}")`;
    db.query(sql, function (err, data) {
        if (err) throw err;
    });
    if (good == 1) {
        var sql = `UPDATE blood_bank SET quantity = quantity+"${quantit}" WHERE blood_group = "${bg}"`;
        db.query(sql, function (err, data) {
            if (err) throw err;
        });
    }
    var sql = `UPDATE donor2 SET is_done = "1" WHERE donor_id = "${id}" and c_date = "${date}"`;
    db.query(sql, function (err, data) {
        if (err) throw err;
    });
    res.redirect(`/bloodbank/checker/${emp_id}`);
})

app.get('/bloodbank/hospital', (req, res) => {
    res.render('hospital');
})

app.post('/bloodbank/hospital', (req, res) => {
    var i = req.body;
    var id = i.id;
    var name = i.name;
    var address = i.address;
    var email = i.email;
    var phone = i.phone;
    var bg = i.bg;
    var quantit = i.quantity;
    var sql = `INSERT INTO hospital1 VALUES ("${id}", "${name}", "${address}", "${email}","${phone}")`;
    try {
        query(sql);
    } catch (e) {
        console.log(e);
        pass;
    }
    var sql = `INSERT INTO hospital2 VALUES ("${id}","${bg}","${quantit}",CURRENT_DATE(),"0")`;
    db.query(sql, function (err, data) {
        if (err) throw err;
    });

    var sql = `INSERT INTO orders VALUES ("${bg}","${id}")`
    db.query(sql, function (err, data) {
        if (err) throw err;
    });
    res.redirect("/bloodbank");
})

app.get('/bloodbank/administrator/', (req, res) => {
    var sql = `SELECT hospital2.id,name,address,phone_no,blood_group,quantity,date_of_request FROM hospital1 NATURAL JOIN hospital2 WHERE is_received=0`;
    db.query(sql, async function (err, data) {
        var requests = data;
        if (err) throw err;
        var sql = `select * from blood_bank`;
        try {
            const data = await query(sql);
            res.render('admin_display', { requests, data });
        } catch (e) {
            console.log(e);
        }
    });
})

async function get_data(sql) {
    try {
        const quant = await query(sql);
        return quant[0].quantity;
    } catch (e) {
        console.log(e);
    }
}

app.get('/bloodbank/grant/:id/:bg', async (req, res) => {
    var { id, bg } = req.params;
    var l = []
    var sql = `SELECT quantity from hospital2 WHERE id = "${id}" and blood_group = "${bg}" and is_received="0"`;
    quant = await get_data(sql);
    var sql = `SELECT quantity from blood_bank WHERE blood_group = "${bg}"`;
    quant_bb = await get_data(sql);
    if (quant <= quant_bb) {
        var sql = `UPDATE hospital2 SET is_received = 1 WHERE id = "${id}" and blood_group = "${bg}" and is_received="0"`;
        db.query(sql, function (err, data) {
            if (err) throw err;
        });
        var sql = `DELETE from orders WHERE id = "${id}" and blood_group = "${bg}"`;
        db.query(sql, function (err, data) {
            if (err) throw err;
        });
        var sql = `UPDATE blood_bank SET quantity = quantity-"${quant}" WHERE blood_group = "${bg}"`;
        db.query(sql, function (err, data) {
            if (err) throw err;
        });
    } else {
        alert("Blood Quantity not Available :(")
    }
    res.redirect("/bloodbank/administrator")
})

async function get_data2(sql) {
    try {
        const quant = await query(sql);
        return quant[0];
    } catch (e) {
        console.log(e);
    }
}

app.get('/bloodbank/details', async (req, res) => {
    var sql = "SELECT SUM(CASE WHEN gender = 'm' THEN 1 ELSE 0 END) as Male_count,SUM(CASE WHEN gender = 'f' THEN 1 ELSE 0 END) as Female_count, SUM(CASE WHEN gender = 'o' THEN 1 ELSE 0 END) as Other_count FROM donor1 NATURAL JOIN donor2";
    gender_count = await get_data2(sql);
    var sql = "SELECT SUM(CASE WHEN DATE_FORMAT(`c_date`, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m') THEN 1 ELSE 0 END) as count FROM donor2";
    var month = await get_data2(sql);
    sql = "SELECT  distinct name, address  from hospital1 NATURAL JOIN hospital2 where is_received = '1'";
    const data = await query(sql);
    res.render('details', { gender_count, month, data });
})

app.post('/bloodbank/details', async (req, res) => {
    var search = req.body.query;
    var sql = `SELECT * FROM donor1 NATURAL JOIN donor2 where donor1.donor_id ="${search}"`;
    db.query(sql, function (err, data) {
        var donors = data;
        console.log(donors);
        if (err) throw err;
    });
    res.redirect('/bloodbank/details');
})

app.get('*', (req, res) => {
    res.send("Invalid URL :(")
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})