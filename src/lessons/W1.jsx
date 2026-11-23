import { Lesson, Section, Callout, Sim, Quiz, Table, Steps } from '../components/ui'
import { Formula, P, V } from '../components/Formula'
import Boids from '../sims/Boids'

export default function W1({ onDone }) {
  return (
    <Lesson
      week="Week 1"
      title="Natural Computing: why copy nature at all?"
      subtitle="Before any algorithm, you need the one idea the whole module rests on: some problems are too big to solve by checking every answer, and nature has spent billions of years finding good-enough answers to exactly that kind of problem."
      time="25 minutes"
    >
      <Section n="1" title="What ordinary computing is good at, and where it stops">
        <p>
          A normal program is a recipe. You tell the computer every step, and it follows them. The lecture lists the three things this style of
          computing needs. The task must be <b>well-defined</b> (you can state exactly what the right answer looks like), it must finish in a{' '}
          <b>reasonable time</b>, and it must be <b>predictable</b> (same input, same output).
        </p>
        <p>
          Sorting a list, adding up a bank balance, drawing a web page: all three boxes are ticked. The lecture asks whether these requirements are
          "drawbacks or advantages". The honest answer is both. They are an advantage because you can trust the result. They become a drawback the
          moment a problem refuses to fit in the boxes, and there are two ways a problem can refuse.
        </p>
        <Table
          head={['Kind of hard problem', 'What goes wrong', 'Lecture examples']}
          rows={[
            [
              <b>Well-defined but computationally hard</b>,
              'You know exactly what a good answer is. There are just far too many candidate answers to try them all.',
              'Travelling Salesman Problem, DNA sequence assembly, bin packing, chess, Go',
            ],
            [
              <b>Hardly predictable, dynamic</b>,
              'The problem itself keeps changing while you solve it, so a fixed recipe written in advance is out of date before it finishes.',
              'Robots moving in the real world, business planning, stock trading',
            ],
          ]}
        />
        <Callout type="example" title="How bad is 'far too many'?">
          <p>
            Take the Travelling Salesman Problem (TSP): visit every city once and return home, using the shortest total route. With 4 cities there
            are 3 different round trips. Easy. But the count grows as a <b>factorial</b>:
          </p>
          <Table
            head={['Cities', 'Different round trips', 'Time at one billion checks per second']}
            rows={[
              ['5', '12', 'instant'],
              ['10', '181,440', 'instant'],
              ['15', '43,589,145,600', '44 seconds'],
              ['20', '60,822,550,204,416,000', '1.9 years'],
              ['25', '310,224,200,866,619,719,680,000', '9.8 million years'],
              ['30', 'about 4.4 × 10³⁰', '140 trillion years: about 10,000 times the age of the universe'],
            ]}
          />
          <p>
            Going from 20 to 30 cities did not make the problem 50% harder. It made it impossible. This is called <b>combinatorial explosion</b>,
            and it is the reason this module exists.
          </p>
        </Callout>
        <Callout type="deep" title="What 'NP-hard' actually means">
          <p>
            You will see "NP-hard" on the slides. In plain terms: for an NP-hard problem, nobody has ever found a method that is guaranteed to give
            the perfect answer without the running time exploding as the problem grows, and most computer scientists believe no such method exists.
            It does <i>not</i> mean "impossible". It means "give up on <b>guaranteed-perfect</b>, aim for <b>very good, quickly</b>". An algorithm
            that aims for good-enough answers without a guarantee is called a <b>heuristic</b>, and a general-purpose heuristic that can be pointed
            at many different problems is called a <b>metaheuristic</b>. Every algorithm in this module (DFO, GA, SDS, ACO, PSO, DE) is a
            metaheuristic.
          </p>
        </Callout>
      </Section>

      <Section n="2" title="The alternatives, and why nature is one of them">
        <p>The lecture mentions three ways people try to escape these limits. It helps to see they are different kinds of thing:</p>
        <ul>
          <li>
            <b>Quantum computing</b> changes the <i>hardware</i>: it uses superposition and entanglement so that certain calculations take far fewer
            steps.
          </li>
          <li>
            <b>Biological computing</b> also changes the hardware: it uses real molecules such as DNA and proteins to store and process data.
          </li>
          <li>
            <b>Natural computing</b>, the subject of this module, keeps your ordinary laptop and changes the <i>method</i>. It borrows the{' '}
            <b>strategy</b> that living systems use, and runs that strategy as normal code.
          </li>
        </ul>
        <Callout type="history">
          <p>
            The idea is older than most people expect. In 1948 Alan Turing wrote about "genetical or evolutionary search". In the 1960s John Holland
            in Michigan and Ingo Rechenberg in Berlin independently turned evolution into working optimisers; Rechenberg famously evolved the shape
            of a bent pipe and a jet nozzle by mutating physical prototypes, which is the "design a tube with a bend for maximum flow" example on
            your slides. In 1987 Craig Reynolds showed that realistic bird flocks appear from three tiny rules (you will play with them below). In
            1989 Mark Bishop published Stochastic Diffusion Search, then came ant colonies (1991–92), particle swarms (1995) and, much later, your
            lecturer's own Dispersive Flies Optimisation (2014).
          </p>
        </Callout>
        <p>Two sources of inspiration are named on the slides:</p>
        <div className="grid2">
          <div className="card">
            <h4>Brains → neural networks</h4>
            <p>
              A brain is <b>parallel</b> (billions of neurons at once), <b>associative</b> (one memory triggers another), able to <b>learn</b>,{' '}
              <b>redundant</b> (lose some neurons and it still works) and <b>self-organising</b> (nobody wires it by hand). Artificial neural
              networks copy this. They are covered elsewhere in your degree; here they are just evidence that copying nature works.
            </p>
          </div>
          <div className="card">
            <h4>Evolution → evolutionary algorithms</h4>
            <p>
              Three operations, shown on the slide with lists of 0s and 1s: <b>mutation</b> (one individual changes a little, e.g. [0,1,1,0] →
              [0,1,1,1]), <b>crossover</b> (two individuals swap parts) and <b>selection</b> (the better ones are more likely to have children).
              Week 5 is entirely about this.
            </p>
          </div>
        </div>
        <Callout type="key" title="When should you reach for a nature-inspired method?">
          <p>The lecture's "half-way summary" is the rule to remember. Use these methods when:</p>
          <ol>
            <li>
              <b>Knowledge about the problem is limited or missing.</b> You cannot write a formula for the answer; all you can do is try a candidate
              and measure how good it was.
            </li>
            <li>
              <b>The number of possible solutions is (almost) infinite.</b> Trying them all is out of the question.
            </li>
          </ol>
          <p>
            The bridge example fits both: you choose width, material and so on (endless combinations), you want minimum cost, and you have
            constraints (it must carry n vehicles and must not collapse). There is no formula that outputs "the best bridge". You can only propose
            a design and test it.
          </p>
        </Callout>
      </Section>

      <Section n="3" title="Swarm intelligence: clever groups of simple individuals">
        <p>The lecture gives this definition from Bonabeau, Dorigo and Theraulaz (1999):</p>
        <blockquote>"An emergent collective intelligence of groups of simple agents."</blockquote>
        <p>Read it one word at a time, because each word is doing work:</p>
        <ul>
          <li>
            <b>Simple agents</b>: each individual (an ant, a bird, a "fly" in DFO) follows a handful of rules and has no idea what the group is
            trying to achieve.
          </li>
          <li>
            <b>Collective</b>: the useful behaviour belongs to the group, not to any one member.
          </li>
          <li>
            <b>Emergent</b>: the group behaviour is not written down anywhere in the rules. It <i>appears</i> when many agents interact.
          </li>
        </ul>
        <Callout type="analogy" title="A Mexican wave">
          <p>
            In a stadium, every person follows one rule: "stand up just after the person beside you stands up, then sit down". Nobody is in charge.
            Nobody can see the whole stadium. Yet a wave travels round it. The wave is emergent: you will not find it by examining one spectator.
            An ant colony finding the shortest path to food is the same thing with a more useful result.
          </p>
        </Callout>
        <p>The lecture lists four key features. Here is what each one buys you:</p>
        <Table
          head={['Feature', 'Meaning', 'Why it matters']}
          rows={[
            ['Distributed control', 'No leader, no central plan.', 'There is no single point of failure.'],
            ['Localised communication', 'Each agent only talks to, or senses, a few neighbours.', 'It scales: adding agents does not overload anyone.'],
            ['Emergence / self-organisation', 'Global order arises from local interactions.', 'You get complex behaviour from very little code.'],
            ['Robust and adaptive', 'Lose some agents, or change the environment, and the swarm carries on.', 'Exactly what the "dynamic, unpredictable" problems need.'],
          ]}
        />
        <Sim
          title="Emergence in action: Reynolds' flocking rules"
          caption="Each triangle is a bird that can only see nearby birds. The colour shows which way it is heading, so a patch of one colour is a group that agrees."
          wide
        >
          <Boids />
        </Sim>
        <Callout type="try">
          <ol>
            <li>
              Press <b>No rules</b>. The birds are a gas: the order score sits near 0. This is what "simple agents, no interaction" looks like.
            </li>
            <li>
              Press <b>All three rules</b> and wait ten seconds. Flocks form and the order score climbs towards 1. You did not program a flock. You
              programmed three local rules.
            </li>
            <li>
              Press <b>No alignment</b>. You get clumps that jiggle but go nowhere. Each rule contributes something different.
            </li>
            <li>
              Shrink the vision radius to its minimum. Order collapses: with too little communication there is no collective behaviour.
            </li>
          </ol>
        </Callout>
      </Section>

      <Section n="4" title="Self-organisation: the four ingredients">
        <p>
          The slide titled "How does self-organisation come to emerge?" is the most important one in week 1, because every algorithm later in the
          module is a different mixture of these same ingredients. If you can name them in your report and point to where each one lives in your
          chosen algorithm, you are showing real understanding.
        </p>
        <Steps
          items={[
            [
              'Positive feedback (amplification)',
              'Success attracts more of the same. An ant trail with more pheromone attracts more ants, who lay more pheromone. In an optimiser this is "move towards whoever is doing well". It makes the swarm converge.',
            ],
            [
              'Negative feedback (stabilisation)',
              'Something that pushes back so amplification does not run away. Pheromone evaporates; food runs out; birds keep a minimum distance. In an optimiser this stops everyone piling onto the first decent answer.',
            ],
            [
              'Randomness (fluctuation)',
              'Mistakes and random wandering. It looks like noise, but it is the only way new options are ever discovered. An ant that loses the trail may stumble on a shorter one.',
            ],
            [
              'Multiple interactions',
              'Agents must affect each other, directly (talking) or through the environment (leaving marks). One ant does nothing interesting. Information has to flow.',
            ],
          ]}
        />
        <Callout type="key" title="Exploration versus exploitation">
          <p>
            These ingredients pull in two directions, and the slide names the tension. <b>Exploitation</b> means using what you already know: search
            close to the best answer found so far (driven by positive feedback). <b>Exploration</b> means looking somewhere new (driven by
            randomness). Too much exploitation and the swarm gets stuck on a mediocre answer. Too much exploration and it never settles on anything:
            it is just random guessing.
          </p>
          <p>
            <b>Every parameter you will tune in this module is a dial between these two.</b> DFO's disturbance threshold, a GA's mutation rate,
            ACO's evaporation rate, PSO's coefficients: all of them. When your coursework asks you to "understand the relevant parameters", this is
            the lens to use.
          </p>
        </Callout>
        <Callout type="analogy" title="Choosing where to eat">
          <p>
            You are in a new city for a month. Exploitation is going back to the good restaurant you found on day two. Exploration is trying
            somewhere unknown. Only exploit, and you never find out there was a brilliant place round the corner. Only explore, and you eat a lot of
            bad meals. Sensible people explore a lot in week one and exploit more in week four. Good optimisers do the same.
          </p>
        </Callout>
      </Section>

      <Section n="5" title="The limits: why this is not magic">
        <p>The lecture is honest about limitations, and a critical report should be too:</p>
        <ul>
          <li>
            <b>Nature compromises.</b> Evolution produces "good enough to survive", not "perfect". So do these algorithms. You get a good answer
            with no proof that it is the best one.
          </li>
          <li>
            <b>Nature sometimes fails.</b> Species go extinct. A swarm can converge on a poor answer and stay there (this is called{' '}
            <b>premature convergence</b>).
          </li>
          <li>
            <b>We simulate, we do not replicate.</b> A "fly" in DFO is three lines of arithmetic. It is a metaphor that helped someone design an
            algorithm, not a model of a real insect.
          </li>
          <li>
            <b>For well-defined problems, look elsewhere first.</b> If an exact method exists (sorting, shortest path on a small map, a linear
            programme), use it. Do not use a swarm to sort a list.
          </li>
        </ul>
        <Formula
          title="The No Free Lunch theorem (Wolpert & Macready, 1997), in symbols"
          legend={[
            { k: 'sum', sym: 'Σ', name: 'Add up over every possible problem', desc: 'Imagine the list of every fitness function that could ever exist, sensible or completely random, and total the results across all of them.' },
            { k: 'perf', sym: 'Perf', name: 'How well an algorithm did', desc: 'Any performance measure you like, e.g. the best fitness found after a fixed number of tries.' },
            { k: 'A', sym: 'A', name: 'One search algorithm', desc: 'Say, DFO.' },
            { k: 'B', sym: 'B', name: 'Any other search algorithm', desc: 'Say, a genetic algorithm. Or pure random guessing.' },
            { k: 'f', sym: 'f', name: 'One particular problem', desc: 'A single fitness function from that enormous list.' },
          ]}
          plain="Averaged over every conceivable problem, all search algorithms perform exactly the same. Any algorithm that is better than another on some problems must be worse on others."
        >
          <P k="sum"><span className="bigop"><span className="bigop-sym">Σ</span><span className="bigop-from">all f</span></span></P>
          <P k="perf">Perf</P>(<P k="A"><V>A</V></P>, <P k="f"><V>f</V></P>)
          <span className="op">=</span>
          <P k="sum"><span className="bigop"><span className="bigop-sym">Σ</span><span className="bigop-from">all f</span></span></P>
          <P k="perf">Perf</P>(<P k="B"><V>B</V></P>, <P k="f"><V>f</V></P>)
        </Formula>
        <Callout type="cw" title="How to use No Free Lunch in a report">
          <p>
            The lecture set "read about the No Free Lunch theorem" as a task, so referring to it correctly earns credit. The practical meaning is:{' '}
            <b>there is no best algorithm, only a best algorithm for a given kind of problem.</b> That is why (a) you must test on your actual
            problem instead of assuming, (b) comparing your technique against another one is valuable (the brief says it "would be ideal"), and (c)
            a claim like "DFO is better than PSO" is meaningless unless you add "on this problem, with these settings". Real problems are not
            random, they have structure (nearby solutions tend to have similar quality), which is why good algorithms do beat random search in
            practice.
          </p>
        </Callout>
      </Section>

      <Section n="6" title="How to design a nature-inspired system">
        <p>The lecture ends with the three-step recipe every algorithm in this module followed:</p>
        <Steps
          items={[
            ['Detect the analogy', 'Notice something in nature that solves a problem: ants find short paths, flies gather over food, giraffes with longer necks survive.'],
            ['Design a realistic model', 'Strip it down to a few rules you can write as maths. Throw away everything that is not needed. (Real ants have six legs. The algorithm does not care.)'],
            ['Implement and apply', 'Code it, then point it at a real problem by writing a fitness function for that problem. Week 2 is about exactly this step.'],
          ]}
        />
        <p>
          The lecture also poses a debate: are evolutionary methods part of swarm intelligence? There is no official answer. A fair position: both
          are <b>population-based metaheuristics</b>. In evolutionary methods individuals are <i>replaced</i> by their children and interact through
          reproduction. In swarm methods individuals <i>persist</i> and move, interacting through communication. Algorithms like Differential
          Evolution (week 8) sit awkwardly in between, which is the point of the debate.
        </p>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'A delivery company must plan one route through 60 addresses. Why is checking every possible route not an option?',
            options: ['Computers cannot store 60 addresses', 'The number of routes grows factorially, so it exceeds what any computer could check in the lifetime of the universe', 'The problem is not well-defined', 'Routes cannot be compared with each other'],
            answer: 1,
            why: 'The problem is perfectly well-defined (shortest total distance). It is computationally hard because of combinatorial explosion: (n−1)!/2 routes.',
          },
          {
            q: 'In the flocking simulator, where in the code is the instruction "form a flock"?',
            options: ['In the cohesion rule', 'In the alignment rule', 'Nowhere. The flock emerges from three local rules', 'In a hidden leader bird'],
            answer: 2,
            why: 'That is what "emergent" means: the global pattern is not stated in any individual rule.',
          },
          {
            q: 'Pheromone evaporating from an ant trail is an example of which self-organisation ingredient?',
            options: ['Positive feedback', 'Negative feedback', 'Multiple interactions', 'Distributed control'],
            answer: 1,
            why: 'Evaporation pushes back against amplification. Without it, the first trail found would be reinforced forever, even if a better one existed.',
          },
          {
            q: 'A swarm quickly gathers around a mediocre solution and never improves. Which statement describes this?',
            options: ['Too much exploration', 'Too much exploitation (premature convergence)', 'The No Free Lunch theorem', 'The problem is not NP-hard'],
            answer: 1,
            why: 'Everyone rushed towards the early leader (exploitation) and nobody was left looking elsewhere (exploration).',
          },
          {
            q: 'What does the No Free Lunch theorem imply for your mini-project?',
            options: ['Nature-inspired algorithms never work', 'You should always use the newest algorithm', 'No algorithm is best on every problem, so you must test and compare on your own problem', 'Random search is always the best choice'],
            answer: 2,
            why: 'Performance depends on the match between algorithm and problem. Evidence from experiments on your problem is the only way to know.',
          },
        ]}
      />
    </Lesson>
  )
}
