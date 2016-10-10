class Genegen {

	constructor(seed,fitness,copy,crossover,mutate)
	{
		this.fitness = fitness;
		this.seed = seed;
		this.mutate = mutate;
		this.select1 = this.Tournament2;
		this.select2 = this.Reproduction;
		this.optimize = this.Optimize;
		this.generation = null;
		this.crossover = crossover;
		this.copy = copy;

		this.size = 6;
		this.crossoverRate = 0.1;
		this.mutation = 0.1;
		this.iterations = 1000;
		this.timer = 4000;
		this.fittestPercentageAlwaysSurvives = 0.2; //0..1
		this.fittestEntities = [];
		this.entities = [];
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

	Roulete2 (pop) {
		var tickets = [];
		for(let p in pop){
			for(var i = 0; i <= pop[p].fitness/pop[0].fitness; i++) {
				tickets.push(pop[p])
			}
		}
		return tickets;
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

	RouleteReproduction(pop) {
		return [this.select1.call(this, this.Roulete2(pop)), this.select1.call(this, this.Roulete2(pop))];
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
	var self = this;
	function mutateOrNot(entity) {
		// applies mutation based on mutation probability
		return Math.random() <= self.mutation && self.mutate ? self.mutate(entity) : entity;
	}

	// score and sort
	var pop = this.entities
		.map(function (entity) {
			return {"fitness": self.fitness(entity), "entity": entity };
		})
		.sort(function (a, b) {
			return self.optimize(a.fitness, b.fitness) ? -1 : 1;
		});

	console.log(pop[1]);

	// crossover and mutate
	var newPop = [];
	for (let i = 0; i < pop.length*this.fittestPercentageAlwaysSurvives; i++) // lets the best solution fall through
	{
		this.fittestEntities.push(pop[i].entity);
	}
	var greatest = this.fittestEntities
		.map(function (entity) {
			return {"fitness": self.fitness(entity), "entity": entity };
		})
		.sort(function (a, b) {
			return self.optimize(a.fitness, b.fitness) ? -1 : 1;
		});

	for (let g = 0; g < greatest.length; g++) // lets the best solution fall through
	{
		if(g < pop.length*this.fittestPercentageAlwaysSurvives){
			newPop.push(this.copy(greatest[g].entity));
		}else {
			this.fittestEntities.pop();
		}
	}



	while (newPop.length < self.size) {
		if (
			this.crossover // if there is a crossover function
			&& Math.random() <= this.crossoverRate // base crossover on specified probability
			&& newPop.length+1 < self.size // keeps us from going 1 over the max population size
			&& this.select2
		) {
			var parents = this.select2(pop);
			var children = this.crossover(parents[0], parents[1]).map(mutateOrNot);
			newPop.push(children[0], children[1]);
		} else {
			newPop.push(mutateOrNot(this.copy(self.select1(pop))));
		}
	}

	// Remove the previous entities from the game.
	for (var e = 0; e < this.entities.length; e++) {
		if (this.entities[e].Destroy()) {
		}
	}

	this.entities = newPop;

	for (var e = 0; e < this.entities.length; e++) {
		if (this.entities[e].Create()) {
		}
	}
}