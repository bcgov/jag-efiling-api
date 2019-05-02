class Api {
    getUserInfo() {
        var p = new Promise((resolve, reject)=>{
            fetch('/api/persons/connected').then((response) => {
                response.json().then((json) => {
                    resolve(json)
                })
            })
        })
        return p
    }
    getCaseList() {
        var p = new Promise((resolve, reject)=>{
            fetch('/api/cases').then((response) => {
                response.json().then((json) => {
                    resolve(json.cases)
                })
            })
        })
        return p
    }
    download(ids) {
        var p = new Promise((resolve, reject)=>{
            fetch('/api/zip?id=' + ids.join('&id=')).then((response) => {
                response.blob().then((data) => {
                    resolve(data)
                })
            })
        })
        return p
    }
}
var api = new Api()
