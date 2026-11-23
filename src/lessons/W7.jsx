import { Lesson, Section, Callout, Sim, Quiz, Table, Steps, Code } from '../components/ui'
import { Formula, P, V, Frac, Sum } from '../components/Formula'
import { GossCalc, DoubleBridge, TransitionCalc, AcoTsp } from '../sims/AcoSims'

export default function W7({ onDone }) {
  return (
    <Lesson
      week="Week 7"
      title="Ant Colony Optimisation (ACO)"
      subtitle="An ant is nearly blind and has a brain smaller than a pinhead, yet a colony reliably finds the shortest route between nest and food. The trick is that ants do not talk to each other. They write on the ground."
      time="45 minutes"
    >
      <Section n="1" title="The experiments with real ants">
        <Callout type="history">
          <p>
            In the late 1980s, <b>Jean-Louis Deneubourg</b> and colleagues in Brussels ran a now-famous experiment with Argentine ants. They
            connected the nest to a food source with a bridge that split into two branches and counted how many ants used each. In 1989 Goss,
            Aron, Deneubourg and Pasteels published a simple mathematical model of the result. A young Italian researcher, <b>Marco Dorigo</b>,
            read this work and in his 1991–92 PhD thesis turned it into an optimisation algorithm, "Ant System", first tested on the Travelling
            Salesman Problem. ACO now has its own conference series (ANTS) and is used in vehicle routing, scheduling and network routing.
          </p>
        </Callout>
        <p>
          The key fact about these ants: as they walk, they lay a chemical called <b>pheromone</b>, and when they reach a fork they tend to follow
          whichever branch smells more strongly of it.
        </p>
        <div className="grid2">
          <div className="card">
            <h4>Experiment I: two branches of equal length</h4>
            <p>
              At first ants choose at random, about 50/50. But randomness is never perfectly even. As soon as a few more ants happen to have taken
              one branch, it has slightly more pheromone, so it attracts slightly more ants, who add more pheromone. Within minutes almost the
              whole colony is using one branch. Which one? It differs from run to run. <b>Pure positive feedback amplifying a random
              fluctuation.</b>
            </p>
          </div>
          <div className="card">
            <h4>Experiment II: one branch twice as long</h4>
            <p>
              Now the colony almost always ends up on the <b>short</b> branch. Why? Ants taking the short branch reach the food and get back
              sooner, so the short branch receives pheromone at a faster rate. That small head start is amplified exactly as before. No ant ever
              measured or compared the two branches.
            </p>
          </div>
        </div>
        <Formula
          title="The Goss model: probability that an ant chooses bridge 1"
          legend={[
            { k: 'p', sym: 'p₁', name: 'Probability of choosing bridge 1', desc: 'A number between 0 and 1. The probability of bridge 2 is simply 1 − p₁.' },
            { k: 'm1', sym: 'm₁', name: 'Ants that have already used bridge 1', desc: 'A stand-in for how much pheromone is on bridge 1, since each passing ant lays some.' },
            { k: 'm2', sym: 'm₂', name: 'Ants that have already used bridge 2', desc: 'Same for the other bridge.' },
            { k: 'k', sym: 'k', name: 'Attractiveness of an unmarked branch', desc: 'A constant added to both counts. When few ants have passed, k dominates and the choice is nearly 50/50. So a large k means "ants ignore pheromone until there is plenty of it". Experiments suggest k ≈ 20.' },
            { k: 'h', sym: 'h', name: 'How sharply ants respond', desc: 'An exponent (a power). h = 1 would make the choice simply proportional. h = 2 squares both sides, which exaggerates any difference: the leading branch gets more than its fair share. Experiments suggest h ≈ 2. This non-linearity is what makes the colony commit.' },
          ]}
          plain="Take the number of ants that used each bridge, add a constant k to each, raise both to the power h, and bridge 1's chance is its share of the total."
          example={
            <>
              m₁ = 30, m₂ = 10, k = 20, h = 2: (30 + 20)² = 2500 and (10 + 20)² = 900, so p₁ = 2500 ÷ (2500 + 900) = <b>0.735</b>. Bridge 1 had 75%
              of the traffic and now gets about 74% of new ants. With both at 0, p₁ = 400 ÷ 800 = 0.5: a coin toss.
            </>
          }
        >
          <P k="p"><V sub="1">p</V></P>
          <span className="op">=</span>
          <Frac
            n={<>(<P k="m1"><V sub="1">m</V></P> + <P k="k"><V>k</V></P>)<sup><P k="h"><V>h</V></P></sup></>}
            d={<>(<P k="m1"><V sub="1">m</V></P> + <P k="k"><V>k</V></P>)<sup><P k="h"><V>h</V></P></sup> + (<P k="m2"><V sub="2">m</V></P> + <P k="k"><V>k</V></P>)<sup><P k="h"><V>h</V></P></sup></>}
          />
        </Formula>
        <p>
          The footnote on the slide says "This equation inspired ACO!" and you will see why: the ACO transition rule in section 4 has exactly the
          same shape, "my score divided by the sum of everyone's scores".
        </p>
        <Sim title="Play with the Goss formula">
          <GossCalc />
        </Sim>
        <Sim title="The double-bridge experiment" caption="White ants are heading to the food, gold ants are carrying it home. The purple glow is pheromone." wide>
          <DoubleBridge />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Run <b>Experiment II</b>. Early on the split is roughly even, then the short branch takes over.</li>
            <li>Run <b>Experiment I</b> and restart it several times. The colony still commits to one branch, but which one is a matter of chance. This is called <b>symmetry breaking</b>.</li>
            <li>Set h = 1. The colony is much less decisive. Set h = 0: pheromone is ignored and the split stays at 50/50. The non-linearity (h &gt; 1) is essential.</li>
            <li>Set evaporation to 0, let the colony commit to the short branch, then drag the length ratio down to 1 and back. With no evaporation the old trail is permanent. Add some evaporation and restart: the colony stays more flexible.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="2" title="Stigmergy: communicating through the environment">
        <p>
          The ants never signal to each other directly. One ant changes the environment (lays pheromone) and another ant later responds to that
          change. This is called <b>stigmergy</b>, a term coined by the French biologist Pierre-Paul Grassé in 1959 while studying how termites
          build nests. It comes from Greek words meaning "mark" and "work": work that is guided by marks left by earlier work.
        </p>
        <Callout type="analogy" title="Desire paths">
          <p>
            Look at any park. Besides the paved paths there are worn tracks across the grass where people take shortcuts. Nobody planned them.
            One person cuts the corner and flattens the grass slightly. The next person sees a faint track and follows it, flattening it more.
            Soon there is a clear path, and it is usually the most efficient route. If people stop using it, the grass grows back (evaporation).
            That is stigmergy: the path is a shared memory written into the environment.
          </p>
        </Callout>
        <p>Pheromone trails have two opposing processes, and you need both:</p>
        <Table
          head={['Process', 'Self-organisation ingredient', 'Effect', 'Without it']}
          rows={[
            ['Deposit: ants add pheromone to paths they use', 'Positive feedback', 'Good paths become more attractive.', 'No learning. Every ant searches from scratch.'],
            ['Evaporation: pheromone fades over time', 'Negative feedback', 'Old or poor paths are gradually forgotten.', 'The first path found is reinforced forever, even if it is bad.'],
          ]}
        />
        <p>
          This is the direct opposite of SDS's communication style. SDS: one-to-one, direct, instant. ACO: indirect, through a shared map that
          everyone reads and writes, with a built-in time delay.
        </p>
      </Section>

      <Section n="3" title="From ants to an algorithm">
        <p>ACO applies to any problem where a solution can be built step by step as a <b>path through a network</b>. The translation:</p>
        <Table
          head={['Real ants', 'ACO']}
          rows={[
            ['An ant', 'An agent that builds one complete candidate solution.'],
            ['Junctions and trails', 'Nodes and edges of a graph (for TSP: cities and the roads between them).'],
            ['An ant\'s trip', 'One candidate solution (one tour).'],
            ['Pheromone on a trail', 'A number stored on each edge. All ants can read it.'],
            ['Shorter trips get reinforced faster', 'Better solutions deposit more pheromone.'],
            ['Evaporation', 'Every pheromone number is multiplied by a factor below 1 each iteration.'],
          ]}
        />
        <Callout type="key" title="A different way of making solutions">
          <p>
            DFO and GAs take <b>complete</b> solutions and modify them. ACO <b>constructs</b> each solution from nothing, one decision at a time,
            every iteration. What carries over between iterations is not the solutions. It is the pheromone map. The pheromone map is the swarm's
            memory, and it lives in the environment, not in any ant.
          </p>
        </Callout>
        <Code title="ACO pseudo-code (lecture version, annotated)">{`While (still hope!)                  # i.e. until a stopping condition
    constructAntSolutions()          # every ant builds a full tour using the transition rule,
                                     #   then the tour is scored by the fitness function
    updatePheromone()                # evaporate everywhere, then deposit on the tours used
    DaemonActions()                  # optional "god-like" extras no single ant could do:
                                     #   e.g. polish tours with local search, or give the
                                     #   best ant a bonus deposit (elitism)`}</Code>
        <p>The TSP walk-through on the slides, as a sequence:</p>
        <Steps
          items={[
            ['Set up', 'Put a small amount of pheromone on every edge. With five cities A–E, that is ten edges.'],
            ['Place an ant', 'Drop it on a random city, say A. Its "tour memory" is {A}.'],
            ['Choose the next city', 'The ant looks at every city it has not visited and picks one at random, but with better odds for edges that have more pheromone and are shorter. Say it picks C. Tour memory = {A, C}.'],
            ['Keep going', 'From C it cannot return to A, because A is in its memory. The memory enforces the "visit each city once" constraint. It continues until every city is visited, then returns to the start: {A, C, D, B, E, A}.'],
            ['Score it', 'Add up the distances. That is the fitness of this tour.'],
            ['Update pheromone', 'Reduce pheromone on every edge (evaporation). Then add pheromone to the edges of this tour, more if the tour was short.'],
            ['Next ant', 'Start another ant at a different city and repeat.'],
          ]}
        />
      </Section>

      <Section n="4" title="Formula 1: the transition rule">
        <p>This is how an ant standing at city r decides which city s to visit next.</p>
        <Formula
          title="Transition rule: probability that ant k goes from city r to city s"
          legend={[
            { k: 'p', sym: 'pₖ(r, s)', name: 'Probability of the move r → s', desc: 'For ant number k, currently at city r, the chance that it chooses city s next. The probabilities over all allowed next cities add up to 1.' },
            { k: 'T', sym: 'T(r, s)', name: 'Pheromone on the edge r–s', desc: 'A number stored on that road. High means many good tours have used it. This is what the colony has learned. (Many papers write it as τ, the Greek letter tau.)' },
            { k: 'a', sym: 'α', name: 'Pheromone influence', desc: 'A power applied to the pheromone. α = 0: pheromone is ignored. Larger α: ants follow the crowd more strongly.' },
            { k: 'H', sym: 'H(r, s)', name: 'Heuristic value of the edge', desc: 'A common-sense guess at how good this road is, known before any searching. For TSP, H = 1 ÷ distance, so near cities score high. (Many papers write it as η, eta.)' },
            { k: 'b', sym: 'β', name: 'Heuristic influence', desc: 'A power applied to the heuristic. β = 0: distance is ignored. Larger β: ants act more greedily, nearly always going to the nearest city.' },
            { k: 'sum', sym: 'Σ over unvisited c', name: 'Total score of all allowed options', desc: 'Compute the same "pheromone × heuristic" score for every city c that this ant has not yet visited, and add them up. Dividing by this total turns scores into probabilities.' },
          ]}
          plain="Give each unvisited city a score: (pheromone on the road to it) × (how close it is), each raised to a power that sets its importance. The chance of picking a city is its score divided by the total of all the scores."
          example={
            <>
              Ant at A. To B: T = 1, distance 2. To C: T = 4, distance 5. α = 1, β = 2. Score B = 1 × (1/2)² = 0.25. Score C = 4 × (1/5)² = 0.16.
              Total 0.41. So p(A→B) = 0.25 ÷ 0.41 = <b>61%</b> and p(A→C) = <b>39%</b>. The closer city is favoured, but C's strong pheromone keeps
              it well in the running.
            </>
          }
        >
          <P k="p"><V sub="k">p</V>(<V>r</V>, <V>s</V>)</P>
          <span className="op">=</span>
          <Frac
            n={<><P k="T"><V>T</V>(<V>r</V>, <V>s</V>)</P><sup><P k="a">α</P></sup> × <P k="H"><V>H</V>(<V>r</V>, <V>s</V>)</P><sup><P k="b">β</P></sup></>}
            d={<><P k="sum"><Sum from="unvisited c" /></P> <P k="T"><V>T</V>(<V>r</V>, <V>c</V>)</P><sup><P k="a">α</P></sup> × <P k="H"><V>H</V>(<V>r</V>, <V>c</V>)</P><sup><P k="b">β</P></sup></>}
          />
        </Formula>
        <Callout type="warn" title="Which Greek letter is which?">
          <p>
            The slide labels the two exponents "heuristic strength" and "greediness". In Dorigo's standard notation, which is what you will find
            in almost every paper and what this course uses, <b>α goes with pheromone</b> and <b>β goes with the heuristic</b>. Some texts swap
            them. In a report, define your symbols explicitly ("α controls the influence of pheromone…") so nobody has to guess.
          </p>
        </Callout>
        <Sim title="Transition rule calculator" caption="Three candidate roads from city A. The bar at the bottom is the roulette wheel the ant effectively spins.">
          <TransitionCalc />
        </Sim>
        <p>The slide asks: <b>what happens when α is too high? What about β?</b></p>
        <Table
          head={['Setting', 'Ant behaviour', 'Result']}
          rows={[
            ['α too high', 'Slavishly follows the strongest trail.', 'Stagnation: after a few iterations every ant walks the same tour, and it is usually not the best. Too much exploitation.'],
            ['α = 0', 'Ignores pheromone entirely.', 'No learning. Each ant does a randomised greedy tour, independent of all the others.'],
            ['β too high', 'Always goes to the nearest unvisited city.', 'The "nearest neighbour" heuristic. Quick and decent, but greedy choices early force long jumps later, and pheromone cannot correct it.'],
            ['β = 0', 'Ignores distance entirely.', 'Early tours are essentially random, so learning is very slow, though it can still work on small problems.'],
          ]}
        />
        <p>Typical starting values from the literature are α = 1 and β between 2 and 5.</p>
      </Section>

      <Section n="5" title="Formula 2: the global pheromone update">
        <p>Once all the ants have finished their tours, the map is updated.</p>
        <Formula
          title="Global pheromone update for one edge"
          legend={[
            { k: 'Tn', sym: 'T(r, s) ←', name: 'New pheromone on edge r–s', desc: 'The arrow means "becomes". The value on the left is overwritten by the result on the right.' },
            { k: 'rho', sym: 'ρ', name: 'Pheromone decay rate', desc: 'The Greek letter rho. In the lecture\'s formula it multiplies the old pheromone, so it is the fraction that SURVIVES: ρ = 0.9 keeps 90% and evaporates 10%. A number between 0 and 1.' },
            { k: 'To', sym: 'T(r, s)', name: 'Old pheromone on that edge', desc: 'What was there before this update.' },
            { k: 'sum', sym: 'Σ k = 1…m', name: 'Add up the contributions of all ants', desc: 'Go through ant 1, ant 2, … up to ant m and total what each deposits on this edge.' },
            { k: 'm', sym: 'm', name: 'Number of ants', desc: 'The population size.' },
            { k: 'A', sym: 'Aₖ(r, s)', name: 'What ant k deposits on this edge', desc: 'Equal to 1 ÷ Lₖ if ant k\'s tour used the edge r–s, and 0 if it did not.' },
            { k: 'L', sym: 'Lₖ', name: 'Length of ant k\'s complete tour', desc: 'Its fitness. Because it is underneath the fraction, a shorter tour gives a larger deposit.' },
          ]}
          plain="First let some of the old pheromone evaporate. Then every ant whose tour used this edge adds an amount equal to one divided by its tour length, so short tours leave stronger marks."
          example={
            <>
              Edge A–C has T = 2.0 and ρ = 0.9. Two ants used it: one with a tour of length 10 (deposits 1/10 = 0.1) and one of length 20 (deposits
              1/20 = 0.05). New T = 0.9 × 2.0 + 0.1 + 0.05 = 1.8 + 0.15 = <b>1.95</b>. An edge nobody used just decays: 0.9 × 2.0 = 1.8.
            </>
          }
        >
          <P k="Tn"><V>T</V>(<V>r</V>, <V>s</V>) ←</P>
          <span className="gap" />
          <P k="rho">ρ</P> × <P k="To"><V>T</V>(<V>r</V>, <V>s</V>)</P>
          <span className="op">+</span>
          <P k="sum"><Sum from="k = 1" to={<P k="m"><V>m</V></P>} /></P>
          <P k="A"><V sub="k">A</V>(<V>r</V>, <V>s</V>)</P>
          <span className="gap" />
          where
          <span className="gap" />
          <P k="A"><V sub="k">A</V>(<V>r</V>, <V>s</V>)</P> = <Frac n="1" d={<P k="L"><V sub="k">L</V></P>} />
        </Formula>
        <Callout type="warn" title="A notation trap with ρ">
          <p>
            The lecture writes ρ × T, so <b>ρ is the fraction kept</b>. Dorigo's papers write (1 − ρ) × T, where <b>ρ is the fraction
            evaporated</b>. So "ρ = 0.1" means almost total evaporation in the lecture's convention and very gentle evaporation in Dorigo's. Always
            check which one a source uses, and state yours.
          </p>
        </Callout>
        <Table
          head={['Evaporation', 'Effect']}
          rows={[
            ['Very little (ρ close to 1 in the lecture\'s form)', 'Long memory. Early tours, which were nearly random, keep influencing the colony for a long time. Slow to improve, slow to adapt.'],
            ['A lot (ρ close to 0)', 'Short memory. Only the latest iteration matters. The colony jumps about and may forget good edges before they are reinforced.'],
            ['Moderate (about 0.5–0.9)', 'The usual compromise.'],
          ]}
        />
        <Sim title="Ant System on the Travelling Salesman Problem" caption="Teal lines are the pheromone map. Watch it start as a faint, even web and sharpen into a tour." wide>
          <AcoTsp />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Run with the defaults. The teal web thins out until it traces a route, and the gap between "average of this iteration" and "best so far" narrows: the colony is converging.</li>
            <li>Reset, set <b>α = 0</b>. The pheromone picture is irrelevant now. The average tour never improves, because nothing is learned between iterations.</li>
            <li>Reset, set <b>β = 0</b>, α = 1. Ants are blind to distance. Progress is painfully slow from a random start.</li>
            <li>Reset, set <b>α = 5</b>. Within a handful of iterations all the pheromone is on one tour and the average equals the best. That is <b>stagnation</b>, and the tour it froze on is usually poor.</li>
            <li>Compare ρ = 0.99 with ρ = 0.3 on 40 cities.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="6" title="Going deeper">
        <Callout type="deep" title="Why the lecture's version is called 'simplified', and what the improved versions add">
          <ul>
            <li><b>Elitist Ant System</b>: the best tour found so far gets an extra deposit every iteration. This is one of the "daemon actions".</li>
            <li><b>MAX–MIN Ant System</b>: only the best ant deposits, and pheromone is clamped between a minimum and a maximum so that no edge can ever become impossible or irresistible. This directly prevents the stagnation you saw with α = 5.</li>
            <li><b>Ant Colony System</b>: ants also evaporate pheromone locally as they walk, which pushes later ants in the same iteration to try different edges.</li>
            <li><b>Local search</b> (the footnote "good idea to apply local search at this stage"): after each ant finishes, tidy its tour with a simple improver such as 2-opt, which uncrosses crossing roads. ACO supplies good starting tours; local search polishes them. This combination is what makes ACO competitive in practice.</li>
          </ul>
        </Callout>
        <Callout type="deep" title="What 'daemon actions' really means">
          <p>
            Everything else in ACO is decentralised: each ant acts on local information only. A daemon action is a deliberately centralised step
            that looks at global information, such as "which ant had the best tour?". The lecture's summary slide puts it as "injecting central vs
            individual actions". It is a pragmatic compromise: pure self-organisation is elegant, but a small amount of central coordination often
            improves results a great deal.
          </p>
        </Callout>
        <Table
          head={['', 'ACO', 'GA on TSP', 'DFO']}
          rows={[
            ['How solutions are produced', 'Constructed from scratch each iteration', 'Recombined from parent tours', 'Positions moved'],
            ['Where knowledge is stored', 'In the pheromone map (the environment)', 'In the population of tours', 'In the positions of the flies'],
            ['Communication', 'Indirect (stigmergy)', 'Via crossover', 'Direct (neighbours, best)'],
            ['Uses problem knowledge?', 'Yes, built in through the heuristic H', 'Only if you design special operators', 'No'],
            ['Constraint handling', 'Built into construction (tour memory)', 'Needs special operators (order-1)', 'Bounds check'],
            ['Natural fit', 'Routing, sequencing, anything graph-shaped', 'Many discrete problems', 'Continuous problems'],
          ]}
        />
        <Callout type="cw" title="If you use ACO in your project">
          <p>
            The lecture lists vehicle routing, sequential ordering, timetabling, graph colouring, scheduling, knapsack, set covering and bin
            packing: "any problem whose solutions can be represented as paths in a network". The design questions you must answer are: what are
            the nodes and edges, what is the heuristic H, and how does the tour memory enforce your constraints? Then tune α, β, ρ and m, show a
            pheromone-map visualisation (it makes an excellent figure and video), and compare against a baseline such as nearest-neighbour or a
            GA.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'In the double-bridge experiment with a short and a long branch, why does the colony end up on the short one?',
            options: ['Ants measure both branches and compare', 'The queen instructs them', 'Ants on the short branch complete trips sooner, so it accumulates pheromone faster, and that lead is amplified', 'Pheromone only sticks to short branches'],
            answer: 2,
            why: 'No ant compares anything. A difference in the rate of reinforcement plus positive feedback does the work.',
          },
          {
            q: 'Using the Goss formula with m₁ = 0, m₂ = 0, k = 20, h = 2, what is p₁?',
            options: ['0', '0.5', '1', 'Undefined'],
            answer: 1,
            why: '(0+20)² ÷ [(0+20)² + (0+20)²] = 400 ÷ 800 = 0.5. With no pheromone the ant tosses a coin. Without k the formula would be 0 ÷ 0.',
          },
          {
            q: 'What is stigmergy?',
            options: ['Ants touching antennae to share information', 'Indirect communication by modifying the environment, which others later respond to', 'A type of crossover', 'Evaporation of pheromone'],
            answer: 1,
            why: 'The pheromone trail is a message left in the environment. Sender and receiver never need to meet.',
          },
          {
            q: 'All ants are following the same mediocre tour after ten iterations. Which change is most likely to help?',
            options: ['Increase α', 'Decrease α or increase evaporation', 'Set β to 0', 'Use fewer ants'],
            answer: 1,
            why: 'This is stagnation from too much exploitation. Trusting pheromone less (lower α) or forgetting faster restores exploration.',
          },
          {
            q: 'In the update T ← ρ × T + Σ Aₖ with Aₖ = 1/Lₖ, an ant completes a tour of length 50. How much does it deposit on each edge of its tour?',
            options: ['50', '0.5', '0.02', '1'],
            answer: 2,
            why: '1 ÷ 50 = 0.02. A tour of length 25 would deposit 0.04: twice as much for a tour half as long.',
          },
        ]}
      />
    </Lesson>
  )
}
