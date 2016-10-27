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
        this.brain = brain ? brain : new Perceptron(4,[4,4],2);
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

        //TODO: Code for adding actual car shapes to the scene, current issue is that memory rises fast. Commented out for now
        //
        // let self = this;
        // let ploader = new THREE.ColladaLoader();
        // ploader.load('/model/car.dae', function (result) {
        //     self.spawn = spawns[spawnPoint];
        //     self.mesh = result.scene;
        //     self.mesh.position.x = self.spawn.position.x;
        //     self.mesh.position.y = self.spawn.position.y;
        //     self.mesh.position.z = self.spawn.position.z;
        //     self.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
        //     self.mesh.rotation.y = self.spawn.rotation;
        //
        //     self.raycaster = new THREE.Raycaster();
        //     self.raycaster.set(result.scene.position, new THREE.Vector3(0, -1, 0))
        //
        //     scene.add(result.scene);
        // });

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