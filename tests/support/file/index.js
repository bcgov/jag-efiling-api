const fs = require('fs')
const path = require('path')
const process = require('process')
const { unzipPdfs, unzipPdfsFromStream } = require('./unzip.pdfs')
const { extractFileNo } = require('./extract.file.number')

module.exports = {
    unzipPdfs:unzipPdfs,
    unzipPdfsFromStream:unzipPdfsFromStream,
    extractFileNo:extractFileNo,
    fs:fs,
    path:path,
    root:process.cwd()
}
