const Promise = require('bluebird')
var fs    = require('fs')
var path    = require('path');
var jsforce = require('jsforce');

function saveImagetoSForce(numofImages,path){

    return new Promise((resolve, reject) => {
        var conn = new jsforce.Connection({
            loginUrl: 'https://login.salesforce.com/services/oauth2/token',
            oauth2 : {
              clientId : "3MVG9d8..z.hDcPI0Vp7ZATkKCk_ZgT_cYpQ_D7FN8_.tekqIwUNhom3C_5lutwsF2FfEV4XwY.aFL1R_n5iq",
              clientSecret: "4911084831847527315"
            }
        });
        conn.login('jery@softsquare.biz', 'softsquare73vjANwKbPGzpFic2TPUzVQPjcq', function(err, res) {
            if (err) { return console.error(err); }                   
           // for(var i = 0; i < numofImages; i++){           
               var i = 0; 
               saveAttachment();
               function saveAttachment(){     
                    console.log('Image Send',i);
                    var fileOnServer = path+'/result-'+i+'.png',
                    fileName = 'finalresult'+i+'.png',
                    fileType = 'image/png';
                    fs.readFile(fileOnServer, function (err, filedata) {
                    if (err){
                        reject(err);
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
                                if(i == numofImages-1){ 
                                    resolve();
                                }
                                else{
                                    i++;
                                    saveAttachment();
                                }
                        });
                        }
                    });
            // }
            }
        });
    });
}

module.exports = {
    saveImagetoSForce : saveImagetoSForce
}