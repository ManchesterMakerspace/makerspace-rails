exports.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        if(Array.isArray(classes)){
            classes = classes.join(" ");
        }
        return classes.split(' ').indexOf(cls) !== -1;
    });
};
