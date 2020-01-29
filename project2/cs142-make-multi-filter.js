'use strict';

function cs142MakeMultiFilter (originalArray) {
    var currentArray = originalArray; //initial value
    var arrayFilterer = (filterCriteria, callback) => {
        if (typeof(filterCriteria) !== "function") {
            return currentArray;
        }
        currentArray = currentArray.filter(filterCriteria);
        if (typeof(callback) === "function") {
            //make callback's 'this' refer to original array
            callback = callback.bind(originalArray); 
            callback(currentArray);
        }
        return arrayFilterer;
    };
    return arrayFilterer;
}