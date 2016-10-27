/**
 * Created by wander on 10/10/2016.
 */
var randomMutate = function (weight) {
    if (Math.random() >= 0.75) {
        return Math.random() * 2 - 1;
    }
    return weight;
}

var superMutate = function (weight) {
    return Math.random() * 4 - 2;
}

var slideMutate = function (weight) {
    if (Math.random() >= 0.75) {
        let newWeight = weight + Math.random() * 5 - 2.5;
        newWeight = Math.min(newWeight,2.5);
        newWeight = Math.max(newWeight,-2.5);
        return newWeight;
    }
    return weight;
}