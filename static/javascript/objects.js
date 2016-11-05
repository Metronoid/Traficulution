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
    constructor(mesh, spawnPoint, brain) {
        this.mesh = mesh;
        this.spawn = spawns[spawnPoint];
        this.brain = brain ? brain : new Perceptron(3,[4,4],2);
        this.brain.setOptimize(false);
        this.brain.mutationGenes = [];
        //this.brain = ;
        this.output = [0, 0];
        this.moral = 0;
        this.raycaster = new THREE.Raycaster();
    }

    // TODO: this is just a simple collision but we need one that cares about rotation
    Collision(b){
        //let axisX = new THREE.Vector3(1,0,0).applyEuler(this.mesh.rotation);
        //let axisZ = new THREE.Vector3(0,0,1).applyEuler(this.mesh.rotation);
        //this.arrow.position.x = this.mesh.position.x;
        //this.arrow.position.z = this.mesh.position.z;
        //this.arrow.setDirection(axisX);
        //return (Math.abs(this.mesh.position.x - b.position.x) * 2 < (2)) &&
        //    (Math.abs(this.mesh.position.z - b.position.z) * 2 < (2));
    }

    Destroy() {

        //TODO: Would be nice to be able to remove the neural network too.
        let children = getChildren(this.mesh);
        for(let child in children) {
            if(children[child].type == "PerspectiveCamera" || children[child].type == "Object3D") continue;
            children[child].geometry.dispose();
            children[child].material.dispose();
        }
        scene.remove(this.mesh);
        //TODO: Make the line beneath this work without errors
        // this.mesh = undefined;
        this.mesh.inuse = false;
        this.brain.clear();
    }

    Reset(spawnPoint) {
        if(spawnPoint == undefined)
        {
            console.error("There is no spawnPoint");
        }

        while (spawnPoint > spawns.length-1){
            spawnPoint -= spawns.length;
        }

        this.spawn = spawns[spawnPoint];
        this.mesh.castShadow = true;
        this.mesh.position.x = this.spawn.position.x;
        this.mesh.position.y = this.spawn.position.y;
        this.mesh.position.z = this.spawn.position.z;
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
        this.mesh.rotation.y = this.spawn.rotation;

        this.raycaster.set(this.mesh.position, new THREE.Vector3(0, -1, 0));

        this.color = 0xFF0000;
        this.setColor(this.getRandomColor());
    }

    Obliterate() {
        this.Destroy();
        this.brain = undefined;
        this.raycaster = undefined;
    }

    Create(spawnPoint) {
        if(spawnPoint == undefined)
        {
            console.error("There is no spawnPoint");
        }

        while (spawnPoint > spawns.length-1){
            spawnPoint -= spawns.length;
        }

        this.spawn = spawns[spawnPoint];
        this.mesh = getCarMesh();
        //console.log(this.mesh);
        this.mesh.castShadow = true;
        this.mesh.position.x = this.spawn.position.x;
        this.mesh.position.y = this.spawn.position.y;
        this.mesh.position.z = this.spawn.position.z;
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
        this.mesh.rotation.y = this.spawn.rotation;

        this.raycaster.set(this.mesh.position, new THREE.Vector3(0, -1, 0));

        this.color = 0xFF0000;
        this.setColor(this.getRandomColor());

        scene.add(this.mesh);

    }

    getRandomColor() {
        return '0x'+Math.floor(Math.random()*16777215).toString(16);
    }

    setColor(hex) {
        let children = this.getChildren(this.mesh);
        for(let child in children) {
            if(!children[child].material) continue;
            let color = children[child].material.color;
            if(color.getHex() == this.color) {
                color.setHex(hex);
            }
        }
        if(hex) this.color = hex;
    }

    getChildren(mesh) {
        let result = [];
        if(!mesh.children || mesh.children.length == 0) return result;
        for(let child in mesh.children) {
            let rchildren = this.getChildren(mesh.children[child]);
            for(let rchild in rchildren) {
                result.push(rchildren[rchild]);
            }
            result.push(mesh.children[child]);
        }
        return result;
    }

}