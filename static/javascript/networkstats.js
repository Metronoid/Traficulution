/**
 * Created by Mark on 26-10-2016.
 */
class NetworkStats {

    constructor() {
        // $("#network").width(window.innerWidth/4);
        // $("#network").height(window.innerHeight/3);


        $("#networkdiv").width(512);
        $("#networkdiv").height(327);

        this.canvas = document.getElementById('network');
        this.canvas.width = 512*2;
        this.canvas.height = 327*2;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext('2d');

        this.pulsateCurrentTime = 0;
        this.pulsateCurrentLayer = 0;
        this.pulsateCurrentNeuron = 0;
        this.pulsateStep = .5;
        this.pulsateDelay = 20;
        this.pulsateTotalTime = 1000;
        this.pulsating = false;

        this.circleCurrentRadius = 50;
        this.circleDefaultRadius = 50;
        this.circleMaxRadius = this.circleDefaultRadius + (this.pulsateTotalTime/this.pulsateDelay)*this.pulsateStep/2;
        this.circleMinRadius = this.circleDefaultRadius - (this.pulsateTotalTime/this.pulsateDelay)*this.pulsateStep/2;
        this.circleIncreasing = true;

        this.layerAmt = 0;
        this.neuronAmt = 0;

        this.show = true;

    }

    toggleStats(){
        this.show = this.show ? false : true;
        if(!this.show){
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }

    updateStats(brain, moral) {
        if(brain) {
            this.input = brain.layers.input;
            this.hidden = brain.layers.hidden;
            this.output = brain.layers.output;
            if(!this.pulsating) this.pulsate();
        }
        if(moral) {
            this.moral = moral;
        }

        this.context.clearRect(0, 0, this.width, this.height);
        if(this.show) {
            if (this.input && this.hidden && this.output) {
                let layers = [];

                let maxNeuronHeight = this.input.list.length < this.output.list.length ? this.output.list.length : this.input.list.length;
                let neuronsWidth = 2 + this.hidden.length;
                for (let l = 0; l < this.hidden.length; l++) {
                    if (maxNeuronHeight < this.hidden[l].list.length) maxNeuronHeight = this.hidden[l].list.length;
                }

                let neuronWidthIdx = 1;
                let offset = (this.width - neuronsWidth * this.circleMaxRadius * 2) / neuronsWidth;
                let temp = [];
                for (let i = 0; i < this.input.list.length; i++) {
                    let xPos = this.width / 8 * neuronWidthIdx + offset * (neuronWidthIdx - 1);
                    let yPos = (this.height / maxNeuronHeight * i + 50 * 2) + ((this.height / maxNeuronHeight * ((maxNeuronHeight - this.input.list.length) / 2)));
                    temp.push({id: this.input.list[i].ID, x: xPos, y: yPos, activation: this.input.list[i].activation});
                }
                neuronWidthIdx++;
                layers.push(temp);
                temp = [];

                for (let l = 0; l < this.hidden.length; l++) {
                    for (let i = 0; i < this.hidden[l].list.length; i++) {
                        let xPos = this.width / 8 * neuronWidthIdx + offset * (neuronWidthIdx - 1);
                        let yPos = (this.height / maxNeuronHeight * i + 50 * 2) + ((this.height / maxNeuronHeight * ((maxNeuronHeight - this.hidden[l].list.length) / 2)));
                        temp.push({
                            id: this.hidden[l].list[i].ID,
                            x: xPos,
                            y: yPos,
                            activation: this.hidden[l].list[i].activation
                        });
                    }
                    layers.push(temp);
                    temp = [];
                    neuronWidthIdx++;
                }

                for (let i = 0; i < this.output.list.length; i++) {
                    let xPos = this.width / 8 * neuronWidthIdx + offset * (neuronWidthIdx - 1);
                    let yPos = (this.height / maxNeuronHeight * i + 50 * 2) + ((this.height / maxNeuronHeight * ((maxNeuronHeight - this.output.list.length) / 2)));
                    temp.push({
                        id: this.output.list[i].ID,
                        x: xPos,
                        y: yPos,
                        activation: this.output.list[i].activation
                    });
                }
                layers.push(temp);
                temp = [];

                this.layerAmt = neuronWidthIdx;

                let layerIdx = 0;
                for (let i = 0; i < this.input.list.length; i++) {
                    for (let c in Object.keys(this.input.list[i].connections.projected)) {
                        let fromNeuron = this.getNeuronByID(layers, Object.values(this.input.list[i].connections.projected)[c].from.ID);
                        let toNeuron = this.getNeuronByID(layers, Object.values(this.input.list[i].connections.projected)[c].to.ID);
                        let weight = Object.values(this.input.list[i].connections.projected)[c].weight;
                        this.drawConnection(fromNeuron.x, fromNeuron.y, toNeuron.x, toNeuron.y, weight);
                    }
                }

                for (let hid = 0; hid < this.hidden.length; hid++) {
                    for (let i = 0; i < this.hidden[hid].list.length; i++) {
                        for (let c in Object.keys(this.hidden[hid].list[i].connections.projected)) {
                            let fromNeuron = this.getNeuronByID(layers, Object.values(this.hidden[hid].list[i].connections.projected)[c].from.ID);
                            let toNeuron = this.getNeuronByID(layers, Object.values(this.hidden[hid].list[i].connections.projected)[c].to.ID);
                            let weight = Object.values(this.hidden[hid].list[i].connections.projected)[c].weight;
                            this.drawConnection(fromNeuron.x, fromNeuron.y, toNeuron.x, toNeuron.y, weight);
                        }
                    }
                }

                for (let layer in layers) {
                    for (let neur in layers[layer]) {
                        let rad = layer == this.pulsateCurrentLayer ? this.circleCurrentRadius : this.circleDefaultRadius;
                        this.drawNeuron(layers[layer][neur].x, layers[layer][neur].y, rad, layers[layer][neur].activation);
                    }
                }

                if (this.moral) {
                    this.drawText("Moral: " + this.moral, layers[0][0].x - this.circleDefaultRadius, 25);
                }

            }
        }

    }

    drawNeuron(x, y, radius, activation) {
        this.context.beginPath();
        this.context.strokeStyle = "black";
        this.context.lineWidth = "2";
        this.context.arc(x, y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = "black";
        this.context.fill();
        this.context.stroke();

        let txt = activation.toFixed(3);
        this.drawText(txt, x - this.context.measureText(txt).width/2, y + this.getTextHeight(this.context.font).height/2);
    }

    drawText(txt, x, y) {
        this.context.beginPath();
        this.context.strokeStyle = "white";
        this.context.fillStyle = "white";
        this.context.font="25px Verdana";
        this.context.fillText(txt, x, y);
        this.context.stroke();
    }

    drawConnection(startX, startY, endX, endY, weight) {
        this.context.beginPath();
        if(weight >= 0) {
            this.context.strokeStyle = "#4CAF50";
            this.context.lineWidth = weight*10;
        }else{
            this.context.strokeStyle = "#FF5722";
            this.context.lineWidth = -weight*10;
        }
        this.context.moveTo(startX,startY);
        this.context.lineTo(endX,endY);
        this.context.stroke();
    }

    getNeuronByID(array, id) {
        for(let i in array) {
            for(let ob in array[i]) {
                if(array[i][ob].id == id) {
                    return array[i][ob];
                }
            }
        }
        return undefined;
    }

    pulsate(init, reset) {
        if(this.pulsating && init) return;
        if(init || reset) {
            this.circleCurrentRadius = 50;
            this.circleIncreasing = true;
            this.pulsateCurrentTime = 0;
            this.pulsating = true;
        }

        let self = this;
        setTimeout(function() {
            self.updateStats();

            if(self.circleCurrentRadius <= self.circleMaxRadius && self.circleIncreasing) {
                self.circleCurrentRadius += self.pulsateStep;
            } else if(self.circleIncreasing) {
                self.circleIncreasing = false;
            }

            if(self.circleCurrentRadius >= self.circleMinRadius && !self.circleIncreasing) {
                self.circleCurrentRadius -= self.pulsateStep;
            } else if(!self.circleIncreasing) {
                self.circleIncreasing = true;
            }

            self.pulsateCurrentTime += Math.abs(self.pulsateDelay);
            if(self.pulsateTotalTime > self.pulsateCurrentTime) {
                self.pulsate();
            } else {
                if(self.pulsateCurrentLayer + 1 == self.layerAmt) {
                    self.pulsateCurrentLayer = 0;
                } else {
                    self.pulsateCurrentLayer++;
                }
                self.pulsate(false, true);
            }
        }, Math.abs(self.pulsateDelay));
    }

    getTextHeight(font) {

    var text = $('<span>Hg</span>').css({ fontFamily: font });
    var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');

    var div = $('<div></div>');
    div.append(text, block);

    var body = $('body');
    body.append(div);

    try {

        var result = {};

        block.css({ verticalAlign: 'baseline' });
        result.ascent = block.offset().top - text.offset().top;

        block.css({ verticalAlign: 'bottom' });
        result.height = block.offset().top - text.offset().top;

        result.descent = result.height - result.ascent;

    } finally {
        div.remove();
    }

    return result;
};
}

class GenerationData{
    constructor(sortedEntities){
        this.max = sortedEntities[0].fitness;
        this.min = sortedEntities[sortedEntities.length-1].fitness;
        this.medium = sortedEntities[Math.floor(sortedEntities.length/2)].fitness;
        this.med = this.medCalc(sortedEntities);
    }

    medCalc(sortedEntities){
        let sumFitness = 0;
        for(let g in sortedEntities){
            sumFitness += sortedEntities[g].fitness;
        }
        return sumFitness/sortedEntities.length;
    }
}

class GenerationStats {

    constructor() {
        $("#generationdiv").width(512);
        $("#generationdiv").height(327);
        //
        this.canvas = document.getElementById('generation');
        this.canvas.width = 512*2;
        this.canvas.height = 327*2;
        this.context = this.canvas.getContext('2d');

        this.generations = [];
        this.max = undefined;
        this.min = undefined;

        this.show = true;
    }

    toggleStats(){
        this.show = this.show ? false : true;
        if(!this.show){
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }else{
            this.UpdateStats();
        }
    }

    UpdateStats(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let weight = this.canvas.width / this.generations.length;
        if(this.show) {
            for (let g in this.generations) {
                let canvasHeight = this.canvas.height/1.25;
                let totalHeight = (Math.abs(this.max)+Math.abs(this.min));
                let maxHeight = (canvasHeight / (totalHeight) * (totalHeight)+this.generations[g].max);
                let mediumHeight = (canvasHeight / (totalHeight) * (totalHeight)+this.generations[g].medium);
                let minHeight = (canvasHeight / (totalHeight) * (totalHeight)+this.generations[g].min);
                if(maxHeight < mediumHeight || maxHeight < minHeight || mediumHeight < minHeight){
                    console.error("gen has not been sorted")
                }
                //(this.canvas.height / 1.25) / (Math.abs(this.max)+Math.abs(this.min)) * ((Math.abs(this.max)+Math.abs(this.min))-Math.abs(this.generations[g].max))
                //a / (b) * ((b)-c) = (a*(b-c))/b
                this.drawBlock(g * (weight) + (weight / 2), weight, maxHeight, "black");
                this.drawBlock(g * (weight) + (weight / 2), weight, mediumHeight, "#F2B50F");
                //this.drawBlock(g * (weight) + (weight/2), weight,mediumHeight,"#4CAF50");
                //this.drawBlock(g * (weight) + (weight/2), weight,medHeight,"#F2B50F");
                this.drawBlock(g * (weight) + (weight / 2), weight, minHeight, "#FF5722");
            }
        }
    }

    AddGen(generation) {
        let data = new GenerationData(generation);
        this.generations.push(data);
        if(data.max > this.max || this.max == undefined){
            this.max = data.max;
        }
        if(data.min < this.min || this.min == undefined){
            this.min = data.min;
        }
        if(this.generations.length > 50) {
            let pop = this.generations.shift();
            if(this.max == data.max) {
                let max = this.generations[0];
                for(let generation in this.generations) {
                    if(this.generations[generation].max > max) max = this.generations[generation].max;
                }

            }
            if(this.min = data.min) {
                let min = this.generations[0];
                for(let generation in this.generations) {
                    if(this.generations[generation].min < min) min = this.generations[generation].min;
                }
            }
        }
        this.UpdateStats();
    }

    drawBlock(x, weight, height, color) {
        this.context.beginPath();
        this.context.strokeStyle = color;
        this.context.lineWidth = weight;
        this.context.moveTo(x,this.canvas.height);
        this.context.lineTo(x,this.canvas.height - height);
        this.context.fillStyle = color;
        this.context.fill();
        this.context.stroke();
    }

}