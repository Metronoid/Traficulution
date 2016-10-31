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
        this.brain = brain ? brain : new Perceptron(4,[4,4],2);
        this.brain.setOptimize(false);
        this.brain = mutate(this, superMutate).brain;
        this.output = [0, 0];
        this.moral = 0;
        this.raycaster = new THREE.Raycaster();
        //this.view = new THREE.Raycaster();
        //this.arrow = new THREE.ArrowHelper( new THREE.Vector3(0,1,0), this.mesh.position, 5, Math.random() * 0xffffff );
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
        scene.remove(this.mesh);
        //scene.remove ( this.arrow );

    }

    Create(spawnPoint) {
        if(spawnPoint == undefined)
        {
            console.error("There is no spawnPoint");
        }

        //TODO: Code for adding actual car shapes to the scene, current issue is that memory rises fast. Commented out for now
        //
        let self = this;
        let ploader = new THREE.ColladaLoader();
        ploader.load('/model/car.dae', function (result) {
            self.spawn = spawns[spawnPoint];
            result.scene.traverse(function(child) {
                child.castShadow = true;
            });
            self.mesh = result.scene;
            self.mesh.castShadow = true;
            self.mesh.position.x = self.spawn.position.x;
            self.mesh.position.y = self.spawn.position.y;
            self.mesh.position.z = self.spawn.position.z;
            self.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
            self.mesh.rotation.y = self.spawn.rotation;

            self.raycaster.set(self.mesh.position, new THREE.Vector3(0, -1, 0));
            //self.view.set(self.mesh.position, new THREE.Vector3(0, 0, 1))

            scene.add(self.mesh);

            self.color = 0xFF0000;
            self.setColor(self.getRandomColor());
        });

        // this.spawn = spawns[spawnPoint];
        // this.mesh.position.x = this.spawn.position.x;
        // this.mesh.position.y = this.spawn.position.y;
        // this.mesh.position.z = this.spawn.position.z;
        // this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), 0);
        // this.mesh.rotation.y = this.spawn.rotation;
        // scene.add(this.mesh);
        // this.raycaster = new THREE.Raycaster();
        // this.raycaster.set(this.mesh.position, new THREE.Vector3(0, -1, 0))
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