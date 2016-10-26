/**
 * Created by wander on 10/15/2016.
 */

function Cube (xSize,ySize,zSize,color) {
    this.geometry = new THREE.BoxGeometry(xSize, ySize, zSize);
    this.material = new THREE.MeshLambertMaterial({color: color});
    return new THREE.Mesh(this.geometry, this.material);
}

class Spawn {
    constructor(position,rotation)
    {
        this.mesh = new Cube(1,0.25,2,0xbb4444);
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
        this.mesh.rotation.y = rotation;
        this.position = position;
        this.rotation = rotation;
        scene.add(this.mesh);
    }
}

class Car {
    constructor(mesh, spawn, brain) {
        this.mesh = mesh;
        this.spawn = spawn;
        this.brain = brain ? brain : new Perceptron(4, 4, 4, 2);
        this.brain.setOptimize(false);
        this.brain = mutate(this, superMutate).brain;
        this.output = [0, 0];
        this.moral = 0;
    }

    Destroy() {
        //TODO: Would be nice to be able to remove the neural network too.
        scene.remove(this.mesh);
    }

    Create(spawnPoint) {
        if(spawnPoint == undefined)
        {
            spawnPoint = 0;
        }
        this.spawn = spawns[spawnPoint];
        this.mesh.position.x = this.spawn.position.x;
        this.mesh.position.y = this.spawn.position.y;
        this.mesh.position.z = this.spawn.position.z;
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
        this.mesh.rotation.y = this.spawn.rotation;
        scene.add(this.mesh);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.set(this.mesh.position, new THREE.Vector3(0, -1, 0))
    }
}