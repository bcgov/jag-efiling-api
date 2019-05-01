var zeroLeading = function(number) {
    return number < 10 ? '0'+number : '' + number
}
var dateLabelFrom = function(date) {
    var value = new Date(date)
    var label = value.getFullYear()
                + '-' + (zeroLeading(value.getMonth()+1))
                + '-' + (zeroLeading(value.getDate()))
                + ' ' +(zeroLeading(value.getHours()))
                + ':' +(zeroLeading(value.getMinutes()))

    return label
}
