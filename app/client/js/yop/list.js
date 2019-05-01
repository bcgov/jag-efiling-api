var repeat = (template, collection, mappings)=>{
    var children = ''
    for (var index = 0; index < collection.length; index++) {
        var line = template
        for (var i = 0; i < mappings.length; i++) {
            var mapping = mappings[i]
            line = line.split(mapping.replace).join(mapping.with(collection[index]))
        }
        children += line
    }
    return children
}
