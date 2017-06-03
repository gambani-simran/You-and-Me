var app = require('express')();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({secret: 'itsasecret',
				saveUninitialized: true,
				resave: true}));

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');
app.set('view engine', 'ejs');

var connection = mysql.createPool({
	connectionLimit: 50,
	host     : 'localhost',
  	user     : 'root',
  	password : '',
  	database : 'myDB'
});

//test for connection-landing page
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
    connection.getConnection(function(error, tempCont){
		if(!!error){
			console.log("Error");
		}else{
			console.log("Connected");
			tempCont.query("SELECT * FROM vendorlist", function(error, rows, fields){
				//tempCont.release();
				if(!!error){
					console.log("Error in query");
				}else{
					console.log("Successful query");
					console.log(rows[0].ven_name);
          			console.log(rows[0].ven_img);
          		}
				});
global.lastid=0;
//user sign-up
app.get('/data', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});
//vendor sign-up
app.get('/insert', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/venreg.html'));
});
app.get('/userlogin', function(req, res) {
    res.sendFile(path.join(__dirname, 'userlogin.html'));
});
app.get('/useraddl', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/addluserinfo.html'));
});

//user sign-up and data insertion
app.post('/data', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/register.html'));
    console.log(req.body.Name);
    
    // Add these values to your MySQL database here
     var queryString = "insert into usertable(Name,EmailId,Password) values('"+req.body.Name+"','"+req.body.EmailId+"','"+req.body.Password+"')";
       
       connection.query(queryString,function(error,results){
           if(error)
               {
                   throw error;
				}
           else 
               {
                 console.log('Inserted Successfully!');
                
               }
           
       }); 
});
app.post('/addldata', function(req, res){
  res.sendFile(path.join(__dirname, 'views/addluserinfo.html'));
    console.log(req.body.Name);
    
    // Add these values to your MySQL database here
     var queryString = "insert into addluserinfo(UName,UType,UYear,UMon,UEngage,USan,UWed) values('"+req.body.UName+"','"+req.body.UType+"','"+req.body.UYear+"','"+req.body.UMon+"','"+req.body.UEngage+"','"+req.body.USan+"','"+req.body.UWed+"')";
       
       connection.query(queryString,function(error,results){
           if(error)
               {
                   throw error;

               }
           else 
               {
                 console.log('Inserted Successfully!');
                 
               }
           
       }); 
      /* res.writeHead(302, {
      'Location': 'http://localhost:3000/'
      });
      res.end();*/
});

//vendor sign-up and data insert
app.post('/insert', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/venreg.html'));
    console.log(req.body.Vendor_name);
    
    // Add these values to your MySQL database here
     var queryvend = "insert into vendortable(Vendor_name,Brand,Vendor_type,City,Email,VPassword) values('"+req.body.Vendor_name+"','"+req.body.Brand+"','"+req.body.Vendor_type+"','"+req.body.City+"','"+req.body.Email+"','"+req.body.VPassword+"')";
       
       connection.query(queryvend,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                console.log(results.insertId);
                lastid=results.insertId;
                 res.send('Inserted Successfully!')
               }
           
       }); 
       var queryv = "insert into allvendors(VName,VBrand,VType,VCity,VEmail) values('"+req.body.Vendor_name+"','"+req.body.Brand+"','"+req.body.Vendor_type+"','"+req.body.City+"','"+req.body.Email+"')";
       
       connection.query(queryv,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                console.log(results.insertId);
                lastid=results.insertId;
                 res.send('Inserted Successfully!');
               }
           
       }); 
   		/*res.writeHead(302, {
      'Location': 'http://localhost:3000/'
      });
      res.end();*/    
});
app.post('/userlogin', function(req, res) {
  res.sendFile(path.join(__dirname, 'userlogin.html'));
    //console.log(req.body.Vendor_name);
    
    // Add these values to your MySQL database here
     connection.query("SELECT * FROM usertable",function(err,rows){
        if(err) throw err;
        
        console.log('Data received from Db:\n');
        console.log(rows[0]);
        if (rows[0].EmailId == req.body.EmailId && rows[0].Password == req.body.Password) {
          console.log("Successfully logged in");
          res.redirect('/');
        }
        });
       /*connection.query(queryvend,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                console.log(results.insertId);
                lastid=results.insertId;
                 res.send('Inserted Successfully!')
               }
           
       }); */
      /*res.writeHead(302, {
      'Location': 'http://localhost:3000/'
      });
      res.end();*/
       
});
//selecting one vendor category and landing on its list page
app.get('/select_vendor',function(req,res){
  console.log(req.query.catg);
  var x = req.query.catg;
  connection.query("SELECT * FROM vendortable WHERE Vendor_type = '" + x + "' ORDER BY Vid", function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
  res.render('selectedvendor',{page_title:"Vendor-select",data:rows});
});
});
//loading of vendor additional details form
app.get('/vendor_insert', function(req, res) {
    
    connection.query("SELECT * FROM vendortable",function(err,rows){
        if(err) throw err;
        console.log(lastid);
        console.log('Data received from Db:\n');
        console.log(rows);
        res.render('addlvendor',{page_title:"Vendor-register",data:rows});
        });
    //res.sendFile(path.join(__dirname, 'addlvendor.ejs'));
    //console.log(req.body.VName);
    // Add these values to your MySQL database here
    /* var queryvend = "insert into allvendors(VName,VBrand,VType,VCity,VEmail,VContact,VDescription,VPricing,VAddress,VPaymentTerms,VTravelCost) values('"+req.body.VName+"','"+req.body.VBrand+"','"+req.body.VType+"','"+req.body.VCity+"','"+req.body.VEmail+"','"+req.body.VContact+"','"+req.body.VDescription+"','"+req.body.VPricing+"','"+req.body.VAddress+"','"+req.body.VPaymentTerms+"','"+req.body.VTravelCost+"')";
       
       connection.query(queryvend,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                 res.send('Inserted Successfully!')
               }
           
       }); 
     */   
});
//submission of vendor additional form 
app.post('/vendor_insert', function(req, res) {
  
    //res.sendFile(path.join(__dirname, 'addlvendor.ejs'));
    console.log(req.body.VName);
    var name = req.body.VName;
    // Add these values to your MySQL database here
    //var queryvend = "UPDATE allvendors(VContact,VDescription,VPricing,VAddress,VPaymentTerms,VTravelCost,VPic_a,VPic_b,VPic_c,VLink_a,VLink_b) values('"+req.body.VContact+"','"+req.body.VDescription+"','"+req.body.VPricing+"','"+req.body.VAddress+"','"+req.body.VPaymentTerms+"','"+req.body.VTravelCost+"','"+req.body.VPic_a+"','"+req.body.VPic_b+"','"+req.body.VPic_c+"','"+req.body.VLink_a+"','"+req.body.VLink_b+"') where VName ='"+name+"'";

    var queryvend = "UPDATE allvendors SET VContact = '"+req.body.VContact+"', VDescription = '"+req.body.VDescription+"', VPricing = '"+req.body.VPricing+"', VAddress = '"+req.body.VAddress+"', VPaymentTerms = '"+req.body.VPaymentTerms+"', VTravelCost = '"+req.body.VTravelCost+"', VPic_a = '"+req.body.VPic_a+"', VPic_b = '"+req.body.VPic_b+"', VPic_c = '"+req.body.VPic_c+"', VLink_a = '"+req.body.VLink_a+"', VLink_b = '"+req.body.VLink_b+"' WHERE VName = '"+name+"'";
    var n;  
       connection.query(queryvend,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                 res.send('Inserted Successfully!');
                 //n=(results.length-1);
               }
           
       });
       var z = req.body.VPic_b;
       n = req.body.VName;
    var queryimg = "UPDATE vendortable SET VPic = '"+z+"' WHERE Vendor_name = '"+n+"'";
       
       connection.query(queryimg,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                 res.send('Inserted Successfully!')
               }
           
       }); 
       
});


/*app.post('/vendor_login', function(req, res) {
  
    connection.query('SELECT * FROM vendortable',function(err,rows){
        if(err) throw err;

        console.log('Data received from Db:\n');
        console.log(rows);
        for(var i=0; i<rows.length; i++)
        {
          if(rows[i].Email == req.body.vLogin)
          {
            res.render('vprofile',{page_title:"Welcome vendor",data:rows});
          }
        }
        });
       
});*/
//selecting one vendor from the categories  and landing on its profile page
app.get('/onevendor_selected',function(req,res){
  console.log(req.query.name);
  var y = req.query.name;
  connection.query("SELECT * FROM allvendors WHERE VName = '" + y + "' ORDER BY V_ID",function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
  res.render('view',{page_title:"Vendor profile",data:rows});
});
});

app.get('/viewaddl',function(req,res){
  //console.log(req.query.name);
  
  connection.query("SELECT * FROM addluserinfo",function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
  res.render('userprofile',{page_title:"User profile",data:rows});
});
});

app.post('/likes',function(req,res){

  var queryvend = "insert into userinfo(ven_liked) values('"+req.body.ven_liked+"')";
       
       connection.query(queryvend,function(error,results){
           if(error)
               {
                   throw error;
               }
           else 
               {
                 res.send('Inserted Successfully!')
               }
           
       });
});

}
});
});
app.listen(3000);