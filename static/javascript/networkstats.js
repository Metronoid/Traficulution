/**
 * Created by Mark on 26-10-2016.
 */
class NetworkStats {

    constructor() {
        // $("#network").width(window.innerWidth/4);
        // $("#network").height(window.innerHeight/3);

        $("#network").width(512);
        $("#network").height(300);

        this.canvas = document.getElementById('network');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext('2d');


    }

    updateStats(brain) {
        this.input = brain.layers.input;
        this.hidden = brain.layers.hidden;
        this.output = brain.layers.output;

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillRect(0, 0, this.width, this.height);
        if(this.input && this.hidden && this.output) {
            let layers = [];

            let totalNeuronWidth = this.input.list.length + this.output.list.length;
            for(let l = 0; l < this.hidden.length; l++) {
                totalNeuronWidth += this.hidden[l].list.length;
            }

            let neuronWidthIdx = 1;
            let offset = this.width/24;
            let temp = [];
            for(let i = 0 ; i < this.input.list.length; i++) {
                let xPos = this.width/8*neuronWidthIdx+offset*neuronWidthIdx;
                let yPos = this.height/this.input.list.length*i + 10*2;
                temp.push({ id: this.input.list[i].ID, x: xPos, y: yPos });
                this.drawNeuron(xPos, yPos);
            }
            neuronWidthIdx++;
            layers.push(temp);
            temp = [];

            for(let l = 0; l < this.hidden.length; l++) {
                for(let i = 0 ; i < this.hidden[l].list.length; i++) {
                    let xPos = this.width/8*neuronWidthIdx+offset*neuronWidthIdx;
                    let yPos = this.height/this.hidden[l].list.length*i + 10*2;
                    temp.push({ id: this.hidden[l].list[i].ID, x: xPos, y: yPos });
                    this.drawNeuron(xPos, yPos);
                }
                layers.push(temp);
                temp = [];
                neuronWidthIdx++;
            }

            for(let i = 0 ; i < this.output.list.length; i++) {
                let xPos = this.width/8*neuronWidthIdx+offset*neuronWidthIdx;
                let yPos = this.height/this.output.list.length*i + 10*2;
                temp.push({ id: this.output.list[i].ID, x: xPos, y: yPos });
                this.drawNeuron(xPos, yPos);
            }
            layers.push(temp);
            temp = [];


            let layerIdx = 0;
            for(let i = 0 ; i < this.input.list.length; i++) {
                for(let c in Object.keys(this.input.list[i].connections.projected)) {
                    let fromNeuron = this.getNeuronByID(layers, Object.values(this.input.list[i].connections.projected)[c].from.ID);
                    let toNeuron = this.getNeuronByID(layers, Object.values(this.input.list[i].connections.projected)[c].to.ID);
                    let weight = Object.values(this.input.list[i].connections.projected)[c].weight;
                    this.drawConnection(fromNeuron.x, fromNeuron.y, toNeuron.x, toNeuron.y, weight);
                }
            }

            for(let hid = 0; hid < this.hidden.length; hid++) {
                for(let i = 0 ; i < this.hidden[hid].list.length; i++) {
                    for(let c in Object.keys(this.hidden[hid].list[i].connections.projected)) {
                        let fromNeuron = this.getNeuronByID(layers, Object.values(this.hidden[hid].list[i].connections.projected)[c].from.ID);
                        let toNeuron = this.getNeuronByID(layers, Object.values(this.hidden[hid].list[i].connections.projected)[c].to.ID);
                        let weight = Object.values(this.hidden[hid].list[i].connections.projected)[c].weight;
                        this.drawConnection(fromNeuron.x, fromNeuron.y, toNeuron.x, toNeuron.y, weight);
                    }
                }
            }


        }

        this.input = brain.layers.input;
        this.hidden = brain.layers.hidden;
        this.output = brain.layers.output;
    }

    drawNeuron(x, y) {
        this.context.beginPath();
        this.context.strokeStyle = "purple";
        this.context.lineWidth = "2";
        this.context.arc(x, y, 10, 0, 2 * Math.PI);
        this.context.stroke();
    }

    drawConnection(startX, startY, endX, endY, weight) {
        this.context.beginPath();
        if(weight >= 0) {
            this.context.strokeStyle = "green";
            this.context.lineWidth = weight;
        }else{
            this.context.strokeStyle = "red";
            this.context.lineWidth = -weight;
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

}