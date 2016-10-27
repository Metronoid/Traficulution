/**
 * Created by wander on 10/15/2016.
 */
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network;

function RandomHidden(maxLayers,maxNeurons){
    let hiddenLayers = [];
    let layers = Math.floor(Math.random() * maxLayers) + 1;
    maxNeurons = Math.floor(Math.random() * maxNeurons);
    for (let l = 0; l < layers; l++) {
        hiddenLayers.push(1);
        maxNeurons -= 1;
    }
    for (let l = 0; l < layers || maxNeurons > 0; l++) {
        let neurons = Math.floor(Math.random() * maxNeurons) + 1;
        for(let n = 0; n < neurons || maxNeurons > 0; n++) {
            hiddenLayers[l] += 1;
            maxNeurons -= 1;
        }
    }
    return hiddenLayers;
}


function Perceptron(input, hidden, output)
{
    // create the layers
    let inputLayer = new Layer(input);
    let outputLayer = new Layer(output);
    let hiddenLayers = [];
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