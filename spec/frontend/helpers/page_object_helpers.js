exports.filterOneByDisplayed = function(elements){
    return elements.filter(function(el){
        return el.isDisplayed().then(function(displayed){
            return displayed;
        });
    }).first();
};
exports.filterAllByDisplayed = function(elements){
    return elements.filter(function(el){
        return el.isDisplayed().then(function(displayed){
            return displayed;
        });
    });
};
