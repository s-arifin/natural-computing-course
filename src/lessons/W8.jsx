import { Lesson, Section, Callout, Sim, Quiz, Table, Steps, Code } from '../components/ui'
import { Formula, P, V } from '../components/Formula'
import SwarmSim from '../sims/SwarmSim'
import DeStep from '../sims/DeStep'

export default function W8({ onDone }) {
  return (
    <Lesson
      week="Week 8"
      title="Particle Swarm Optimisation and Differential Evolution"
      subtitle="The two most widely used optimisers for continuous problems. PSO is DFO's more complicated ancestor: particles with velocity and memory. DE is an evolutionary algorithm that builds its mutations out of the differences between population members."
      time="45 minutes"
    >
      <Section n="1" title="Particle Swarm Optimisation: the story">
        <Callout type="history">
          <p>
            In 1995 <b>James Kennedy</b>, a social psychologist, and <b>Russell Eberhart</b>, an electrical engineer, were trying to simulate on
            screen the graceful, unpredictable movement of a bird flock or fish school (building on Reynolds' 1987 "boids", the flocking rules you
            played with in week 1). They added a "roost" that the birds were attracted to, then realised that if the roost were replaced by "the
            best position anyone has found", the flock was performing optimisation. Kennedy's background shaped the interpretation: he saw it as a
            model of social learning, where individuals balance their own experience against what they see succeeding around them. The paper became
            one of the most cited in all of computing and made swarm intelligence a mainstream field.
          </p>
        </Callout>
        <p>A PSO swarm is made of <b>particles</b>. As in DFO, each particle is a candidate solution. Unlike a fly, each particle carries three things:</p>
        <Table
          head={['Vector', 'Symbol', 'What it is', 'In DFO?']}
          rows={[
            ['Position', 'x', 'The candidate solution it currently represents.', 'Yes'],
            ['Velocity', 'v', 'How far and in which direction it will move this step. One number per dimension.', 'No'],
            ['Personal best (memory)', 'p', 'The best position this particle has ever visited.', 'No'],
          ]}
        />
        <Callout type="analogy" title="Looking for the best fishing spot on a lake">
          <p>
            Each boat on a lake is drifting with some speed and direction (velocity). Each skipper remembers the best spot they personally have
            found (personal best) and can hear over the radio where the best catch among their friends was (neighbourhood best). Every few minutes
            each skipper adjusts course: keep some of the current heading, steer partly back towards their own best spot, and partly towards their
            friends' best spot. Boats overshoot, curve round and spiral in, sweeping the water in between as they go.
          </p>
        </Callout>
      </Section>

      <Section n="2" title="The PSO update equations">
        <Formula
          title="Velocity update (Clerc–Kennedy constriction PSO)"
          number="1"
          legend={[
            { k: 'vn', sym: 'vᵢd (t)', name: 'NEW velocity', desc: 'Particle i, dimension d, at time step t. This is what is being calculated. The t is a time label, not a power.' },
            { k: 'chi', sym: 'χ', name: 'Constriction factor', desc: 'The Greek letter chi. A number below 1 that shrinks the velocity each step so the swarm calms down instead of flying apart. Recommended value 0.72984.' },
            { k: 'vo', sym: 'vᵢd (t−1)', name: 'OLD velocity (momentum)', desc: 'The velocity the particle had on the previous step. Keeping part of it means the particle tends to carry on in the direction it was already going.' },
            { k: 'c1', sym: 'c₁', name: 'Cognitive learning factor', desc: 'How strongly the particle is pulled towards its own best memory. A constant. Suggested: χ × 4.1 ÷ 2 ≈ 1.496.' },
            { k: 'r1', sym: 'r₁', name: 'Random number between 0 and 1', desc: 'Drawn fresh each time from U(0, 1). Makes the size of the pull towards the personal best vary.' },
            { k: 'pb', sym: '(pᵢd − xᵢd)', name: 'Gap to the personal best', desc: 'pᵢd is the particle\'s best-ever position in dimension d; xᵢd is where it was at the previous step. The difference is the direction and distance "back to my best spot".' },
            { k: 'c2', sym: 'c₂', name: 'Social learning factor', desc: 'How strongly the particle is pulled towards the best position known to its neighbours. Suggested: the same value as c₁.' },
            { k: 'r2', sym: 'r₂', name: 'Another random number between 0 and 1', desc: 'Independent of r₁. Makes the size of the social pull vary.' },
            { k: 'gb', sym: '(gᵢd − xᵢd)', name: 'Gap to the neighbourhood best', desc: 'gᵢd is the best position found by any particle in i\'s neighbourhood. The difference points "towards where my neighbours did best".' },
          ]}
          plain="New velocity = a damped copy of the old velocity + a random-strength pull back towards my own best spot + a random-strength pull towards my neighbours' best spot."
          example={
            <>
              One dimension: old velocity 2, position 5, personal best 3, neighbourhood best 1, r₁ = 0.5, r₂ = 0.5. New v = 0.730 × 2 + 1.496 × 0.5 ×
              (3 − 5) + 1.496 × 0.5 × (1 − 5) = 1.46 − 1.50 − 2.99 = <b>−3.03</b>. The particle was heading up at speed 2; it now heads down at
              speed 3.
            </>
          }
        >
          <P k="vn"><V sub="id" sup="t">v</V></P>
          <span className="op">=</span>
          <P k="chi">χ</P> <P k="vo"><V sub="id" sup="t−1">v</V></P>
          <span className="op">+</span>
          <P k="c1"><V sub="1">c</V></P><P k="r1"><V sub="1">r</V></P>
          <P k="pb">(<V sub="id">p</V> − <V sub="id" sup="t−1">x</V>)</P>
          <span className="op">+</span>
          <P k="c2"><V sub="2">c</V></P><P k="r2"><V sub="2">r</V></P>
          <P k="gb">(<V sub="id">g</V> − <V sub="id" sup="t−1">x</V>)</P>
        </Formula>
        <Formula
          title="Position update"
          number="2"
          legend={[
            { k: 'xn', sym: 'xᵢd (t)', name: 'NEW position', desc: 'Where the particle is after this step.' },
            { k: 'v', sym: 'vᵢd (t)', name: 'The velocity just calculated', desc: 'The step to take.' },
            { k: 'xo', sym: 'xᵢd (t−1)', name: 'OLD position', desc: 'Where the particle was.' },
          ]}
          plain="New position = old position + velocity. Take the step you just worked out."
          example={<>Continuing: new position = 5 + (−3.03) = <b>1.97</b>.</>}
        >
          <P k="xn"><V sub="id" sup="t">x</V></P>
          <span className="op">=</span>
          <P k="v"><V sub="id" sup="t">v</V></P>
          <span className="op">+</span>
          <P k="xo"><V sub="id" sup="t−1">x</V></P>
        </Formula>
        <p>After moving, each particle is evaluated. If its new position is better than its personal best, the personal best is overwritten.</p>
        <h3>The three terms, as three instincts</h3>
        <Table
          head={['Term', 'Nickname', 'Instinct', 'If it were the only term']}
          rows={[
            ['χ × old velocity', 'Inertia / momentum', '"Keep going the way I was going."', 'Particles fly in straight lines forever. No learning.'],
            ['c₁r₁(p − x)', 'Cognitive', '"Go back to the best place I have found myself."', 'Each particle searches alone around its own best. No cooperation.'],
            ['c₂r₂(g − x)', 'Social', '"Go where my neighbours did well."', 'Everyone rushes to one point. Fast, but premature convergence.'],
          ]}
        />
        <Callout type="deep" title="Where 0.72984 comes from">
          <p>
            Early PSO had a problem: velocities grew without limit and the swarm exploded. In 2002 Maurice Clerc and James Kennedy analysed the
            equations mathematically and derived a multiplier χ that guarantees the particles' oscillations die away. With the combined pull
            strength set to 4.1, their formula gives χ ≈ 0.72984, and c₁ = c₂ = χ × 2.05 ≈ 1.496. You may also meet the "inertia weight" version,
            v = w·v + c₁r₁(p − x) + c₂r₂(g − x), with w ≈ 0.729 and c ≈ 1.494. It is the same algorithm written differently. The lecture's version
            has χ already multiplied into c₁ and c₂.
          </p>
        </Callout>
        <Callout type="key" title="Neighbourhoods: who is 'g'?">
          <p>
            The lecture says g is the <b>neighbourhood</b> best. Which particles count as neighbours is a design choice called the{' '}
            <b>topology</b>:
          </p>
          <ul>
            <li><b>Global best (gbest)</b>: everyone is everyone's neighbour. Information spreads instantly. Fast convergence, higher risk of getting trapped.</li>
            <li><b>Local best (lbest), e.g. a ring</b>: each particle only hears from its two index neighbours, exactly like DFO's ring. Information spreads slowly, different parts of the swarm explore different regions, and it is more robust on multimodal problems.</li>
          </ul>
        </Callout>
        <Sim title="PSO on a 2-D landscape" caption="White dots are particles, lines are their velocities, hollow rings are personal bests, gold is the best position found." wide>
          <SwarmSim algo="pso" defaultFn="rastrigin" />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Run with defaults and watch the particles <b>overshoot and swing back</b>. That oscillation is momentum, and it is how PSO samples around good points. DFO has no equivalent.</li>
            <li>Set <b>χ above 1</b>. The velocity arrows grow each step and the swarm explodes to the walls. This is the instability Clerc and Kennedy fixed.</li>
            <li>Set <b>c₁ = 0</b> (no personal memory): the swarm collapses quickly onto one point. Set <b>c₂ = 0</b> instead (no social term): particles mill around their own bests and never cooperate.</li>
            <li>Switch the topology to <b>ring</b> on Rastrigin or Schwefel. Convergence is slower but the swarm is trapped less often. Reset several times with each topology and compare.</li>
          </ol>
        </Callout>
        <Table
          head={['', 'PSO', 'DFO']}
          rows={[
            ['State per agent', 'Position + velocity + personal best', 'Position'],
            ['Start of the move', 'From the particle\'s own position', 'From the best neighbour\'s position'],
            ['Memory', 'Yes (personal bests)', 'None, except not moving the best fly'],
            ['Escaping local minima', 'Momentum and slow information flow (ring)', 'Explicit random restarts (Δ)'],
            ['Parameters', 'χ, c₁, c₂, topology, N', 'Δ, N'],
            ['In a changing environment', 'Memories go stale and mislead', 'Naturally adaptive'],
          ]}
        />
      </Section>

      <Section n="3" title="Differential Evolution: the story">
        <Callout type="history">
          <p>
            In 1995 <b>Kenneth Price</b> was trying to solve a hard curve-fitting problem that <b>Rainer Storn</b> had posed (fitting Chebyshev
            polynomials for a filter design). Existing methods kept failing. Price's breakthrough was a new way to make mutations: instead of
            adding random noise of some hand-chosen size, <b>add the difference between two randomly chosen population members</b>. They published
            it as a technical report that year. At the first international optimisation contest in 1996, DE came third overall and was the best
            general-purpose method. It has been a consistent top performer in continuous-optimisation competitions ever since.
          </p>
        </Callout>
        <p>
          DE is an evolutionary algorithm, so it has the same three operators as a GA, but in a different order and with a different flavour:{' '}
          <b>mutation → crossover → selection</b>. The population members are lists of real numbers.
        </p>
        <p>For each member of the population, DE creates one challenger and stages a duel. Three vectors are involved, and the names matter:</p>
        <Table
          head={['Name', 'Symbol', 'What it is']}
          rows={[
            ['Target vector', 'x', 'The existing population member whose place is being challenged.'],
            ['Mutant vector', 'v', 'A new point made by mutation from other members of the population.'],
            ['Trial vector', 'u', 'A mix of target and mutant, made by crossover. This is the actual challenger.'],
          ]}
        />
        <Callout type="warn" title="Do not confuse the letters with PSO's">
          <p>In PSO, v is a velocity. In DE, v is a mutant <i>position</i>. In DFO, u is a random number; in DE, u is the trial vector. Same letters, different meanings. Define them whenever you write about either.</p>
        </Callout>
      </Section>

      <Section n="4" title="DE step 1: mutation">
        <Formula
          title="Mutation, strategy DE/best/1"
          number="3"
          legend={[
            { k: 'v', sym: 'vᵢ (g)', name: 'Mutant vector for member i', desc: 'A brand-new candidate position, built for the i-th population member in generation g. (g is a generation label, not a power.)' },
            { k: 'best', sym: 'x_best (g)', name: 'Best member of the current population', desc: 'The vector with the best fitness in generation g. It is the base point: the mutant is created near it.' },
            { k: 'F', sym: 'F', name: 'Scale factor', desc: 'A positive number, set to 0.5 in the lecture, that shrinks or stretches the difference. Small F = small steps (fine-tuning). Large F = big jumps (exploring). Typical range 0.4 to 1.' },
            { k: 'r1', sym: 'x_r1 (g)', name: 'A randomly chosen member', desc: 'r1 is a random index between 1 and N, different from i.' },
            { k: 'r2', sym: 'x_r2 (g)', name: 'Another randomly chosen member', desc: 'r2 is a second random index, different from i and from r1.' },
            { k: 'diff', sym: '(x_r1 − x_r2)', name: 'The difference vector', desc: 'Subtract one random member from another, dimension by dimension. The result is an arrow: its direction and length are those of the line between two population members.' },
          ]}
          plain="Start at the best member. Pick two other members at random, find the arrow from one to the other, shrink it by F, and add it on. Where you land is the mutant."
          example={
            <>
              2-D: x_best = (1, 1), x_r1 = (4, 2), x_r2 = (2, 6), F = 0.5. Difference = (4 − 2, 2 − 6) = (2, −4). Scaled: (1, −2). Mutant v = (1 + 1,
              1 − 2) = <b>(2, −1)</b>.
            </>
          }
        >
          <P k="v"><V sub="i" sup="g">v</V></P>
          <span className="op">=</span>
          <P k="best"><V sub="best" sup="g">x</V></P>
          <span className="op">+</span>
          <P k="F"><V>F</V></P>
          <P k="diff">(<P k="r1"><V sub="r1" sup="g">x</V></P> − <P k="r2"><V sub="r2" sup="g">x</V></P>)</P>
        </Formula>
        <Callout type="key" title="Why differences are such a clever idea">
          <p>
            The size of the mutation is not a parameter you choose. It comes from the population itself. Early on, members are spread far apart, so
            differences are large and mutations are big: <b>exploration</b>. As the population converges, members are close together, differences
            shrink and mutations become tiny: <b>fine-tuning</b>. And if the population is stretched along a narrow valley, the differences point
            along the valley, so mutations follow the shape of the landscape. DE adapts its step size and direction automatically. This is called
            being <b>self-scaling</b>, and it is the main reason DE performs so well. (DFO has a similar property: its step is the gap between the
            best fly and the current one.)
          </p>
        </Callout>
        <h3>The naming code: DE/x/y</h3>
        <p>
          The slide lists five strategies. The name is a code. <b>DE / base / number</b>: the first part says which vector is the starting point,
          the second says how many difference vectors are added.
        </p>
        <Table
          head={['Strategy', 'Formula in words', 'Character']}
          rows={[
            ['DE/rand/1', 'random member + F × (difference of two others)', 'The classic. Most exploratory, most robust, slower.'],
            ['DE/best/1', 'best member + F × (one difference)', 'Greedy and fast. Can converge prematurely on multimodal problems.'],
            ['DE/target-to-best/1', 'target + F × (best − target) + F × (one difference)', 'A compromise: each member moves part-way towards the best, plus a random nudge.'],
            ['DE/best/2', 'best + F × (difference) + F × (a second difference)', 'Like best/1 with more varied mutations.'],
            ['DE/rand/2', 'random + F × (difference) + F × (a second difference)', 'Most diverse of all. Needs a bigger population.'],
          ]}
        />
        <p>
          In every case the random indices must all be different from each other and from i. (In the standard definition the two differences in
          the "/2" strategies use four distinct random members. The slide's equation 7 reuses r2, which looks like a typo.)
        </p>
      </Section>

      <Section n="5" title="DE step 2: crossover">
        <p>
          The mutant could simply be used as the challenger, but mixing it with the target first gives more variety. Crossover builds the trial
          vector one dimension at a time by asking, for each dimension, "do I take this number from the mutant or keep the target's?"
        </p>
        <Formula
          title="Binomial crossover"
          number="9"
          legend={[
            { k: 'u', sym: 'uᵢ,ⱼ', name: 'Component j of the trial vector', desc: 'The j-th number of the challenger for member i. j runs over the dimensions, 1 to D.' },
            { k: 'v', sym: 'vᵢ,ⱼ', name: 'Component j of the mutant', desc: 'Used when the dice roll says "inherit from the mutant".' },
            { k: 'x', sym: 'xᵢ,ⱼ', name: 'Component j of the target', desc: 'Used otherwise: the trial keeps the target\'s original value in this dimension.' },
            { k: 'r', sym: 'r', name: 'Random number between 0 and 1', desc: 'Drawn fresh for every dimension.' },
            { k: 'CR', sym: 'CR', name: 'Crossover rate', desc: 'A number between 0 and 1, set to 0.5 in the lecture. It is the probability that each component is taken from the mutant. CR near 0: the trial is nearly a copy of the target with one changed number. CR near 1: the trial is nearly the whole mutant.' },
            { k: 'rd', sym: 'r_d', name: 'One guaranteed dimension', desc: 'A dimension chosen at random beforehand. In that dimension the mutant\'s value is always used, whatever the dice say. This guarantees the trial differs from the target in at least one place, so an evaluation is never wasted on an identical copy.' },
          ]}
          plain="For each dimension, roll a die. If the roll is at or below CR, or this is the one guaranteed dimension, take the mutant's number. Otherwise keep the target's number."
          example={
            <>
              Target x = (5, 5, 5), mutant v = (1, 2, 3), CR = 0.5, guaranteed dimension = 3. Rolls: 0.8, 0.3, 0.9. Dimension 1: 0.8 &gt; 0.5, keep 5.
              Dimension 2: 0.3 ≤ 0.5, take 2. Dimension 3: guaranteed, take 3. Trial u = <b>(5, 2, 3)</b>.
            </>
          }
        >
          <P k="u"><V sub="i,j">u</V></P>
          <span className="op">=</span>
          <span className="cases">
            <span><P k="v"><V sub="i,j">v</V></P> <span className="gap" /> if <P k="r"><V>r</V></P> ≤ <P k="CR">CR</P> or <V>j</V> = <P k="rd"><V sub="d">r</V></P></span>
            <span><P k="x"><V sub="i,j">x</V></P> <span className="gap" /> otherwise</span>
          </span>
        </Formula>
      </Section>

      <Section n="6" title="DE step 3: selection">
        <Formula
          title="One-to-one greedy selection"
          number="10"
          legend={[
            { k: 'next', sym: 'xᵢ (g+1)', name: 'Member i in the NEXT generation', desc: 'Who occupies slot i after the duel.' },
            { k: 'u', sym: 'uᵢ (g)', name: 'The trial vector', desc: 'The challenger.' },
            { k: 'x', sym: 'xᵢ (g)', name: 'The target vector', desc: 'The current occupant.' },
            { k: 'fu', sym: 'f(uᵢ)', name: 'Fitness of the trial', desc: 'Costs one fitness evaluation.' },
            { k: 'fx', sym: 'f(xᵢ)', name: 'Fitness of the target', desc: 'Already known from earlier.' },
          ]}
          plain="Whichever of the two has the lower (or equal) fitness gets the slot. The trial only ever competes against its own target, not against the rest of the population."
          example={<>f(trial) = 3.2 and f(target) = 4.0 → the trial takes the slot. If instead f(trial) = 4.5, the target stays and the trial is discarded.</>}
        >
          <P k="next"><V sub="i" sup="g+1">x</V></P>
          <span className="op">=</span>
          <span className="cases">
            <span><P k="u"><V sub="i" sup="g">u</V></P> <span className="gap" /> if <P k="fu"><V>f</V>(<V sub="i" sup="g">u</V>)</P> ≤ <P k="fx"><V>f</V>(<V sub="i" sup="g">x</V>)</P></span>
            <span><P k="x"><V sub="i" sup="g">x</V></P> <span className="gap" /> otherwise</span>
          </span>
        </Formula>
        <p>
          "As simple as that!" says the slide, and it is. Two consequences are worth noticing. First, <b>no member ever gets worse</b>, so the
          whole population improves monotonically (elitism for everyone, not just the best). Second, there is <b>no roulette wheel and no
          tournament</b>: selection in DE is purely local, one slot at a time.
        </p>
        <Sim title="One DE step, drawn as arrows" caption="The rings are contours of the Sphere function, with the optimum at the centre.">
          <DeStep />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Drag <b>F</b>. The solid purple arrow (from the best member to the mutant) is the dashed arrow (between the two random members) scaled by F.</li>
            <li>Press <b>Re-roll the crossover dice</b> several times. The trial (teal) jumps between corners of the dotted rectangle: it takes each coordinate from either the target or the mutant.</li>
            <li>Set CR = 1: the trial always equals the mutant. Set CR = 0: only the one guaranteed coordinate changes, so the trial moves along a single axis.</li>
          </ol>
        </Callout>
        <Code title="The whole of DE/best/1/bin">{`initialise N vectors at random inside the bounds; evaluate them
repeat each generation:
    for each member i (the target x_i):
        pick r1 != r2, both different from i
        v = x_best + F * (x_r1 - x_r2)              # 1. mutation  -> mutant
        jr = random dimension
        for each dimension j:                        # 2. crossover -> trial
            u[j] = v[j] if (rand() <= CR or j == jr) else x_i[j]
        if f(u) <= f(x_i):                           # 3. selection
            x_i (next generation) = u
        else:
            x_i (next generation) = x_i`}</Code>
        <Sim title="DE on a 2-D landscape" caption="Compare DE/best/1 with DE/rand/1 on Rastrigin and Schwefel." wide>
          <SwarmSim algo="de" defaultFn="rastrigin" />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Watch the diversity curve: it falls steadily and smoothly, because step sizes shrink as the population contracts.</li>
            <li>Set <b>F = 0.1</b>. Steps are tiny, the population shrinks fast and often stalls in a local dent. Set <b>F = 1.2</b>: slow, wide-ranging and rarely trapped.</li>
            <li>Reduce N to 4 or 5. DE needs enough members to supply varied difference vectors. With too few it stagnates: the set of possible moves is too small.</li>
            <li>On Schwefel, compare the two strategies over several resets. DE/best/1 commits early to whichever valley the first best member is in; DE/rand/1 is slower but finds the far corner more often.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="7" title="Putting the whole module together">
        <p>You have now seen six algorithms. Here they are side by side, described with the week-1 ingredients.</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Algorithm</th><th>Year</th><th>Inspiration</th><th>Positive feedback</th><th>Source of randomness / exploration</th><th>Main parameters</th><th>Natural home</th></tr>
            </thead>
            <tbody>
              <tr><td><b>GA</b></td><td>1960s–75</td><td>Darwinian evolution</td><td>Selection of fitter parents</td><td>Mutation, crossover points</td><td>N, mutation rate, crossover rate, selection scheme</td><td>Discrete, structured problems</td></tr>
              <tr><td><b>SDS</b></td><td>1989</td><td>Tandem-running ants / miners</td><td>Recruitment by active agents</td><td>Random hypothesis on failed recruitment</td><td>Number of agents</td><td>Search and matching with decomposable tests</td></tr>
              <tr><td><b>ACO</b></td><td>1992</td><td>Ant foraging trails</td><td>Pheromone deposit</td><td>Probabilistic choice; evaporation as negative feedback</td><td>α, β, ρ, m</td><td>Routing, sequencing, graphs</td></tr>
              <tr><td><b>PSO</b></td><td>1995</td><td>Bird flocks, social learning</td><td>Pull to personal and neighbourhood best</td><td>r₁, r₂ and momentum</td><td>χ, c₁, c₂, topology, N</td><td>Continuous optimisation</td></tr>
              <tr><td><b>DE</b></td><td>1995</td><td>Evolution (abstractly)</td><td>Greedy one-to-one selection</td><td>Random choice of difference vectors</td><td>F, CR, strategy, N</td><td>Continuous optimisation</td></tr>
              <tr><td><b>DFO</b></td><td>2014</td><td>Flies over food</td><td>Pull to best neighbour and swarm best</td><td>u and disturbance Δ</td><td>Δ, N</td><td>Continuous optimisation, dynamic problems</td></tr>
            </tbody>
          </table>
        </div>
        <Callout type="key" title="The pattern underneath all of them">
          <ol>
            <li>Keep a <b>population</b> of candidate solutions.</li>
            <li><b>Measure</b> how good they are with a fitness function.</li>
            <li><b>Share information</b> so that new candidates are biased towards what has worked (exploitation).</li>
            <li><b>Inject randomness</b> so that new regions keep being tried (exploration).</li>
            <li><b>Repeat</b>, and keep the best.</li>
          </ol>
          <p>The algorithms differ only in <i>how</i> they share information and <i>where</i> the randomness comes in. If you can state those two things for an algorithm, you understand it.</p>
        </Callout>
        <Callout type="cw" title="Next: the Algorithm Arena">
          <p>
            The next page lets you run DFO, PSO, DE and a GA against each other under fair conditions and see the convergence curves and
            statistics. It is the closest thing in this course to the experiments section of a report, and it addresses learning outcome 4:
            evaluating the performance of nature-inspired algorithms.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'Which term of the PSO velocity equation makes particles overshoot good positions and swing back?',
            options: ['The cognitive term c₁r₁(p − x)', 'The social term c₂r₂(g − x)', 'The momentum term χ × old velocity', 'The position update'],
            answer: 2,
            why: 'Carrying over part of the previous velocity gives inertia, so a particle does not stop the instant it reaches a good point.',
          },
          {
            q: 'A PSO particle has old velocity 0, position 4, personal best 4 and neighbourhood best 0. With c₂ = 1.5 and r₂ = 0.4, what is its new position?',
            options: ['4', '1.6', '−2.4', '0'],
            answer: 1,
            why: 'v = χ×0 + c₁r₁×(4 − 4) + 1.5 × 0.4 × (0 − 4) = −2.4. New position = 4 + (−2.4) = 1.6.',
          },
          {
            q: 'In DE, what is the "trial vector"?',
            options: ['The best member of the population', 'The result of mutation alone', 'The mix of mutant and target produced by crossover, which then competes with the target', 'A particle\'s velocity'],
            answer: 2,
            why: 'Target → (mutation makes) mutant → (crossover makes) trial → (selection) trial versus target.',
          },
          {
            q: 'DE/best/1 with x_best = (0, 2), x_r1 = (3, 3), x_r2 = (1, −1), F = 0.5. What is the mutant?',
            options: ['(1, 4)', '(2, 4)', '(1, 2)', '(4, 6)'],
            answer: 0,
            why: 'Difference = (3−1, 3−(−1)) = (2, 4). Times 0.5 = (1, 2). Add to best: (0+1, 2+2) = (1, 4).',
          },
          {
            q: 'Why do DE\'s mutations automatically get smaller as the search progresses?',
            options: ['F is reduced each generation', 'They are built from differences between population members, which shrink as the population converges', 'CR increases over time', 'The fitness function changes'],
            answer: 1,
            why: 'This self-scaling property is DE\'s central idea. No schedule or extra parameter is needed.',
          },
          {
            q: 'What is the purpose of the guaranteed dimension r_d in DE crossover?',
            options: ['It speeds up the fitness function', 'It ensures the trial differs from the target in at least one component', 'It selects the best member', 'It keeps vectors inside the bounds'],
            answer: 1,
            why: 'Without it, a low CR could produce a trial identical to the target, wasting a fitness evaluation.',
          },
        ]}
      />
    </Lesson>
  )
}
