/**
 * Created by wander on 9/15/2016.
 */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var fpsText = document.getElementById("fps");
var nwstats = new NetworkStats();
var genstats = new GenerationStats();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x221f36, 1 );
renderer.shadowMapEnabled = true;

document.body.appendChild( renderer.domElement );

var loader = new THREE.TextureLoader();
var clock = new THREE.Clock();

var controls = new THREE.TrackballControls( camera );
controls.target.set( 0, 0, 0 );
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 0.05;
controls.maxDistance = 200.0;
controls.panSpeed = 0;
controls.userPan = false;


var collisionList = [];
var spawns = [];
spawns.push(new Spawn(new THREE.Vector3(13,1,-2.5),-Math.PI/2));
//spawns.push(new Spawn(new THREE.Vector3(2.5,1,20),-Math.PI));
spawns.push(new Spawn(new THREE.Vector3(-2.5,1,-13),0));
//spawns.push(new Spawn(new THREE.Vector3(20,1,-2.5),-Math.PI/2));
 spawns.push(new Spawn(new THREE.Vector3(2.5,1,13),-Math.PI));
// spawns.push(new Spawn(new THREE.Vector3(-2.5,1,-8),0));
// spawns.push(new Spawn(new THREE.Vector3(27,1,-2.5),-Math.PI/2));
// spawns.push(new Spawn(new THREE.Vector3(2.5,1,8),-Math.PI));
// spawns.push(new Spawn(new THREE.Vector3(-2.5,1,-20),0));
// spawns.push(new Spawn(new THREE.Vector3(34,1,-2.5),-Math.PI/2));
// spawns.push(new Spawn(new THREE.Vector3(2.5,1,27),-Math.PI));
// spawns.push(new Spawn(new THREE.Vector3(-2.5,1,-27),0));

var point = new THREE.Vector3(-27,0,-2.5);
var ground = new THREE.Object3D();

var iloader = new THREE.ColladaLoader();
var intersectionMesh;
iloader.load('/model/intersection.dae', function (result) {
    result.scene.rotation.x = Math.PI*1.5;

    result.scene.traverse(function(child) {
        child.receiveShadow = true;
    });

    intersectionMesh = result.scene;
    scene.add(result.scene);
    collisionList.push(result.scene);

    for(let ent in collisionList) {
        let children = getChildren(collisionList[ent]);
        for(let child in children) {
            if(children[child].type == "Mesh") {
                children[child].parentuuid = collisionList[ent].uuid;
                ground.add(jQuery.extend(true, {}, children[child]));
            }
        }
    }


});

var lloader = new THREE.ColladaLoader();
lloader.load('/model/lights.dae', function (result) {
    result.scene.rotation.x = Math.PI*1.5;
    console.log(result);
    result.scene.traverse(function(child) {
        child.castShadow = true;
    });

    scene.add(result.scene);
    collisionList.push(result.scene);

});


var seed = function(spawnPoint) {
    var car = new Car(Cube(1,0.25,2,0x47475b),spawnPoint);
    car.Create(spawnPoint);
    // We have to manually set the Bias to 0
    for(let h in car.brain.layers.hidden) {
        for(let l in car.brain.layers.hidden[h].list) {
            car.brain.layers.hidden[h].list[l].bias = 0;
        }
    }
    for(let o in car.brain.layers.output.list) {
        car.brain.layers.output.list[o].bias = 0;
    }

    return car;
};

var fitness = function(entity) {
    var moral = 0;
    moral -= entity.mesh.position.distanceTo(point);
    if(moral > -2) {
        //point.x = -point.x
        //targetBox.position.set(point.x, 0.3, point.z);
        moral = 10;
        moral -= Math.abs(0.2 - entity.output[0]) * 5;
        moral -= Math.abs(entity.output[1]) * 10;

    }
    return moral;
};

var copy = function(entity,spawnPoint)
{
    var newEntity = new Car(Cube(1,0.25,2,0x47475b),spawnPoint);
    newEntity.brain = entity.brain.clone();
    newEntity.brain.setOptimize(false);
    newEntity.moral = entity.moral;

    newEntity.mesh.position.set(entity.mesh.position.x, entity.mesh.position.y, entity.mesh.position.z);

    return newEntity;
}

var crossoverRandom = function(father,mother,spawnPoint)
{
    var son = new Car(Cube(1,0.25,2,0x47475b),spawnPoint);
    var daughter = new Car(Cube(1,0.25,2,0x47475b),spawnPoint);

    var dadNeurons = father.brain.neurons();
    var dadWeights = [];
    for(let s in dadNeurons){
        for(let i in dadNeurons[s].neuron.connections.inputs){
            let input = dadNeurons[s].neuron.connections.inputs[i].weight;
            if(input == undefined) {
                console.error("Error: Undefined weight");
            }
            dadWeights.push(input);
        }
    }

    var momNeurons = mother.brain.neurons();
    var momWeights = [];
    for(let s in momNeurons){
        for(let i in momNeurons[s].neuron.connections.inputs){
            let input = momNeurons[s].neuron.connections.inputs[i].weight;
            if(input == undefined) {
                console.error("Error: Undefined weight");
            }
            momWeights.push(input);
        }
    }


    var splice = function (dad,mom) {
        var slice = Math.random().toFixed(2);
        var son = [];
        var daughter = [];

        for(let i = 0; i < dad.length;i++){
            var len = dad.length * slice;

            son.push(i <= len ? dad[i] : mom[i]);
            daughter.push(i < len ? mom[i] : dad[i]);
        }

        return [son,daughter];
    }

    var newWeights = splice(dadWeights,momWeights);

    var sonNeurons = son.brain.neurons();
    let connection = 0;
    for(let s in sonNeurons){
        for(let i in sonNeurons[s].neuron.connections.inputs){
            if(newWeights[0][s] == undefined) {
                console.error("Error: Undefined weight");
            }
            son.brain.neurons()[s].neuron.connections.inputs[i].weight = newWeights[0][connection];
            connection++;
        }
    }
    connection = 0;
    var daughterNeurons = daughter.brain.neurons();
    for(let s in daughterNeurons){
        for(let i in daughterNeurons[s].neuron.connections.inputs){
            if(newWeights[1][s] == undefined) {
                console.error("Error: Undefined weight");
            }
            daughter.brain.neurons()[s].neuron.connections.inputs[i].weight = newWeights[1][connection];
            connection++;
        }
    }
    return [son,daughter];
}

var mutate = function (oldEntity,mutationType,mutationChance) {
    let entity = oldEntity;

    let inputConn = entity.brain.layers.input.list;
    for(let n in inputConn){
        for(let c in inputConn[n].connections.projected) {
            inputConn[n].connections.projected[c].weight = mutationType(inputConn[n].connections.projected[c].weight,2,-2,mutationChance);
        }
    }

    let hiddenLayerAmt = entity.brain.layers.hidden;

    for (let depth = 0; depth < hiddenLayerAmt.length; depth++) {
        for (let n in hiddenLayerAmt[depth].list) {
            //hiddenLayerAmt[depth].list[n].bias = mutationType(hiddenLayerAmt[depth].list[n].bias,2,-2,mutationChance);
            for (let c in hiddenLayerAmt[depth].list[n].connections.projected) {
                hiddenLayerAmt[depth].list[n].connections.projected[c].weight = mutationType(hiddenLayerAmt[depth].list[n].connections.projected[c].weight,1,-1,mutationChance);
            }
        }
    }

    // let outputConn = entity.brain.layers.output.list;
    // for(let n in outputConn.list){
    //     outputConn.list[n].bias = mutationType(outputConn.list[n].bias,2,-2,mutationChance);
    // }

    return entity;
}


var pool = new Genegen(seed,fitness,copy,crossoverRandom,mutate);
var carPool = [];
var createCarPool = function() {
    for(let i = 0; i < pool.size; i++) {
        let cloader = new THREE.ColladaLoader();
        cloader.load('/model/car.dae', function (result) {
            result.scene.traverse(function(child) {
                child.castShadow = true;
            });

            result.scene.inuse = false;
            carPool.push(result.scene);

            if(carPool.length == pool.size && !pool.started) {
                pool.Start();
            }

        });
    }
}
createCarPool();

var getCarMesh = function() {
    for(let car in carPool) {
        if(!carPool[car].inuse) {
            carPool[car].inuse = true;
            return carPool[car];
        }
    }
    console.log("All car meshes are in use!");
}

var resetCarMeshes = function() {
    for(let car in carPool) {
        carPool[car].inuse = false;
    }
}

var targetBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color:0xFFFFFF}));
targetBox.position.set(point.x, 0.3, point.z);
scene.add(targetBox);


camera.position.z = 15;
camera.position.y = 30;
camera.lookAt(new THREE.Vector3(0, 0, 4));

var geometry = new THREE.SphereGeometry(800, 60, 40);
var uniforms = {
    texture: { type: 't', value: THREE.ImageUtils.loadTexture('/img/texture/repeating.jpg') }
};

var material = new THREE.ShaderMaterial( {
    uniforms:       uniforms,
    vertexShader:   document.getElementById('sky-vertex').textContent,
    fragmentShader: document.getElementById('sky-fragment').textContent
});

skyBox = new THREE.Mesh(geometry, material);
skyBox.scale.set(-1, 1, 1);
skyBox.eulerOrder = 'XZY';
skyBox.renderDepth = 1000.0;
scene.add(skyBox);


var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// create a point light
var pointLight = new THREE.PointLight(0xcdcde7, 4, 100);
//
// // set its position
pointLight.position.x = 50;
pointLight.position.y = 50;
pointLight.position.z = 50;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
// // add to the scene
scene.add(pointLight);
//
var pointLight1 = new THREE.PointLight(0xcdcde7, 1, 100);

// set its position
pointLight1.position.x = 0;
pointLight1.position.y = 50;
pointLight1.position.z = 0;
// add to the scene
scene.add(pointLight1);


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseDown( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    let meshes = new THREE.Object3D();
    for(let ent in pool.entities) {
        let children = getChildren(pool.entities[ent].mesh);
        for(let child in children) {
            children[child].parentuuid = pool.entities[ent].mesh.uuid;
            meshes.add(jQuery.extend(true, {}, children[child]));
        }
    }

    var intersects = raycaster.intersectObjects(meshes.children);
     if(intersects[0] != undefined) {
        let uuid = intersects[0].object.parentuuid;
         for(let entnr in pool.entities) {
            if(uuid == pool.entities[entnr].mesh.uuid) {
                nwstats.updateStats(pool.entities[entnr].brain, pool.entities[entnr].moral);
                nwstats.pulsate(true);
                return;
            }
        }
    }
}

function getChildren(mesh) {
    let result = [];
    if(!mesh.children || mesh.children.length == 0) return result;
    for(let child in mesh.children) {
        let rchildren = getChildren(mesh.children[child]);
        for(let rchild in rchildren) {
            result.push(rchildren[rchild]);
        }
        result.push(mesh.children[child]);
    }
    return result;
}

class ColorMap {

    constructor() {
        var self = this;
        self.canvas = document.createElement('canvas');
        self.context = self.canvas.getContext('2d');
        self.img = new Image();
        self.img.src = "img/texture/intersection.png";

        this.img.onload = function() {
            self.canvas.width = self.img.width;
            self.canvas.height = self.img.height;
            self.context.drawImage(self.img, 0, 0);
            self.data = self.context.getImageData(0, 0, self.canvas.width, self.canvas.height).data;
        }


    }

    getPixel(x, y) {
        if(this.img.complete); // Image is loaded
        x = Math.round(x);
        y = Math.round(y);
        let pos = (this.canvas.width * y) + x*4;
        return [this.data[pos], this.data[pos + 1], this.data[pos + 2], this.data[pos + 3]];
    }

    getRGBPixel(x, y) {
        let arr = this.getPixel(x, y);
        return "#" + ("000000" + this.RGBToHex(arr[0], arr[1], arr[2])).slice(-6)
    }

    RGBToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }

}
var map = new ColorMap();

// document.body.appendChild(canvas);

function moveCar(object,delta)
{
    let speed = 10;
    // Collision
    //     for (let c in collisionList) {
    //         if (collisionList[c].mesh != object.mesh) {
    //             let collision = object.Collision(collisionList[c].mesh);
    //             if (collision) {
    //                 speed = 0;
    //             }
    //         }
    //     }

    //var objDistance = point.distanceTo(object.mesh.position);
    var input = [];
    //input.push((object.output[0] + 1)/2);
    //input.push(object.mesh.rotation.y / (Math.PI/2));
    //input.push(-1);
    input.push((object.mesh.position.x - point.x)/100);
    input.push((object.mesh.position.z - point.z)/100);
    //input.push(1);
    // TODO: Add the positive and negative rotation axis for input.
    //input.push((Math.abs(object.mesh.rotation.x / Math.PI)));
    var output = object.brain.activate(input);
    object.output[0] = output[0];
    object.output[1] = output[1];
    object.mesh.translateZ((output[0] + 0.20) * speed * delta);
    object.mesh.rotateY((output[1] / 2) * speed * delta);

    var outLog = document.getElementById("outLog");
    object.raycaster.set(object.mesh.position, new THREE.Vector3(0, -10, 0));

    // console.log(ground.children);
    var intersects = object.raycaster.intersectObjects(intersectionMesh.children[0].children);
    // if(intersects.length != 0) {
    //     console.log("Hey");
    //     console.log(intersects[0]);
    //     var intersect = intersects[0];
    //     if(intersect.object.material.map.image && intersect.object.material.map.image.complete) {
    //         // Code for getting the pixel the car is driving on
    //         // var posX = map.img.width / 30 * (object.mesh.position.x + 15);
    //         // var posY = map.img.height / 30 * (object.mesh.position.z + 15);
    //         // console.log(map.getRGBPixel(posX, posY));
    //     }
    // }

    // Some sort of output for checking on our neural network
    //    outLog.innerHTML =
    //    "<h5> Input:" + input[0].toFixed(2) + " Bias:" + object.brain.layers.input.list[0].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.hidden[0].list[0].connections.inputs[6].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[0].connections.inputs[8].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[0].bias.toFixed(2) + " | " + " Weights:" + object.brain.layers.output.list[0].connections.inputs[10].weight.toFixed(2) + " and " + object.brain.layers.output.list[0].connections.inputs[12].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[0].bias.toFixed(2) + " Output:" + output[0].toFixed(2) + "</h5>" +
    //    "<h5> Input:" + input[1].toFixed(2) + " Bias:" + object.brain.layers.input.list[1].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.hidden[0].list[1].connections.inputs[7].weight.toFixed(2) + " and " + object.brain.layers.hidden[0].list[1].connections.inputs[9].weight.toFixed(2) + " Bias:" + object.brain.layers.hidden[0].list[1].bias.toFixed(2)  + " | " + " Weights:" + object.brain.layers.output.list[1].connections.inputs[11].weight.toFixed(2) + " and " + object.brain.layers.output.list[1].connections.inputs[13].weight.toFixed(2) + " Bias:" + object.brain.layers.output.list[1].bias.toFixed(2) + " Output:" + output[1].toFixed(2) + "</h5>";
    // object.brain.propagate(learningRate, target);
    // object.brain.restore();
};

var update = function () {
    requestAnimationFrame( update );
        controls.update();
        fpsText.innerHTML = "FPS: " + fps.getFPS();
        var delta = clock.getDelta(); // seconds.
    // if(pool && pool.started) {
        for (car in pool.entities){
            moveCar(pool.entities[car],delta);
        }
    // }
    render();
};


var render = function () {
    renderer.render(scene, camera);
};

function onKeyDown(e){
    if(e.key == "f"){
        let canvas = renderer.domElement;
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    }
    if(e.key == "n"){
        nwstats.toggleStats();
    }
    if(e.key == "g"){
        genstats.toggleStats();
    }
}


function addHandler(canvas) {
    canvas.addEventListener('mousemove', function (e) {
        // onMouseMove(e);
    }, false);
    canvas.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    canvas.addEventListener('mouseup', function (e) {
        // onMouseUp(e);
    }, false);
    canvas.addEventListener('keypress',function(e){
        onKeyDown(e);
    },false);
}

addHandler(document);

var fps = {
    startTime : 0,
    frameNumber : 0,
    getFPS : function(){
        this.frameNumber++;
        var d = new Date().getTime(),
            currentTime = ( d - this.startTime ) / 1000,
            result = Math.floor( ( this.frameNumber / currentTime ) );
        if( currentTime > 1 ){
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;
    }
};

update();

