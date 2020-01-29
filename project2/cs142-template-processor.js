'use strict';
function Cs142TemplateProcessor (template) { //template is a string
    this.temp = template;
}

Cs142TemplateProcessor.prototype.fillIn = function (dictionary) {
    //numbers or letters could be in property name
    var placeHolder = /\{\{(\w|\d)*\}\}/g; 

    var filledIn = this.temp.replace(placeHolder, (match) => {
        var property = match.slice(2, match.length-2);
        var word = dictionary[property];
        if (word === undefined) {
            return " ";
        } else {
            return word;
        }
    });
    return filledIn;
};