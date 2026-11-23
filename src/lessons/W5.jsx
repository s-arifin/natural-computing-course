import { Lesson, Section, Callout, Sim, Quiz, Table, Steps } from '../components/ui'
import { Formula, P, V, Frac, Sum } from '../components/Formula'
import { EvolveString, Roulette, CrossoverLab, TspGA } from '../sims/GaSims'

export default function W5({ onDone }) {
  return (
    <Lesson
      week="Week 5"
      title="Evolutionary computation and genetic algorithms"
      subtitle="Evolution is an optimisation process that designed eyes, wings and brains without any designer. A genetic algorithm borrows its three moves (selection, crossover, mutation) and runs them on a population of candidate solutions."
      time="45 minutes"
    >
      <Section n="1" title="Evolution as a search algorithm">
        <Callout type="history">
          <p>
            In 1859 Charles Darwin published <i>On the Origin of Species</i>. His argument fits in four lines, and they are the four bullet points
            on your "Key concepts" slide: resources are limited; so individuals compete; those that fit their environment better are more likely to
            survive and reproduce; and they pass their traits to their offspring. Over many generations the population shifts towards whatever
            works.
          </p>
          <p>
            A century later, <b>John Holland</b> at the University of Michigan asked whether a computer could do the same thing to solve problems.
            He developed genetic algorithms through the 1960s and published <i>Adaptation in Natural and Artificial Systems</i> in 1975. His student{' '}
            <b>David Goldberg</b> wrote the 1989 textbook that made them famous. At the same time in Germany, Rechenberg and Schwefel developed
            "evolution strategies", and in the US Lawrence Fogel developed "evolutionary programming". Together these are called{' '}
            <b>evolutionary computation</b>.
          </p>
        </Callout>
        <Callout type="example" title="The peppered moth: evolution you can watch">
          <p>
            Before the Industrial Revolution, peppered moths around Manchester were pale and speckled, which hid them on lichen-covered tree bark.
            A dark form was not recorded before 1811. Then factory soot killed the lichen and blackened the trees. Pale moths now stood out and
            were eaten by birds; dark moths were hidden. By 1895 about 98% of the moths in Manchester were dark. When clean-air laws arrived in the
            1950s, the trees lightened again and the pale form came back ("evolution in reverse", the paper cited on your slide).
          </p>
          <p>Map this onto the algorithm and you have understood the principle:</p>
          <Table
            head={['Nature', 'Genetic algorithm']}
            rows={[
              ['A moth', 'One candidate solution'],
              ['The moth\'s genes for wing colour', 'The numbers that encode the solution'],
              ['How well camouflaged it is', 'The fitness value'],
              ['Birds eating visible moths', 'Selection'],
              ['A rare dark moth appearing by chance', 'Mutation'],
              ['The trees changing colour', 'The fitness function changing (a dynamic problem)'],
            ]}
          />
        </Callout>
        <h3>Where GAs sit among search methods</h3>
        <p>The lecture's tree diagram sorts search techniques into three families. It is worth being able to place each algorithm:</p>
        <Table
          head={['Family', 'How it works', 'Limitation', 'Members']}
          rows={[
            ['Calculus-based', 'Use the slope (gradient) of the function to walk downhill.', 'Needs a smooth formula you can differentiate; gets stuck in local minima.', 'Gradient descent, Newton\'s method'],
            ['Enumerative', 'Systematically examine every possibility.', 'Guaranteed but hopeless for big search spaces (week 1).', 'Brute force, dynamic programming'],
            [<b>Guided random</b>, 'Use randomness, but steer it with what has been learned so far.', 'No guarantee of the perfect answer.', <span><b>Evolutionary algorithms</b> (GA, evolution strategies, DE), <b>swarm intelligence</b> (PSO, SDS, DFO, ACO), simulated annealing</span>],
          ]}
        />
        <p>
          Everything in this module is in the third row. "Guided random" is a precise description: not blind guessing, and not a fixed recipe, but
          randomness with a memory.
        </p>
      </Section>

      <Section n="2" title="The vocabulary, translated">
        <p>GAs come with biology words. Each one maps onto something you already know from DFO.</p>
        <Table
          head={['GA term', 'Plain meaning', 'Equivalent in DFO']}
          rows={[
            [<b>Gene</b>, 'One number (or symbol) in a solution.', 'One coordinate, x_id'],
            [<span><b>Chromosome</b> (also "individual", "state")</span>, 'One complete candidate solution: a list of genes.', 'One fly'],
            [<b>Population</b>, 'All the chromosomes that currently exist.', 'The swarm'],
            [<b>Generation</b>, 'One round of creating a new population.', 'One iteration'],
            [<b>Parents / children</b>, 'Existing solutions chosen to produce new ones / the new ones.', 'Flies before / after the update'],
            [<b>Fitness</b>, 'How good a chromosome is.', 'Same'],
            [<b>Encoding</b>, 'The rule for writing a solution as a chromosome.', 'How a fly\'s numbers are interpreted'],
          ]}
        />
        <h3>Encoding: what a chromosome is made of</h3>
        <p>The slide "Population or chromosomes" lists the options. The right one depends on what your solutions are:</p>
        <Table
          head={['Encoding', 'Looks like', 'Used when a solution is…']}
          rows={[
            ['Bit string', '(0, 1, 0, 1, 1, 1, 0, 0)', 'a set of yes/no choices, e.g. which items to pack in a knapsack'],
            ['Real numbers', '(43.2, −33.1, 0.0, 89.2)', 'a set of measurements, e.g. angles, weights, dimensions'],
            ['Permutation', '(E11, E3, E7, E1, E15)', 'an ordering, e.g. the order to visit cities'],
            ['List of rules', '(R1, R2, R3, …)', 'a strategy or a controller'],
            ['Program tree', 'a small program', 'a formula or program itself (this is "genetic programming")'],
          ]}
        />
        <Callout type="key" title="Encoding decides which operators are legal">
          <p>
            Flipping a 0 to a 1 makes sense in a bit string. It makes no sense in a permutation, where changing one city to another creates a
            duplicate. You will see this problem, and its solution, in section 6. Choosing the encoding is the first real design decision in any GA
            project.
          </p>
        </Callout>
      </Section>

      <Section n="3" title="The GA cycle">
        <p>The lecture's cycle diagram, as steps. One trip round the loop is one generation.</p>
        <Steps
          items={[
            ['Initialise', 'Create N random chromosomes. This is the first population.'],
            ['Evaluate', 'Run every chromosome through the fitness function. Each gets one number.'],
            ['Select parents', 'Choose chromosomes to reproduce, favouring fitter ones.'],
            ['Reproduce: crossover', 'Combine pairs of parents to make children that mix their genes.'],
            ['Modify: mutation', 'Make small random changes to the children.'],
            ['Evaluate the children', 'Score the new chromosomes.'],
            ['Replace (delete)', 'Decide who survives into the next generation. Discarded members go in the "bin" on the lecture diagram.'],
            ['Repeat', 'Go back to step 3 until the budget runs out or the solution is good enough.'],
          ]}
        />
        <Sim title="Watch evolution spell a sentence" caption="Each chromosome is a string of letters. Fitness = how many letters match the target. Green letters are correct." wide>
          <EvolveString />
        </Sim>
        <Callout type="try" title="Find out what each operator is for">
          <ol>
            <li>
              Press <b>Evolve</b> with everything on. It finds a 23-letter sentence after testing a few thousand strings, out of about 10³³
              possibilities. That is the power of cumulative selection.
            </li>
            <li>
              Reset, turn <b>Selection off</b>, and evolve. Nothing improves. Without selection the population has no direction: it is a random
              walk. <b>Selection is the only operator that knows about fitness.</b>
            </li>
            <li>
              Turn selection back on and set <b>Mutation to 0%</b>. Progress stalls short of the target. If the correct letter for some position
              does not exist anywhere in the population, crossover cannot create it. <b>Mutation is the only source of new genes.</b>
            </li>
            <li>
              Set mutation to <b>20%</b> or more. Progress collapses: good strings are scrambled faster than selection can preserve them.
            </li>
            <li>
              Turn <b>Elitism off</b> with moderate mutation and watch the gold "best" line: it now goes down as well as up.
            </li>
          </ol>
        </Callout>
        <Callout type="warn" title="The famous caveat about this demo">
          <p>
            This demo (a version of Richard Dawkins' "weasel program") cheats in one respect: it knows the target in advance. Real problems do
            not. The fitness function there measures <i>quality</i> (tour length, energy, error), not similarity to a known answer. The demo
            illustrates how the operators interact, not how to write a real fitness function.
          </p>
        </Callout>
      </Section>

      <Section n="4" title="Selection: who gets to reproduce">
        <p>
          The lecture asks, "If you were in charge, how would you select?" The obvious answer, "only the very best", is a trap. Breed only from the
          champion and within a few generations everyone is a near-copy of it. Variety is gone, and with it any chance of finding something
          different and better. Selection needs to <b>favour</b> the fit without <b>excluding</b> the rest.
        </p>
        <h3>Roulette wheel (fitness-proportionate) selection</h3>
        <Formula
          title="Probability that a chromosome is selected"
          legend={[
            { k: 'p', sym: 'p(xᵢ)', name: 'Chance that chromosome i is picked', desc: 'A number between 0 and 1. All the chances in the population add up to 1.' },
            { k: 'fi', sym: 'f(xᵢ)', name: 'Fitness of chromosome i', desc: 'Here bigger means better (a maximisation problem). This goes on top of the fraction.' },
            { k: 'sum', sym: 'Σ f(xₙ)', name: 'Total fitness of the whole population', desc: 'Add up the fitness of every chromosome, from the 1st to the N-th. n is just a counter.' },
            { k: 'N', sym: 'N', name: 'Population size', desc: 'How many chromosomes there are.' },
          ]}
          plain="Your chance of being chosen is your share of the population's total fitness. Imagine a roulette wheel where each chromosome owns a slice, and the slice width is proportional to its fitness."
          example={<>Fitness values 10, 20, 5, 40, 25 add up to 100. The fourth chromosome is picked with probability 40 ÷ 100 = <b>40%</b>; the third with 5 ÷ 100 = <b>5%</b>. Unlikely, but not impossible.</>}
        >
          <P k="p"><V>p</V>(<V sub="i">x</V>)</P>
          <span className="op">=</span>
          <Frac n={<P k="fi"><V>f</V>(<V sub="i">x</V>)</P>} d={<P k="sum"><Sum from="n = 1" to={<P k="N">N</P>} /><V>f</V>(<V sub="n">x</V>)</P>} />
        </Formula>
        <Sim title="Roulette wheel selection" caption="Spin 1,000 times and compare the 'times picked' percentages with the calculated probabilities.">
          <Roulette />
        </Sim>
        <Callout type="deep" title="Roulette's weaknesses, and the alternative the footnote mentions">
          <ul>
            <li>
              <b>It assumes bigger is better and fitness is never negative.</b> For a minimisation problem (tour length, energy) you must convert
              first, e.g. use 1 ÷ length.
            </li>
            <li>
              <b>A super-fit individual takes over.</b> One chromosome with fitness 1000 among others at 1 owns the whole wheel: premature
              convergence.
            </li>
            <li>
              <b>Late on, it stops discriminating.</b> When everyone has fitness between 990 and 1000, all slices are nearly equal and selection
              pressure vanishes.
            </li>
            <li>
              The slide says roulette "guarantees that the fittest member goes through". Strictly, it only makes that <i>likely</i>. A true
              guarantee needs <b>elitism</b>: copying the best chromosome into the next generation unchanged.
            </li>
          </ul>
          <p>
            <b>Tournament selection</b> avoids all of this: pick k chromosomes at random (often k = 2 or 3) and the best of those becomes a parent.
            It only uses comparisons, so it works for minimisation, with negative fitness, and is unaffected by the scale of the numbers. The
            sentence simulator above uses a tournament of 3. A larger k means stronger selection pressure.
          </p>
        </Callout>
        <h3>The numbers game: parents and children</h3>
        <p>From "Selection I":</p>
        <ul>
          <li><b>Too many parents</b>: you are bound to be breeding from some poor ones, so progress is slow.</li>
          <li><b>Too few parents</b>: a "stagnant gene pool". Everyone becomes related and variety disappears.</li>
          <li><b>More children</b> means more candidates tested per generation, so evolution is faster per generation, at the cost of more fitness evaluations.</li>
        </ul>
        <p>And from "Deletion or discarding", two replacement schemes:</p>
        <Table
          head={['Scheme', 'How it works', 'Character']}
          rows={[
            ['Generational GA', 'The whole population is replaced by children every generation.', 'Explores widely, but can lose good solutions unless elitism is added.'],
            ['Steady-state GA', 'Only a few members are replaced at a time (usually the worst).', 'Keeps good solutions, smoother progress, but less variety and a risk of converging early.'],
          ]}
        />
        <p>
          The lecture's own discussion gives the trade-off for keeping some parents: the <b>advantage</b> is a smoother fitness curve (the best
          never gets worse); the <b>disadvantage</b> is less variation and so fewer chances of a leap forward. This is exploration against
          exploitation again.
        </p>
      </Section>

      <Section n="5" title="Crossover and mutation">
        <div className="grid2">
          <div className="card">
            <h4>Crossover (recombination)</h4>
            <p>
              Takes <b>two</b> parents and mixes them. The hope: one parent is good for one reason and the other for a different reason, and a
              child might inherit both. It is how good partial solutions ("building blocks") found separately get combined. It is{' '}
              <b>population-based</b>: it needs someone else.
            </p>
          </div>
          <div className="card">
            <h4>Mutation</h4>
            <p>
              Takes <b>one</b> chromosome and changes it slightly at random. It is the safety net that restores lost variety and makes every point
              in the search space reachable. It is <b>individual</b>: it needs no partner.
            </p>
          </div>
        </div>
        <p>The slide lists several kinds of crossover. They differ only in how the child's genes are divided between the parents:</p>
        <Table
          head={['Type', 'How the child is built']}
          rows={[
            ['Single-point', 'Choose one cut. Take everything before it from parent A and everything after from parent B.'],
            ['Two-point', 'Choose two cuts. The middle section comes from one parent, the two ends from the other.'],
            ['Multi-point', 'Several cuts, alternating between parents.'],
            ['Uniform', 'For each gene, toss a coin to decide which parent it comes from.'],
            ['Arithmetic', 'For real numbers: the child gene is a blend, e.g. the average of the two parents\' genes.'],
          ]}
        />
        <Sim title="Crossover and mutation lab" caption="Start with the first tab, then use the other two when you reach section 6.">
          <CrossoverLab />
        </Sim>
        <Callout type="key" title="How much mutation?">
          <p>
            The lecture asks "to what extent should mutation alter the solution?" A common rule of thumb for a chromosome of length L is a
            per-gene rate of about 1 ÷ L, so that on average one gene changes per child. Much less and lost genes are never recovered; much more
            and children stop resembling their parents, which destroys the inheritance that makes evolution work. The lecture's line about
            parameter settings needing "practice & art & years of pain" is honest: there is no formula, only experiment.
          </p>
        </Callout>
      </Section>

      <Section n="6" title="The Travelling Salesman Problem with a GA">
        <p>
          The lecture applies the checklist to touring eight UK cities. This example matters because it shows what to do when the standard
          operators <b>break</b>.
        </p>
        <Table
          head={['Checklist item', 'TSP answer']}
          rows={[
            ['Problem', 'Visit every city exactly once and return to the start, with the smallest total distance.'],
            ['Encoding', 'A permutation of the city numbers 1–8. [3, 7, 6, 1, 4, 5, 2, 8] means Cambridge → Manchester → London → Brighton → Glasgow → Liverpool → Bristol → Oxford → back to Cambridge. This is an "order-based GA".'],
            ['Fitness', 'Total length of the tour. Minimise. The slide gives c0 = 2,215 km and c1 = 1,627 km.'],
            ['Search space', '8! = 40,320 orderings. Many are the same loop started at a different city or travelled backwards, so there are (8 − 1)! ÷ 2 = 2,520 genuinely different tours.'],
            ['Constraint', 'Every city appears exactly once. A chromosome that breaks this is "inadmissible".'],
          ]}
        />
        <Callout type="warn" title="Why ordinary operators fail here">
          <p>
            <b>Mutation</b>: change one city to another, say the 6 to a 2, and city 2 now appears twice while city 6 is never visited.{' '}
            <b>Crossover</b>: glue the front of one tour to the back of another and you get repeated cities and missing cities. Open the second tab
            of the lab above to see the lecture's exact example produce duplicates.
          </p>
        </Callout>
        <h3>Fix 1: mutation that only rearranges</h3>
        <p>The slide shows two repaired mutations of c0 = [3, 7, 6, 1, 4, 5, 2, 8]. Both only move cities around, so nothing is duplicated or lost:</p>
        <ul>
          <li><b>Insert (shift)</b>: lift one city out and put it somewhere else. Moving the 5 forward gives [3, 7, 6, <b>5</b>, 1, 4, 2, 8].</li>
          <li><b>Swap</b>: two cities trade places. Swapping the 6 and the 5 gives [3, 7, <b>5</b>, 1, 4, <b>6</b>, 2, 8].</li>
        </ul>
        <h3>Fix 2: order-1 crossover</h3>
        <Steps
          items={[
            ['Choose a random segment', 'Say positions 2 to 4 (counting from 0). In c0 that segment is 6, 1, 4.'],
            ['Copy it into the child at the same positions', 'child0 = [–, –, 6, 1, 4, –, –, –]'],
            ['Fill the gaps from the other parent, in the order they appear there', 'Read c1 starting just after the segment and wrapping round: 3, 7, 1, 2, 4, 8, 5, 6. Skip any city already in the child (1, 4, 6). That leaves 3, 7, 2, 8, 5. Write those into the empty slots, also starting just after the segment and wrapping round.'],
            ['Result', 'child0 = [8, 5, 6, 1, 4, 3, 7, 2]. Swap the parents\' roles to get child1 = [1, 4, 8, 5, 6, 2, 3, 7]. Both match the slide.'],
          ]}
        />
        <p>
          The child keeps a whole stretch of road from one parent and the <b>relative order</b> of the remaining cities from the other. That is
          what the slide's note "preserve relative order" means. Use the third tab of the lab to try other segments.
        </p>
        <Sim title="A genetic algorithm solving the TSP" caption="Distances are straight lines between cities, so the kilometres differ from the lecture's road distances. The method is identical." wide>
          <TspGA />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Run it on the 8 UK cities. With only 2,520 different tours, the dashed true optimum can be computed by brute force, and the GA normally matches it within a few generations.</li>
            <li>Switch to 30 random cities. There are now about 4 × 10³⁰ tours. Brute force is impossible; the GA still produces a sensible-looking route. Note it gives no proof that the route is optimal.</li>
            <li>Turn crossover off. The GA still improves (selection plus mutation is enough to climb) but more slowly. Then set mutation to 0% with crossover on: it stalls once the population has lost its variety.</li>
            <li>Look for crossing lines in the best tour. A tour that crosses itself can always be shortened by uncrossing. A GA does not know this, which is why real TSP solvers add a local-search step.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="7" title="Going deeper: why GAs work, and when they do not">
        <Callout type="deep" title="The building-block idea">
          <p>
            Holland's explanation is the <b>schema theorem</b>. In plain words: short patterns of genes that tend to appear in above-average
            chromosomes get copied into more and more of the population, generation after generation, and crossover assembles these good fragments
            ("building blocks") into complete good solutions. This only works if good solutions really are made of good fragments. For TSP they
            are (a good tour contains good stretches of road), which is why order-1 crossover carefully preserves stretches. If your encoding
            scatters related genes far apart, crossover just scrambles things, and you would do better with mutation alone.
          </p>
        </Callout>
        <Table
          head={['', 'Genetic algorithm', 'DFO / swarm methods']}
          rows={[
            ['How new candidates arise', 'Children are built from parents; old individuals are replaced.', 'Individuals persist and move.'],
            ['Information sharing', 'Through crossover between selected parents.', 'Through looking at neighbours and the best.'],
            ['Natural fit', 'Discrete problems: bit strings, orderings, structures.', 'Continuous problems: lists of real numbers.'],
            ['Parameters', 'Population size, selection method, crossover type and rate, mutation type and rate, replacement scheme.', 'DFO: just N and Δ.'],
          ]}
        />
        <Callout type="cw" title="If you use a GA in your project">
          <p>
            Be ready to justify four choices: the <b>encoding</b> (and why it suits the problem), the <b>selection</b> method, the{' '}
            <b>crossover and mutation operators</b> (and how they keep solutions valid), and the <b>replacement scheme</b>. Then tune the mutation
            rate and population size with the methodology from week 4. The lecture's applications slide (genetic walkers and cars) shows how
            visual GA results can be, which helps with the "visualisation" marks and the video.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'A population has fitness values 2, 3 and 5 (maximisation). Under roulette wheel selection, what is the chance the third is chosen?',
            options: ['33%', '50%', '5%', '100%'],
            answer: 1,
            why: '5 ÷ (2 + 3 + 5) = 5 ÷ 10 = 0.5.',
          },
          {
            q: 'Every chromosome in a bit-string population has a 0 in position 4, but the best solution needs a 1 there. Which operator can fix this?',
            options: ['Selection', 'Single-point crossover', 'Mutation', 'Elitism'],
            answer: 2,
            why: 'Crossover only shuffles genes that already exist. If no parent has a 1 in that position, no child can inherit one. Only mutation creates it.',
          },
          {
            q: 'Why can you not use single-point crossover directly on TSP tours?',
            options: ['Tours are too long', 'The child may contain some cities twice and others not at all', 'Tours have no fitness', 'It is too slow'],
            answer: 1,
            why: 'A tour must be a permutation. Naive crossover breaks that constraint and produces inadmissible solutions.',
          },
          {
            q: 'Parents p1 = [1, 2, 3, 4, 5] and p2 = [5, 4, 3, 2, 1]. Order-1 crossover copies positions 1–2 from p1 (the cities 2, 3). What is the child?',
            options: ['[5, 2, 3, 4, 1]', '[4, 2, 3, 1, 5]', '[5, 2, 3, 1, 4]', '[1, 2, 3, 4, 5]'],
            answer: 1,
            why: 'Child = [–, 2, 3, –, –]. Read p2 from just after the segment (position 3), wrapping: 2, 1, 5, 4, 3. Skip 2 and 3 → 1, 5, 4. Fill positions 3, 4, 0 → [4, 2, 3, 1, 5].',
          },
          {
            q: 'What is the difference between a generational and a steady-state GA?',
            options: ['Generational uses mutation, steady-state does not', 'Generational replaces the whole population each iteration; steady-state replaces only a few members', 'Steady-state has no fitness function', 'There is no difference'],
            answer: 1,
            why: 'It is about how many individuals are discarded and replaced per iteration.',
          },
        ]}
      />
    </Lesson>
  )
}
