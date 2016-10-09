class Genegen {

	constructor(seed,fitness)
	{
		this.fitness = fitness;
		this.seed = seed;
		this.mutate = null;
		this.select1 = this.Tournament2;
		this.select2 = null;
		this.optimize = this.Optimize;
		this.generation = null;

		this.size = 4;
		this.crossover = 0.9;
		this.mutation = 0.2;
		this.iterations = 5;
		this.fittestAlwaysSurvives = true;
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
		var best = this.optimize(a.fitness, b.fitness) ? a : b;
		best = this.optimize(best.fitness, c.fitness) ? best : c;
		return best.entity;
	}

	Fittest (pop) {
		return pop[0].entity;
	}

	Random (pop) {
		return pop[Math.floor(Math.random() * pop.length)].entity;
	}

	Start () {

		var i;

		// seed the population
		for (i=0;i<this.size;++i)  {
			this.entities.push(this.seed());
		}

		for (i=0;i<this.iterations;++i) {

			// Wait a while
			setTimeout(Iterate.bind(this), 2000 * (i+1))

		}
	}
}

function Iterate(){
	var self = this;
	function mutateOrNot(entity) {
		// applies mutation based on mutation probability
		return Math.random() <= self.mutation && self.mutate ? self.mutate(entity) : entity;
	}
	function copy(entity){
		var newEntity = this.seed();
		// TODO: Go through all the weights and change them.
		var inputNew = newEntity.brain.layers.input.list;
		var inputOld = entity.brain.layers.input.list;
		for (var i=0;i<inputNew.length;++i) {
			inputNew[i].bias = inputOld[i].bias;
		}
		newEntity.brain.layers.input.list = inputNew;

		for (var h=0;h<newEntity.brain.layers.hidden.length;++h) {
			var hiddenNew = newEntity.brain.layers.hidden[h].list;
			var hiddenOld = entity.brain.layers.hidden[h].list;
			for (var i = 0; i < hiddenNew.length; ++i) {
				hiddenNew[i].bias = hiddenOld[i].bias;
				var newWeights = [];
				for(var o in hiddenOld[i].connections.inputs) {
					newWeights.push(hiddenOld[i].connections.inputs[o].weight);
				}
				var l = 0;
				for(var n in hiddenNew[i].connections.inputs) {
					hiddenNew[i].connections.inputs[n].weight = newWeights[l];
					l++;
				}
			}
			newEntity.brain.layers.hidden[h].list = hiddenNew;
		}

		var outputNew = newEntity.brain.layers.output.list;
		var outputOld = entity.brain.layers.output.list;
		for (var i=0;i<outputNew.length;++i) {
			outputNew[i].bias = outputOld[i].bias;
			var newWeights = [];
			for(var o in outputOld[i].connections.inputs) {
				newWeights.push(outputOld[i].connections.inputs[o].weight);
			}
			var l = 0;
			for(var n in outputNew[i].connections.inputs) {
				outputNew[i].connections.inputs[n].weight = newWeights[l];
				l++;
			}
		}
		newEntity.brain.layers.output.list = outputNew;

		return newEntity;

	}
	// score and sort
	var pop = this.entities
		.map(function (entity) {
			return {"fitness": self.fitness(entity), "entity": entity };
		})
		.sort(function (a, b) {
			return self.optimize(a.fitness, b.fitness) ? -1 : 1;
		});

	// crossover and mutate
	var newPop = [];

	if (this.fittestAlwaysSurvives) // lets the best solution fall through
		newPop.push(copy(pop[0].entity));

	while (newPop.length < self.size) {
		if (
			this.crossover // if there is a crossover function
			&& Math.random() <= this.crossover // base crossover on specified probability
			&& newPop.length+1 < self.size // keeps us from going 1 over the max population size
			&& this.select2
		) {
			var parents = this.select2(pop);
			var children = this.crossover(parents[0], parents[1]).map(mutateOrNot);
			newPop.push(children[0], children[1]);
		} else {
			newPop.push(mutateOrNot(copy(self.select1(pop))));
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