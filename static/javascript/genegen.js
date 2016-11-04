class Genegen {

	constructor(seed,fitness,copy,crossover,mutate)
	{
		this.fitness = fitness;
		this.seed = seed;
		this.mutate = mutate;
		this.mutationType = slideMutate;
		this.select1 = this.Fittest;
		this.select2 = this.RouletteReproduction;
		this.optimize = this.Optimize;
		this.generation = null;
		this.crossover = crossover;
		this.copy = copy;

		this.size = 12;
		this.crossoverRate = 0; //0..1
		this.mutation = 1; //0..1
		this.mutationChance = 0.95; //1..0
		this.generations = 10000;
		this.itterations = 3;
		this.timer = 5000;
		this.entities = [];
		this.fitnessText = document.getElementById("fitness");
		this.genStats = new GenerationStats();
	}

	Optimize(a, b) {
		return a >= b;
	}

	Tournament2(pop) {
		var n = pop.length;
		var a = pop[Math.floor(Math.random() * n)];
		var b = pop[Math.floor(Math.random() * n)];
		return this.Optimize(a.fitness, b.fitness) ? a.entity : b.entity;
	}

	Tournament3 (pop) {
		var n = pop.length;
		var a = pop[Math.floor(Math.random()*n)];
		var b = pop[Math.floor(Math.random()*n)];
		var c = pop[Math.floor(Math.random()*n)];
		var best = this.Optimize(a.fitness, b.fitness) ? a : b;
		best = this.Optimize(best.fitness, c.fitness) ? best : c;
		return best.entity;
	}

	Fittest (pop) {
		return pop[0].entity;
	}

	Random (pop) {
		return pop[Math.floor(Math.random() * pop.length)].entity;
	}

	Reproduction(pop) {
		return [this.select1.call(this, pop), this.select1.call(this, pop)];
	}

	RouletteReproduction(pop) {
		var tickets = [];
		let sum = 0;
		// normalize
		let minScore = undefined;
		for(let p in pop){
			let fitness = pop[p].fitness;
			if(pop[p].fitness < minScore || minScore == undefined){
				minScore = fitness;
			}
			sum += fitness;
		}

		sum += -(pop.length * minScore);
		let percentage = 100/sum;
		for(let p in pop){
			console.log(((pop[p].fitness - minScore) * percentage));
			for(let i = 0;i < ((pop[p].fitness - minScore) * percentage);i++){
				tickets.push(pop[p]);
			}
		}

		return [this.select1.call(this, tickets), this.select1.call(this, tickets)];
	}

	Start () {
		this.started = true;
		var i;

		// seed the population
		for (i=0;i<this.size;i++)  {
			this.entities.push(this.seed(i));
		}

		for (i=0; i<this.generations; i++) {

			// Wait a while
			for (let g=0; g<this.itterations; g++) {
				setTimeout(Iterate.bind(this,g), (this.timer * (g+1) + ((this.timer * i * this.itterations)+1)))
			}
		}
	}
}

// TODO: Use a pulling mechanism instead.
function RemoveBatch(entities){
	// Remove the previous entities from the game.
	for (var e = 0; e < entities.length; e++) {
		if (entities[e].Destroy()) {
		}
	}
}

function ObliterateBatch(entities) {
	for(let e = 0; e < entities.length; e++) {
		if(entities[e].Obliterate()) {

		}
		entities[e] = undefined;
	}
}



function CreateBatch(entities,spawnPoint){
	if(spawnPoint == undefined) {
		console.error("There is no spawnPoint");
	}
	collisionList = [];
	for (var e = 0; e < entities.length; e++) {
		if (entities[e].Create(spawnPoint)) {
		}
		spawnPoint += 1;
		if(spawnPoint >= entities.length)
			spawnPoint = 0;
	}
}

function ResetBatch(entities,spawnPoint){
	if(spawnPoint == undefined) {
		console.error("There is no spawnPoint");
	}
	collisionList = [];
	for (var e = 0; e < entities.length; e++) {
		if (entities[e].Reset(spawnPoint)) {
		}
		spawnPoint += 1;
		if(spawnPoint >= entities.length)
			spawnPoint = 0;
	}
}

function CheckMoral(self,entities){
	for (var e = 0; e < entities.length; e++) {
		entities[e].moral += self.fitness(entities[e]);
	}
}

function CleanMoral(entities){
	for (var e = 0; e < entities.length; e++) {
		entities[e].moral = 0;
	}
}

function Iterate(g){
	let self = this;
	CheckMoral(self,self.entities);
	if(g == this.itterations-1) {
		Generate(self);
	}else {
		ResetBatch(self.entities, g + 1);
	}

	// This code is here to see the neural network update live instead of static. after half of the complete timer has passed,
	// it'll pick out the best car and show the neural network of that car.
	setTimeout(function() {
		let fittestCar;
		let maxFitness = this.fitness(pool.entities[0]);
		// let maxFitness;
		for (car in pool.entities){
			let fitness = this.fitness(pool.entities[car]);
			// let fitness = 1;
			if(fitness > maxFitness) {
				maxFitness = fitness;
				fittestCar = pool.entities[car];
			}
		}
		if(fittestCar != undefined) nwstats.updateStats(fittestCar.brain);
	}, this.timer/2);
}

function Generate(self){
	console.log("Generate!");
	function mutateOrNot(entity) {
		// applies mutation based on mutation probability
		return Math.random() <= self.mutation && self.mutate ? self.mutate(entity,self.mutationType,self.mutationChance) : entity;
	}

	// score and sort
	function sortOnFitness(entities){
		return entities
			.sort(function (a, b) {
				return  b.moral - a.moral;
			})
			.map(function (entity) {
				return {"fitness": entity.moral, "entity": entity, "isbest": false };
			});
	}

	// score and sort
	let pop = sortOnFitness(self.entities);
	self.genStats.AddGen(pop);
    //
    //
	// // crossover and mutate
	let newPop = [];
	let entityCopy = self.entities;

	let sumFitness = 0;
	for(let g in pop){
		sumFitness += pop[g].fitness;
	}
	sumFitness = sumFitness/pop.length;
	self.fitnessText.innerHTML = "Best fitness: " + pop[0].fitness.toFixed(2) + " Med fitness: " + sumFitness.toFixed(2);
	console.log(pop[0].fitness + " and " + sumFitness);
	pop[0].entity.isbest = true;

	while (newPop.length < self.size) {
		if (
			self.crossover // if there is a crossover function
			&& Math.random() <= self.crossoverRate // base crossover on specified probability
			&& newPop.length+1 < self.size // keeps us from going 1 over the max population size
			&& self.select2
		) {
			let parents = self.select2(pop);
			let children = self.crossover(parents[0], parents[1], 0).map(mutateOrNot);
			newPop.push(children[0], children[1]);
		} else {
			let ent = self.select1(pop);
			newPop.push(mutateOrNot(self.copy(ent,0)));
			ent = undefined;
		}
	}

	ObliterateBatch(entityCopy);
	console.log(pop.length);

	for(let pop in newPop) {
		console.log(newPop[pop].brain);
	}

	self.entities = newPop;

	CreateBatch(self.entities,0);
	CleanMoral(self.entities);
}