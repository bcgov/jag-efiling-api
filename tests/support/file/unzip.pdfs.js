const fs = require('fs')
const PDFParser = require('pdf2json')
const unzipstream = require('unzip-stream')
const { Transform } = require('stream')

const readPdf = function(entry, pdfDataExtractor, resolve) {
    let json = new Transform()
    json._writableState.objectMode = true;
    json._transform = function(data) {
        let page = data.formImage.Pages[0]
        resolve({
            path:entry.path,
            data:pdfDataExtractor(page)
        })
    }
    entry.pipe(new PDFParser()).pipe(json)
}
const unzipPdfs = function(file, pdfDataExtractor) {
    return unzipPdfsFromStream(fs.createReadStream(file), pdfDataExtractor)
}
const unzipPdfsFromStream = function(stream, pdfDataExtractor) {
    let promises = []
    let unzip = new Promise((resolve, reject)=>{
        stream
            .pipe(unzipstream.Parse())
            .on('entry', async (entry)=> {
                let promise = new Promise((res, rej)=>{
                    readPdf(entry, pdfDataExtractor, res)
                })
                promises.push(promise)
                await promise
            })
            .on('end', async ()=>{
                resolve(await Promise.all(promises))
            })
    })
    return unzip
}
module.exports = {
    unzipPdfs:unzipPdfs,
    unzipPdfsFromStream:unzipPdfsFromStream
}
