var Queue = require('./service/queue.js');
const Promise = require('bluebird')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
var download = require('download-file')
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var bodyParser = require('body-parser');
var jsforce = require('jsforce');
var rimraf = require('rimraf');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var im = require('imagemagick')
var processPdf = require('./service/converts-pdf-to-png.js')
var saveImgtoSForce = require('./service/save-img-to-sforce.js')

let queue = new Queue((job, queue) => {convertpdftopng(job).then(() => queue.executeNext())}, 1);

// This Method convert the given pdf to image

function convertpdftopng(job){
    console.log('Iam Called');
    return new Promise((resolve,reject) => {   
    var url = job.url;
    var pageNum = job.pageNum;
    var cropSize = job.cropSize;
    var rootFolder =  new Date().getTime();    
    var uploadPath = __dirname + '/public/uploadfile/'+rootFolder 
   
    fs.mkdirSync(__dirname + '/public/uploadfile/'+rootFolder);    

        var downloadRandomNumber = new Date().getTime();
        
        console.log('EntryTime -->' + downloadRandomNumber);
        
        var downloadDir = '/fileupload-' + downloadRandomNumber;
        fs.mkdirSync(uploadPath + downloadDir);

        // This method download the pdf from the given url

        processPdf.
        downloadPdf(url, uploadPath + downloadDir).then(() => {
            var page = ''
            if(pageNum == '' || pageNum == undefined){
                page = ''
            }
            else{
                page = '['+pageNum+']'
            }
            
            var convertRandomNumber = new Date().getTime();
            var convertDir = '/convertedimg-' + convertRandomNumber;
            fs.mkdirSync(uploadPath + convertDir);
    
            var convertArgs = [
                uploadPath + downloadDir+"/file.pdf"+page,
                uploadPath + convertDir +"/outputs.png"
            ];

            // This method convert the given pdf to img

            processPdf.
            convert_crop_trim(convertArgs,uploadPath + convertDir).then( path => {
                
                var cropRandomNumber = new Date().getTime();
                var cropDir = '/cropedimg-' + cropRandomNumber;
                fs.mkdirSync(uploadPath + cropDir);
                var cropImg;
                if(cropSize == "" || cropSize ==  undefined){
                    cropImg = "730x480+30+50";
                }
                else{
                    cropImg = cropSize;
                }
                var cropArgs = [
                path + "/*.png",
                    "-crop",
                    cropImg,
                    uploadPath + cropDir+"/outputs.png"
                ];

                // This method crop the converted image

                processPdf.
                convert_crop_trim(cropArgs,uploadPath + cropDir).then( path =>{
                    
                    var trimRandomNumber = new Date().getTime();
                    var trimDir = '/trimmedimg-' + trimRandomNumber;
                    fs.mkdirSync(uploadPath + trimDir);

                    var outputdir;

                    if(pageNum == '' || pageNum == undefined){
                        outputdir = uploadPath + trimDir + "/result.png"; 
                    }
                    
                    else {
                        var page = pageNum.toString();
                        if(page.length == 1){
                            outputdir = uploadPath + trimDir+"/result-0.png";
                        }
                        else{
                            outputdir = uploadPath + trimDir + "/result.png"; 
                        }
                    }

                    var trimArgs = [
                    path+"/*.png",
                        "-trim",
                        outputdir
                    ];

                    // This method Trim the cropped Images

                    processPdf.
                    convert_crop_trim(trimArgs,uploadPath + trimDir).then((path)=>{
                        fs.readdir(path, (err, files) => {

                            // This Method save the Images into salesforce

                            saveImgtoSForce.
                            saveImagetoSForce(files.length,path).then((path)=>{
                                console.log(uploadPath);
                                rimraf(uploadPath, function () {
                                    var ft = new Date().getTime();
                                    console.log('FinishTime',ft);                                
                                    resolve();
                                });                                                   
                            });   
                        });                                                    
                    })
                });
            });
        });           
    });     
}

// post request add the url in queue and process the job from queue one by one  

app.post('/convert', (req,res) => {
   
    res.send('success'); 
    let job = {}
    job.url =  req.body.url;
    job.pageNum = req.body.pageNum;
    job.cropSize = req.body.cropSize;
    queue.addJob(job);

})

app.listen(port, () => console.log('App listening on port' + port))
