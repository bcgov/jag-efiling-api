var createMenuDom = function(data) {
    var lines = data.split('\n');
    var dom = '<ul class="menu">';
    for (var line of lines) {
        if (line.trim().length > 0) {
            dom += '<li class="menu"><a href="/index.html?page=' + line.trim() + '">' + line.trim() + '</a></li>';
        }
    }
    dom += '</ul>';

    return dom;
};
