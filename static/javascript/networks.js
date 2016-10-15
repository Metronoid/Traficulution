/**
 * Created by wander on 10/15/2016.
 */
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network;

function Perceptron(input, hidden, second, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer = new Layer(hidden);
    var secondHiddenLayer = new Layer(second);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(secondHiddenLayer);
    secondHiddenLayer.project(outputLayer);

    inputLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });

    hiddenLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });
    secondHiddenLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });

    outputLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });


    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer,secondHiddenLayer],
        output: outputLayer
    });

    //var standalone = this.standalone();
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;