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
}
var api = new Api()
