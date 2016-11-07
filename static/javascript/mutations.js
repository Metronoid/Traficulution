/**
 * Created by wander on 10/10/2016.
 */
var randomMutate = function (weight,max,min,mutateChance) {
    if (Math.random() >= mutateChance) {
        let newWeight = (Math.random() * (max*2)) - max;
        newWeight = Math.min(newWeight,max);
        newWeight = Math.max(newWeight,min);
        return newWeight
    }
    return weight;
}

var superMutate = function (weight) {
    let newWeight = Math.random() - 0.5;
    newWeight = Math.min(newWeight,0.5);
    newWeight = Math.max(newWeight,-0.5);
    return newWeight
}

var slideMutate = function (weight,max,min,mutateChance) {
    if (Math.random() >= mutateChance) {
        let newWeight = weight + (Math.random() * (max*2) - max);
        newWeight = Math.min(newWeight,max);
        newWeight = Math.max(newWeight,min);
        return newWeight;
    }
    return weight;
}