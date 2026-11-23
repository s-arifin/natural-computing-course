import { Lesson, Section, Callout, Sim, Table, Steps, Quiz } from '../components/ui'
import Arena from '../sims/Arena'

export function ArenaPage({ onDone }) {
  return (
    <Lesson
      week="Lab"
      title="Algorithm Arena: comparing optimisers fairly"
      subtitle="Learning outcome 4 is 'evaluate the performance of nature-inspired algorithms'. That is a skill of its own, separate from knowing how the algorithms work. This page is a small laboratory for practising it."
      time="20 minutes"
    >
      <Section n="1" title="What a fair comparison needs">
        <Steps
          items={[
            ['Same problem, same dimensions', 'Results in 2-D say little about 30-D. State the function and D.'],
            ['Same budget, counted in fitness evaluations', 'The fitness function is normally the expensive part, so evaluations are the fair unit of cost. Iterations are not: one iteration of a 100-member population costs 100 evaluations.'],
            ['Many independent runs', 'Every algorithm here is stochastic. A single run can be lucky or unlucky. 30 runs is the usual standard; 10 is a minimum.'],
            ['Report centre and spread', 'Median or mean, plus standard deviation, best and worst. The median is safer when a few runs go badly wrong.'],
            ['Include a baseline', 'Random search costs nothing to implement. If your algorithm cannot clearly beat it, something is wrong with the algorithm, the settings or the fitness function.'],
            ['Tune each algorithm reasonably', 'Comparing a carefully tuned algorithm with a badly configured rival proves nothing.'],
          ]}
        />
      </Section>
      <Section n="2" title="Run your own experiment">
        <Sim title="The arena" caption="All algorithms get the same function, dimensions, population size and evaluation budget." wide>
          <Arena />
        </Sim>
        <Callout type="try" title="Experiments worth running">
          <ol>
            <li><b>Sphere, D = 10.</b> Everything except random search does well. Easy problems do not separate algorithms.</li>
            <li><b>Rastrigin, D = 10, then D = 30.</b> Rankings can change as D grows. Note which algorithms degrade gracefully.</li>
            <li><b>Rosenbrock, D = 10.</b> The variables are linked (a curved valley), which suits DE's difference vectors and is harder for methods that treat each dimension separately.</li>
            <li><b>Schwefel.</b> The best valley is in a far corner. Greedy, fast-converging settings do badly.</li>
            <li><b>Tune DFO.</b> On Rastrigin with D = 30 compare Δ = 0, 0.001 and 0.01. You are doing a parameter study.</li>
            <li><b>Turn on hill climbers.</b> On Sphere they are competitive. On Rastrigin they are stuck. A baseline tells you how hard a problem really is.</li>
          </ol>
        </Callout>
      </Section>
      <Section n="3" title="How to read a convergence plot">
        <Table
          head={['Shape of the curve', 'What it means']}
          rows={[
            ['Drops steeply, then goes flat well above zero', 'Premature convergence: the population lost diversity and is stuck in a local optimum.'],
            ['Declines steadily and is still falling at the end', 'Still improving. A larger budget would give a better answer.'],
            ['Flat for a long time, then a sudden drop', 'A lucky discovery (for DFO, often a disturbance) found a better basin.'],
            ['Barely declines at all', 'Too much exploration (or random search): it is not exploiting what it finds.'],
          ]}
        />
        <p>
          The vertical axis is logarithmic because fitness values often span many orders of magnitude (from 100 down to 0.000001). On an ordinary
          axis everything after the first few iterations would look like a flat line at zero.
        </p>
        <Callout type="deep" title="Is the difference real? Statistical tests">
          <p>
            If algorithm A has median 0.8 and B has 1.1 over ten runs, is A better, or was it chance? Published studies answer this with a
            statistical test, most often the <b>Wilcoxon rank-sum test</b>, which does not assume the results follow a bell curve. It gives a
            p-value: below 0.05 is conventionally taken as a real difference. You do not need to do the maths by hand
            (<code>scipy.stats.ranksums</code> does it in one line), but mentioning that you checked significance is a clear marker of a careful
            evaluation.
          </p>
        </Callout>
      </Section>
      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'Why are fitness evaluations a fairer budget than iterations?',
            options: ['They are easier to count', 'Different population sizes use different numbers of evaluations per iteration, and evaluations are usually the real cost', 'Iterations are random', 'They are not fairer'],
            answer: 1,
            why: 'A population of 100 does ten times the work per iteration of a population of 10.',
          },
          {
            q: 'Algorithm A beats B in a single run. What can you conclude?',
            options: ['A is better', 'B is better', 'Very little: both are stochastic, so many runs and a measure of spread are needed', 'The benchmark is broken'],
            answer: 2,
            why: 'One run is one sample from a random process.',
          },
          {
            q: 'A convergence curve drops fast then stays flat at a fitness of 12 on Rastrigin (true minimum 0). Diagnosis?',
            options: ['Solved', 'Premature convergence into a local minimum', 'Too much exploration', 'Not enough dimensions'],
            answer: 1,
            why: 'Fast drop plus early plateau above the optimum is the signature of lost diversity.',
          },
        ]}
      />
    </Lesson>
  )
}

export function Toolkit() {
  return (
    <Lesson
      week="Reference"
      title="Coursework toolkit and cheat sheet"
      subtitle="What the brief asks for, how the things you have learned map onto the marking scheme, and every formula from the module on one page."
    >
      <Section n="1" title="What the brief actually asks for">
        <Table
          head={['Part', 'Weight', 'What it is']}
          rows={[
            ['A. Wiki', '40%', 'A weekly entry of about 150 words: a summary of your reading plus the output and description of your experiments. Two weeks are chosen at the end and marked.'],
            ['B. Report', '60%', '1,800 words including references, in the LaTeX template, plus a 3–5 minute video and your code. Apply one or more natural computing techniques to a problem, ideally comparing against others.'],
          ]}
        />
        <Callout type="warn" title="Check your deadline">
          <p>
            The specification PDF in your project folder gives the submission deadline as <b>Monday 23 November 2026, 17:00 UK time</b>. Confirm
            the date on Moodle today so you know exactly how much time you have.
          </p>
        </Callout>
        <Callout type="warn" title="The AI rules for this assessment">
          <p>
            The brief permits generative AI for <b>learning support, planning, brainstorming, clarification, feedback and language improvement</b>
            , which is what this course is. It does <b>not</b> permit AI to generate substantive assessment content: "all analysis, arguments,
            calculations, interpretations and the final submission must be your own work". You must also include a 100–150 word AI reflection
            before the references saying which tools you used, how they supported your learning, how you transformed the outputs, and how you
            verified them. So use this course to understand, then run your own experiments and write your own words.
          </p>
        </Callout>
      </Section>

      <Section n="2" title="Marking scheme mapped to what you now know">
        <Table
          head={['Report criterion', 'Marks', 'Where in this course', 'What demonstrates it']}
          rows={[
            ['Understanding the problem', '10', 'Week 2 checklist', 'State problem, encoding, fitness function, search-space size and constraints for your problem.'],
            ['Reading and referencing papers', '10', 'Reference list in each lecture PDF', 'Cite the original algorithm paper and papers applying it to problems like yours. Harvard style.'],
            ['Quality of the papers\' summary', '10', 'History sections', 'Say what each paper did, found, and how it relates to your work. Do not just list them.'],
            ['Running of the code', '10', 'Code blocks in weeks 3, 4, 8', 'It runs, and the video shows it running.'],
            ['Understanding the parameters', '10', 'Parameter tables in each week', 'Explain each parameter as an exploration/exploitation dial.'],
            ['Adjusting and fine-tuning', '10', 'Week 4 section 6; Arena', 'A systematic study: one parameter at a time, several values, many runs.'],
            ['Quality of the results', '10', 'Arena', 'Convergence plots, tables with median and spread, a baseline.'],
            ['Advanced features', '10', '"Going deeper" boxes', 'A hybrid, a variant, a dynamic problem, a second algorithm, a statistical test.'],
            ['Coherent summary + critical discussion', '10', 'Week 1 limitations; No Free Lunch', 'What worked, what did not, why, and what you would change.'],
            ['Writing, referencing, LaTeX', '10', '–', 'Clear structure, figures with captions, consistent notation.'],
          ]}
        />
        <p>For the wiki (per marked week): understanding the problem 20, reading and referencing 20, helpful visualisations 30, quality of the implementation of the weekly task 30. Visualisations and implementation are 60% of it, so screenshots and plots from your own runs matter more than long text.</p>
      </Section>

      <Section n="3" title="Which algorithm for which kind of problem">
        <Table
          head={['Your solution is…', 'Examples', 'Natural choices']}
          rows={[
            ['A list of real numbers', 'Angles, weights, coordinates, shape parameters, neural-network weights', 'DFO, PSO, DE'],
            ['An ordering or a route', 'TSP, scheduling, sequencing', 'ACO, GA with permutation operators'],
            ['A set of yes/no choices', 'Knapsack, feature selection', 'GA with bit strings (or a continuous optimiser with thresholding)'],
            ['A location to be found by matching', 'Pattern in text or image, symmetry axis', 'SDS, possibly hybridised with DFO'],
            ['Something that changes over time', 'Tracking, dynamic environments', 'DFO with higher Δ, SDS'],
          ]}
        />
      </Section>

      <Section n="4" title="Cheat sheet: every formula in one place">
        <Table
          head={['Week', 'Formula', 'In words']}
          rows={[
            ['2', 'size = (360 × granularity)^D', 'Search-space size for D angles.'],
            ['2', 'Sphere: f(x) = Σ x_d²', 'Sum of squares. Unimodal. Min 0 at the origin. Range ±5.12.'],
            ['2', 'Rastrigin: f(x) = Σ [x_d² − 10 cos(2π x_d) + 10]', 'Bowl plus egg-box ripples. Highly multimodal. Range ±5.12.'],
            ['2', 'Ackley: f(x) = −20 exp(−0.2 √(Σx_d²/D)) − exp(Σcos(2πx_d)/D) + 20 + e', 'Flat bumpy plain with a central funnel. Range ±32.768.'],
            ['2', 'Energy = Σ ¼(1 − cos θᵢ) + 4 ΣΣ [rᵢⱼ⁻¹² − C·rᵢⱼ⁻⁶]', 'Toy protein: bending cost + pairwise repulsion/attraction. C = 1 (AA), 0.5 (BB), −0.5 (AB).'],
            ['3', 'x_id(0) = x_min + r (x_max − x_min)', 'Random initialisation within bounds.'],
            ['3', 'x_id(t+1) = x_in,d(t) + u (x_sd(t) − x_id(t))', 'DFO update: best neighbour + random step along (swarm best − me).'],
            ['3', 'if U(0,1) < Δ: restart x_id', 'DFO disturbance.'],
            ['5', 'p(xᵢ) = f(xᵢ) ÷ Σ f(xₙ)', 'Roulette-wheel selection probability.'],
            ['6', 'α = matching micro-features ÷ all micro-features', 'SDS: probability an agent at a hypothesis is active.'],
            ['7', 'p₁ = (m₁+k)^h ÷ [(m₁+k)^h + (m₂+k)^h]', 'Goss double-bridge model. k ≈ 20, h ≈ 2.'],
            ['7', 'p_k(r,s) = T(r,s)^α H(r,s)^β ÷ Σ_c T(r,c)^α H(r,c)^β', 'ACO transition rule. H = 1/distance.'],
            ['7', 'T(r,s) ← ρ T(r,s) + Σ_k A_k(r,s),  A_k = 1/L_k', 'ACO pheromone update: evaporate, then deposit.'],
            ['8', 'v = χ v + c₁r₁(p − x) + c₂r₂(g − x);  x = x + v', 'PSO. χ = 0.72984, c₁ = c₂ ≈ 1.496.'],
            ['8', 'v = x_best + F (x_r1 − x_r2)', 'DE/best/1 mutation. F = 0.5.'],
            ['8', 'u_j = v_j if r ≤ CR or j = r_d, else x_j', 'DE binomial crossover. CR = 0.5.'],
            ['8', 'x(g+1) = u if f(u) ≤ f(x), else x', 'DE selection.'],
          ]}
        />
      </Section>

      <Section n="5" title="Glossary">
        <Table
          head={['Term', 'Meaning']}
          rows={[
            ['Agent / individual / fly / particle / chromosome / ant', 'One member of the population. Usually one candidate solution (in ACO, a builder of one).'],
            ['Fitness function (objective function)', 'Maps a candidate solution to one number saying how good it is.'],
            ['Search space', 'The set of all candidate solutions.'],
            ['Dimensionality (D)', 'How many numbers describe one solution.'],
            ['Global / local optimum', 'The best point anywhere / the best point in its immediate surroundings.'],
            ['Unimodal / multimodal', 'One optimum / many optima.'],
            ['Exploration / exploitation', 'Searching new regions / refining around known good ones.'],
            ['Premature convergence', 'The population collapses onto a poor solution too early.'],
            ['Diversity', 'How spread out the population is.'],
            ['Stochastic', 'Involving randomness.'],
            ['Heuristic / metaheuristic', 'A rule of thumb with no optimality guarantee / a general-purpose heuristic search strategy.'],
            ['U(0, 1)', 'A random number between 0 and 1, all values equally likely.'],
            ['arg min', '"The input that gives the smallest output": which one is best, not how good it is.'],
            ['Σ (sigma)', 'Add up the following term for every value of the counter.'],
            ['∈', '"Is a member of".'],
            ['←', '"Is set to" (assignment).'],
            ['Elitism', 'Guaranteeing the best solution survives unchanged.'],
            ['Topology', 'Who can communicate with whom (ring, global, …).'],
            ['Stigmergy', 'Indirect communication through changes to the environment.'],
            ['Micro-feature', 'In SDS, one independently testable part of a hypothesis.'],
            ['NP-hard', 'No known method solves it exactly without the time exploding as it grows.'],
            ['No Free Lunch', 'No algorithm is best across all possible problems.'],
          ]}
        />
      </Section>
    </Lesson>
  )
}
