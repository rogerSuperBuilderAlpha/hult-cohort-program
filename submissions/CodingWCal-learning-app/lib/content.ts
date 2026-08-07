export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  body: string[];
  code?: string;
  quiz: QuizQuestion[];
};

export type Module = {
  slug: string;
  title: string;
  tagline: string;
  lessons: Lesson[];
};

export const APP_NAME = "AI OnRamp";
export const APP_TAGLINE =
  "From first prompt to ethical practice — a hands-on introduction to AI and machine learning.";

export const COURSE_MODULES: Module[] = [
  {
    slug: "understanding-ai",
    title: "Understanding AI",
    tagline: "What AI actually is — and isn't.",
    lessons: [
      {
        slug: "what-is-ai",
        title: "What is AI?",
        minutes: 4,
        body: [
          "Artificial intelligence is software that performs tasks that traditionally required human judgment: recognizing images, understanding language, predicting outcomes, and generating new content. It is not a single technology, but a collection of techniques and products built on them.",
          "The key shift: traditional software follows explicit rules written by developers (if this, then that). AI systems learn patterns from data instead of being handed rules. That's both their superpower and the reason they need guardrails.",
          "Three words you will see everywhere: AI (the broad field), machine learning (the technique of learning patterns from data), and deep learning (machine learning using large neural networks). People often say 'AI' when they mean any of the three. This course will teach all of them from the ground up.",
          "A useful first habit: when you hear 'AI can do X,' translate it to 'some software can approximate X given enough examples and compute.' That translation keeps expectations honest.",
        ],
        quiz: [
          {
            prompt: "What is the main difference between traditional software and AI systems?",
            options: [
              "Traditional software is faster",
              "AI systems learn patterns from data instead of following explicit rules",
              "AI systems do not use code",
              "There is no difference",
            ],
            answer: 1,
            explain:
              "Traditional software encodes rules directly; AI systems infer patterns from data, which is why they generalize to new inputs in ways hand-written rules cannot.",
          },
          {
            prompt: "Which term describes 'machine learning using large neural networks'?",
            options: ["Artificial general intelligence", "Deep learning", "Robotics", "Natural language"],
            answer: 1,
            explain:
              "Deep learning is machine learning built on large neural networks — most modern AI products run on it.",
          },
        ],
      },
      {
        slug: "ml-down-the-stack",
        title: "Machine learning down the stack",
        minutes: 5,
        body: [
          "Machine learning takes a dataset — a collection of examples — and finds patterns in it. Instead of saying 'an image with these pixels is a cat,' we show the model thousands of labeled images and let it figure out the visual features that separate cats from dogs.",
          "There are a few flavors. In supervised learning, examples come with labels (a photo + 'cat'), so the model learns a mapping from input to answer. In unsupervised learning, there are no labels — the model finds structure on its own, like grouping customers by behavior. In reinforcement learning, an agent learns by taking actions and receiving rewards or penalties, like a chess engine improving through self-play.",
          "For most practical, everyday AI — including the tools engineers use — supervised learning is the workhorse. The model approximates a function from input to output based on the examples it has seen.",
        ],
        quiz: [
          {
            prompt: "Your model learns animal photos labeled 'cat' or 'dog.' What type of learning is this?",
            options: [
              "Unsupervised",
              "Reinforcement",
              "Supervised",
              "Generative",
            ],
            answer: 2,
            explain:
              "Labels are present, so the model learns a mapping from input to answer — the defining property of supervised learning.",
          },
        ],
      },
      {
        slug: "ai-in-daily-life",
        title: "AI in daily life — find the pattern",
        minutes: 5,
        body: [
          "You already use AI every day: email spam filters classify messages, streaming services recommend the next video, maps apps predict arrival times, and your camera chooses the right exposure. Each one is a small model solving a narrow task — not a single 'AI brain' running everything.",
          "Once you start looking, the pattern is everywhere: a system that decides, predicts, or generates something from data is almost certainly a model underneath. Spotting the model changes how you debug the product: bad suggestions are usually bad data or a mismatched task, not a mystery.",
          "Practice exercise: next time a product surprises you — a weird recommendation, a wrong auto-caption, a spam folder mistake — ask three questions. What task was it trying to solve? What data shaped its answer? Where would you add a rule or a human check to fix it?",
        ],
        quiz: [
          {
            prompt: "A music app 'likes' songs you skip. What is the model doing?",
            options: [
              "Generating new songs",
              "Predicting your preference from listening behavior",
              "Downloading music",
              "Running a text search",
            ],
            answer: 1,
            explain:
              "It infers a preference pattern from your behavior — a prediction task, not generation.",
          },
        ],
      },
      {
        slug: "history-of-ai",
        title: "A short history of AI",
        minutes: 4,
        body: [
          "AI has been 'ten years away' for over sixty years. The field began in the 1950s with chess programs and theorem provers, went through two brutal winters — funding crashes when hype outran capability — and kept quietly advancing: spam filters, credit scores, speech recognition, route planning.",
          "The modern wave arrived with deep learning. Around 2012, neural networks trained on GPUs crushed previous benchmarks in image recognition. The same recipe scaled — more data, more compute, larger networks — until language models became chat-worthy products in the 2020s.",
          "Every hype cycle teaches the same lesson: capabilities arrive on a different timetable than promised. The engine behind today's image generators and coding assistants is the same one that has powered your spam filter for fifteen years: pattern learning at scale.",
          "Use history as calibration. When you read 'AI can now do X,' ask which part is pattern matching (plausible today) and which part is genuine reasoning or understanding (still an open research question).",
        ],
        quiz: [
          {
            prompt: "What pattern has repeated throughout AI's history?",
            options: [
              "Hype cycles where expectations run ahead of capability",
              "AI steadily working exactly as promised",
              "Capability always arriving before funding",
              "Researchers avoiding publicity",
            ],
            answer: 0,
            explain:
              "Every wave of AI has swung between inflated promises and quiet, incremental progress — 'winters' follow hype every time.",
          },
          {
            prompt: "What was deep learning's breakthrough recipe?",
            options: [
              "Smarter hand-written rules",
              "More data, more compute, and larger neural networks",
              "Faster chess engines",
              "Smaller datasets with cleaner labels",
            ],
            answer: 1,
            explain:
              "Deep learning won by scaling the same learning loop — more data, more compute, bigger networks — until pattern recognition crossed useful thresholds.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-ai-works",
    title: "How AI Works",
    tagline: "Training, data, and the math behind the magic.",
    lessons: [
      {
        slug: "training-and-data",
        title: "Training, data, and the learning loop",
        minutes: 6,
        body: [
          "Training is a loop. Start with a model whose parameters are random. Feed it a batch of examples, let it make predictions, measure how wrong it was (the loss), then nudge the parameters to reduce that error. Repeat millions of times. That loop — predict, measure, adjust — is the entire engine of learning.",
          "Data quality determines everything. If the data is biased, incomplete, or duplicated, the model learns those flaws. A famous rule of thumb: 'garbage in, garbage out.' Models do not discover truth; they compress the patterns present in their training data.",
          "After training, we evaluate on data the model never saw (a test set). A model that memorized its training examples but fails on new ones is overfit. Measuring on held-out data is how we know whether the model actually learned general patterns.",
        ],
        code: `// The training loop, simplified
for (let epoch = 0; epoch < EPOCHS; epoch++) {
  for (const example of batch) {
    const prediction = model.forward(example.input);
    const loss = measureError(prediction, example.label);
    model.backprop(loss);        // how wrong were we?
    model.step();                // nudge weights to reduce loss
  }
}`,
        quiz: [
          {
            prompt: "Why do we evaluate models on data they never saw during training?",
            options: [
              "To make training faster",
              "To check the model generalizes rather than memorizing",
              "To find better labels",
              "We don't need to",
            ],
            answer: 1,
            explain:
              "A held-out test set reveals whether the model learned general patterns or simply memorized its training examples (overfitting).",
          },
          {
            prompt: "What does 'garbage in, garbage out' mean for machine learning?",
            options: [
              "Models crash on bad input",
              "The model inherits the flaws of its training data",
              "Clean code fixes bad data",
              "Models ignore bad examples",
            ],
            answer: 1,
            explain:
              "Models compress patterns from data — biased, incomplete, or duplicated data produces flawed behavior.",
          },
        ],
      },
      {
        slug: "neural-networks",
        title: "Neural networks without the woo",
        minutes: 7,
        body: [
          "A neural network is a stack of simple arithmetic operations: multiply inputs by weights, add a bias, push the result through a nonlinearity, and repeat. Layers of these operations compose into extremely flexible functions able to approximate almost any input→output relationship.",
          "The 'deep' in deep learning just means many layers. Each layer transforms its input into a slightly more abstract representation: a vision model might first detect edges, then shapes, then faces. The network discovers its own feature hierarchy — no human tells it what to look for.",
          "The magic ingredient is scale and compute plus the backpropagation algorithm, which efficiently computes how much each weight contributed to the error so it can be adjusted. Nothing mystical — just a very large, tuned, differentiable function.",
        ],
        quiz: [
          {
            prompt: "What does 'deep' in deep learning refer to?",
            options: [
              "Deep understanding of the problem",
              "Many layers of the network",
              "Deep datasets",
              "Deep neural activity",
            ],
            answer: 1,
            explain:
              "'Deep' refers to the number of layers — each layer builds a more abstract representation on top of the previous one.",
          },
        ],
      },
      {
        slug: "generative-ai",
        title: "Generative AI and large language models",
        minutes: 6,
        body: [
          "Large language models (LLMs) like the one you may be talking to are trained on vast amounts of text to predict the next token — essentially, to continue a sequence. Trained at enough scale, this simple objective produces systems that can summarize, write, translate, and reason across topics.",
          "Chatting to an LLM is not like querying a database. The model has no memory of what it does not see in its context, and it can be confidently wrong (hallucination). It is a next-token predictor with an excellent turn of phrase, not a source of ground truth.",
          "That reframing is the single most useful mental model for using generative AI well: verify facts, treat outputs as drafts, and remember the chatbot is generating plausible text, not reciting stored answers.",
        ],
        quiz: [
          {
            prompt: "What is the fundamental objective an LLM is trained on?",
            options: [
              "Predicting the next token in a sequence",
              "Scraping websites",
              "Answering truthfully",
              "Passing exams",
            ],
            answer: 0,
            explain:
              "LLMs are trained to predict the next token. This simple objective scaled up yields their remarkable — but imperfect — abilities.",
          },
        ],
      },
      {
        slug: "embeddings-and-search",
        title: "Embeddings, search, and meaning",
        minutes: 6,
        body: [
          "Computers don't understand words, but they can measure similarity. An embedding model converts text into a long list of numbers (a vector) arranged so that similar meanings sit close together. 'Kitten' and 'puppy' end up near each other; 'kitten' and 'tax audit' do not.",
          "This unlocks real products: semantic search (find the document that means the same thing, not just contains the keyword), deduplication, clustering, and recommendation. You don't need an LLM at all — embedding similarity is cheap, fast, and often the right tool.",
          "The trick to keep straight: embeddings measure statistical similarity in language, not truth. Two documents can be near-identical in style and tone while one is completely wrong. Similarity is a routing signal, not a quality judgment.",
        ],
        code: `// Semantic search in a few lines
const queryVector = embed("how do I reset my password?");
const results = documents
  .map((doc) => ({ doc, score: cosineSimilarity(queryVector, doc.vector) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);`,
        quiz: [
          {
            prompt: "What does an embedding model map text to?",
            options: [
              "A single number from 0 to 100",
              "A vector where similar meanings are close together",
              "A database row",
              "A web URL",
            ],
            answer: 1,
            explain:
              "Embeddings place text in a vector space where semantic similarity corresponds to distance.",
          },
        ],
      },
      {
        slug: "llms-and-transformers",
        title: "Large language models and transformers",
        minutes: 6,
        body: [
          "Large language models are built on the transformer, an architecture (2017) that processes text as a stream of tokens — short word fragments — all at once rather than word by word. The heart is attention: each token looks at every other token and decides how much it matters.",
          "Attention is why transformers scale. Because every token can reference every other token directly, the model tracks long-range patterns — who is doing what in a sentence — without the information loss of reading left to right.",
          "Generation is a loop: predict the next token, append it, repeat. That loop runs on probabilities — the model does not 'know' an answer; it produces the most likely continuation. That is why the same prompt can produce different outputs (sampling) and why confident-sounding text can still be wrong.",
          "Two dials matter in practice. Temperature controls randomness: low for predictable tasks, higher for creative ones. Context length is how much text the model can 'see' at once — its working memory, not its education.",
        ],
        code: `// The heart of a transformer: self-attention (simplified)
function attention(query, keys, values) {
  const weights = keys.map((k) => dot(query, k)); // similarity scores
  const probs = softmax(weights);                  // normalize to 0..1
  return blend(values, probs);                     // weighted summary
}`,
        quiz: [
          {
            prompt: "What lets a transformer track long-range patterns in text?",
            options: [
              "Reading text left to right only",
              "Attention: each token can reference every other token",
              "Bigger training sets",
              "Faster hardware",
            ],
            answer: 1,
            explain:
              "Attention lets any token look directly at any other token, so long-range relationships survive without word-by-word information loss.",
          },
          {
            prompt: "Why can the same prompt produce different answers?",
            options: [
              "The model is broken",
              "The context window changed",
              "Generation samples from next-token probabilities",
              "The training data changed",
            ],
            answer: 2,
            explain:
              "Text generation picks the next token probabilistically (especially with higher temperature), so the same prompt can continue differently each run.",
          },
        ],
      },
    ],
  },
  {
    slug: "applying-ai",
    title: "Applying AI",
    tagline: "Choose the right tool, ask the right questions.",
    lessons: [
      {
        slug: "pick-the-right-tool",
        title: "Pick the right tool for the job",
        minutes: 5,
        body: [
          "AI is not one tool; it is a menu. Classification models sort inputs into categories, regression predicts numbers, embeddings compare meaning, and generative models create content. Before reaching for an LLM, ask: what kind of task am I solving?",
          "A common mistake is using a large generative model for a task a small, cheap classifier does better — or vice versa. Match the capability to the task: need to detect spam? A classifier. Need to draft a proposal? A generator.",
          "Cost and latency matter too. Bigger models are more capable but slower and pricier. For many production tasks, a compact model fine-tuned on your data beats a frontier model used generically.",
        ],
        quiz: [
          {
            prompt: "You need to label emails as 'urgent' or 'not urgent.' Most fitting AI approach?",
            options: [
              "A generative model writing text",
              "A classification model",
              "An embedding output",
              "Reinforcement learning",
            ],
            answer: 1,
            explain:
              "Sorting inputs into categories is classification — a fast, cheap, and reliable approach for discrete labels.",
          },
        ],
      },
      {
        slug: "prompting",
        title: "Prompting as a skill",
        minutes: 6,
        body: [
          "Prompting is how you steer a generative model. The best prompts are specific about the role, context, format, and constraints. 'Write a report' produces far worse output than 'You are a data analyst. Summarize these numbers for a non-technical stakeholder in three bullet points, flagging the biggest risk.'",
          "Iterate. Real prompting is a conversation: refine the request, ask for alternatives, demand the model explain its reasoning, and push back on weak drafts. Treat the first output as a rough draft, not an answer.",
          "Give the model room to work. Provide examples in the prompt (few-shot prompting), split hard problems into smaller steps (chain-of-thought), and ask it to reconsider when an answer feels wrong.",
        ],
        code: `// A repeatable prompt template
const prompt = \`You are a data analyst.
Audience: non-technical stakeholder.
Task: summarize the numbers below in 3 bullets.
Flag: the single biggest risk. Keep it under 150 words.

Data: \${JSON.stringify(data)}\`;

const draft = await model(prompt);
// then: "Which assumption would break this conclusion?"`,
        quiz: [
          {
            prompt: "Which prompt is most likely to produce a useful response?",
            options: [
              "'Write about our results.'",
              "'You are a data analyst summarizing results for executives with a recommendation and risks in under 150 words.'",
              "'Make it good.'",
              "'Do the report thing.'",
            ],
            answer: 1,
            explain:
              "A concrete role, audience, format, and constraints steer the model toward useful, on-target output.",
          },
          {
            prompt: "What is 'few-shot prompting'?",
            options: [
              "Asking the model to work fast",
              "Providing examples in the prompt",
              "Restricting the model to one answer",
              "Prompting with a timer",
            ],
            answer: 1,
            explain:
              "Few-shot prompting shows the model examples of the desired output pattern inside the prompt itself.",
          },
        ],
      },
      {
        slug: "grounded-ai",
        title: "Grounded answers: RAG and retrieval",
        minutes: 6,
        body: [
          "A raw LLM answers from memory and invents freely. Grounding fixes that: instead of asking the model directly, you first search your own documents (often with embeddings), then hand the model only the relevant passages and ask it to answer from them.",
          "This pattern — retrieval-augmented generation, or RAG — is how most production AI assistants actually work. The model becomes a summarizer of your knowledge base instead of a maker-up of facts. Citations become possible because you know which source each answer came from.",
          "RAG has limits: if the right passage isn't retrieved, the model quietly answers from memory anyway. The engineering work is in retrieval quality: chunking documents well, indexing with good embeddings, and testing which queries fail.",
        ],
        quiz: [
          {
            prompt: "Why does RAG reduce hallucinations?",
            options: [
              "It makes the model bigger",
              "The model answers from retrieved passages instead of memory",
              "It disables generation",
              "It encrypts the prompt",
            ],
            answer: 1,
            explain:
              "RAG supplies relevant evidence in context, so the model reasons from your documents rather than inventing from memory.",
          },
        ],
      },
      {
        slug: "structured-output-and-tools",
        title: "Structured output and tool calling",
        minutes: 5,
        body: [
          "Text in, text out is fine for chat, but software needs structure. Models can be asked to emit JSON, call functions, or choose from a fixed set of actions — this is what turns an LLM from a toy into a component in a real pipeline.",
          "The pattern: constrain the output format in the prompt, parse it with a schema validator, and treat anything that does not parse as a failed call. Never trust raw model text as data — validate first, then use it.",
          "Tool/function calling goes further: the model returns a structured 'call this function with these arguments' request, your code executes it for real (database query, search, calculator), and the result is fed back into the conversation. That grounding loop is how agents do real work instead of guessing.",
        ],
        code: `const result = await model.chat({
  messages,
  format: "json",                    // ask for structured output
  schema: { intent: "string" },      // describe the shape
});
const parsed = JSON.parse(result.text); // validate — never trust
if (!parsed.intent) throw new Error("bad model output");`,
        quiz: [
          {
            prompt: "Why validate structured model output?",
            options: [
              "To make the model slower",
              "Model text can be confident and wrong; validation catches it before it becomes data",
              "Validation makes prompts longer",
              "You don't need to",
            ],
            answer: 1,
            explain:
              "A model can emit malformed or invented output confidently. Validation and typed parsing catch that before it corrupts your data.",
          },
          {
            prompt: "What does tool calling let a model do?",
            options: [
              "Replace your entire application",
              "Access the internet secretly",
              "Request a function call that your code executes with real results",
              "Choose its own training data",
            ],
            answer: 2,
            explain:
              "The model proposes a structured function call; your code runs it against real systems and feeds the result back. That is how agents take actions.",
          },
        ],
      },
    ],
  },
  {
    slug: "ai-and-the-work",
    title: "AI in Engineering & Coding",
    tagline: "Ship faster without removing your judgment.",
    lessons: [
      {
        slug: "pair-programming",
        title: "AI as a pair programmer",
        minutes: 6,
        body: [
          "The most proven AI-in-engineering flow is a loop: describe the task, let the AI scaffold a draft, review the code line by line, run the tests, and iterate. The AI amortizes boilerplate and reduces the cost of exploring alternatives — but you remain the engineer accountable for the result.",
          "Keep the review bar high. The same 'garbage in, garbage out' law applies to code: an AI that generates plausible-looking but subtly broken code is a real risk. Treat suggestions as a starting point, verify them, and never merge unread code.",
          "Great uses: writing tests for tricky logic, refactoring with a safety net of tests, generating regexes and glue code, explaining unfamiliar codebases, and drafting commit messages. All of these keep you in the loop while letting the model do the grunt work.",
        ],
        quiz: [
          {
            prompt: "What is the right ownership model when AI generates code for you?",
            options: [
              "The AI owns the code",
              "Copy-paste without review for speed",
              "You review and own every line you merge",
              "Only use AI for documentation",
            ],
            answer: 2,
            explain:
              "You remain accountable: AI drafts, you review, test, and own the result. Trust but verify.",
          },
        ],
      },
      {
        slug: "agents-and-context",
        title: "Agents, context, and delegation",
        minutes: 5,
        body: [
          "Beyond single responses, AI agents can chain tools: search the codebase, run tests, edit files, and report back. The closer an agent gets to taking actions on code, the more important boundaries and safeguards become.",
          "Context is the currency. An agent can only reason over what it can see — so give it a precise task, a file map, a runbook of commands, and constraints. Ambiguous or giant context produces unpredictable work.",
          "Start small. Let an agent make one change, review it, then approve the next step. This keeps you steering the direction rather than cleaning up a large autonomous detour.",
        ],
        quiz: [
          {
            prompt: "Why does context matter so much to an AI coding agent?",
            options: [
              "It decides the license",
              "The agent can only reason over what it can see",
              "Agents don't use context",
              "It speeds up compilation",
            ],
            answer: 1,
            explain:
              "Agents reason over the context they're given; precise context and stepwise control produce predictable, reviewable work.",
          },
        ],
      },
      {
        slug: "testing-with-ai",
        title: "AI-assisted testing: keep the loop safe",
        minutes: 6,
        body: [
          "Tests are where AI assistance pays for itself. Ask the model to enumerate edge cases you might have missed, generate test inputs, and draft assertions — then review each one. A test that encodes the wrong expectation is worse than no test.",
          "A practical pattern is test-first delegation: write the test, let the AI implement until green, then review the diff. The test defines the contract; the model fills in the implementation; your review keeps the contract honest.",
          "Watch for tests that always pass for the wrong reason: missing assertions, mocking away the logic under test, or mirroring the buggy implementation. Read generated tests with the same suspicion you'd apply to generated features.",
        ],
        code: `// Test-first delegation loop
1. Write a failing test for the behavior you want
2. Let the AI implement until the test goes green
3. Review the diff — no new mocking, no weakened assertions
4. Add the edge cases the AI missed
5. Re-run the full suite before merge`,
        quiz: [
          {
            prompt: "What is the risk of 'tests that always pass for the wrong reason'?",
            options: [
              "They slow down CI",
              "They give false confidence while missing real bugs",
              "They use too much memory",
              "They can't be reviewed",
            ],
            answer: 1,
            explain:
              "Weak assertions or over-mocking make tests green regardless of behavior — they certify nothing.",
          },
        ],
      },
    ],
  },
  {
    slug: "building-with-ai",
    title: "Building with AI",
    tagline: "Models, context, and measuring what matters.",
    lessons: [
      {
        slug: "picking-models-and-apis",
        title: "Picking models and APIs",
        minutes: 5,
        body: [
          "There is no best model, only best-fit. Providers (OpenAI, Anthropic, Google, Meta, Mistral, and others) ship many sizes and tiers. Small models answer in milliseconds on a laptop; frontier models reason through harder problems but cost more per call and take longer.",
          "Decide along four axes: capability (can it do the task at all?), cost per call, latency, and data handling (is it acceptable for your data to reach a third party? if not, open models you can self-host). Write these four answers down before choosing anything.",
          "APIs beat self-hosting for most teams: no GPUs to manage and updates for free. Self-hosting wins when privacy, price at scale, or offline operation matter. The right answer changes as traffic grows — plan to swap providers, don't marry your first choice.",
        ],
        code: `// Calling a hosted model API — the shape most apps use
const res = await fetch("https://api.provider.example/v1/chat", {
  method: "POST",
  headers: { Authorization: \`Bearer \${process.env.MODEL_API_KEY}\` },
  body: JSON.stringify({
    model: "fast-and-cheap",
    messages: [{ role: "user", content: prompt }],
  }),
});
const { choices } = await res.json();
return choices[0].message.content;`,
        quiz: [
          {
            prompt: "Which of these is NOT a useful axis for choosing a model?",
            options: [
              "Capability at the task",
              "How popular the model is online",
              "Cost per call and latency",
              "Whether your data can go to the provider",
            ],
            answer: 1,
            explain:
              "Popularity is a vibes metric. Pick on capability, cost, latency, and data policy — everything else is noise.",
          },
          {
            prompt: "When does self-hosting a model make sense?",
            options: [
              "When you want the strongest possible model",
              "When data cannot leave your control or you need offline operation",
              "When your traffic is very small",
              "Never — APIs are always better",
            ],
            answer: 1,
            explain:
              "Self-hosting pays off when privacy, scale pricing, or offline use matter. For most small teams an API is the pragmatic start.",
          },
        ],
      },
      {
        slug: "rag-and-long-context",
        title: "RAG and long-context engineering",
        minutes: 6,
        body: [
          "Modern models have huge context windows, but that does not remove the need for retrieval. Stuffing everything into one prompt gets expensive, diluted, and stale. Retrieval-augmented generation (RAG) flips it: search your own corpus first, then answer from what you found.",
          "The RAG pipeline: split documents into focused chunks, embed each chunk (turn text into a vector), and store them in a vector database. At query time, embed the question, fetch the nearest chunks, and include them in the prompt as evidence.",
          "This is why 'answer from my docs' assistants work: the model never relies on memory; it reads the evidence you supply. Keep chunks focused, re-embed whenever documents change, and always cite the source chunks so users can verify the answer.",
        ],
        code: `// Semantic search over your documents (simplified)
function search(query, chunks, store) {
  const q = embed(query);          // vector for the question
  const hits = store.nearest(q, 5); // top-k chunks by distance
  return hits.map((c) => chunks[c.id]);
}
// Then: model.chat([...question, ...retrievedChunks])`,
        quiz: [
          {
            prompt: "What is the point of retrieval in RAG?",
            options: [
              "Find relevant evidence and put it in the prompt instead of relying on memory",
              "Make the model's context window larger",
              "Replace the model with a search engine",
              "Speed up training",
            ],
            answer: 0,
            explain:
              "Retrieval grounds the answer in your documents, so the model reasons from evidence instead of inventing from memory.",
          },
          {
            prompt: "Why keep document chunks small and focused?",
            options: [
              "Smaller chunks are easier to type",
              "Focused evidence answers better and costs less per call",
              "Vector databases only accept short texts",
              "There is no reason",
            ],
            answer: 1,
            explain:
              "Compact, on-topic chunks surface the exact evidence the question needs — better answers at lower token cost.",
          },
        ],
      },
      {
        slug: "evaluating-ai-systems",
        title: "Evaluating AI systems",
        minutes: 5,
        body: [
          "AI output looks confident regardless of correctness, so 'it seemed fine' is not an evaluation. What separates toy apps from real ones is evals: a fixed set of test cases you run on every change and score automatically.",
          "Start with a golden set: a few dozen real inputs with expected behaviors. Score each response — exact match for structured tasks, rubric checks for open-ended ones (accurate? grounded? does it follow the format?).",
          "Run the same eval before and after every prompt change or model swap. A change that dazzles on your demo cases but breaks the golden set is a regression, not an upgrade. Add a case every time you find a failure in the wild.",
        ],
        code: `// The loop that keeps AI quality honest
const golden = loadTestCases(); // real inputs + expected behavior
for (const { input, check } of golden) {
  const out = await runPipeline(input);
  if (!check(out)) reportFailure(input, out);
}`,
        quiz: [
          {
            prompt: "What is a golden test set for?",
            options: [
              "Saving the best prompts for later",
              "Detecting regressions on every prompt or model change",
              "Training the model",
              "Replacing user feedback",
            ],
            answer: 1,
            explain:
              "A fixed, scored set of cases is the only way to know a change improved things instead of breaking them.",
          },
          {
            prompt: "A prompt change passes your demo cases but fails your eval. What is it?",
            options: [
              "A success — ship it",
              "A fluke — rerun and ignore",
              "A regression — revert or fix it",
              "A sign you need a bigger model",
            ],
            answer: 2,
            explain:
              "Evals exist to catch exactly this: improvements on cherry-picked cases that degrade real behavior. Treat it as a regression.",
          },
        ],
      },
      {
        slug: "ai-and-automation",
        title: "AI and automation at work",
        minutes: 5,
        body: [
          "The biggest productivity gains come from wiring AI into workflows, not from crafting longer prompts. Pick one repetitive bottleneck — triaging tickets, summarizing meetings, drafting reports — and let a model do the 80% while a human checks the 20%.",
          "Automation works best as a human-in-the-loop assembly line: model drafts, person edits, model formats, person approves. Each stage keeps a human accountable while the machine removes the toil.",
          "Start small: instrument the process, measure time saved, and only then expand. Automation nobody monitors becomes a silent liability — wrong tickets auto-answered, bad drafts auto-sent, nobody noticing until it is too late.",
        ],
        quiz: [
          {
            prompt: "What is the safest pattern for AI automation at work?",
            options: [
              "Fully autonomous with no human review",
              "Human-in-the-loop: model drafts, person reviews and approves",
              "Let the model decide what to automate",
              "Avoid automation entirely",
            ],
            answer: 1,
            explain:
              "A human review stage keeps accountability while the model removes the repetitive work — the 80/20 split that actually sticks.",
          },
          {
            prompt: "Before expanding an automated workflow, what should you do?",
            options: [
              "Automate everything at once",
              "Remove error logs to save space",
              "Measure time saved and monitor output quality",
              "Ask the model to monitor itself",
            ],
            answer: 2,
            explain:
              "Measure the win and watch quality first. Untracked automation grows into silent failure — monitor or don't scale.",
          },
        ],
      },
    ],
  },
  {
    slug: "ethics",
    title: "AI & Ethics",
    tagline: "Bias, privacy, and responsibility.",
    lessons: [
      {
        slug: "bias-and-fairness",
        title: "Bias, fairness, and feedback loops",
        minutes: 6,
        body: [
          "AI inherits the biases of its training data and its builders. A hiring model trained on historical decisions can encode past discrimination; a credit model can penalize protected groups. Fairness is not automatic, and it is not fixed by one checkbox.",
          "Watch for feedback loops: an algorithm influences the world, the world produces new data, and that data trains a worse version. A moderation system that over-bans a group creates a dataset that confirms the over-bans.",
          "Practical moves: audit datasets for skew, measure outcomes across groups, and keep a human accountable for consequential decisions. Fairness is ongoing maintenance, not a launch-day test.",
        ],
        quiz: [
          {
            prompt: "Why can't you just 'trust the model' to be fair?",
            options: [
              "Models always lie",
              "Models can encode historical bias from their training data",
              "Fairness is automatic",
              "Models only learn good things",
            ],
            answer: 1,
            explain:
              "Models compress patterns in their data. If that data reflects biased decisions, the model reproduces the bias.",
          },
        ],
      },
      {
        slug: "privacy-and-safety",
        title: "Privacy, safety, and your data",
        minutes: 5,
        body: [
          "When you use an AI service, you are submitting your data to be processed — and often stored. Treat it like a stranger's notepad: never paste secrets, personal health data, or confidential business information into tools you don't control.",
          "Transparency matters at every layer. Users should know when they're talking to an AI, what the system can do with their data, and how consequential automated decisions can be appealed.",
          "The ethical bar goes up with stakes. Generating marketing copy is low-stakes fun; deciding who gets a loan, medical advice, or legal guidance is high-stakes and needs humans, oversight, and clear fallback paths.",
        ],
        quiz: [
          {
            prompt: "Can you safely paste a customer's personal data into any AI chat tool?",
            options: [
              "Yes, if the model is smart",
              "No — data may be stored and used beyond your control",
              "Only during business hours",
              "It depends on the emoticon you use",
            ],
            answer: 1,
            explain:
              "Submitted data may be stored and reused. Ask about retention, scope, and controls before sending sensitive information.",
          },
        ],
      },
      {
        slug: "human-oversight",
        title: "Human oversight in consequential decisions",
        minutes: 6,
        body: [
          "The higher the stakes of an automated decision, the more infrastructure you need around it: a clear escalation path, a human who can override, and a record of what the model saw and decided. 'The model said so' is not an accountability story.",
          "Design for graceful failure. Every AI system should know what it can't do and say so — a loan model that declines, a medical triage bot that admits uncertainty, a moderation system that defers. Confidence scores are useful; knowing when to not decide is essential.",
          "The best teams treat oversight as a product feature: dashboards of decisions, audits of edge cases, and review queues for the risky 1%. Responsibility never ships with the model — it stays with the organization.",
        ],
        quiz: [
          {
            prompt: "What makes an AI decision accountable in a high-stakes setting?",
            options: [
              "A high confidence score",
              "A human with override authority and a record of the decision",
              "Faster inference",
              "A bigger model",
            ],
            answer: 1,
            explain:
              "Accountability comes from oversight: escalation paths, human override, and records — not from model confidence.",
          },
        ],
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return COURSE_MODULES.find((m) => m.slug === slug);
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string
): { mod: Module; lesson: Lesson; index: number } | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  const index = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index < 0) return undefined;
  return { mod, lesson: mod.lessons[index], index };
}

export const TOTAL_LESSONS = COURSE_MODULES.reduce(
  (acc, m) => acc + m.lessons.length,
  0
);
