/**
 * Created by Mark on 17-10-2016.
 */
class block {

    constructor(width, height){
        this.width = width;
        this.height = height;
        this.buildings = [];
    }

    generateBlock(min, max, maxHeight, amount, padding) {
        for(let idx = 0; idx < amount; idx++) {
            let width = (Math.random() * max) + min;
            let height = (Math.random() * max) + min;
            let x = (Math.random() * this.width);
            let y = (Math.random() * this.height);
            let build = new building(x, y, width, height, padding);

            if(this.isSpotTaken(build) || this.isOuterBounds(build)) {
                idx--;
            } else {
                this.buildings.push(build);
            }
        }

        let group = new THREE.Object3D();
        let floor = new Cube(this.width, .1, this.height);
        floor.position.set(this.width/2, 0, this.height/2);
        group.add(floor);
        console.log(group);
        for(let idx = 0; idx < this.buildings.length; idx++) {
            let tmp = this.buildings[idx];
            let height = Math.random() * maxHeight;
            let build = new Cube(tmp.width, height, tmp.height, 0xADADAD);
            build.position.set(tmp.x, height/2, tmp.y);
            console.log(build);
            group.add(build);
        }

        return group;
    }

    isSpotTaken(building) {
        for(let idx = 0; idx < this.buildings.length; idx++) {
            let target = this.buildings[idx];
            if (target.x < building.x + building.width && target.x + target.width > building.x &&
                target.y < building.y + building.height && target.y + target.height > building.y) return true;
        }
        return false;
    }


    isOuterBounds(building) {
        return building.x < 0 || building.y < 0 || building.x + building.width > this.width || building.y + building.height > this.height;
    }
}

class building {

    constructor(x, y, width, height, padding) {
        this.x = this.applyPadding(x, padding);
        this.y = this.applyPadding(y, padding);
        this.width = this.applyPadding(width, padding);
        this.height = this.applyPadding(height, padding);
    }

    applyPadding(num, padding) {
        return (num - padding / 2) + padding;
    }

}