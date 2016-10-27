/**
 * Created by wander on 10/15/2016.
 */
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network;


function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var outputLayer = new Layer(output);
    var hiddenLayers = [];
    for(let n in hidden){
        hiddenLayers.push(new Layer(hidden[n]));
    }

    // connect the layers
    inputLayer.project(hiddenLayers[0]);
    for(let i = 0; i < hiddenLayers.length; i++){
        if(i+1 < hiddenLayers.length) {
            hiddenLayers[i].project(hiddenLayers[i + 1]);
        }
        else{
            hiddenLayers[i].project(outputLayer);
        }
    }

    inputLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });

    for(let n in hiddenLayers) {
        hiddenLayers[n].set({
            squash: Neuron.squash.LOGISTIC,
            bias: 0
        });
    }

    outputLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 0
    });


    // set the layers
    this.set({
        input: inputLayer,
        hidden: hiddenLayers,
        output: outputLayer
    });

    //var standalone = this.standalone();
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;