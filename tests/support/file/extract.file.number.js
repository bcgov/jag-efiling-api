const extractFileNo = function(page) {
    let start = 52;
    let fileno = '';
    for (let i=start; i<start+3; i++) {
        fileno += page.Texts[i].R[0].T;
    }
    return { fileno:fileno };
}

module.exports = { extractFileNo:extractFileNo }
