/**
 * Created by wander on 10/10/2016.
 */
var randomMutate = function (weight) {
    if (Math.random() >= 0.75) {
        return Math.random() * 2 - 1;
    }
    return weight;
}

var superMutate = function (weight,max,min) {
    //let newWeight = Math.random() * (max*2) - max;
    //newWeight = Math.min(newWeight,max);
    //newWeight = Math.max(newWeight,min);
    //return newWeight
    return weight
}

var slideMutate = function (weight,max,min,mutateChance) {
    if (Math.random() >= mutateChance) {
        let newWeight = weight + Math.random() * (max*2) - max;
        newWeight = Math.min(newWeight,max);
        newWeight = Math.max(newWeight,min);
        return newWeight;
    }
    return weight;
}