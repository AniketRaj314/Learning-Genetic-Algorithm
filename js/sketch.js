let target;
let population;
let mutationRate;
let all_phrases;
let generations = 1;
let bestPhrase;
let stats;
let allPhrases;
function setup() {
  target = "Learning Genetic Algorithm";
  population = 200;
  mutationRate = 0.01;
  all_phrases = new Population(target, population, mutationRate);
  bestPhrase = createP(`Best of Generation: ${generations}`);
  bestPhrase.class('best');
  stats = createP("Stats");
  stats.class("stats");
  allPhrases = createP("All phrases:");
  allPhrases.class("all");
  allPhrases.position(innerWidth / 2 - 50, 20);
}

function draw() {
  all_phrases.calcFitness();
  let flg = all_phrases.checkWinner();
  showStats();
  if (flg) { noLoop(); }
  all_phrases.generateMatingPool();
  all_phrases.produceChild();
}

function showStats() {
  bestPhrase.html(`Best of Generation: ${generations}<br>${all_phrases.getBestPhrase()}`)
  let statsText = `Generation: ${generations}<br>Average Fitness: ${all_phrases.calcAvgFitness()}<br>
  Total Population: ${population}<br>Mutation Rate: ${mutationRate * 100}%`;
  stats.html(statsText);
  allPhrases.html(`All Phrases:<br>${all_phrases.getAllPhrases()}`);
  generations++;
}

class Population {
  constructor(target, population, mutationRate) {
    this.target = target;
    this.population = population;
    this.mutationRate = mutationRate;
    this.phrases = [];
    this.matingPool = [];
    for (let i = 0; i < this.population; i++) {
      this.phrases[i] = new DNA(this.target.length);
    }
  }

  calcFitness() {
    for (let i = 0; i < this.population; i++) {
      this.phrases[i].calcFitness(this.target);
    }
  }

  getAllPhrases() {
    let string = ``;
    for(let i = 0; i < this.phrases.length; i++) {
      string += `${this.phrases[i].getPhrase()}<br>`;
    }
    return string;
  }

  calcAvgFitness() {
    let sum = 0;
    for (let i = 0; i < this.phrases.length; i++) {
      sum += this.phrases[i].fitness;
    }
    return sum / this.phrases.length;
  }

  getBestPhrase() {
    let maxFitness = this.phrases[0].fitness;
    let index = 0;
    for (let i = 0; i < this.population; i++) {
      if (maxFitness < this.phrases[i].fitness) {
        maxFitness = this.phrases[i].fitness;
        index = i;
      }
    }
    return this.phrases[index].getPhrase();
  }

  checkWinner() {
    for (let i = 0; i < this.population; i++) {
      if (this.phrases[i].getPhrase() == this.target) {
        console.log("COMPLETED!, " + this.phrases[i].getPhrase());
        return 1;
      }
    }
    return 0;
  }

  generateMatingPool() {
    this.matingPool = [];
    let maxFitness = -1;
    for (let i = 0; i < this.population; i++) {
      if (maxFitness < this.phrases[i].fitness)
        maxFitness = this.phrases[i].fitness;
    }
    for (let i = 0; i < this.population; i++) {
      let temp = map(this.phrases[i].fitness, 0, maxFitness, 0, 1);
      let n = floor(temp * 100);
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.phrases[i]);
      }
    }
  }

  produceChild() {
    for (let i = 0; i < this.phrases.length; i++) {
      let parent1 = this.matingPool[floor(random(this.matingPool.length))];
      let parent2 = this.matingPool[floor(random(this.matingPool.length))];
      let child = parent1.crossover(parent2);
      child.mutate(this.mutationRate);
      this.phrases[i] = child;
    }
  }
}

function newChar() {
  let c = floor(random(63, 122));
  if (c === 63) c = 32;
  if (c === 64) c = 46;

  return String.fromCharCode(c);
}

class DNA {
  constructor(phrase_length) {
    this.genes = [];
    this.fitness = 0;
    for (let i = 0; i < phrase_length; i++) {
      this.genes[i] = newChar();
    }
  }

  crossover(other) {
    let child = new DNA(this.genes.length);
    let midpoint = floor(random(this.genes.length));
    for (let i = 0; i < this.genes.length; i++) {
      if (i > midpoint)
        child.genes[i] = this.genes[i];
      else
        child.genes[i] = other.genes[i];
    }
    return child;
  }

  calcFitness(target) {
    let score = 0;
    for (let i = 0; i < target.length; i++) {
      if (target[i] == this.genes[i]) {
        score++;
      }
    }
    this.fitness = score / target.length;
  }

  getPhrase() {
    return this.genes.join("");
  }

  mutate(rate) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < rate) {
        this.genes[i] = newChar();
      }
    }
  }
}