import { Lesson, Section, Callout, Sim, Quiz, Table, Steps, Code } from '../components/ui'
import { Formula, P, V, Frac } from '../components/Formula'
import { MiningGame, TextSearch } from '../sims/SdsSims'

export default function W6({ onDone }) {
  return (
    <Lesson
      week="Week 6"
      title="Stochastic Diffusion Search (SDS)"
      subtitle="The first swarm intelligence algorithm, and a different kind of idea from everything so far. DFO and GAs evaluate each candidate fully. SDS asks: what if each agent only checked a tiny part of its candidate, and the swarm did the rest by gossip?"
      time="35 minutes"
    >
      <Section n="1" title="History and the core idea">
        <Callout type="history">
          <p>
            Stochastic Diffusion Search was introduced by <b>Mark Bishop</b> in 1989 as a method for pattern matching (his paper was called
            "Stochastic Searching Networks"). That makes it the earliest swarm intelligence algorithm on the lecture's timeline: SDS 1989, Ant
            Colony Optimisation 1992, Particle Swarm Optimisation 1995, and DFO in 2014. Its natural inspiration is recruitment in social insects:
            some ant species practise "tandem running", where one ant that has found something good leads a single nest-mate directly to it.
            One-to-one, direct communication. (Contrast that with next week's ants, which communicate indirectly by leaving chemical trails.)
          </p>
        </Callout>
        <p>The name describes the algorithm:</p>
        <ul>
          <li><b>Stochastic</b> = involving randomness. Agents test random parts and choose random partners.</li>
          <li><b>Diffusion</b> = spreading. Good hypotheses spread through the population from agent to agent.</li>
          <li><b>Search</b> = it is looking for the best match or the best location.</li>
        </ul>
        <Callout type="key" title="The big idea: partial evaluation">
          <p>
            In DFO or a GA, scoring one candidate means running the <i>whole</i> fitness function. Sometimes that is very expensive: comparing a
            whole template against an image region, or checking a rule against a million records. SDS agents never do the whole job. Each agent
            tests <b>one small randomly chosen piece</b> of its candidate and gets a simple yes or no. One such test is cheap and unreliable. But
            many agents, testing different pieces and then pooling results by talking to each other, add up to a reliable answer.
          </p>
        </Callout>
        <Callout type="analogy" title="Restaurant reviews">
          <p>
            You cannot judge a restaurant by eating its whole menu every night. So each diner orders <b>one random dish</b> and comes away either
            happy or unhappy. Unhappy diners ask a random acquaintance "were you happy tonight? Where did you eat?" and go there tomorrow if the
            answer is yes, or else try somewhere at random. A truly good restaurant makes most diners happy whichever dish they try, so its crowd
            keeps growing. A restaurant with one good dish pleases only the few who happen to order it, so its crowd never holds together. Nobody
            ever evaluated a whole menu, yet the crowd ends up at the best restaurant.
          </p>
        </Callout>
      </Section>

      <Section n="2" title="The mining game">
        <p>The lecture explains SDS with a story. Here it is with the SDS term for each part:</p>
        <Table
          head={['In the story', 'In SDS', 'Meaning']}
          rows={[
            ['A miner', 'An agent', 'One member of the population.'],
            ['A hill', 'A hypothesis (h)', 'One candidate solution. "I think the gold is on hill 4."'],
            ['A seam on the hill', 'A micro-feature', 'One small part of the candidate that can be tested on its own.'],
            ['Mining one random seam for a day', 'Partial function evaluation (the test)', 'A cheap check of one piece of the hypothesis.'],
            ['Happy miner (found gold today)', 'Active agent', 'The test passed.'],
            ['Unhappy miner', 'Inactive agent', 'The test failed.'],
            ['Chatting in the evening', 'Diffusion', 'Hypotheses pass from active agents to inactive ones.'],
          ]}
        />
        <p>
          The miners know there is gold somewhere in the mountain range but have no idea which hill is richest. Their goal is to get as many miners
          as possible onto the best hill. The procedure:
        </p>
        <Steps
          items={[
            ['Initialisation', 'Every miner is sent to a random hill. That hill is the miner\'s hypothesis.'],
            ['Test phase (the day)', 'Each miner digs one randomly chosen seam on their hill. The richer the hill, the more likely that seam has gold. A miner who finds gold is happy (active); otherwise unhappy (inactive).'],
            ['Diffusion phase (the evening)', 'Each unhappy miner picks one other miner at random. If that miner is happy, the unhappy one copies their hill. If that miner is also unhappy, the unhappy one picks a completely new hill at random. Happy miners stay where they are.'],
            ['Repeat', 'Day after day. Miners accumulate on the richest hill.'],
          ]}
        />
        <Sim title="The mining game" caption="The gold bars show each hill's true richness, which is hidden from the miners. They only ever learn 'I found gold today' or 'I did not'." wide>
          <MiningGame />
        </Sim>
        <Callout type="try">
          <ol>
            <li>Use the single-phase button to step through one day slowly: test (dots turn teal or grey), then diffusion (grey dots jump). Then press Run days.</li>
            <li>Watch the chart. The richest hill's line rises in an S-shape: slow at first, then explosively, then levelling off. That is positive feedback: more happy miners there means more recruits.</li>
            <li>The cluster never reaches 100%. Even on an 80% hill, a miner fails 20% of the time and wanders off. Those wanderers are not waste. They are the scouts.</li>
            <li>Press <b>Move the gold</b>. The old cluster dissolves (its miners become unhappy) and a new one forms on the new best hill. No reset, no extra code: the same two rules handle a changing world.</li>
            <li>Lower the best hill's richness towards the others. The cluster becomes smaller and flickers between hills. SDS finds a clear winner easily and a marginal winner with difficulty.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="3" title="The architecture: two phases">
        <Code title="SDS in pseudo-code (lecture version)">{`Initialise agents                       # each gets a random hypothesis
While (stopping condition is not met)
    Test phase:
        each agent tests ONE random micro-feature of its hypothesis
        passed  -> the agent is ACTIVE
        failed  -> the agent is INACTIVE
    Diffusion phase:
        each INACTIVE agent picks a random agent
            if that agent is ACTIVE   -> copy its hypothesis
            if that agent is INACTIVE -> pick a new random hypothesis
End While`}</Code>
        <p>Each phase supplies one half of what a search needs:</p>
        <div className="grid2">
          <div className="card">
            <h4>Test phase</h4>
            <p>
              Produces a <b>Boolean</b> (true/false) per agent, not a number. This is quite unlike DFO, where fitness is a number and flies are
              ranked. In SDS the "fitness" of a hypothesis is never computed directly. It shows up as <i>the proportion of agents at that
              hypothesis who are active</i>.
            </p>
          </div>
          <div className="card">
            <h4>Diffusion phase</h4>
            <p>
              Does two jobs at once. Copying from active agents is <b>exploitation</b> (positive feedback towards good hypotheses). Picking a
              random hypothesis when the chosen agent is inactive is <b>exploration</b>. There is no separate exploration parameter: the balance
              sets itself according to how many agents are currently active.
            </p>
          </div>
        </div>
        <Formula
          title="How good is a hypothesis? Its test score"
          legend={[
            { k: 'a', sym: 'α', name: 'Quality of a hypothesis', desc: 'The probability that an agent holding this hypothesis passes a randomly chosen test. In the mining game it is the hill\'s richness (e.g. 0.8).' },
            { k: 'ok', sym: 'matching micro-features', name: 'How many parts check out', desc: 'Count the pieces of the hypothesis that would pass the test.' },
            { k: 'all', sym: 'all micro-features', name: 'How many parts there are', desc: 'The total number of pieces that could be tested.' },
          ]}
          plain="The quality of a hypothesis is the fraction of its parts that are correct. A perfect hypothesis passes every test (α = 1). Agents never calculate α. They just experience it as how often they come away active."
          example={<>Searching for "SIB": the position holding "SIB" has α = 3/3 = 1. A position holding "SIV" has α = 2/3, so an agent there is active two times out of three.</>}
        >
          <P k="a">α</P>
          <span className="op">=</span>
          <Frac n={<P k="ok">number of matching micro-features</P>} d={<P k="all">total number of micro-features</P>} />
        </Formula>
      </Section>

      <Section n="4" title="The lecture's text-search example">
        <p>
          Task: find the 3-letter model <b>S-I-B</b> inside a 16-letter search space, using 4 agents. Here a <b>hypothesis</b> is a starting
          position (a number from 0 to 13), and a <b>micro-feature</b> is one of the three letters.
        </p>
        <p>What the lecture's four tables show, in words:</p>
        <Table
          head={['Iteration', 'Agent positions', 'What happened']}
          rows={[
            ['1', '12, 9, 2, 3', 'Random start. Each agent compares one of its three letters with the same letter of the model. All four fail (✗). In diffusion, each asks a random agent, finds it inactive, and jumps to a new random position.'],
            ['2', '6, 10, 0, 5', 'Agent 1 has landed on position 6 (S-I-B). It tests its 2nd letter: "I" = "I". Active (✓). The others fail. In diffusion, agent 2 happens to ask agent 1 and copies position 6. Agents 3 and 4 ask inactive agents and go random.'],
            ['3', '6, 6, 1, 4', 'Agents 1 and 2 are both at 6 and both pass. Now two of the four are active, so an inactive agent has a much better chance of asking an active one.'],
            ['4', '6, 6, 6, 6', 'All four agents are at position 6. Whichever letter each one tests, it matches. The swarm has converged on the answer.'],
          ]}
        />
        <Callout type="key" title="Notice what never happened">
          <p>
            No agent ever compared all three letters. No agent ever scanned the text from left to right. The correct position won because it is the
            only place where an agent is active <i>every</i> time, so agents that arrive there never leave, while agents everywhere else keep
            getting dislodged.
          </p>
        </Callout>
        <Sim title="SDS text search, phase by phase" caption="The strip shows the search space. Small bars under a letter are agents whose hypothesis covers it (teal = active). A highlighted outline marks letters being tested." wide>
          <TextSearch />
        </Sim>
        <Callout type="try">
          <ol>
            <li>It starts in the lecture's exact starting state (agents at 12, 9, 2, 3). Alternate the two phase buttons and follow the right-hand column to see who asked whom.</li>
            <li>Look for a <b>false positive</b>. Position 11 reads O-L-<b>B</b>: its third letter matches the model's third letter. An agent there that happens to test letter 3 becomes active even though the position is wrong. It may even recruit someone. But next round it probably tests letter 1 or 2, fails, and leaves. Mistakes correct themselves.</li>
            <li>Change the search space to <code>ABABABABABSIBABAB</code> or add a near-miss such as "SIV" somewhere. Near-misses hold agents for a while (α = 2/3) but lose to the full match (α = 1).</li>
            <li>Raise the number of agents to 12. Convergence is faster and steadier.</li>
          </ol>
        </Callout>
      </Section>

      <Section n="5" title="Going deeper">
        <Callout type="deep" title="Why SDS can be efficient">
          <p>
            Checking every position fully costs (number of positions) × (model length) comparisons. In SDS each agent does <b>one</b> comparison
            per iteration, whatever the model length. For a 3-letter word in 16 letters the saving is nil. For a 10,000-pixel template in a
            10-megapixel image, or a hypothesis that must be checked against millions of data records, it is enormous. SDS is at its best when the
            fitness function can be <b>broken into many independent partial tests</b>. If your fitness is one indivisible number (like the Sphere
            function), plain SDS does not directly apply.
          </p>
        </Callout>
        <Callout type="deep" title="Variations you may see in the SDS tutorial paper">
          <ul>
            <li><b>Passive recruitment</b> (the lecture's version): inactive agents go looking for an active agent to copy.</li>
            <li><b>Active recruitment</b>: active agents go looking for inactive agents to convert.</li>
            <li><b>Context-sensitive</b> variants: an active agent that meets another active agent with the same hypothesis lets go and explores, which stops the whole swarm locking onto one answer and helps it track several good answers or a changing one.</li>
          </ul>
        </Callout>
        <p>SDS is also one of the few swarm algorithms with a proper mathematical analysis: it has been proved to converge to the best hypothesis under stated conditions, and the expected size of the stable cluster can be calculated. That is unusual in this field, where most algorithms are justified only by experiments.</p>
        <Table
          head={['', 'SDS', 'DFO', 'GA']}
          rows={[
            ['An agent holds', 'A hypothesis and an active/inactive flag', 'A position', 'A chromosome'],
            ['Evaluation', 'Partial: one micro-feature, yes/no', 'Full fitness, a number', 'Full fitness, a number'],
            ['Communication', 'One-to-one, direct, with a random agent', 'Ring neighbours and swarm best', 'Through crossover'],
            ['Exploration comes from', 'Random hypothesis when recruitment fails', 'Disturbance Δ', 'Mutation'],
            ['Best suited to', 'Search and matching where fitness splits into parts', 'Continuous optimisation', 'Discrete/structured optimisation'],
          ]}
        />
        <Callout type="cw" title="Using SDS in a project">
          <p>
            The lecture lists applications in medical imaging (spotting metastases in bone scans, microcalcifications in mammograms), feature
            selection, symmetry detection, and generative art and music. A powerful pattern from your lecturer's papers is the <b>hybrid</b>: use
            SDS to decide <i>where</i> to concentrate effort and another algorithm (DFO, PSO, DE) to do the fine optimisation there. If you take
            that route, the thing to explain clearly is your choice of hypothesis and micro-feature, because that pairing is the whole design. Code
            is at github.com/mohmaj/SDS.
          </p>
        </Callout>
      </Section>

      <Quiz
        onDone={onDone}
        questions={[
          {
            q: 'What makes SDS fundamentally different from DFO and GAs?',
            options: ['It uses a population', 'Agents evaluate only a randomly chosen part of their hypothesis, getting a yes/no result', 'It has a fitness function', 'It was invented more recently'],
            answer: 1,
            why: 'Partial evaluation is the defining feature. (SDS is actually the oldest of the three swarm algorithms, from 1989.)',
          },
          {
            q: 'In the diffusion phase, an inactive agent picks a random agent who turns out to be inactive too. What does the first agent do?',
            options: ['Copies that agent anyway', 'Stays where it is', 'Picks a completely new random hypothesis', 'Becomes active'],
            answer: 2,
            why: 'This is where exploration comes from in SDS.',
          },
          {
            q: 'In the mining game, what does a "seam" correspond to?',
            options: ['An agent', 'A hypothesis', 'A micro-feature: one testable part of a hypothesis', 'The diffusion phase'],
            answer: 2,
            why: 'Hill = hypothesis, seam = micro-feature, mining one seam = partial evaluation.',
          },
          {
            q: 'An agent is at a position reading "SXB" while searching for "SIB". How often will it be active?',
            options: ['Never', 'About one time in three', 'About two times in three', 'Always'],
            answer: 2,
            why: 'Two of the three letters match, so a random letter test passes with probability 2/3. It is a decent but imperfect hypothesis.',
          },
          {
            q: 'Why does the cluster on the best hill never include every single miner?',
            options: ['A bug in the algorithm', 'Unless the hill is 100% rich, some miners fail their test each day and leave; these act as scouts', 'Miners dislike crowds', 'The diffusion phase forbids it'],
            answer: 1,
            why: 'Only a perfect hypothesis (α = 1) holds agents permanently. The leak of agents keeps the swarm adaptive.',
          },
        ]}
      />
    </Lesson>
  )
}
