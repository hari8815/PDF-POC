const express = require('express')
const app = express()
const port = process.env.PORT || 7000;
var download = require('download-file')
var fs      = require('fs');
var path    = require('path');
const util = require('./service/util.js')
const convertor = require('./service/convert-to-png.js')
var formidable = require('formidable');
const config =  require('dotenv').config;
const accessToken = require('./service/GenerateAccesToken.js')
var oldpdfdir;
var bodyParser = require('body-parser');
var PDFImage = require("pdf-image").PDFImage;
var PNGCrop = require('png-crop');
gm = require('gm')
const trimImage   = require('trim-image');
var jsforce = require('jsforce');
let uploadPath = '/public/uploadfile'
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var conn = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com/services/oauth2/token',
    oauth2 : {
      clientId : "3MVG9d8..z.hDcPI0Vp7ZATkKCk_ZgT_cYpQ_D7FN8_.tekqIwUNhom3C_5lutwsF2FfEV4XwY.aFL1R_n5iq",
      clientSecret: "4911084831847527315"
      }
});

app.post('/generateimg',(req,res) =>{
    
   var url1 = "http://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf";
   var url = req.body.url
   if(url1 == url){
        console.log('It equal',url);
   }
    else{
        console.log(req.body.url);
    }
   
    var options = {
        directory: __dirname + '/public',
        filename: "file.pdf"
    }

    download(url, options, function(err){
        if (err) {
            console.log('err',err)
        }
        else{
            console.log('download success');
        }

 
        convertor
        .convertToPng(options.directory)
        .then(imagePath => {           
            conn.login('jery@softsquare.biz', 'softsquare73vjANwKbPGzpFic2TPUzVQPjcq', function(err, res) {
                if (err) { return console.error(err); }       
                var fileOnServer = __dirname + '/public/output.png',
                fileName = 'outputs.png',
                fileType = 'image/png';
            
              fs.readFile(fileOnServer, function (err, filedata) {
                  if (err){
                      console.error(err);
                  }
                  else{
                      var base64data = new Buffer(filedata).toString('base64');
                      conn.sobject('Attachment').create({ 
                              ParentId: '0037F00000G3NZz',
                              Name : fileName,
                              Body: base64data,
                              ContentType : fileType,  
                          }, 
                          function(err, uploadedAttachment) {
                              console.log(err,uploadedAttachment);
                             
                      });
              }
              });
              });   
        })
        .catch(err => {
            console.log('unexpected error.')
            res.send(err)
        }) 
    })    
    res.send('sucess');
});

app.post("/", function (req,res){
    
    if(oldpdfdir){
        console.log('old directory exists')
        convertor.removeDir(oldpdfdir);
    }
    var randomnumber = new Date().getTime();
    
    var dir = '/fileupload-' + randomnumber;
    console.log(uploadPath);
    console.log('Upload Filename: ' + __dirname + uploadPath + dir);
    
    fs.mkdirSync(__dirname + uploadPath + dir);

    oldpdfdir = __dirname + uploadPath + dir;

    console.log('oldpdf directory',oldpdfdir);

    var form = new formidable.IncomingForm();
  
    console.log('Parsing form');

    form.parse(req, function (err, fields, files) {
      
        var oldpath = files.filetoupload.path
        console.log(oldpath)
        var newpath = __dirname + uploadPath + dir + '/file.pdf';

        util.copyFile(oldpath, newpath)
        .then(() => {
            if (err) throw err;
            console.log('directory ' + uploadPath + dir)
            convertor
            .convertToPng(__dirname + uploadPath + dir)
            .then(imagePath => {                
                res.sendFile(imagePath)                               
            })
            .catch(err => {
                console.log('unexpected error.')
                res.send(err)
            })
        })
        .catch(err => {
            console.log('error' + err)
            res.send(err)
        })
    });     
});
/*
app.get('/',(req,res) => {
    accessToken.
    getAccessToken().then((accessToken) =>{
        console.log('Access Token Generated')
    });
    res.sendFile(__dirname + '/public/pdfurl.html');
});

app.post('/gererateimg',(req,res) => {
  
   var url = JSON.stringify(req.body.url)
   
   if(oldpdfdir){
        console.log('old directory exist')
        convertor.removeDir(oldpdfdir);
   }
   
   var randomnumber = new Date().getTime();

   var dir = '/fileupload-' + randomnumber;

   console.log('Upload Filenamess: ' + __dirname + uploadPath + dir);
   
   fs.mkdirSync(__dirname + uploadPath + dir);
   
   oldpdfdir = __dirname + uploadPath + dir;
   
   var options = {
       directory: __dirname + uploadPath + dir,
       filename: "file.pdf"
   }
    
   download(url, options, function(err){
       if (err) throw err

       convertor
       .convertToPng(options.directory)
       .then(imagePath => {                
           res.sendFile(imagePath)                               
       })
       .catch(err => {
           console.log('unexpected error.')
           res.send(err)
       })
   }) 
   

})

app.post('/gererateimgs', (req,res) => {
    console.log('request ' + typeof req.body);
    console.log((req.body.url));
    console.log(JSON.stringify(req.body.url))
    res.send(req.body); 
}); 

*/
app.get('/',(req,res) =>{
  //res.sendFile(__dirname + '/public/index.html')
  /* var config2 = {width:'1000',height:'1000',top: 100,left:100,right:100,bottom:100};
   
  var imgBuffer = fs.readFileSync(__dirname+'/output.png');
  PNGCrop.cropToStream(imgBuffer, config2, function(err, outputStream) {
    if (err) throw err;
    outputStream.pipe(fs.createWriteStream('aftercrop.png'));
  }); 
  console.log('Called');
  trimImage(`./img/${'out-0.png'}`, `${'ab.png'}`);
  console.log('Calledasdsad'); */
  const images = allFilesSync('/img/').filter((out) => filename.match(/\.png$/));
  
 images.forEach((filename) => {
     trimImage(`/img/${filename}`, `${filename}`, { top: false, left: false }, (err) => {
         if (err) {
           console.log(err);
           return;
         }
     });
 });
}); 

app.listen(port, () => console.log('App listening on port' + port))