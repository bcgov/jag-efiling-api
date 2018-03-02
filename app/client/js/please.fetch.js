var pleaseFetch = function(url, done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        var data = xhr.responseText;
        done(data);
    };
    xhr.send();
};