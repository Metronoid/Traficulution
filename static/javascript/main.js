/**
 * Created by wander on 9/15/2016.
 */
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network;


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x221f36, 1 );
document.body.appendChild( renderer.domElement );

var loader = new THREE.TextureLoader();
var clock = new THREE.Clock();

function Cube (xSize,ySize,zSize,color) {
    this.geometry = new THREE.BoxGeometry(xSize, ySize, zSize);
    this.material = new THREE.MeshLambertMaterial({color: color});
    return new THREE.Mesh(this.geometry, this.material);
}

function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer = new Layer(hidden);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer,
    });
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;


class Car {
    constructor(mesh) {
        this.mesh = mesh;
        this.brain = new Perceptron(2,2,2);
        this.velocity = 1;
        //You want to log out the object file so we can explore it, just once per session though.
        //TODO: remove this when no longer needed.
       // console.log(this.brain.layers);
    }

    Destroy() {
        //TODO: Would be nice to be able to remove the neural network too.
        scene.remove(this.mesh);
    }

    Create() {
        this.mesh.position.set(0,0.3,-2);
        scene.add(this.mesh);
    }
}

var collisionList = [];

var seed = function() {
    var car = new Car(Cube(0.5,0.25,1,0x47475b));
    car.Create();
    //collisionList.push(car.mesh);
    return car
};

var fitness = function(entity) {
    var moral = 0;
    moral = entity.mesh.position.x;
    return moral;
};

var copy = function(entity)
{
    var newEntity = seed();
    var inputNew = newEntity.brain.layers.input.list;
    var inputOld = entity.brain.layers.input.list;
    for (var i=0;i<inputNew.length;++i) {
        inputNew[i].bias = inputOld[i].bias;
    }
    newEntity.brain.layers.input.list = inputNew;

    for (var h=0;h<newEntity.brain.layers.hidden.length;++h) {
        var hiddenNew = newEntity.brain.layers.hidden[h].list;
        var hiddenOld = entity.brain.layers.hidden[h].list;
        for (var i = 0; i < hiddenNew.length; ++i) {
            hiddenNew[i].bias = hiddenOld[i].bias;
            var newWeights = [];
            for(var o in hiddenOld[i].connections.inputs) {
                newWeights.push(hiddenOld[i].connections.inputs[o].weight);
            }
            var l = 0;
            for(var n in hiddenNew[i].connections.inputs) {
                hiddenNew[i].connections.inputs[n].weight = newWeights[l];
                l++;
            }
        }
        newEntity.brain.layers.hidden[h].list = hiddenNew;
    }

    var outputNew = newEntity.brain.layers.output.list;
    var outputOld = entity.brain.layers.output.list;
    for (var i=0;i<outputNew.length;++i) {
        outputNew[i].bias = outputOld[i].bias;
        var newWeights = [];
        for(var o in outputOld[i].connections.inputs) {
            newWeights.push(outputOld[i].connections.inputs[o].weight);
        }
        var l = 0;
        for(var n in outputNew[i].connections.inputs) {
            outputNew[i].connections.inputs[n].weight = newWeights[l];
            l++;
        }
    }
    newEntity.brain.layers.output.list = outputNew;

    return newEntity;
}

var crossoverRandom = function(father,mother)
{
    var son = seed();
    var daughter = seed();
    var slice = 0.5;

    var entity = function () {
        var r = Math.random();
        return r > slice ? [father,mother] : [mother,father];
    }

    var inputSon = son.brain.layers.input.list;
    var inputDaughter = daughter.brain.layers.input.list;
    for (var i=0;i<inputSon.length;++i) {
        var inputGenes = entity();
        inputSon[i].bias = inputGenes[0].brain.layers.input.list[i].bias;
        inputDaughter[i].bias = inputGenes[1].brain.layers.input.list[i].bias;
    }
    son.brain.layers.input.list = inputSon;
    daughter.brain.layers.input.list = inputDaughter;

    for (var h=0;h<son.brain.layers.hidden.length;++h) {
        var hiddenSon = son.brain.layers.hidden[h].list;
        var hiddenDaughter = son.brain.layers.hidden[h].list;
        for (var i = 0; i < hiddenSon.length; ++i) {
            var hiddenGenes = entity();
            hiddenSon[i].bias = hiddenGenes[0].brain.layers.hidden[h].list[i].bias;
            hiddenDaughter[i].bias = hiddenGenes[1].brain.layers.hidden[h].list[i].bias;
            var newWeights = [];
            for(var o in hiddenGenes[0].brain.layers.hidden[h].list[i].connections.inputs) {
                newWeights.push(hiddenGenes[0].brain.layers.hidden[h].list[i].connections.inputs[o].weight);
            }
            var l = 0;
            for(var n in hiddenSon[i].connections.inputs) {
                hiddenSon[i].connections.inputs[n].weight = newWeights[l];
                l++;
            }
            newWeights = [];
            for(var o in hiddenGenes[1].brain.layers.hidden[h].list[i].connections.inputs) {
                newWeights.push(hiddenGenes[1].brain.layers.hidden[h].list[i].connections.inputs[o].weight);
            }
            var l = 0;
            for(var n in hiddenDaughter[i].connections.inputs) {
                hiddenDaughter[i].connections.inputs[n].weight = newWeights[l];
                l++;
            }
        }
        son.brain.layers.hidden[h].list = hiddenSon;
        daughter.brain.layers.hidden[h].list = hiddenDaughter;
    }

    var outputSon = son.brain.layers.output.list;
    var outputDaughter = daughter.brain.layers.output.list;
    for (var i=0;i<outputSon.length;++i) {
        var outputGenes = entity();
        outputSon[i].bias = outputGenes[0].brain.layers.output.list[i].bias;
        outputDaughter[i].bias = outputGenes[1].brain.layers.output.list[i].bias;
        var newWeights = [];
        for(var o in outputGenes[0].brain.layers.output.list[i].connections.inputs) {
            newWeights.push(outputGenes[0].brain.layers.output.list[i].connections.inputs[o].weight);
        }
        var l = 0;
        for(var n in outputSon[i].connections.inputs) {
            outputSon[i].connections.inputs[n].weight = newWeights[l];
            l++;
        }
        newWeights = [];
        for(var o in outputGenes[1].brain.layers.output.list[i].connections.inputs) {
            newWeights.push(outputGenes[1].brain.layers.output.list[i].connections.inputs[o].weight);
        }
        var l = 0;
        for(var n in outputDaughter[i].connections.inputs) {
            outputDaughter[i].connections.inputs[n].weight = newWeights[l];
            l++;
        }
    }
    son.brain.layers.output.list = outputSon;
    daughter.brain.layers.output.list = outputDaughter;

    return [son,daughter];
}


var pool = new Genegen(seed,fitness,copy,crossoverRandom);
pool.Start();

var floor = new Cube(6,0.25,11,0x0078dc);
floor.position.set(0,0,0);
var left = new Cube(0.5,0.5,10,0x47475b);
left.position.set(-2.75,0.3,0);
collisionList.push(left);
var right = new Cube(0.5,0.5,10,0x47475b);
right.position.set(2.75,0.3,0);
collisionList.push(right);
var front = new Cube(6,0.5,0.5,0x47475b);
front.position.set(0,0.3,-5.25);
collisionList.push(front);
var back = new Cube(6,0.5,0.5,0x47475b);
back.position.set(0,0.3,5.25);
collisionList.push(back);
table = new THREE.Group();
table.add(floor);
table.add(left);
table.add(right);
table.add(front);
table.add(back);

scene.add( table );

camera.position.z = 10;
camera.position.y = 5
camera.lookAt(table.position);

// create a point light
var pointLight =
    new THREE.PointLight(0xcdcde7);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 25;

// add to the scene
scene.add(pointLight);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var point = new THREE.Vector3();

function onMouseDown( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( collisionList );
    if(intersects[0] != undefined)
    {
        point = intersects[0].point;
    }
}

function moveCar(object,delta)
{
    var objDistance = point.distanceTo(object.mesh.position);
    var input = [];
    input.push(object.velocity);
    input.push(((object.mesh.rotation.y + 1.6) / 3.2));
    // TODO: Add the positive and negative rotation axis.
    //input.push((Math.abs(object.mesh.rotation.x / Math.PI)));
    var output = object.brain.activate(input);
    object.velocity = output[0];
    object.mesh.translateZ(output[0] * delta);
    object.mesh.rotateY((output[1] - 0.5) * delta);

    var learningRate = 0.01;
    var target = [(mouse.y/2)+0.5,(mouse.x/2)+0.5];
    var outLog = document.getElementById("outLog");


    // Some sort of output for checking on our neural network
    // TODO: This should be generated but because we don't really know how we want it to look like this will function as a prototype.
    // TODO: Make some variables so that these sentences can become shorter.. right now they are there so we can fully understand how it works.
    //    outLog.innerHTML =
    //    "<h5> Input:" + input[0].toFixed(2) + " Bias:" + object.brain.layers.input.list[0].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.hidden[0].list[0].connections.inputs[6].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[0].connections.inputs[8].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[0].bias.toFixed(2) + " | " + " Weights:" + object.brain.layers.output.list[0].connections.inputs[10].weight.toFixed(2) + " and " + object.brain.layers.output.list[0].connections.inputs[12].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[0].bias.toFixed(2) + " Output:" + output[0].toFixed(2) + "</h5>" +
    //    "<h5> Input:" + input[1].toFixed(2) + " Bias:" + object.brain.layers.input.list[1].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.hidden[0].list[1].connections.inputs[7].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[1].connections.inputs[9].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[1].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.output.list[1].connections.inputs[11].weight.toFixed(2) + " and " + object.brain.layers.output.list[1].connections.inputs[13].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[1].bias.toFixed(2) + " Output:" + output[1].toFixed(2) + "</h5>";
    // console.log(object.brain);
    // object.brain.propagate(learningRate, target);
    // object.brain.restore();
};

var update = function () {
    requestAnimationFrame( update );
    var delta = clock.getDelta(); // seconds.
    for (car in pool.entities){
        moveCar(pool.entities[car],delta);
    }
    render();
};


var render = function () {
    renderer.render(scene, camera);
};


function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function (e) {
        // onMouseMove(e);
    }, false);
    canvas.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    canvas.addEventListener('mouseup', function (e) {
        // onMouseUp(e);
    }, false);
}

addMouseHandler(document);

update();

