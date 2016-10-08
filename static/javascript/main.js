/**
 * Created by wander on 9/15/2016.
 */
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;


var genetic = Genetic.create();
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.Tournament2;


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

genetic.seed = function() {
    return new Perceptron(2,1,2);
};

genetic.mutate = function(entity){

}
;

class GameObject {
    constructor(mesh) {
        this.mesh = mesh;
        this.brain = new Perceptron(2,2,2);
        this.velocity = 0;
        //You want to log out the object file so we can explore it, just once per session though.
        //TODO: remove this when no longer needed.
        console.log(this.brain.layers);

    }
}


var collisionList = [];

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

var car = new GameObject(Cube(0.5,0.25,1,0x47475b));
car.mesh.position.set(0,0.3,-2);
collisionList.push(car.mesh);
scene.add(car.mesh);


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
        point = intersects[0].position;
    }
}

function moveCar(object)
{
    var delta = clock.getDelta(); // seconds.
    var input = [];
    input.push(object.velocity);
    input.push(((object.mesh.rotation.y + 1.6) / 3.2));
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
    outLog.innerHTML =  "<h5> Input:" + input[0].toFixed(2) + " Bias:" + object.brain.layers.input.list[0].bias.toFixed(2)  + " | " + " Weight:" + object.brain.layers.hidden[0].list[0].connections.inputs[6].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[0].connections.inputs[8].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[0].bias.toFixed(2) + " | " + " Weight:" + object.brain.layers.output.list[0].connections.inputs[10].weight.toFixed(2) + " and " + object.brain.layers.output.list[0].connections.inputs[12].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[0].bias.toFixed(2) + " Output:" + output[0].toFixed(2) + "</h5>" +
        "<h5> Input:" + input[1].toFixed(2) + " Bias:" + object.brain.layers.input.list[1].bias.toFixed(2)  + " | " + " Weight:" + object.brain.layers.hidden[0].list[1].connections.inputs[7].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[1].connections.inputs[9].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[1].bias.toFixed(2)  + " | " + " Weight:" + object.brain.layers.output.list[1].connections.inputs[11].weight.toFixed(2) + " and " + object.brain.layers.output.list[1].connections.inputs[13].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[1].bias.toFixed(2) + " Output:" + output[1].toFixed(2) + "</h5>";
    // console.log(object.brain);
    object.brain.layers.input.list[0].bias = (mouse.x/2)+0.5;
    // ISSUE: https://github.com/Metronoid/Traficulution/issues/1
    object.brain.propagate(learningRate, target);
    object.brain.restore();
};

var update = function () {
    requestAnimationFrame( update );
    moveCar(car);
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

