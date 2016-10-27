class Genegen {

	constructor(seed,fitness,copy,crossover,mutate)
	{
		this.fitness = fitness;
		this.seed = seed;
		this.mutate = mutate;
		this.mutationType = slideMutate;
		this.select1 = this.Tournament2;
		this.select2 = this.Reproduction;
		this.optimize = this.Optimize;
		this.generation = null;
		this.crossover = crossover;
		this.copy = copy;

		this.size = 3;
		this.crossoverRate = 0; //0..1
		this.mutation = 1; //0..1
		this.mutationChance = 0.75; //1..0
		this.generations = 10000;
		this.itterations = 3;
		this.timer = 5000;
		this.fittestPercentageAlwaysSurvives = 1; //0..1
		this.fittestEntities = [];
		this.entities = [];
		this.fitnessText = document.getElementById("fitness");
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
		let minScore = null;
		for(let p in pop){
			let fitness = pop[p].fitness;
			if(minScore == null) {minScore = fitness;}
			if(pop[p].fitness < minScore){minScore = fitness;}
			sum += fitness;
		}

		sum += -(pop.length * minScore);
		let percentage = 100/sum;
		for(let p in pop){
			for(let i = 0;i < ((pop[p].fitness - minScore) * percentage);i++){
				console.log(((pop[p].fitness - minScore) * percentage));
				tickets.push(pop[p]);
			}
		}

		return [this.select1.call(this, tickets), this.select1.call(this, tickets)];
	}

	Start () {

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

function CreateBatch(entities,spawnPoint){
	if(spawnPoint == undefined) {
		console.error("There is no spawnPoint");
	}
	for (var e = 0; e < entities.length; e++) {
		if (entities[e].Create(spawnPoint)) {
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
	}else{
		RemoveBatch(self.entities);
		CreateBatch(self.entities,g+1);
	}
}

function Generate(self){
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
				return {"fitness": entity.moral, "entity": entity };
			});
	}

	// score and sort
	let pop = sortOnFitness(self.entities);
    //
    //
	// // crossover and mutate
	let newPop = [];
	let entityCopy = self.entities;
	if(self.fittestPercentageAlwaysSurvives > 0) {
		for (let i = 0; i < self.size * self.fittestPercentageAlwaysSurvives; i++) // lets the best solution fall through
		{
			self.fittestEntities.push(pop[i].entity);
		}
		var greatest = sortOnFitness(self.fittestEntities)

		console.log(greatest[0]);
		self.fitnessText.innerHTML = "Best fitness: " + greatest[0].fitness.toFixed(2);
		nwstats.updateStats(greatest[0].entity.brain);

		self.fittestEntities = null;
		self.entities = null;
		self.fittestEntities = [];
		self.entities = [];
		for (let g = 0; g < greatest.length; g++) // lets the best solutions fall through
		{
			if (g < self.size * self.fittestPercentageAlwaysSurvives) {
				self.fittestEntities.push(greatest[g].entity);
				self.entities.push(self.copy(greatest[g].entity,0));
			}
		}

		// score and sort
		pop = sortOnFitness(self.entities);

		pop = pop.slice(0,5);

	}




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
			newPop.push(mutateOrNot(self.copy(self.select1(pop),0)));
		}
	}

	RemoveBatch(entityCopy);

	self.entities = newPop;

	CreateBatch(self.entities,0);
	CleanMoral(self.entities);

}