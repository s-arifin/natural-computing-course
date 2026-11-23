import { Lesson, Section, Callout, Sim, Quiz, Table, Steps, Code } from '../components/ui'
import { Formula, P, V } from '../components/Formula'
import { DfoWorked } from '../sims/DfoSims'
import SwarmSim from '../sims/SwarmSim'

export default function W3({ onDone }) {
  return (
    <Lesson
      week="Week 3"
      title="Dispersive Flies Optimisation (DFO)"
      subtitle="Your lecturer's own algorithm, and the simplest swarm optimiser there is: one line of arithmetic and one tunable parameter. Understand this properly and every other population-based algorithm becomes a variation on a theme."
      time="40 minutes"
    >
      <Section n="1" title="Where DFO comes from">
        <Callout type="history">
          <p>
            Dispersive Flies Optimisation was published in 2014 by Mohammad Majid al-Rifaie (your module leader). By then, swarm algorithms had
            become complicated: Particle Swarm Optimisation, the best-known one, gives every agent a position, a velocity and a memory, and has
            several parameters to tune. DFO asked a deliberately minimalist question: <b>what is the least machinery a swarm needs to still
            optimise well?</b> The answer was an algorithm where each agent has only a position, with one update equation and a single parameter.
            That simplicity is why the lecture says it is good for "students who would like to better understand the behaviour of the complex
            communication between members of the population". Since then it has been applied to medical image reconstruction (CT and MRI),
            training neural networks, tuning classifiers and motor controllers, and placing drone base stations.
          </p>
        </Callout>
        <p>
          The natural inspiration is flies hovering over a food source. Watch flies around a bin: they form a loose cloud over the food (
          <b>swarm formation</b>). Wave your hand and they scatter, then drift back, sometimes settling on a different, better spot (
          <b>swarm disturbance</b>). DFO is those two behaviours and nothing else:
        </p>
        <div className="grid2">
          <div className="card">
            <h4>Formation → exploitation</h4>
            <p>Flies move towards good positions that other flies have found. This concentrates the search where things look promising.</p>
          </div>
          <div className="card">
            <h4>Disturbance → exploration</h4>
            <p>Now and then a fly is knocked somewhere random. This stops the whole swarm getting stuck in one place.</p>
          </div>
        </div>
      </Section>

      <Section n="2" title="The basics: a fly is a solution">
        <p>This is the mental shift that makes everything else click. Forget insects. In DFO:</p>
        <ul>
          <li>
            A <b>fly</b> is one candidate solution: a list of D numbers. For the 5-bead protein, a fly is three angles. For the Sphere function in
            3-D, a fly is three coordinates.
          </li>
          <li>The <b>population</b> (or swarm) is N flies, so N candidate solutions that exist at the same time.</li>
          <li>
            A fly's <b>position</b> in the search space <i>is</i> its list of numbers. "The fly moves" means "the numbers change", so it now
            represents a different candidate solution.
          </li>
          <li>Each fly has a <b>fitness</b>: put its numbers into the fitness function and see what comes out.</li>
        </ul>
        <Formula
          title="Notation for a fly's position"
          number="1"
          legend={[
            { k: 'xi', sym: 'xᵢ', name: 'Fly number i', desc: 'The whole position of one fly: a list of D numbers. The little i says which fly.' },
            { k: 'i', sym: 'i', name: 'Which fly', desc: 'An index that runs from 0 to N − 1. Computer scientists count from 0, so with N = 4 flies they are x₀, x₁, x₂, x₃.' },
            { k: 'xid', sym: 'xᵢ₀, xᵢ₁, …', name: 'One coordinate of that fly', desc: 'Two subscripts: the first says which fly, the second says which dimension. x₀₁ means "fly 0, dimension 1".' },
            { k: 'D', sym: 'D', name: 'Dimensionality', desc: 'How many numbers each fly holds. The last one is numbered D − 1 because counting starts at 0.' },
            { k: 'N', sym: 'N', name: 'Population size', desc: 'How many flies there are.' },
          ]}
          plain="Fly i is a list of D numbers. The symbol ∈ means 'is one of', so i is one of 0, 1, 2, … up to N − 1."
          example={<>The lecture's fly x₀ = [2, 3, 1] has x₀₀ = 2, x₀₁ = 3 and x₀₂ = 1.</>}
        >
          <P k="xi"><V sub="i">x</V></P>
          <span className="op">=</span>[<P k="xid"><V sub="i0">x</V>, <V sub="i1">x</V>, …, <V sub={<>i,<P k="D">D</P>−1</>}>x</V></P>],
          <span className="gap" />
          <P k="i"><V>i</V></P> ∈ {'{'}0, 1, 2, …, <P k="N"><V>N</V></P> − 1{'}'}
        </Formula>
        <h3>Who talks to whom: the ring</h3>
        <p>
          Flies are imagined sitting in a circle in the order of their index numbers. Each fly has exactly two neighbours: the one before it and the
          one after it. The ring closes on itself, so fly 0's left neighbour is the last fly. This arrangement is called a <b>ring topology</b>.
        </p>
        <Callout type="warn" title="The ring is about index numbers, not about distance">
          <p>
            A fly's "neighbours" are the flies with index i − 1 and i + 1. They are <b>not</b> the flies that happen to be nearest to it in the
            search space. Fly 3 and fly 4 are neighbours even if they are at opposite ends of the landscape. This trips up almost everyone. Turn on
            "Draw the ring" in the simulator below and you will see the links criss-cross the whole map at the start.
          </p>
        </Callout>
        <p>Each fly then needs two pieces of information before it can move:</p>
        <ul>
          <li>
            its <b>best neighbour</b>: whichever of its two ring neighbours has the better (lower) fitness. Written x<sub>i<sub>n</sub></sub>.
          </li>
          <li>
            the <b>best fly in the whole swarm</b>. Written x<sub>s</sub>.
          </li>
        </ul>
      </Section>

      <Section n="3" title="The update equation">
        <p>This is the entire algorithm. Everything else is bookkeeping.</p>
        <Formula
          title="DFO update equation"
          number="4"
          legend={[
            { k: 'new', sym: 'xᵢd (t+1)', name: 'The fly\'s NEW value in dimension d', desc: 'The thing being calculated. The superscript t + 1 means "at the next time step". It is not a power.' },
            { k: 'nb', sym: 'x iₙ d (t)', name: 'Best neighbour\'s value in dimension d', desc: 'Look at fly i\'s two ring neighbours, take the fitter one, and read off its d-th number. This is the starting point of the move. The fly does not start from where it is. It starts from where its best neighbour is.' },
            { k: 'u', sym: 'u', name: 'A random number between 0 and 1', desc: 'Drawn fresh every single time: a new one for each fly and each dimension. u ~ U(0, 1) means "pick any number from 0 to 1, all equally likely" (U stands for uniform).' },
            { k: 's', sym: 'x_sd (t)', name: 'Swarm-best fly\'s value in dimension d', desc: 'The d-th number of the best fly in the entire population right now.' },
            { k: 'cur', sym: 'xᵢd (t)', name: 'The fly\'s CURRENT value in dimension d', desc: 'Where fly i is at this moment, in this dimension.' },
            { k: 'diff', sym: '(x_sd − xᵢd)', name: 'The gap between the best fly and me', desc: 'How far, and in which direction, the swarm best is from the current fly. Positive means "the best is above me in this dimension", negative means "below".' },
          ]}
          plain="Go to where your best neighbour is, then take a random-sized step in the direction that leads from you to the best fly in the swarm. Do this separately for every dimension."
          example={
            <>
              Lecture example, fly x₀ = [2, 3, 1], dimension 0. Best neighbour x₁ has value 1. Swarm best x₂ has value 0. Current value is 2. With u
              = 0.1: new value = 1 + 0.1 × (0 − 2) = 1 − 0.2 = <b>0.8</b>.
            </>
          }
        >
          <P k="new"><V sub="id" sup="t+1">x</V></P>
          <span className="op">=</span>
          <P k="nb"><V sub={<>i<sub>n</sub>d</>} sup="t">x</V></P>
          <span className="op">+</span>
          <P k="u"><V>u</V></P>
          <P k="diff">(<P k="s"><V sub="sd" sup="t">x</V></P> − <P k="cur"><V sub="id" sup="t">x</V></P>)</P>
        </Formula>
        <Callout type="analogy" title="Looking for the best view on a hillside, in a line of friends">
          <p>
            You and your friends are spread over a hillside, each numbered. You can only see what the friend numbered just before and just after
            you are seeing (your ring neighbours), but everyone has heard on the radio where the person with the very best view is standing. Your
            rule: walk over to whichever of your two neighbours has the better view, then, from there, take a few steps of random length in the
            direction "from where I was, towards the radio champion". You have used local gossip (the neighbour) and global news (the champion),
            and a dash of luck (the random step length).
          </p>
        </Callout>
        <h3>Why each piece is there</h3>
        <Table
          head={['Piece', 'What it contributes', 'What would happen without it']}
          rows={[
            ['Best neighbour as the starting point', 'Local information. Different flies have different neighbours, so they are pulled to different places. This keeps variety in the swarm.', 'Everyone would start from the same point and the swarm would collapse almost instantly.'],
            ['Step towards the swarm best', 'Global information. Good news reaches every fly immediately.', 'Good discoveries would only spread slowly round the ring, two flies at a time.'],
            ['Random u', 'Unpredictability. Flies land in a range of places, sampling the area instead of all jumping to one exact point.', 'The algorithm would be deterministic and would test far fewer distinct points.'],
            ['The gap (xₛ − xᵢ) as step size', 'A self-adjusting step. Far from the best: big steps. Close to the best: tiny steps. No step-size parameter needed.', 'You would have to choose a step size by hand, and one size never suits both early and late search.'],
          ]}
        />
        <Sim title="The lecture's four-fly example, step by step" caption="These are exactly the four flies from the slides 'Understanding DFO: II–V', evaluated on the Sphere function.">
          <DfoWorked />
        </Sim>
        <Callout type="try">
          <ol>
            <li>With fly x₀ selected and u for dimension 0 at 0.10, confirm you get 0.8, the number on the slide.</li>
            <li>Slide u from 0 to 1 and watch the new value sweep across a range. That range is the "valid area for x₃ at time t+1" shaded on the lecture's diagram: u decides where in that area the fly lands.</li>
            <li>Click x₃ = [−5, 0, 1], the worst fly. Notice dimension 2: every fly has the value 1 there, so the gap is 0 and the fly cannot change it no matter what u is. Remember this. It is the reason the disturbance mechanism exists.</li>
            <li>Click x₂. It is the best fly, so it does not move.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="4" title="Starting the swarm: initialisation">
        <p>Before the first update, every fly is scattered at random across the allowed range.</p>
        <Formula
          title="Initialising one coordinate of one fly"
          number="2"
          legend={[
            { k: 'x0', sym: 'xᵢd (0)', name: 'Starting value', desc: 'Fly i, dimension d, at time step 0 (the very beginning).' },
            { k: 'min', sym: 'x_min,d', name: 'Lower bound', desc: 'The smallest value allowed in dimension d. For Sphere it is −5.12.' },
            { k: 'max', sym: 'x_max,d', name: 'Upper bound', desc: 'The largest value allowed in dimension d. For Sphere it is 5.12.' },
            { k: 'r', sym: 'r', name: 'A random number between 0 and 1', desc: 'r ~ U(0, 1). When r = 0 you get the lower bound; r = 1 gives the upper bound; r = 0.5 gives the midpoint.' },
            { k: 'w', sym: '(x_max,d − x_min,d)', name: 'Width of the allowed range', desc: 'For Sphere: 5.12 − (−5.12) = 10.24.' },
          ]}
          plain="Start at the lower bound and move a random fraction of the way towards the upper bound. In other words: pick a uniformly random value inside the allowed range."
          example={<>Sphere, r = 0.25: −5.12 + 0.25 × 10.24 = −5.12 + 2.56 = <b>−2.56</b>.</>}
        >
          <P k="x0"><V sub="id" sup="0">x</V></P>
          <span className="op">=</span>
          <P k="min"><V sub="min,d">x</V></P>
          <span className="op">+</span>
          <P k="r"><V>r</V></P>
          <P k="w">(<P k="max"><V sub="max,d">x</V></P> − <P k="min"><V sub="min,d">x</V></P>)</P>
        </Formula>
        <p>
          Random scattering matters. At the start you know nothing, so the fairest thing to do is cover the space evenly. A swarm that starts
          bunched in one corner has already thrown away most of the landscape.
        </p>
      </Section>

      <Section n="5" title="Disturbance: the one parameter, Δ">
        <p>
          The update equation only ever moves flies <i>towards</i> each other. Left alone, the swarm shrinks to a single point and the search is
          over, whether or not that point is any good. If it shrank into a local minimum, it is stuck there forever. You saw the cause in the
          worked example: when all flies share a value in some dimension, the gap is zero and nothing can change.
        </p>
        <p>
          The fix is the <b>disturbance threshold</b>, written Δ (capital Greek delta). Before updating each coordinate of each fly, DFO rolls a
          die:
        </p>
        <Formula
          title="The disturbance rule"
          legend={[
            { k: 'U', sym: 'U(0, 1)', name: 'A fresh random number between 0 and 1', desc: 'Rolled separately for every coordinate of every fly, every iteration.' },
            { k: 'D', sym: 'Δ', name: 'Disturbance threshold', desc: 'A small number you choose, e.g. 0.001. It is a probability: Δ = 0.001 means each coordinate has a 1 in 1000 chance of being restarted.' },
            { k: 'restart', sym: 'restart', name: 'Throw that coordinate somewhere random', desc: 'Replace it with a uniformly random value between the lower and upper bound, exactly as in initialisation. Only that one coordinate, not the whole fly.' },
            { k: 'upd', sym: 'update', name: 'Otherwise, behave normally', desc: 'Use the update equation above.' },
          ]}
          plain="Most of the time, follow the update equation. Occasionally (with probability Δ) ignore everyone and teleport one coordinate to a random value."
        >
          if <P k="U">U(0, 1)</P> &lt; <P k="D">Δ</P> <span className="gap" /> → <P k="restart">restart x<sub>id</sub> at random</P>
          <span className="gap" /> else <span className="gap" /> → <P k="upd">apply the update equation</P>
        </Formula>
        <Callout type="key" title="Δ is your exploration dial">
          <Table
            head={['Δ', 'Behaviour', 'Good for', 'Risk']}
            rows={[
              ['0', 'Pure formation. The swarm collapses to a point and stops.', 'Simple unimodal problems; fastest fine-tuning.', 'Gets permanently stuck in the first local minimum it falls into.'],
              ['about 0.001', 'Mostly formation, with a steady trickle of scouts.', 'The usual starting value; a sensible default.', 'May still be too little on very rugged landscapes.'],
              ['0.01 – 0.1', 'A loose cloud. Many flies are always elsewhere.', 'Rugged, multimodal or changing problems.', 'Slower and less precise: the swarm never fully settles.'],
              ['1', 'Every coordinate is random every time.', 'Nothing. This is random search.', 'No learning at all.'],
            ]}
          />
          <p>
            Notice the arithmetic: with N flies and D dimensions, about N × D × Δ coordinates are restarted per iteration. With N = 100, D = 30 and
            Δ = 0.001 that is 3 restarts per iteration. The same Δ on a 2-D problem with 20 flies gives 0.04 restarts per iteration, which is
            almost none. <b>A good Δ depends on N and D</b>, which is why "adjusting and fine-tuning the parameters" is worth marks.
          </p>
        </Callout>
        <Sim title="DFO on a 2-D landscape" caption="White dots are flies. Use Step once to follow individual moves, or Run to watch the swarm form." wide>
          <SwarmSim algo="dfo" defaultFn="rastrigin" />
        </Sim>
        <Callout type="try" title="Four experiments that teach you what Δ does">
          <ol>
            <li>
              <b>See the equation.</b> Press Reset, then Step once a few times. The pink ring is one fly, the teal line goes to its best ring
              neighbour, the dashed gold line to the swarm best.
            </li>
            <li>
              <b>Collapse.</b> Set Δ to 0.000 and Run on Rastrigin. The diversity curve falls off a cliff and the best-fitness curve goes flat. If
              the best fitness is not near 0, the swarm is trapped in a dent and will stay there. Reset a few times: sometimes it is lucky,
              sometimes not.
            </li>
            <li>
              <b>Rescue.</b> While it is stuck, raise Δ to about 0.02. Pink flies start popping up elsewhere, diversity rises, and before long the
              best fitness drops again. You have just watched disturbance free a trapped swarm.
            </li>
            <li>
              <b>Overdo it.</b> Push Δ to 0.2. The flies never settle, and the best fitness improves only slowly. Too much exploration.
            </li>
          </ol>
        </Callout>
      </Section>

      <Section n="6" title="The full algorithm, line by line">
        <p>The lecture's pseudo-code, annotated. Line numbers match the slide.</p>
        <Table
          head={['Lines', 'Pseudo-code', 'What it means']}
          rows={[
            ['1', 'procedure DFO(N, D, x_min, x_max, f)', 'Inputs: number of flies, number of dimensions, the bounds, and the fitness function.'],
            ['2–6', 'for every fly i, for every dimension d:  x_id ← U(x_min,d , x_max,d)', 'Initialisation: scatter every fly at random inside the bounds. (The arrow ← means "is set to".)'],
            ['7', 'while not (termination criteria)', 'Main loop. Stop after a fixed number of iterations or evaluations, or when the fitness is good enough.'],
            ['8–10', 'for every fly i:  x_i.fitness ← f(x_i)', 'Evaluation: measure how good each fly currently is.'],
            ['11', 'x_s = arg min [ f(x_i) ]', 'Find the best fly. "arg min" means "the one that gives the minimum": not the lowest fitness value itself, but which fly has it.'],
            ['12', 'for every fly i, except i = s', 'Update every fly apart from the best. Leaving the best untouched is elitism: the best answer found is never lost.'],
            ['13', 'x_in = arg min [ f(x_(i−1)%N), f(x_(i+1)%N) ]', 'Find the best neighbour. % is "remainder after dividing", which makes the ring wrap round: for the last fly, (i+1) % N = 0.'],
            ['14', 'for every dimension d', 'Handle one coordinate at a time.'],
            ['15–16', 'if U(0,1) < Δ:  x_id ← U(x_min,d , x_max,d)', 'Disturbance: with probability Δ, restart this coordinate.'],
            ['17–19', 'else:  u ← U(0,1);  x_id ← x_in,d + u (x_sd − x_id)', 'Otherwise apply the update equation with a fresh random u.'],
            ['20–22', 'if x_id is outside the bounds:  x_id ← U(x_min,d , x_max,d)', 'Constraint handling: if the move took the fly outside the allowed range, restart that coordinate inside it.'],
            ['27', 'return x_s', 'Hand back the best solution found.'],
          ]}
        />
        <p>And here it is as runnable Python, in the same style as the official code at github.com/mohmaj/DFO:</p>
        <Code title="dfo.py: the complete algorithm">{`import numpy as np

def f(x):                      # FITNESS FUNCTION: swap this for your own problem
    return np.sum(x ** 2)      # Sphere

N = 100                        # population size (number of flies)
D = 30                         # dimensionality (numbers per fly)
delta = 0.001                  # disturbance threshold
max_iterations = 3000
lower, upper = -5.12, 5.12     # bounds of the search space

X = np.random.uniform(lower, upper, (N, D))   # lines 2-6: random initialisation
fitness = np.zeros(N)

for itr in range(max_iterations):             # line 7: main loop
    for i in range(N):                        # lines 8-10: evaluate every fly
        fitness[i] = f(X[i])
    s = np.argmin(fitness)                    # line 11: index of the best fly

    for i in range(N):
        if i == s:                            # line 12: elitism, skip the best fly
            continue
        left, right = (i - 1) % N, (i + 1) % N                     # ring neighbours
        best_nb = right if fitness[right] < fitness[left] else left  # line 13

        for d in range(D):                    # line 14: one dimension at a time
            if np.random.rand() < delta:      # lines 15-16: disturbance
                X[i, d] = np.random.uniform(lower, upper)
                continue
            u = np.random.rand()              # line 18
            X[i, d] = X[best_nb, d] + u * (X[s, d] - X[i, d])       # line 19: UPDATE
            if X[i, d] < lower or X[i, d] > upper:                  # lines 20-22
                X[i, d] = np.random.uniform(lower, upper)

fitness = np.array([f(x) for x in X])
s = np.argmin(fitness)
print("best fitness:", fitness[s])
print("best solution:", X[s])`}</Code>
        <Callout type="cw" title="To apply DFO to your own problem you change exactly three things">
          <ol>
            <li><b>The fitness function f</b>: return a number that is lower when the solution is better.</li>
            <li><b>D</b>: how many numbers describe one solution.</li>
            <li><b>The bounds</b>: the allowed range of each number.</li>
          </ol>
          <p>The update loop stays untouched. This is the practical meaning of "general-purpose metaheuristic".</p>
        </Callout>
      </Section>

      <Section n="7" title="Going deeper: what makes DFO different">
        <Table
          head={['', 'DFO', 'Standard PSO (week 8)']}
          rows={[
            ['What each agent stores', 'Position only', 'Position, velocity and a personal-best memory'],
            ['Tunable parameters (besides N)', 'One: Δ', 'Three or more: χ (or w), c₁, c₂'],
            ['Where the new position starts from', 'The best neighbour\'s position', 'The agent\'s own position'],
            ['How it avoids getting stuck', 'Explicit random restarts (Δ)', 'Momentum carries particles past the best point'],
            ['Uses memory of the past?', 'No. Only current positions matter.', 'Yes. Every particle remembers its best-ever spot.'],
          ]}
        />
        <Callout type="deep" title="Two subtleties worth knowing">
          <p>
            <b>1. DFO has no memory, apart from elitism.</b> Because flies do not remember where they have been, a fly can move to a <i>worse</i>{' '}
            position and the old one is forgotten. This sounds bad but it is a source of exploration: the swarm is not anchored to its history. The
            only thing protecting the best-so-far answer is line 12, which leaves the best fly alone.
          </p>
          <p>
            <b>2. The update works dimension by dimension.</b> Each coordinate gets its own u, so a fly does not travel in a straight line towards
            the best. In 2-D it lands somewhere inside a rectangle (the shaded "valid area" on the slide). This makes DFO naturally suited to{' '}
            <b>separable</b> problems, where each variable can be improved on its own (Sphere and Rastrigin are separable), and somewhat less
            suited to problems where variables must change together (Rosenbrock's curved valley). Try both in the simulator and compare. That is
            the No Free Lunch theorem showing itself.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'There are 6 flies (indices 0–5). Who are the ring neighbours of fly 5?',
            options: ['Flies 4 and 6', 'Flies 4 and 0', 'The two flies closest to it in the search space', 'Flies 3 and 4'],
            answer: 1,
            why: 'Left = (5−1) % 6 = 4. Right = (5+1) % 6 = 0. The ring wraps round, and it is defined by index, not by distance.',
          },
          {
            q: 'A fly has value 4 in some dimension. Its best neighbour has 2 there, the swarm best has 1, and u = 0.5. What is its new value?',
            options: ['0.5', '2.5', '3.5', '−1'],
            answer: 0,
            why: 'new = neighbour + u × (best − current) = 2 + 0.5 × (1 − 4) = 2 − 1.5 = 0.5.',
          },
          {
            q: 'Why does DFO skip the best fly when updating?',
            options: ['To save computing time', 'So the best solution found so far is never lost (elitism)', 'Because the best fly has no neighbours', 'Because its fitness is zero'],
            answer: 1,
            why: 'Flies have no memory, so if the best fly moved to a worse place the best answer would be gone.',
          },
          {
            q: 'With Δ = 0, all flies end up with the same value in one dimension, and it is the wrong value. What happens next?',
            options: ['The update equation will gradually fix it', 'Nothing can ever change in that dimension: the gap is 0 and the neighbour has the same value', 'The algorithm crashes', 'The flies restart automatically'],
            answer: 1,
            why: 'new = same + u × (same − same) = same. Only disturbance can inject a new value. This is why Δ exists.',
          },
          {
            q: 'You move from a 2-D test problem to a 50-D real problem with the same Δ. What changes?',
            options: ['Nothing', 'Far more coordinates are restarted per iteration, so the effective amount of disturbance is higher', 'Δ is automatically divided by D', 'The ring topology stops working'],
            answer: 1,
            why: 'Expected restarts per iteration ≈ N × D × Δ. Δ needs re-tuning whenever N or D changes.',
          },
        ]}
      />
    </Lesson>
  )
}
