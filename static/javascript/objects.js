/**
 * Created by wander on 10/15/2016.
 */

function Cube (xSize,ySize,zSize,color) {
    this.geometry = new THREE.BoxGeometry(xSize, ySize, zSize);
    this.material = new THREE.MeshLambertMaterial({color: color});
    return new THREE.Mesh(this.geometry, this.material);
}

class Car {
    constructor(mesh,brain) {
        this.mesh = mesh;
        this.brain = brain ? brain : new Perceptron(3,4,4,2);
        this.brain.setOptimize(false);
        this.brain = mutate(this,superMutate).brain;
        this.output = [0,0];
    }

    Destroy() {
        //TODO: Would be nice to be able to remove the neural network too.
        scene.remove(this.mesh);
    }

    Create() {
        this.mesh.position.set(0,0.3,-12);
        this.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 0 ), 0);
        scene.add(this.mesh);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.set(this.mesh.position, new THREE.Vector3(0, -1, 0))
    }
}

class Spawn {
    constructor(position)
    {
        this.mesh = new Cube(1,1,1,0x47475b);
        scene.add(this.mesh);
    }
}