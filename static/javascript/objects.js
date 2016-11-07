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
        this.mutationGenes = [];
        this.output = [0, 0];
        this.moral = 0;
        this.raycaster = new THREE.Raycaster();
        this.brain = mutate(this, slideMutate, 0.95).brain;
    }

    Destroy() {

        let children = getChildren(this.mesh);
        for(let child in children) {
            if(children[child].type == "PerspectiveCamera" || children[child].type == "Object3D") continue;
            children[child].geometry.dispose();
            children[child].material.dispose();
        }
        scene.remove(this.mesh);
        this.mesh.inuse = false;
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
        this.brain.clear();
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