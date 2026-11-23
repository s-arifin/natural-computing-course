import { Lesson, Section, Callout, Sim, Quiz, Table, Steps } from '../components/ui'
import { Formula, P, V, Frac, Sum, Sqrt } from '../components/Formula'
import { SearchSpaceCalc, ProteinFold, LandscapeExplorer } from '../sims/Week2Sims'

export default function W2({ onDone }) {
  return (
    <Lesson
      week="Week 2"
      title="Optimisation and fitness functions"
      subtitle="Every algorithm in this module does the same job: it searches for the input that makes one number as small (or as large) as possible. This week is about that number, where it comes from, and the shape of the ground the algorithms have to walk on."
      time="35 minutes"
    >
      <Section n="1" title="What 'optimisation' means">
        <p>
          Optimisation is choosing the best option from a set of options, where "best" is measured by a number. You do it constantly: the quickest
          route to campus, the cheapest phone contract that still has enough data, the revision plan that gets the most marks from the hours you
          have left.
        </p>
        <Callout type="history">
          <p>
            Optimisation became a formal discipline during the Second World War, when British and American scientists were asked to work out how to
            arrange convoys, radar stations and supply lines with limited resources. They called it "operational research". In 1947 George Dantzig
            invented the simplex method for problems where everything is a straight-line relationship. It still runs inside airline and delivery
            scheduling today (the UPS and truck-routing papers cited on your slides are in this tradition). Nature-inspired methods arrived later
            for the problems simplex cannot touch: ones with no neat formula, lots of local traps, or a gigantic number of combinations.
          </p>
        </Callout>
        <p>
          The lecture uses the Gartner analytics model to show where optimisation sits. Think of four questions a company can ask of its data, each
          harder and more valuable than the last:
        </p>
        <Table
          head={['Stage', 'Question', 'Example']}
          rows={[
            ['Descriptive', 'What happened?', 'Sales fell 10% in March.'],
            ['Diagnostic', 'Why did it happen?', 'A competitor cut prices.'],
            ['Predictive', 'What will happen?', 'Sales will fall another 5% in April.'],
            [<b>Prescriptive</b>, <b>How can we make the outcome we want happen?</b>, <b>Set these prices and this stock level to maximise profit. This is optimisation.</b>],
          ]}
        />
      </Section>

      <Section n="2" title="The anatomy of any optimisation problem">
        <p>
          The slide "Generally, an optimisation problem…" lists four parts. Learn these as a checklist, because the lecture's summary slide ("What
          to look for") is the same checklist, and it is the skeleton of the problem section of a report.
        </p>
        <Steps
          items={[
            ['Decision variables', 'The things you are allowed to change. In the bridge example: width and material. In protein folding: the bend angles. A full set of values for all the variables is one candidate solution.'],
            ['Objective (fitness) function', 'A rule that takes one candidate solution and returns one number saying how good it is. This is the only thing the algorithm ever learns about your problem.'],
            ['Direction', 'Are you trying to make that number as small as possible (minimise cost, energy, error) or as large as possible (maximise profit, flow, brightness)?'],
            ['Constraints', 'Rules a solution must obey to be allowed at all. The bridge must not collapse. An angle must lie between −180° and 180°. Two amino acids cannot occupy the same spot.'],
          ]}
        />
        <Callout type="analogy" title="Tuning a radio blindfolded">
          <p>
            You have a radio with several dials (the decision variables). You cannot see anything. All you get is how clear the sound is (the
            fitness). You turn dials, listen, and turn again. You never see "the formula for good reception". That is the situation every algorithm
            in this module is in. It is called <b>black-box optimisation</b>: the fitness function is a sealed box that takes a solution in and
            pushes a score out.
          </p>
        </Callout>
        <Callout type="key" title="Minimise or maximise? It does not matter">
          <p>
            Any maximisation problem becomes a minimisation problem by putting a minus sign in front of the fitness. "Find the brightest pixel" is
            the same as "find the pixel with the lowest value of −brightness". The lecture's algorithms are written as minimisers, so when you
            maximise something, negate it (you will see exactly this in week 4).
          </p>
        </Callout>
        <p>Two words that the lecture uses constantly, pinned down:</p>
        <ul>
          <li>
            <b>Search space</b>: the set of every possible candidate solution. If there are D decision variables, it is a D-dimensional space, and
            each candidate is one point in it.
          </li>
          <li>
            <b>Dimensionality (D)</b>: how many decision variables there are. Not "3D graphics". Just "how many numbers describe one solution".
          </li>
        </ul>
      </Section>

      <Section n="3" title="The lecture's example: protein folding">
        <p>
          A protein is a chain of small units called amino acids. Straight after it is built, the chain folds itself into a specific 3-D shape, and
          the shape decides what the protein does. A wrongly folded protein does not work, and misfolding is involved in diseases such as
          Alzheimer's. So "given the chain, predict the shape" is one of the big problems in biology.
        </p>
        <Callout type="history">
          <p>
            In 1969 Cyrus Levinthal pointed out a paradox: a typical protein could fold in more ways than there are atoms in the universe, so if it
            tried them one by one it would take longer than the universe has existed. Yet real proteins fold in milliseconds. That is what the slide
            means by "more than the lifetime of the universe". Nature is clearly not doing brute-force search, and neither can we. In 2020
            DeepMind's AlphaFold largely cracked structure prediction using deep learning (it won the 2024 Nobel Prize in Chemistry). The{' '}
            <b>toy model</b> on your slides, from Stillinger, Head-Gordon and Hirshfeld in 1993, is far simpler. It is used because it keeps the
            essential difficulty (a huge, bumpy search space) while being small enough to compute by hand.
          </p>
        </Callout>
        <h3>The 2-D AB off-lattice "toy" model, in plain words</h3>
        <ul>
          <li>
            Real proteins use 20 kinds of amino acid. The toy model keeps only two: <b style={{ color: '#f87171' }}>A = hydrophobic</b> (water-hating:
            wants to hide in the middle of the molecule) and <b style={{ color: '#60a5fa' }}>B = hydrophilic</b> (water-loving: happy on the
            outside).
          </li>
          <li>The beads are joined in a chain by rigid bonds, all of length 1. The chain lies flat on a 2-D surface.</li>
          <li>
            "Off-lattice" means beads can sit anywhere, not only on the squares of a grid. So the only freedom is the <b>angle of the bend at each
            inner bead</b>.
          </li>
          <li>
            A chain of n beads has n − 2 inner bends (the two end beads have nothing to bend). So a solution is a list of <b>n − 2 angles</b>, and
            the dimensionality is <b>D = n − 2</b>. The lecture's 5-bead chain has D = 3.
          </li>
        </ul>
        <p>
          Physics says a molecule settles into the shape with the <b>lowest energy</b>, like a ball rolling to the bottom of a valley. So the
          fitness function is the energy, and the task is to <b>minimise</b> it.
        </p>
        <Formula
          title="Fitness function of the toy protein: its energy"
          number="1"
          legend={[
            { k: 'E', sym: 'Energy', name: 'The fitness value', desc: 'One number for the whole folded shape. Lower = more stable = better. This is what the optimiser tries to minimise.' },
            { k: 's1', sym: 'Σ (first)', name: 'Add up over every bend', desc: 'Go through each of the n − 2 bend angles and add together the term that follows.' },
            { k: 'bend', sym: '¼(1 − cos θᵢ)', name: 'Bending cost of one angle', desc: 'When the chain is straight at that bead (θ = 0), cos θ = 1, so the cost is 0. The sharper the bend, the bigger the cost, up to ½ for a complete U-turn. The chain prefers to be straight.' },
            { k: 'th', sym: 'θᵢ', name: 'The i-th bend angle', desc: 'A decision variable. These angles are the only thing the optimiser controls. Allowed range: −180° to 180°.' },
            { k: 's2', sym: 'Σ Σ (second)', name: 'Add up over every pair of non-neighbouring beads', desc: 'i is one bead, j is another bead at least two places further along the chain (j starts at i + 2, because beads that are directly bonded are always exactly 1 apart and there is nothing to optimise).' },
            { k: 'rep', sym: 'rᵢⱼ⁻¹²', name: 'Repulsion: beads cannot overlap', desc: 'r⁻¹² means 1 ÷ r¹². If two beads get close (r below 1), this becomes gigantic. It is a wall that stops beads sitting on top of each other.' },
            { k: 'r', sym: 'rᵢⱼ', name: 'Distance between bead i and bead j', desc: 'Worked out from the angles using ordinary trigonometry (lecture equation 2). You never choose it directly.' },
            { k: 'att', sym: 'C(ξᵢ, ξⱼ) rᵢⱼ⁻⁶', name: 'Attraction between the pair', desc: 'A weaker, longer-range pull (1 ÷ r⁶). It is subtracted, so attraction lowers the energy. How strong it is depends on C.' },
            { k: 'C', sym: 'C(ξᵢ, ξⱼ)', name: 'How much this pair like each other', desc: 'Depends only on the bead types. A–A pair: +1 (strong attraction: hydrophobic beads clump). B–B pair: +0.5 (weak attraction). A–B pair: −0.5 (they repel).' },
          ]}
          plain="Total energy = how much the chain is bent + for every pair of beads, a huge penalty if they overlap minus a reward if they are comfortably close and of types that like each other. Folding well means tucking the A beads together without bending too sharply and without collisions."
        >
          <P k="E">Energy</P>
          <span className="op">=</span>
          <P k="s1"><Sum from="i = 1" to="n − 2" /></P>
          <P k="bend"><Frac n="1" d="4" />(1 − cos <P k="th"><V sub="i">θ</V></P>)</P>
          <span className="op">+</span>4
          <P k="s2"><Sum from="i = 1" to="n − 2" /><Sum from="j = i + 2" to="n" /></P>
          <span className="paren">[</span>
          <P k="rep"><P k="r"><V sub="ij" sup="−12">r</V></P></P>
          <span className="op">−</span>
          <P k="att"><P k="C"><V>C</V>(<V sub="i">ξ</V>, <V sub="j">ξ</V>)</P> <P k="r"><V sub="ij" sup="−6">r</V></P></P>
          <span className="paren">]</span>
        </Formula>
        <Formula
          title="The 'liking' coefficient C"
          number="3"
          legend={[
            { k: 'xi', sym: 'ξᵢ', name: 'Type of bead i, written as a number', desc: '+1 if bead i is A (hydrophobic), −1 if it is B (hydrophilic). ξ is the Greek letter "xi". It is just a label turned into a number so it can go in a formula.' },
            { k: 'xj', sym: 'ξⱼ', name: 'Type of bead j', desc: 'Same idea for the other bead of the pair.' },
            { k: 'C', sym: 'C', name: 'Result', desc: 'Plug in the two types and you get +1, +0.5 or −0.5.' },
          ]}
          plain="A small trick formula that outputs the right attraction strength for each of the three kinds of pair."
          example={
            <>
              A–A: ⅛(1 + 1 + 1 + 5×1×1) = 8/8 = <b>1</b>. &nbsp; B–B: ⅛(1 − 1 − 1 + 5×(−1)×(−1)) = 4/8 = <b>0.5</b>. &nbsp; A–B: ⅛(1 + 1 − 1 + 5×1×(−1)) = −4/8 ={' '}
              <b>−0.5</b>.
            </>
          }
        >
          <P k="C"><V>C</V>(<P k="xi"><V sub="i">ξ</V></P>, <P k="xj"><V sub="j">ξ</V></P>)</P>
          <span className="op">=</span>
          <Frac n="1" d="8" />(1 + <P k="xi"><V sub="i">ξ</V></P> + <P k="xj"><V sub="j">ξ</V></P> + 5 <P k="xi"><V sub="i">ξ</V></P> <P k="xj"><V sub="j">ξ</V></P>)
        </Formula>
        <Callout type="deep" title="What about equation 2, the one with all the sums of cos and sin?">
          <p>
            That formula for r<sub>ij</sub> looks frightening but says something simple: "to find how far apart bead i and bead j are, walk along
            the chain from i to j, adding up each bond's horizontal step (the cos part) and vertical step (the sin part), then use Pythagoras". The
            simulator below does precisely this in six lines of code. You do not need to reproduce it. The lecture itself says: "Do we have to
            create this as part of the mini-project? No!" What you need is to understand that <b>the fitness function turns a list of angles into
            one energy number</b>.
          </p>
        </Callout>
        <Sim title="Fold a toy protein by hand, then let a swarm do it" caption="This is the 'manual fitness value improvement' slide made playable. The energy shown is the lecture's equation 1.">
          <ProteinFold />
        </Sim>
        <Callout type="try">
          <ol>
            <li>With the 5-bead chain, drag the three angle sliders and try to get the energy as low as you can. Notice how a tiny change can send the energy shooting up (two beads got too close: the r⁻¹² wall).</li>
            <li>Press <b>Let a swarm fold it</b>. DFO, which you meet next week, beats your manual effort in a second or two.</li>
            <li>Switch to the 13-bead chain (D = 11). Folding by hand is now hopeless. The swarm still copes.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="4" title="How big is the search space?">
        <p>
          With D = 3 angles, how many candidate shapes are there? If each angle can be any whole number of degrees, there are 360 choices per angle,
          and the choices multiply: 360 × 360 × 360.
        </p>
        <Formula
          title="Size of the search space"
          legend={[
            { k: 'opt', sym: '360 × granularity', name: 'Options per variable', desc: '360 degrees, times how many steps you divide each degree into. Whole degrees: 360. Tenths: 3,600. Hundredths: 36,000.' },
            { k: 'D', sym: 'D', name: 'Dimensionality', desc: 'The number of decision variables. It is the exponent, which is why the size explodes: each extra variable multiplies the total by the number of options.' },
            { k: 'size', sym: 'size', name: 'Number of candidate solutions', desc: 'How many points a brute-force search would have to test.' },
          ]}
          plain="Multiply the number of options for one variable by itself D times."
          example={<>D = 3, whole degrees: 360³ = 46,656,000. D = 11, hundredths of a degree: 36,000¹¹ ≈ 1.3 × 10⁵⁰, which at 100 tests per second takes about 4.17 × 10⁴⁰ years (the figure on the slide).</>}
        >
          <P k="size">size</P>
          <span className="op">=</span>(<P k="opt">360 × granularity</P>)<sup><P k="D"><V>D</V></P></sup>
        </Formula>
        <Sim title="Search-space calculator" caption="Reproduce the numbers on the lecture slides, then push D up and watch brute force die.">
          <SearchSpaceCalc />
        </Sim>
        <Callout type="key" title="The curse of dimensionality">
          <p>
            This explosive growth as D increases has a name: the <b>curse of dimensionality</b>. It is why an algorithm that looks brilliant in a
            2-D animation can fail in 30 dimensions, and why you should always state D when you report results. (The angles are really continuous,
            so the true search space is infinite, which is what the slide's "(360 × ∞)³" is hinting at.)
          </p>
        </Callout>
      </Section>

      <Section n="5" title="Fitness landscapes: seeing the problem as terrain">
        <p>
          Here is the most useful mental picture in the whole module. Take a problem with just two decision variables. Lay them out as the
          east–west and north–south directions on a map. At each point, the fitness value is the <b>height of the ground</b>. You now have a
          landscape of hills and valleys. Minimising means <b>finding the lowest point</b>.
        </p>
        <Table
          head={['Term', 'Meaning on the landscape']}
          rows={[
            [<b>Global minimum</b>, 'The lowest point anywhere. The true best answer.'],
            [<b>Local minimum</b>, 'The bottom of a dip that is not the deepest one. Every direction from here is uphill, so a searcher that only walks downhill is trapped.'],
            [<b>Unimodal</b>, 'Only one dip: the local minimum is the global minimum. Easy.'],
            [<b>Multimodal</b>, 'Many dips. Hard, because of the traps.'],
            [<b>Continuous</b>, 'The surface has no sudden jumps: a small move gives a small change in height.'],
          ]}
        />
        <Callout type="analogy" title="Hiking in thick fog">
          <p>
            You are dropped on a mountain range in fog so thick you can only feel the slope under your boots, and you want the lowest valley. The
            obvious plan, "always step downhill", takes you to the bottom of <i>whatever dip you happen to be in</i>. That is a greedy local
            search, also called hill climbing. Now imagine 30 hikers with radios who can say "it is much lower over here". That is a swarm. The
            simulator shows both.
          </p>
        </Callout>
        <h3>Benchmark functions</h3>
        <p>
          A <b>benchmark function</b> is an artificial landscape with a known formula and a known lowest point. Researchers use a standard set of
          them the way car makers use a standard test track: so that different algorithms can be compared fairly, and so that each algorithm's
          strengths and weaknesses show up on different kinds of terrain. Because you know where the true minimum is, you can measure exactly how
          close an algorithm got, which you cannot do on a real problem.
        </p>
        <Sim title="Walk around the benchmark landscapes in 3-D" caption="Height and colour both show fitness: dark blue valleys are good, yellow peaks are bad. The gold ball marks the best point found." wide>
          <LandscapeExplorer />
        </Sim>
        <Callout type="try">
          <ol>
            <li>On <b>Sphere</b>, drop the hill-climbers. All 30 roll to the middle. One valley, no traps.</li>
            <li>On <b>Rastrigin</b>, drop the hill-climbers again. Each one falls into the nearest dent and stays there. Only the few that started near the centre reach the true minimum.</li>
            <li>Still on Rastrigin, release the DFO swarm. The flies share information, hop between dents, and most of them end up in the central one.</li>
            <li>Try <b>Ackley</b>: far from the centre the ground is almost flat, so hill-climbers get almost no signal about which way to go.</li>
          </ol>
        </Callout>

        <Formula
          title="Benchmark I: the Sphere function"
          legend={[
            { k: 'f', sym: 'f(x)', name: 'Fitness of solution x', desc: 'The height of the landscape at that point.' },
            { k: 'x', sym: 'x', name: 'One candidate solution', desc: 'A list of D numbers: x = (x₁, x₂, …, x_D). Bold or plain, it means "the whole list".' },
            { k: 'sum', sym: 'Σ', name: 'Add up over every dimension', desc: 'd is a counter that starts at 1 and goes up to D. For each d, work out the term on the right, then add all the results together.' },
            { k: 'D', sym: 'D', name: 'Number of dimensions', desc: 'How many numbers are in the list x.' },
            { k: 'xd', sym: 'x_d²', name: 'The d-th number, squared', desc: 'Squaring makes negatives positive, so any move away from 0 in any direction raises the fitness.' },
          ]}
          plain="Square every number in the solution and add the squares together."
          example={<>x = (2, 3, 1) → 2² + 3² + 1² = 4 + 9 + 1 = <b>14</b>. The only way to get 0 is x = (0, 0, 0), the global minimum. Allowed range for each number: −5.12 to 5.12.</>}
        >
          <P k="f"><V>f</V>(<P k="x"><V>x</V></P>)</P>
          <span className="op">=</span>
          <P k="sum"><Sum from="d = 1" to={<P k="D"><V>D</V></P>} /></P>
          <P k="xd"><V sub="d" sup="2">x</V></P>
        </Formula>

        <Formula
          title="Benchmark III: the Rastrigin function"
          legend={[
            { k: 'bowl', sym: 'x_d²', name: 'The bowl', desc: 'The same squared term as Sphere. It gives the overall bowl shape that slopes towards 0.' },
            { k: 'wave', sym: '10 cos(2π x_d)', name: 'The ripples', desc: 'cos goes up and down like a wave. 2π inside it makes the wave repeat exactly once per unit, so there is a dent at every whole number (…, −2, −1, 0, 1, 2, …). The 10 is the height of the ripples. It is subtracted, so where cos is at its peak (whole numbers) the ground is lowest.' },
            { k: 'ten', sym: '+ 10', name: 'A shift', desc: 'Lifts everything up by 10 per dimension so that the lowest point is exactly 0 instead of −10. It does not change the shape.' },
            { k: 'sum', sym: 'Σ', name: 'Add up over every dimension', desc: 'Do the above for each of the D numbers in the solution and total them.' },
          ]}
          plain="A Sphere bowl with a regular egg-box pattern of dents pressed into it. The dents are local minima; the one at the very centre is the deepest."
          example={<>At x = (0, 0): each term is 0 − 10×cos(0) + 10 = 0 − 10 + 10 = 0, so f = <b>0</b>. At x = (1, 0), a neighbouring dent: 1 − 10 + 10 + 0 = <b>1</b>: a local minimum that is close to, but not, the best.</>}
        >
          <V>f</V>(<V>x</V>)
          <span className="op">=</span>
          <P k="sum"><Sum from="d = 1" to="D" /></P>
          <span className="paren">[</span>
          <P k="bowl"><V sub="d" sup="2">x</V></P>
          <span className="op">−</span>
          <P k="wave">10 cos(2π<V sub="d">x</V>)</P>
          <P k="ten"><span className="op">+</span>10</P>
          <span className="paren">]</span>
        </Formula>

        <Formula
          title="Benchmark II: the Ackley function"
          legend={[
            { k: 't1', sym: '−20 exp(−0.2 √…)', name: 'The big central hole', desc: '"exp(something)" means e (≈ 2.718) raised to that power. The square-root part measures how far x is from the centre. Close to the centre this term is about −20 (deep); far away it fades towards 0. That is the funnel.' },
            { k: 'avg1', sym: '(1/D) Σ x_d²', name: 'Average of the squares', desc: 'Add up the squares of the numbers in x, then divide by D. Its square root is roughly "typical distance from 0".' },
            { k: 't2', sym: '− exp((1/D) Σ cos(2π x_d))', name: 'The ripples', desc: 'The average of a cosine wave in each dimension, fed through exp. This adds small regular bumps over the whole surface: the local minima.' },
            { k: 'c', sym: '+ 20 + e', name: 'A shift', desc: 'Two constants (e ≈ 2.718) added so the lowest point comes out as exactly 0. Shape unchanged.' },
          ]}
          plain="A nearly flat, bumpy plain with one deep funnel in the middle. Far from the centre, almost nothing tells you which way the funnel is."
          example={<>At x = (0, 0): −20×exp(0) − exp(1) + 20 + e = −20 − e + 20 + e = <b>0</b>. Range for each number: −32.768 to 32.768.</>}
        >
          <V>f</V>(<V>x</V>)
          <span className="op">=</span>
          <P k="t1">−20 exp<span className="paren">(</span>−0.2 <Sqrt><P k="avg1"><Frac n="1" d="D" /><Sum from="d = 1" to="D" /><V sub="d" sup="2">x</V></P></Sqrt><span className="paren">)</span></P>
          <P k="t2"><span className="op">−</span>exp<span className="paren">(</span><Frac n="1" d="D" /><Sum from="d = 1" to="D" />cos(2π<V sub="d">x</V>)<span className="paren">)</span></P>
          <P k="c"><span className="op">+</span>20 + <V>e</V></P>
        </Formula>
        <Callout type="deep" title="A trap in benchmark testing that strong reports mention">
          <p>
            Sphere, Rastrigin and Ackley all have their best point at the exact centre of the search space, (0, …, 0). Some algorithms have an
            accidental tendency to drift towards the centre, so they look better on these functions than they really are. Careful researchers
            therefore also test on <b>shifted</b> versions (optimum moved somewhere random) and on functions like <b>Schwefel</b> and{' '}
            <b>Rosenbrock</b> whose optimum is elsewhere. If you benchmark in your project, saying you are aware of this "centre bias" is an easy
            piece of critical analysis.
          </p>
        </Callout>
      </Section>

      <Section n="6" title="The five-point checklist">
        <p>The lecture repeats this summary slide three times. That is a strong hint. For any problem you tackle, you should be able to fill in:</p>
        <Table
          head={['', 'Question', 'Protein folding answer']}
          rows={[
            ['1', 'What is the problem to solve?', 'Find the folded shape of a chain of A/B beads.'],
            ['2', 'What is the fitness function?', 'The energy formula (equation 1). Minimise it.'],
            ['3', 'How is a solution encoded?', 'A list of angles (θ₁, …, θ_D) with D = n − 2.'],
            ['4', 'How big is the search space?', '(360 × granularity)^D.'],
            ['5', 'What are the constraints?', 'Each θ in [−180°, 180°); no two beads overlapping.'],
          ]}
        />
        <Callout type="cw" title="This table is the backbone of your report's problem section">
          <p>
            The marking scheme gives 10 marks for "understanding the problem" and 10 for "understanding the relevant parameters". Being able to
            state these five things clearly for <i>your own</i> chosen problem demonstrates the first directly. The hardest and most important one
            is number 2. The lecture says it bluntly in week 5: "the fitness function is the sole link between the algorithm and the problem". If
            your fitness function rewards the wrong thing, the algorithm will faithfully find the wrong thing.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'A toy protein has 9 beads. What is the dimensionality D of the optimisation problem?',
            options: ['9', '8', '7', '18'],
            answer: 2,
            why: 'D = n − 2 = 7. Only the inner beads have a bend angle.',
          },
          {
            q: 'In the energy formula, what is the job of the r⁻¹² term?',
            options: ['It rewards beads for being close', 'It becomes enormous when two beads get too close, preventing overlap', 'It measures how bent the chain is', 'It converts A beads to B beads'],
            answer: 1,
            why: '1 ÷ r¹² explodes as r shrinks below 1. It acts as a wall and enforces the "no overlap" constraint through the fitness itself.',
          },
          {
            q: 'You want to MAXIMISE profit but your optimiser only minimises. What do you do?',
            options: ['Nothing can be done', 'Use fitness = −profit', 'Use fitness = profit²', 'Increase the population size'],
            answer: 1,
            why: 'The point with the lowest −profit is the point with the highest profit.',
          },
          {
            q: 'Which benchmark would you pick to show that an algorithm can escape many regularly spaced local minima?',
            options: ['Sphere', 'Rastrigin', 'A straight line', 'None, benchmarks cannot show this'],
            answer: 1,
            why: 'Rastrigin is the highly multimodal egg-box. Sphere has no local minima to escape from.',
          },
          {
            q: 'Why does an algorithm that only ever accepts better points fail on Rastrigin?',
            options: ['Rastrigin is not continuous', 'It reaches the bottom of the nearest dent, where every small move is uphill, and stops', 'Rastrigin has no minimum', 'It runs out of memory'],
            answer: 1,
            why: 'That is a local minimum. Escaping needs either a temporary step uphill, a big random jump, or information from someone who is somewhere better.',
          },
        ]}
      />
    </Lesson>
  )
}
