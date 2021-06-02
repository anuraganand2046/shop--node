const fs= require('fs');
const deleteFile= (filePath)=>{//this function unlink takes the path of the file to be deleted.
    fs.unlink(filePath, err=>{
        if(err){
            throw err;
        }
    })
}
exports.deleteFile= deleteFile;