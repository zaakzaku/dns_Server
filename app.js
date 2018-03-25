const express = require('express');
const bodyParser = require('body-parser');
var mysql = require('mysql');
var reverse = require('reverse-string');
var ip = require('ip');
const app = express()
var fs = require('fs');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'domain'
})

connection.connect(function(err) {
    if (err) throw err
    console.log('You are now database connected...')
})

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
   connection.query('SELECT * FROM lists', function(err, rows) {
         if (err)
             throw err
         if (rows)
             res.render('index', {title: 'Wall', data: rows});
       });
})
app.post('/', function (req, res) {
  var myip = ip.address();
  var myiprev = reverse(myip);
  var timestamp = new Date().getTime().toString();
  var domain = req.body.domain;
  var type = req.body.dmtype;
  var dmtype = domain+type;
  console.log(domain+type);
  connection.query("INSERT INTO `lists`(`id`, `domain`, `path`, `recorder`, `date`) VALUES (null,'"+dmtype+"','etc/path','mx',now())", function(err, result) {
  })


  //"mytext file
  var stream = fs.createWriteStream(domain+".txt");
  stream.once('open', function(fd) {
      stream.write("$TTL    604800\n");
      stream.write("@       IN       SOA     "+dmtype+". root."+dmtype+". (\n");
      stream.write("      2; Serial         \n");
      stream.write(" 604800; Refresh           \n");
      stream.write(" 2419200; Expire         \n");
      stream.write(" 604800 )); Negative Cache TTL\n");
      stream.write(";\n");
      stream.write("@ IN  NS  "+dmtype+".     \n");
      stream.write("@ IN  A "+myip+"     \n");
      stream.write("www IN A "+myip+"    \n");
      stream.end();
  });
  //mytext file end
  //Reverse file start writing
  var revstream = fs.createWriteStream(domain+"rev.txt");
  revstream.once('open', function(fd) {
      revstream.write("$TTL    604800\n");
      revstream.write("@       IN       SOA     "+dmtype+". root."+dmtype+". (\n");
      revstream.write("      2; Serial         \n");
      revstream.write(" 604800; Refresh           \n");
      revstream.write(" 2419200; Expire         \n");
      revstream.write(" 604800 )); Negative Cache TTL\n");
      revstream.write(";\n");
      revstream.write("@ IN  NS  "+dmtype+".     \n");
      revstream.write(myiprev+" IN  PTR "+req.body.domain+".       \n");
      revstream.end();
  });
  //end reverse file writing
  //append file add line
  fs.appendFile('named.conf.local', 'zone"'+dmtype+'"{\n   type master;\n  file "/etc/bind/'+domain+'";\n };\n', function (err) {
    if (err) {
        console.log(err);
      // append failed
    } else {

    }
  })

  fs.appendFile('named.conf.local', 'zone"'+timestamp+'" {\n   type master;\n  file "/etc/bind/reverse3";\n };\n', function (err) {
    if (err) {
        console.log(err);
      // append failed
    } else {

    }
  })
  //end append
   connection.query('SELECT * FROM lists', function(err, rows) {
         if (err)
             throw err
         if (rows)
             res.render('index', {title: 'Wall', data: rows});
       });
})
app.listen(3000, function () {
    console.log('listening on port 3000!')
})
