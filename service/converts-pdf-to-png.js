const Promise = require('bluebird')
var fs    = require('fs')
var im = require('imagemagick')
var download = require('download-file')

function convert_crop_trim(convertArgs,path){
      
    return new Promise((resolve, reject) => {
        im.convert(convertArgs, function(err) {
            if(err) {
                reject(err)
            }
            else{
                resolve(path);
            }
        });
    });
}

function downloadPdf(url,path){
    
    return new Promise((resolve,reject) => {
       
        var options = {
            directory:path,
            filename: "file.pdf"
        }

        download(url, options, function(err){
            if (err) {
               reject('err',err)
            }
            else{
               resolve();
            }
        });
    });
}

module.exports = {
    convert_crop_trim : convert_crop_trim,
    downloadPdf:downloadPdf
}