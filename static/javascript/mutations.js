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
    if (Math.random() >= 0.9) {
        let newWeight = weight + Math.random() * 2 - 1;
        return newWeight;
    }
    return weight;
}