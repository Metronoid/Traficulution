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

    var customSquash = function(x, derivate) {
        return derivate ? 1 : x;
    };

    inputLayer.set({
        squash: Neuron.squash.LOGISTIC

    })
    hiddenLayer.set({
        squash: Neuron.squash.LOGISTIC,
        bias: 1
    })
    outputLayer.set({
        squash: Neuron.squash.LOGISTIC
    })

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });

    //var standalone = this.standalone();
}

// extend the prototype chain
Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;


class Car {
    constructor(mesh,brain) {
        this.mesh = mesh;
        this.brain = brain ? brain : new Perceptron(2,3,2);
        this.brain.setOptimize(false);
        this.output = [0,0];
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

    // moral = entity.mesh.position.z;
    moral = entity.mesh.position.z;
    return moral;
};

var copy = function(entity)
{
    var newEntity = new Car(Cube(0.5,0.25,1,0x47475b),entity.brain.clone());
    newEntity.brain = jQuery.extend(true, {}, entity.brain);
    return newEntity;
}

var crossoverRandom = function(father,mother)
{
    var son = new Car(Cube(0.5,0.25,1,0x47475b));
    var daughter = new Car(Cube(0.5,0.25,1,0x47475b));

    var dadNeurons = father.brain.neurons();
    var dadWeights = [];
    for(let s in dadNeurons){
        for(let i in dadNeurons[s].neuron.connections.inputs){
            var input = dadNeurons[s].neuron.connections.inputs[i];
            dadWeights.push(input);
        }
    }

    var momNeurons = mother.brain.neurons();
    var momWeights = [];
    for(let s in momNeurons){
        for(let i in momNeurons[s].neuron.connections.inputs){
            var input = momNeurons[s].neuron.connections.inputs[i];
            momWeights.push(input);
        }
    }

    var splice = function (dad,mom) {
        var slice = Math.random().toFixed(2);
        var son = [];
        var daughter = [];

        for(let i = 0; i <= dad.length;i++){
            var len = dad.length * slice;

            son.push(i <= len ? dad[i] : mom[i]);
            daughter.push(i <= len ? mom[i] : dad[i]);
        }

        return [son,daughter];
    }

    var newWeights = splice(dadWeights,momWeights);

    var sonNeurons = son.brain.neurons();
    for(let s in sonNeurons){
        for(let i in sonNeurons[s].neuron.connections.inputs){
            son.brain.neurons()[s].neuron.connections.inputs[i].weight = newWeights[0][s].weight;
        }
    }

    var daughterNeurons = daughter.brain.neurons();
    for(let s in daughterNeurons){
        for(let i in daughterNeurons[s].neuron.connections.inputs){
            daughter.brain.neurons()[s].neuron.connections.inputs[i].weight = newWeights[1][s].weight;
        }
    }

    return [son,daughter];
}

var mutate = function (oldEntity) {
    var entity = oldEntity;
    var randomEntity = new Car(Cube(0.5,0.25,1,0x47475b));

    var inputConn = entity.brain.layers.input.connectedTo;
    var randomInputConn = randomEntity.brain.layers.input.connectedTo;

    for(let idx = 0; idx < Object.keys(inputConn[0].connections).length; idx++) {
        inputConn[0].connections[Object.keys(inputConn[0].connections)[idx]].weight = Math.random()*2-1;
    }


    var hiddenLayerAmt = entity.brain.layers.hidden.length;
    for(let depth = 0; depth < hiddenLayerAmt; depth++) {
        var hiddenConn = entity.brain.layers.hidden[depth].connectedTo;
        var randomHiddenConn = randomEntity.brain.layers.hidden[depth].connectedTo;

        for(let idx = 0; idx < Object.keys(inputConn[0].connections).length; idx++) {
            hiddenConn[0].connections[Object.keys(hiddenConn[0].connections)[idx]].weight = Math.random()*2-1;
        }
    }

    return entity;
}

var pool = new Genegen(seed,fitness,copy,crossoverRandom,mutate);

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
    //var objDistance = point.distanceTo(object.mesh.position);
    var input = [];
    input.push(object.output[0]);
    input.push(((object.mesh.rotation.y + 1.6) / 3.2));
    // TODO: Add the positive and negative rotation axis.
    //input.push((Math.abs(object.mesh.rotation.x / Math.PI)));
    var output = object.brain.activate(input);
    //object.brain.restore();
    var speed = 5;
    object.output[0] = output[0];
    object.output[1] = output[1];
    object.mesh.translateZ(output[0] * speed * delta);
    object.mesh.rotateY((output[1] - 0.5) * speed * delta);

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

