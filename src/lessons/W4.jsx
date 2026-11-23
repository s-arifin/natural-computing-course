import { Lesson, Section, Callout, Sim, Quiz, Table, Steps, Code } from '../components/ui'
import { Formula, P, V, Frac, Sum } from '../components/Formula'
import { ImageTracker } from '../sims/DfoSims'
import SwarmSim from '../sims/SwarmSim'

export default function W4({ onDone }) {
  return (
    <Lesson
      week="Week 4"
      title="DFO in practice: applying, tuning and tracking"
      subtitle="Week 4 repeated the DFO slides and then set a practical challenge: use DFO to find the brightest part of an image, and keep finding it when the image changes. This lesson is about turning an algorithm you understand into an algorithm you can use."
      time="35 minutes"
    >
      <Section n="1" title="One-minute recap">
        <Steps
          items={[
            ['A fly is a candidate solution', 'A list of D numbers. N flies make the population.'],
            ['Evaluate', 'Put each fly through the fitness function to get one score per fly.'],
            ['Find the leaders', 'The best fly in the swarm (xₛ), and for each fly the better of its two ring neighbours (x_in).'],
            ['Update', 'new = best neighbour + u × (swarm best − current), separately for every dimension, with a fresh random u each time.'],
            ['Disturb', 'With probability Δ, restart a coordinate at random instead of updating it.'],
            ['Repeat', 'Until you run out of budget. Return the best fly.'],
          ]}
        />
        <p>
          The lecture's revision slide asks two things: do you understand the update equation and pseudo-code, and <b>what is disturbance doing?</b>{' '}
          The short answer to the second: it re-injects variety so the swarm can keep discovering. The rest of this lesson shows why that matters
          far more on real tasks than on a tidy benchmark.
        </p>
      </Section>

      <Section n="2" title="From 'a problem' to 'something DFO can solve'">
        <p>
          DFO knows nothing about images, proteins or anything else. It moves lists of numbers around and asks "how good is this list?". Applying
          it is a translation job, and the five-point checklist from week 2 is the translation guide. Here it is for the lab task:
        </p>
        <Table
          head={['Checklist item', 'For "find the brightest area of an image"']}
          rows={[
            ['1. Problem', 'Locate the position in a greyscale image where it is brightest.'],
            ['2. Solution encoding', 'A fly is a pixel location: two numbers (x, y). So D = 2.'],
            ['3. Fitness function', 'The brightness of the pixel at (x, y). We want it large, and DFO minimises, so fitness = −brightness (or flip the comparison signs in the code).'],
            ['4. Search space', 'Every pixel: width × height positions. A 1920 × 1080 image has about 2 million.'],
            ['5. Constraints', '0 ≤ x < width and 0 ≤ y < height. A fly that leaves the image is restarted inside it.'],
          ]}
        />
        <Callout type="key" title="The search space here is small. So why use a swarm?">
          <p>
            Two million pixels could simply be scanned one by one. On a single still image, that brute-force scan is the right tool, and saying so
            is good critical thinking (week 1: "for well-defined problems, look for other techniques first"). The swarm earns its place when:
          </p>
          <ul>
            <li>the image <b>keeps changing</b> (video), so the answer must be re-found continuously and cheaply;</li>
            <li>each fitness check is <b>expensive</b>, so you can afford hundreds of checks but not millions;</li>
            <li>the "image" is really a stand-in for a higher-dimensional space where scanning is impossible.</li>
          </ul>
          <p>The task is a training ground: simple enough to see what the flies are doing, rich enough to expose every tuning issue.</p>
        </Callout>
        <Code title="The only lines that change from last week's code">{`from PIL import Image
import numpy as np

img = np.array(Image.open("input.png").convert("L"))   # "L" = greyscale, values 0..255
H, W = img.shape

def f(x):
    col, row = int(x[0]), int(x[1])     # a fly's two numbers are a pixel position
    return -float(img[row, col])        # minus sign: brightest pixel = lowest fitness

D = 2
lower = [0, 0]
upper = [W - 1, H - 1]                  # different bounds for each dimension`}</Code>
        <Callout type="warn" title="Three bugs almost everybody hits on this task">
          <ul>
            <li><b>Rows and columns the wrong way round.</b> Arrays are indexed [row, column], which is [y, x]. A fly's first number is x.</li>
            <li><b>Forgetting to convert to whole numbers.</b> Fly coordinates are decimals like 103.72; a pixel index must be an integer.</li>
            <li><b>Maximising with a minimiser.</b> If you forget the minus sign, the swarm happily finds the <i>darkest</i> pixel.</li>
          </ul>
        </Callout>
      </Section>

      <Section n="3" title="The challenge, as a live experiment">
        <p>
          The simulator below is the lab task. The grey picture is the image, the flies are candidate pixel positions, and the fitness is the
          brightness beneath each fly. The toggles correspond to the advanced tasks on the slide.
        </p>
        <Sim title="DFO searching an image for the brightest spot" caption="Fitness is re-measured every iteration, so the swarm always sees the current image." wide>
          <ImageTracker />
        </Sim>
        <Callout type="try" title="Work through the lecture's task list">
          <ol>
            <li>
              <b>Tasks 1–2: find it.</b> Let it run. The swarm gathers on the bright blob. Click elsewhere to teleport the blob: with the default Δ,
              the swarm re-finds it.
            </li>
            <li>
              <b>Task 3: change the image half-way.</b> Set Δ to 0. Wait until every fly sits on one point. Now click to move the blob far away.
              The swarm stays where it was, staring at a dark patch. It has no diversity left and cannot react. Raise Δ to 0.02 and it recovers.
            </li>
            <li>
              <b>Task 4: trace a moving object.</b> Switch on the moving object. Try Δ = 0, then 0.01, then 0.1. There is a sweet spot: enough
              scouts to notice the object has moved, not so many that the swarm never concentrates.
            </li>
            <li>
              <b>Task 6: two bright spots.</b> Switch on the second, dimmer spot and press Reset flies several times. Sometimes the swarm settles on
              the dimmer one first. That is a local optimum. With a higher Δ a scout eventually lands on the brighter spot and the swarm migrates.
            </li>
            <li>
              <b>Task 5: fading and emerging.</b> Switch on fading. The "best" location swaps slowly from one spot to the other. Watch whether the
              swarm notices the moment the other spot becomes brighter. With Δ = 0 it never does.
            </li>
          </ol>
        </Callout>
      </Section>

      <Section n="4" title="What the experiment teaches: static versus dynamic problems">
        <p>
          On a fixed benchmark function you might conclude that disturbance is a small tweak. The image task shows it is essential whenever the
          world can change. There are two separate reasons a converged swarm fails after a change:
        </p>
        <div className="grid2">
          <div className="card">
            <h4>Loss of diversity</h4>
            <p>
              All flies are at the same point, so every "gap" in the update equation is zero. Nobody can move, so nobody can discover that
              somewhere else is now better.
            </p>
          </div>
          <div className="card">
            <h4>Outdated information</h4>
            <p>
              The swarm's idea of "the best position" was true for the old image. If fitness values are not re-measured, the flies keep following a
              leader whose score is no longer real. This is why the DFO loop re-evaluates every fly, every iteration.
            </p>
          </div>
        </div>
        <Callout type="deep" title="Why DFO's lack of memory is an advantage here">
          <p>
            Particle Swarm Optimisation (week 8) gives every particle a memory of the best spot it has ever visited. In a changing world those
            memories become lies: a particle is pulled towards a place that <i>used</i> to be bright. PSO needs extra machinery to cope
            (re-evaluating memories, detecting change, resetting). DFO stores only current positions and re-measures them each iteration, so stale
            information clears itself automatically. If your project involves anything that moves or changes over time, this is a point worth
            making, and worth testing rather than just asserting.
          </p>
        </Callout>
        <p>Parameter guidance that falls out of the experiments:</p>
        <Table
          head={['Situation', 'Δ', 'N', 'Why']}
          rows={[
            ['Static, one clear optimum', 'small (≈ 0.001) or 0', 'small', 'Nothing to escape from. Converge fast.'],
            ['Static, many local optima', 'moderate', 'larger', 'Needs scouts to find better basins, and more flies to cover the space.'],
            ['Slowly changing', 'moderate', 'moderate', 'A few scouts are enough to notice gradual drift.'],
            ['Fast changing or jumping', 'high', 'larger', 'Must keep a permanent presence across the whole space.'],
          ]}
        />
      </Section>

      <Section n="5" title="Task 7: 'if the task was to find symmetry, what would your fitness function be?'">
        <p>
          This question is on the slide because it is the real skill being taught: <b>designing a fitness function</b>. There is no brightness to
          read off. You have to invent a number that is small when a candidate is "a good line of symmetry" and large when it is not. Here is one
          way to reason it through, using the checklist.
        </p>
        <Steps
          items={[
            ['What is a candidate solution?', 'A line across the image. A line can be described by two numbers: its angle φ and its distance ρ from the image centre. So a fly is (φ, ρ) and D = 2.'],
            ['What would perfect symmetry look like?', 'If you fold the image along the line, every pixel lands on a pixel of the same brightness.'],
            ['Turn that into a number', 'For a set of pixels, find each one\'s mirror image across the line and measure how different the two brightnesses are. Add up (or average) those differences. Perfect symmetry gives 0; no symmetry gives a large number.'],
            ['Make it cheap', 'Checking every pixel for every fly is slow. Check a random sample of pixels instead. (This idea, a partial evaluation, is the heart of next week\'s algorithm, SDS, which your lecturer has used for exactly this symmetry problem.)'],
          ]}
        />
        <Formula
          title="One possible symmetry fitness function"
          legend={[
            { k: 'f', sym: 'f(φ, ρ)', name: 'Fitness of one candidate line', desc: 'The line is defined by its angle φ (phi) and offset ρ (rho). Lower fitness = more symmetric. 0 = perfectly symmetric.' },
            { k: 'avg', sym: '(1/K) Σ', name: 'Average over K sampled pixels', desc: 'Pick K pixels (all of them, or a random sample). For each, compute the term on the right. Add them up and divide by K.' },
            { k: 'I', sym: 'I(pₖ)', name: 'Brightness at pixel pₖ', desc: 'I for "intensity". pₖ is the k-th sampled pixel.' },
            { k: 'Im', sym: 'I(pₖ′)', name: 'Brightness at its mirror image', desc: 'pₖ′ is where pₖ lands when reflected across the candidate line.' },
            { k: 'abs', sym: '| … |', name: 'Absolute difference', desc: 'The vertical bars mean "ignore the sign". We care how different the two brightnesses are, not which one is bigger.' },
          ]}
          plain="For a sample of pixels, compare each one with its reflection across the proposed line, and average how much they differ."
        >
          <P k="f"><V>f</V>(φ, ρ)</P>
          <span className="op">=</span>
          <P k="avg"><Frac n="1" d="K" /><Sum from="k = 1" to="K" /></P>
          <P k="abs">|</P> <P k="I"><V>I</V>(<V sub="k">p</V>)</P> − <P k="Im"><V>I</V>(<V sub="k">p</V>′)</P> <P k="abs">|</P>
        </Formula>
        <Callout type="warn" title="Fitness functions can be gamed">
          <p>
            This fitness has a loophole: a line through a plain, empty corner of the image scores a perfect 0, because blank mirrors blank.
            Optimisers are ruthless at finding loopholes like this. You would need to add a term that rewards lines with actual content on both
            sides. Spotting and closing loopholes in your own fitness function is the kind of thing "critical discussion" marks are awarded for.
          </p>
        </Callout>
      </Section>

      <Section n="6" title="How to tune and report properly">
        <p>
          The marking scheme awards separate marks for <i>understanding</i> the parameters, for <i>adjusting and fine-tuning</i> them, and for the{' '}
          <i>quality of the results</i>. That is 30% of the report for doing the following well.
        </p>
        <Steps
          items={[
            ['Change one thing at a time', 'Hold N, D and the budget fixed and vary only Δ across a range, e.g. 0, 0.0001, 0.001, 0.01, 0.1. Then fix Δ and vary N. If you change two things at once you cannot say which one caused the difference.'],
            ['Repeat every setting many times', 'DFO is random. One run is an anecdote. Use at least 10, ideally 30, independent runs per setting.'],
            ['Report the centre and the spread', 'Give the median or mean of the final fitness and the standard deviation or best/worst. A setting with a slightly worse average but far smaller spread may be the better choice: it is more reliable.'],
            ['Give every setting the same budget', 'Compare using the same number of fitness evaluations, not the same number of iterations. A swarm of 100 uses ten times as many evaluations per iteration as a swarm of 10.'],
            ['Plot convergence curves', 'Best fitness against evaluations, on a logarithmic vertical axis. The shape tells a story a final number cannot: fast then flat means premature convergence; steady decline means still improving.'],
            ['Explain, do not just list', 'For each result say why it happened in terms of exploration and exploitation. "Δ = 0 converged fastest but reached the global optimum in only 3 of 30 runs, because with no disturbance the swarm cannot leave the first basin it enters."'],
          ]}
        />
        <Sim title="Tuning sandbox" caption="Use this to build intuition for how Δ and N interact on different landscapes before you run real experiments." wide>
          <SwarmSim algo="dfo" defaultFn="ackley" defaultN={30} />
        </Sim>
        <Callout type="cw" title="Ideas the lecture points to for mini-projects">
          <p>
            The week 4 slides link to the EvoStar conference tracks as inspiration: games (level generation, game-playing agents), image analysis
            and pattern recognition, healthcare, sustainability, evolutionary machine learning, and combining evolutionary methods with large
            language models. The past-projects list in week 1 includes knapsack, airfoil shape, battleship target-finding, protein folding, crowd
            simulation, UAV path planning and image reconstruction. Whatever you choose, the structure is always the same: define the encoding,
            design the fitness function, pick and tune an algorithm, compare against a baseline, and discuss honestly what worked and what did not.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'For the brightest-spot task, what does one fly represent and what is D?',
            options: ['A brightness value; D = 1', 'A pixel position (x, y); D = 2', 'The whole image; D = width × height', 'A colour; D = 3'],
            answer: 1,
            why: 'A candidate answer to "where is it brightest?" is a location, which takes two numbers.',
          },
          {
            q: 'With Δ = 0 the swarm has converged on the bright spot. The spot then jumps elsewhere. Why does the swarm not follow?',
            options: ['The fitness function stopped working', 'All flies share one position, so every update gives that same position again and nobody samples anywhere new', 'The ring topology broke', 'The best fly is not updated'],
            answer: 1,
            why: 'No diversity means no movement: neighbour + u × (best − current) = same + u × 0.',
          },
          {
            q: 'You compare N = 10 with N = 100, both run for 500 iterations. What is wrong with this comparison?',
            options: ['Nothing', 'The larger swarm used ten times as many fitness evaluations, so it had a much bigger budget', 'Larger swarms always lose', 'Iterations cannot be counted'],
            answer: 1,
            why: 'The fair currency is fitness evaluations. Give both the same number, e.g. 50,000 each.',
          },
          {
            q: 'A setting gives mean final fitness 0.02 but with a standard deviation of 5. What does that tell you?',
            options: ['It is an excellent, reliable setting', 'The results vary enormously from run to run, so it is unreliable and the mean hides bad runs', 'The algorithm is deterministic', 'The fitness function is wrong'],
            answer: 1,
            why: 'A large spread means some runs were far worse than the average suggests. Always report spread alongside the centre.',
          },
          {
            q: 'What is the main risk with the simple symmetry fitness function "average difference between each pixel and its mirror"?',
            options: ['It cannot be computed', 'It can be satisfied trivially, e.g. by a line through a blank region', 'It needs D = 100', 'It only works with PSO'],
            answer: 1,
            why: 'Optimisers exploit loopholes. A fitness function must reward what you actually want, not merely something that happens to correlate with it.',
          },
        ]}
      />
    </Lesson>
  )
}
