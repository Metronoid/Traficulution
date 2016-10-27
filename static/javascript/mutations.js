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

var slideMutate = function (weight,max,min) {
    if (Math.random() >= 0.75) {
        let newWeight = Math.floor(weight + Math.random() * (max*2) - max);
        newWeight = Math.min(newWeight,max);
        newWeight = Math.max(newWeight,min);
        return newWeight;
    }
    return weight;
}