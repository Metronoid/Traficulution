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

		this.size = 40;
		this.crossoverRate = 0; //0..1
		this.mutation = 1; //0..1
		this.iterations = 10000;
		this.timer = 4000;
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

		console.log("Reproduce");
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
		for (i=0;i<this.size;++i)  {
			this.entities.push(this.seed());
		}

		for (i=0;i<this.iterations;++i) {

			// Wait a while
			setTimeout(Iterate.bind(this), this.timer * (i+1))

		}
	}
}

function Iterate(){
	let self = this;
	function mutateOrNot(entity) {
		// applies mutation based on mutation probability
		return Math.random() <= self.mutation && self.mutate ? self.mutate(entity,self.mutationType) : entity;
	}

	// score and sort
	function sortOnFitness(entities){
		return entities
			.sort(function (a, b) {
				return  self.fitness(b) - self.fitness(a);
			})
			.map(function (entity) {
				return {"fitness": self.fitness(entity), "entity": entity };
			});
	}

	// score and sort
	let pop = sortOnFitness(this.entities);
    //
    //
	// // crossover and mutate
	let newPop = [];
	let entityCopy = this.entities;
	if(this.fittestPercentageAlwaysSurvives > 0) {
		for (let i = 0; i < this.size * this.fittestPercentageAlwaysSurvives; i++) // lets the best solution fall through
		{
			this.fittestEntities.push(pop[i].entity);
		}
		var greatest = sortOnFitness(this.fittestEntities)

		console.log(greatest[0]);
		this.fitnessText.innerHTML = "Best fitness: " + greatest[0].fitness.toFixed(2);

		this.fittestEntities = null;
		this.entities = null;
		this.fittestEntities = [];
		this.entities = [];
		for (let g = 0; g < greatest.length; g++) // lets the best solutions fall through
		{
			if (g < this.size * this.fittestPercentageAlwaysSurvives) {
				this.fittestEntities.push(greatest[g].entity);
				this.entities.push(this.copy(greatest[g].entity));
			}
		}

		// score and sort
		pop = sortOnFitness(this.entities);

		pop = pop.slice(0,5);

	}




	while (newPop.length < self.size) {
		if (
			this.crossover // if there is a crossover function
			&& Math.random() <= this.crossoverRate // base crossover on specified probability
			&& newPop.length+1 < self.size // keeps us from going 1 over the max population size
			&& this.select2
		) {
			let parents = this.select2(pop);
			let children = this.crossover(parents[0], parents[1]).map(mutateOrNot);
			newPop.push(children[0], children[1]);
		} else {
			newPop.push(mutateOrNot(this.copy(self.select1(pop))));
		}
	}


	// Remove the previous entities from the game.
	for (var e = 0; e < entityCopy.length; e++) {
		if (entityCopy[e].Destroy()) {
		}
	}

	this.entities = newPop;

	for (var e = 0; e < this.entities.length; e++) {
		if (this.entities[e].Create()) {
		}
	}
}