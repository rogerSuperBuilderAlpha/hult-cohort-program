export type LessonChoice = {
  id: string;
  text: string;
  correct?: boolean;
};

export type LessonQuestion = {
  id: string;
  prompt: string;
  choices: LessonChoice[];
  explain: string;
  /** Optional section banner shown above this question (e.g. Part A / Part B). */
  partHeading?: string;
};

export type LessonQuiz = {
  moduleSlug: string;
  title: string;
  intro: string;
  questions: LessonQuestion[];
};

/**
 * Module 02 — best 10 for self-paced learning (all A–D).
 * Drawn from staff draft + prior lesson items; overlaps removed.
 */
export const lessonQuizzes: Record<string, LessonQuiz> = {
  "why-ai-fails": {
    moduleSlug: "why-ai-fails",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt: "Why do AI responses often miss the mark?",
        choices: [
          { id: "a", text: "AI is usually broken." },
          { id: "b", text: "AI lacks internet access." },
          {
            id: "c",
            text: "The prompt does not provide enough information or direction.",
            correct: true,
          },
          { id: "d", text: "AI can only answer simple questions." },
        ],
        explain:
          "Clear, specific prompts help AI produce relevant and useful results. The issue is often how we communicate the need — not that the tool is broken.",
      },
      {
        id: "q2",
        prompt:
          "Which prompt is more likely to produce a useful workplace result?",
        choices: [
          { id: "a", text: "“Write something about safety.”" },
          {
            id: "b",
            text: "“Create a 200-word toolbox talk on ladder safety for maintenance technicians, including three common hazards and prevention measures.”",
            correct: true,
          },
          {
            id: "c",
            text: "“As an expert, write a detailed professional document on safety culture.”",
          },
          {
            id: "d",
            text: "“Please help with safety when you can.”",
          },
        ],
        explain:
          "B defines audience, length, topic, and required content. A, C, and D sound busy or polite but do not specify a usable deliverable.",
      },
      {
        id: "q3",
        prompt: "Which prompt gives AI the clearest job to do?",
        choices: [
          { id: "a", text: "“Write a report.”" },
          {
            id: "b",
            text: "“Analyze our maintenance downtime data and summarize the top three causes in a one-page report for the plant manager.”",
            correct: true,
          },
          { id: "c", text: "“Tell me about performance.”" },
          { id: "d", text: "“Create something professional.”" },
        ],
        explain:
          "The best prompts describe a job to be done — data, outcome, format, and reader — not just a topic to discuss.",
      },
      {
        id: "q4",
        prompt: "What is most likely to happen when a prompt is vague?",
        choices: [
          { id: "a", text: "AI automatically knows what the user wants." },
          { id: "b", text: "AI asks unlimited follow-up questions." },
          {
            id: "c",
            text: "AI fills in missing details with assumptions.",
            correct: true,
          },
          { id: "d", text: "AI refuses to answer." },
        ],
        explain:
          "AI is not a mind reader. When instructions are unclear, it fills gaps with assumptions — often confidently.",
      },
      {
        id: "q5",
        prompt:
          "An AI update treats a hallway “two-week extension” as a confirmed agreement. What most invited that mistake?",
        choices: [
          { id: "a", text: "The model’s grammar settings were wrong." },
          {
            id: "b",
            text: "The prompt left gaps, so the AI filled them with assumptions and invented certainty.",
            correct: true,
          },
          { id: "c", text: "The update used too many bullet points." },
          {
            id: "d",
            text: "Workplace updates should never mention contractors.",
          },
        ],
        explain:
          "Confident wrong answers are still wrong. Without constraints like “do not invent” and “unverified,” AI often invents certainty.",
      },
      {
        id: "q6",
        prompt: "Which prompt is most likely to generate a generic response?",
        choices: [
          {
            id: "a",
            text: "“Explain the causes of delayed shipments in Q2 using the attached data.”",
          },
          {
            id: "b",
            text: "“Draft an email to supervisors explaining a change in the maintenance schedule.”",
          },
          {
            id: "c",
            text: "“Write a professional document about performance.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Summarize last month’s safety observations.”",
          },
        ],
        explain:
          "C names a topic and a tone, but not the job. Vague-in produces vague (and confident) out.",
      },
      {
        id: "q7",
        prompt:
          "What is the biggest difference between effective and ineffective prompts?",
        choices: [
          {
            id: "a",
            text: "Effective prompts use more technical language.",
          },
          {
            id: "b",
            text: "Effective prompts provide context and a clear objective.",
            correct: true,
          },
          { id: "c", text: "Effective prompts are longer." },
          {
            id: "d",
            text: "Effective prompts always use the word “expert.”",
          },
        ],
        explain:
          "Length and jargon do not win. Context, purpose, and constraints do.",
      },
      {
        id: "q8",
        prompt: "Which prompt provides the most useful context?",
        choices: [
          { id: "a", text: "“Write a summary.”" },
          {
            id: "b",
            text: "“Summarize the attached quarterly maintenance report for senior leadership in less than 250 words.”",
            correct: true,
          },
          { id: "c", text: "“Explain this.”" },
          { id: "d", text: "“Analyze something.”" },
        ],
        explain:
          "AI can only work with the information you provide. B supplies source, audience, and a length constraint.",
      },
      {
        id: "q9",
        prompt:
          "Which statement best captures why “professional-sounding” prompts still fail?",
        choices: [
          {
            id: "a",
            text: "Professional tone is never allowed in workplace AI use.",
          },
          {
            id: "b",
            text: "They often sound polished but still omit situation, facts, or what “done” looks like.",
            correct: true,
          },
          {
            id: "c",
            text: "Any prompt with the word “professional” confuses the model.",
          },
          {
            id: "d",
            text: "Only technical writers can write good prompts.",
          },
        ],
        explain:
          "Polite or expert-sounding language is not the same as a clear job. Usability comes from information and direction.",
      },
      {
        id: "q10",
        prompt:
          "When a prompt underperforms, what is the best first repair step?",
        choices: [
          {
            id: "a",
            text: "Add more adjectives so it sounds smarter.",
          },
          {
            id: "b",
            text: "Switch tools immediately — the model must be broken.",
          },
          {
            id: "c",
            text: "Find what is missing — context, purpose, constraints, or a clear outcome — then rewrite.",
            correct: true,
          },
          {
            id: "d",
            text: "Ask the AI to “try harder” with the same vague prompt.",
          },
        ],
        explain:
          "Repair starts with finding what’s missing. Better inputs produce better outputs.",
      },
    ],
  },

  situation: {
    moduleSlug: "situation",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt:
          'What is the primary purpose of the "Situation" element in SCORE?',
        choices: [
          { id: "a", text: "To make the prompt longer" },
          {
            id: "b",
            text: "To tell AI what is happening or what problem exists",
            correct: true,
          },
          { id: "c", text: "To specify the writing style" },
          { id: "d", text: "To provide formatting instructions" },
        ],
        explain:
          "Situation explains the context behind the request and helps AI understand the problem.",
      },
      {
        id: "q2",
        prompt: "Which prompt provides the clearest situation?",
        choices: [
          { id: "a", text: "“Write an email to my team.”" },
          {
            id: "b",
            text: "“Our on-time delivery rate dropped from 94% to 87% this quarter. Draft an email to supervisors requesting input on possible causes.”",
            correct: true,
          },
          { id: "c", text: "“Create a professional email.”" },
          { id: "d", text: "“Write something about performance.”" },
        ],
        explain:
          "Prompt B explains what happened and why the email is needed.",
      },
      {
        id: "q3",
        prompt: "Which prompt is missing a situation?",
        choices: [
          {
            id: "a",
            text: "“Customer complaints about shipment delays increased by 20% last month. Summarize likely causes.”",
          },
          {
            id: "b",
            text: "“Our maintenance backlog has doubled since January. Recommend corrective actions.”",
          },
          {
            id: "c",
            text: "“Generate recommendations.”",
            correct: true,
          },
          {
            id: "d",
            text: "“A recent audit identified gaps in permit-to-work compliance. Draft a response plan.”",
          },
        ],
        explain:
          "AI has no context about what recommendations are needed.",
      },
      {
        id: "q4",
        prompt:
          "Why can two similar prompts produce very different responses?",
        choices: [
          { id: "a", text: "AI changes its mind randomly." },
          {
            id: "b",
            text: "The situation provided may differ.",
            correct: true,
          },
          { id: "c", text: "AI prefers longer prompts." },
          { id: "d", text: "AI only works for technical subjects." },
        ],
        explain:
          "Context often determines the quality and relevance of the response.",
      },
      {
        id: "q5",
        prompt: "Which prompt gives AI enough situational context?",
        choices: [
          { id: "a", text: "“Create a report.”" },
          { id: "b", text: "“Analyze performance.”" },
          {
            id: "c",
            text: "“Production output fell by 15% after a planned shutdown. Prepare a report outlining possible causes and recommended actions.”",
            correct: true,
          },
          { id: "d", text: "“Write a summary.”" },
        ],
        explain:
          "The prompt explains what happened and what the user needs.",
      },
      {
        id: "q6",
        prompt: "What is most likely to happen when the situation is omitted?",
        choices: [
          {
            id: "a",
            text: "AI automatically knows the missing details.",
          },
          {
            id: "b",
            text: "AI may make assumptions.",
            correct: true,
          },
          { id: "c", text: "AI refuses to answer." },
          {
            id: "d",
            text: "AI provides more accurate responses.",
          },
        ],
        explain: "Missing context forces AI to guess.",
      },
      {
        id: "q7",
        prompt: "Which of the following best describes a situation statement?",
        choices: [
          { id: "a", text: "“Use bullet points.”" },
          { id: "b", text: "“Write in a formal tone.”" },
          {
            id: "c",
            text: "“Our safety incidents increased from two to six this quarter.”",
            correct: true,
          },
          { id: "d", text: "“Limit the response to 200 words.”" },
        ],
        explain:
          "A situation describes what is happening or what problem exists.",
      },
      {
        id: "q8",
        prompt:
          "Which prompt would likely generate the most relevant response?",
        choices: [
          { id: "a", text: "“Help improve safety.”" },
          {
            id: "b",
            text: "“We recorded three vehicle-related near misses at the warehouse this month. Recommend actions to prevent future incidents.”",
            correct: true,
          },
          { id: "c", text: "“Write about safety.”" },
          { id: "d", text: "“Provide advice.”" },
        ],
        explain:
          "Specific context helps AI focus on the actual issue.",
      },
      {
        id: "q9",
        prompt: "Which statement contains a clear situation?",
        choices: [
          { id: "a", text: "“Prepare a presentation.”" },
          { id: "b", text: "“Act as an expert.”" },
          { id: "c", text: "“Summarize the findings.”" },
          {
            id: "d",
            text: "“Employee turnover increased from 8% to 14% during the last six months.”",
            correct: true,
          },
        ],
        explain:
          "The statement clearly explains the business issue.",
      },
      {
        id: "q10",
        prompt:
          "Which prompt follows the Situation principle most effectively?",
        choices: [
          { id: "a", text: "“Write a memo about maintenance.”" },
          { id: "b", text: "“Create a professional memo.”" },
          {
            id: "c",
            text: "“Unplanned equipment downtime increased by 12% during the past month. Draft a memo to maintenance supervisors outlining potential causes and next steps.”",
            correct: true,
          },
          { id: "d", text: "“Generate a maintenance update.”" },
        ],
        explain:
          "The prompt explains what happened before requesting an action.",
      },
    ],
  },

  context: {
    moduleSlug: "context",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt: 'What is the purpose of "Context" in SCORE?',
        choices: [
          { id: "a", text: "To specify the output format" },
          {
            id: "b",
            text: "To provide facts, background, and information AI needs",
            correct: true,
          },
          { id: "c", text: "To assign a role to AI" },
          { id: "d", text: "To determine the writing style" },
        ],
        explain:
          "Context supplies the information AI needs to understand the request properly.",
      },
      {
        id: "q2",
        prompt: "Which prompt provides the strongest context?",
        choices: [
          { id: "a", text: "“Analyze our performance.”" },
          {
            id: "b",
            text: "“Review our performance. Revenue was $4.2M, operating costs increased by 12%, and customer complaints rose by 18% last quarter.”",
            correct: true,
          },
          { id: "c", text: "“Create a report.”" },
          { id: "d", text: "“Give me recommendations.”" },
        ],
        explain:
          "Prompt B includes facts and data that help AI perform meaningful analysis.",
      },
      {
        id: "q3",
        prompt: "Which prompt is missing useful Context?",
        choices: [
          {
            id: "a",
            text: "“Customer complaints rose 20% last month. Using the complaint categories in the attached file, summarize the top three drivers.”",
          },
          {
            id: "b",
            text: "“Near misses: three vehicle incidents at the warehouse this month. Do not invent injury counts. Suggest prevention steps.”",
          },
          {
            id: "c",
            text: "“Recommend actions.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Turnover rose from 8% to 14% in six months. Use HR’s exit-theme summary; keep names confidential.”",
          },
        ],
        explain:
          "“Recommend actions” has no facts, data, or background for Copilot to use.",
      },
      {
        id: "q4",
        prompt: "Which prompt gives Copilot the information it needs?",
        choices: [
          { id: "a", text: "“Write an executive summary.”" },
          {
            id: "b",
            text: "“Summarize these findings: production output increased 8%, maintenance costs decreased 5%, and safety incidents remained unchanged.”",
            correct: true,
          },
          { id: "c", text: "“Write professionally.”" },
          { id: "d", text: "“Create a useful summary.”" },
        ],
        explain:
          "Providing facts enables AI to generate a specific and accurate summary.",
      },
      {
        id: "q5",
        prompt: "Why is context important?",
        choices: [
          { id: "a", text: "It makes prompts longer." },
          {
            id: "b",
            text: "It helps AI make fewer assumptions.",
            correct: true,
          },
          { id: "c", text: "It guarantees a perfect answer." },
          {
            id: "d",
            text: "It eliminates the need for instructions.",
          },
        ],
        explain:
          "Context reduces guesswork and improves relevance.",
      },
      {
        id: "q6",
        prompt:
          "Which prompt is most likely to produce a generic response?",
        choices: [
          {
            id: "a",
            text: "“Review customer feedback from the attached survey.”",
          },
          {
            id: "b",
            text: "“Analyze these downtime figures and identify trends.”",
          },
          {
            id: "c",
            text: "“Improve customer satisfaction.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Summarize the results from our annual audit.”",
          },
        ],
        explain:
          "Without supporting facts or data, AI can only provide general advice.",
      },
      {
        id: "q7",
        prompt: "Which statement is an example of useful context?",
        choices: [
          { id: "a", text: "“Be professional.”" },
          { id: "b", text: "“Use bullet points.”" },
          {
            id: "c",
            text: "“Customer wait times increased from 4 minutes to 11 minutes after the system upgrade.”",
            correct: true,
          },
          { id: "d", text: "“Limit the response to one page.”" },
        ],
        explain:
          "Context consists of facts and background information.",
      },
      {
        id: "q8",
        prompt: "Which prompt contains both a situation and context?",
        choices: [
          { id: "a", text: "“Write a report.”" },
          { id: "b", text: "“Act as an operations manager.”" },
          {
            id: "c",
            text: "“On-time delivery fell from 94% to 87% this quarter. The largest declines occurred in the South Plant and Warehouse B. Analyze possible causes.”",
            correct: true,
          },
          { id: "d", text: "“Provide recommendations.”" },
        ],
        explain:
          "The prompt explains both the problem and the supporting information.",
      },
      {
        id: "q9",
        prompt: "What will likely happen if important facts are missing?",
        choices: [
          { id: "a", text: "AI will know them automatically." },
          {
            id: "b",
            text: "AI may provide recommendations based on assumptions.",
            correct: true,
          },
          { id: "c", text: "AI will stop responding." },
          { id: "d", text: "AI will search company records." },
        ],
        explain:
          "AI can only work with the information it receives.",
      },
      {
        id: "q10",
        prompt: "Which prompt demonstrates strong use of Context?",
        choices: [
          { id: "a", text: "“Help improve inventory management.”" },
          {
            id: "b",
            text: "“Inventory write-offs increased by 22% this year. Fast-moving items have 95% availability while slow-moving items account for 70% of excess stock. Recommend actions to reduce inventory losses.”",
            correct: true,
          },
          { id: "c", text: "“Fix our inventory issues.”" },
          { id: "d", text: "“Analyze inventory.”" },
        ],
        explain:
          "The prompt provides measurable information that AI can use to formulate practical recommendations.",
      },
    ],
  },

  objective: {
    moduleSlug: "objective",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt: 'What is the purpose of the "Objective" element in SCORE?',
        choices: [
          { id: "a", text: "To explain the background information" },
          {
            id: "b",
            text: "To tell Copilot exactly what you want it to accomplish",
            correct: true,
          },
          { id: "c", text: "To specify the writing style" },
          { id: "d", text: "To identify the audience" },
        ],
        explain:
          "The objective defines the desired outcome or task.",
      },
      {
        id: "q2",
        prompt: "Which prompt contains a clear objective?",
        choices: [
          {
            id: "a",
            text: "“Our customer satisfaction scores dropped last month.”",
          },
          { id: "b", text: "“Review this information.”" },
          {
            id: "c",
            text: "“Our customer satisfaction scores dropped last month. Draft a one-page action plan to address the top three concerns.”",
            correct: true,
          },
          { id: "d", text: "“Customer satisfaction is important.”" },
        ],
        explain:
          "The prompt clearly describes what Copilot should produce.",
      },
      {
        id: "q3",
        prompt:
          "What is missing from this prompt?\n\n“Production output declined by 8% during the last quarter.”",
        choices: [
          { id: "a", text: "Context" },
          { id: "b", text: "Situation" },
          { id: "c", text: "Objective", correct: true },
          { id: "d", text: "Facts" },
        ],
        explain:
          "The prompt explains the problem but doesn’t say what Copilot should do with it.",
      },
      {
        id: "q4",
        prompt: "Which objective is the most specific?",
        choices: [
          { id: "a", text: "“Help me.”" },
          { id: "b", text: "“Write something.”" },
          {
            id: "c",
            text: "“Create a two-paragraph summary for plant supervisors highlighting the top three causes of downtime.”",
            correct: true,
          },
          { id: "d", text: "“Analyze this.”" },
        ],
        explain:
          "Specific objectives lead to more useful outputs.",
      },
      {
        id: "q5",
        prompt: "Which prompt is most likely to generate a useful result?",
        choices: [
          { id: "a", text: "“On-time delivery fell from 94% to 87%.”" },
          {
            id: "b",
            text: "“On-time delivery fell from 94% to 87%. Explain the data.”",
          },
          {
            id: "c",
            text: "“On-time delivery fell from 94% to 87%. Draft a briefing note for senior management outlining likely causes and recommended actions.”",
            correct: true,
          },
          { id: "d", text: "“On-time delivery is important.”" },
        ],
        explain:
          "The objective clearly defines the deliverable.",
      },
      {
        id: "q6",
        prompt: "Which prompt contains the clearest objective?",
        choices: [
          { id: "a", text: "“Review these numbers.”" },
          {
            id: "b",
            text: "“Analyze these maintenance costs and identify three opportunities to reduce spending by next quarter.”",
            correct: true,
          },
          { id: "c", text: "“Look at this data.”" },
          { id: "d", text: "“Tell me what you think.”" },
        ],
        explain:
          "Effective objectives describe exactly what Copilot should accomplish.",
      },
      {
        id: "q7",
        prompt: "Why are objectives important?",
        choices: [
          {
            id: "a",
            text: "They help Copilot understand the desired outcome.",
            correct: true,
          },
          { id: "b", text: "They make prompts look professional." },
          { id: "c", text: "They replace the need for context." },
          { id: "d", text: "They eliminate the need for facts." },
        ],
        explain:
          "Objectives provide direction and define success.",
      },
      {
        id: "q8",
        prompt: "Which prompt lacks a clear objective?",
        choices: [
          {
            id: "a",
            text: "“Prepare a one-page summary of the attached audit findings.”",
          },
          {
            id: "b",
            text: "“Draft an email notifying employees of a schedule change.”",
          },
          {
            id: "c",
            text: "“Create a presentation explaining the maintenance strategy.”",
          },
          {
            id: "d",
            text: "“The audit identified several compliance gaps.”",
            correct: true,
          },
        ],
        explain:
          "The prompt explains a situation but does not specify a task.",
      },
      {
        id: "q9",
        prompt: "Which objective is most action-oriented?",
        choices: [
          { id: "a", text: "“Discuss inventory.”" },
          {
            id: "b",
            text: "“Review warehouse inventory data and recommend five actions to reduce excess stock.”",
            correct: true,
          },
          { id: "c", text: "“Consider inventory.”" },
          { id: "d", text: "“Learn about inventory.”" },
        ],
        explain:
          "Strong objectives focus on a specific outcome or deliverable.",
      },
      {
        id: "q10",
        prompt:
          "Which prompt demonstrates strong use of the Objective principle?",
        choices: [
          {
            id: "a",
            text: "“Our maintenance backlog has increased by 25%.”",
          },
          {
            id: "b",
            text: "“Our maintenance backlog has increased by 25%. Create a prioritized action plan to reduce overdue work orders within 90 days.”",
            correct: true,
          },
          { id: "c", text: "“Maintenance backlog is increasing.”" },
          { id: "d", text: "“Review maintenance.”" },
        ],
        explain:
          "The prompt clearly states what Copilot should produce and accomplish.",
      },
    ],
  },

  role: {
    moduleSlug: "role",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt: 'What is the purpose of the "Role" element in SCORE?',
        choices: [
          { id: "a", text: "To provide background information" },
          {
            id: "b",
            text: "To tell Copilot who it should act as",
            correct: true,
          },
          { id: "c", text: "To define the output format" },
          { id: "d", text: "To describe the problem" },
        ],
        explain:
          "Role helps Copilot adopt the appropriate perspective and expertise.",
      },
      {
        id: "q2",
        prompt: "Which prompt includes a clear role?",
        choices: [
          { id: "a", text: "“Help me improve safety.”" },
          {
            id: "b",
            text: "“Act as a safety manager and recommend three actions to reduce workplace slips, trips, and falls.”",
            correct: true,
          },
          { id: "c", text: "“Give me recommendations.”" },
          { id: "d", text: "“Analyze the problem.”" },
        ],
        explain:
          "The prompt explicitly tells Copilot which role to assume.",
      },
      {
        id: "q3",
        prompt: "Which prompt is missing a role?",
        choices: [
          {
            id: "a",
            text: "“Act as an operations manager and draft a production update.”",
          },
          {
            id: "b",
            text: "“Act as a financial analyst and explain cost trends.”",
          },
          {
            id: "c",
            text: "“Review the attached data and recommend improvements.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Act as a project manager and develop a timeline.”",
          },
        ],
        explain:
          "The task is clear, but no perspective or expertise has been specified.",
      },
      {
        id: "q4",
        prompt: "Why can assigning a role improve responses?",
        choices: [
          {
            id: "a",
            text: "It helps Copilot focus on a relevant perspective.",
            correct: true,
          },
          { id: "b", text: "It guarantees perfect answers." },
          { id: "c", text: "It makes prompts shorter." },
          { id: "d", text: "It replaces the need for context." },
        ],
        explain:
          "Role helps tailor responses to specific workplace needs.",
      },
      {
        id: "q5",
        prompt:
          "Which role would be most appropriate for analyzing maintenance backlog data?",
        choices: [
          { id: "a", text: "Marketing specialist" },
          { id: "b", text: "Reliability engineer", correct: true },
          { id: "c", text: "Graphic designer" },
          { id: "d", text: "Recruiter" },
        ],
        explain:
          "A reliability engineer is more likely to focus on maintenance performance and asset reliability.",
      },
      {
        id: "q6",
        prompt: "Which prompt makes the best use of Role?",
        choices: [
          { id: "a", text: "“Write an email.”" },
          { id: "b", text: "“Draft a report.”" },
          {
            id: "c",
            text: "“Act as a plant manager and draft an email to supervisors explaining the production recovery plan.”",
            correct: true,
          },
          { id: "d", text: "“Create a summary.”" },
        ],
        explain:
          "The role provides the perspective and audience appropriate to the task.",
      },
      {
        id: "q7",
        prompt: "Which of the following contains a role statement?",
        choices: [
          { id: "a", text: "“Production losses increased by 10%.”" },
          { id: "b", text: "“Use bullet points.”" },
          {
            id: "c",
            text: "“Act as a customer service manager.”",
            correct: true,
          },
          { id: "d", text: "“Limit the response to one page.”" },
        ],
        explain:
          "Role answers the question: “Who should Copilot act as?”",
      },
      {
        id: "q8",
        prompt:
          "Which prompt would likely produce the most targeted recommendations?",
        choices: [
          { id: "a", text: "“Improve inventory management.”" },
          {
            id: "b",
            text: "“Act as a supply chain manager and recommend three ways to reduce excess inventory while maintaining service levels.”",
            correct: true,
          },
          { id: "c", text: "“Review inventory.”" },
          { id: "d", text: "“Analyze stock.”" },
        ],
        explain:
          "The role helps Copilot focus on supply chain priorities and trade-offs.",
      },
      {
        id: "q9",
        prompt:
          "Two users provide the same situation and context. One asks Copilot to act as a finance manager, the other as an operations manager. What is most likely?",
        choices: [
          { id: "a", text: "Both responses will be identical." },
          {
            id: "b",
            text: "The finance manager response will focus more on cost and financial impact, while the operations manager response will focus more on performance and execution.",
            correct: true,
          },
          { id: "c", text: "Copilot will ignore the role." },
          { id: "d", text: "Only one response will be useful." },
        ],
        explain:
          "Roles shape how Copilot analyzes and responds to information.",
      },
      {
        id: "q10",
        prompt:
          "Which prompt demonstrates strong use of the Role principle?",
        choices: [
          {
            id: "a",
            text: "“Customer complaints increased by 15%. Suggest improvements.”",
          },
          {
            id: "b",
            text: "“Customer complaints increased by 15%. Act as a customer experience manager and recommend three actions to improve satisfaction within the next quarter.”",
            correct: true,
          },
          { id: "c", text: "“Customer complaints are increasing.”" },
          { id: "d", text: "“Review customer feedback.”" },
        ],
        explain:
          "The prompt clearly defines the perspective Copilot should adopt.",
      },
    ],
  },

  "expected-format": {
    moduleSlug: "expected-format",
    title: "Check your understanding",
    intro:
      "Select the best answer for each question, then submit. Feedback appears after you submit.",
    questions: [
      {
        id: "q1",
        prompt: 'What is the purpose of the "Expectations" element in SCORE?',
        choices: [
          { id: "a", text: "To explain the situation" },
          { id: "b", text: "To provide background information" },
          {
            id: "c",
            text: "To tell Copilot how the response should be presented",
            correct: true,
          },
          { id: "d", text: "To assign a role" },
        ],
        explain:
          "Expectations define the format, structure, style, and presentation of the response.",
      },
      {
        id: "q2",
        prompt: "Which prompt contains a clear expectation?",
        choices: [
          { id: "a", text: "“Analyze this issue.”" },
          {
            id: "b",
            text: "“Analyze this issue and present your findings as a one-page executive summary with three recommendations.”",
            correct: true,
          },
          { id: "c", text: "“Review this information.”" },
          { id: "d", text: "“Help me understand the problem.”" },
        ],
        explain:
          "The prompt clearly specifies the deliverable format.",
      },
      {
        id: "q3",
        prompt:
          "What is missing from this prompt?\n\n“Draft recommendations to reduce downtime.”",
        choices: [
          { id: "a", text: "Situation" },
          { id: "b", text: "Context" },
          { id: "c", text: "Expectation", correct: true },
          { id: "d", text: "Objective" },
        ],
        explain:
          "The task is clear, but the desired output format is not.",
      },
      {
        id: "q4",
        prompt: "Which prompt provides the clearest expectation?",
        choices: [
          { id: "a", text: "“Help me communicate this.”" },
          {
            id: "b",
            text: "“Create a 5-slide presentation for supervisors explaining the proposed maintenance strategy.”",
            correct: true,
          },
          { id: "c", text: "“Review the maintenance strategy.”" },
          { id: "d", text: "“Analyze these findings.”" },
        ],
        explain:
          "The response format and audience are clearly defined.",
      },
      {
        id: "q5",
        prompt:
          "Which expectation would likely produce the most structured response?",
        choices: [
          { id: "a", text: "“Share your thoughts.”" },
          { id: "b", text: "“Provide recommendations.”" },
          {
            id: "c",
            text: "“Present the findings as a table showing issue, impact, and recommended action.”",
            correct: true,
          },
          { id: "d", text: "“Review this information.”" },
        ],
        explain:
          "Structured formatting instructions improve usability.",
      },
      {
        id: "q6",
        prompt: "Why are expectations important?",
        choices: [
          {
            id: "a",
            text: "They help Copilot understand how success should be presented.",
            correct: true,
          },
          { id: "b", text: "They replace the need for context." },
          { id: "c", text: "They provide the facts." },
          { id: "d", text: "They identify the problem." },
        ],
        explain:
          "Expectations shape how the output is delivered.",
      },
      {
        id: "q7",
        prompt: "Which prompt includes an expectation?",
        choices: [
          {
            id: "a",
            text: "“On-time delivery fell from 94% to 87%.”",
          },
          { id: "b", text: "“Act as a supply chain manager.”" },
          {
            id: "c",
            text: "“Provide your recommendations in a bullet-point action plan.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Review the latest shipment data.”",
          },
        ],
        explain:
          "Expectations describe the desired format or presentation.",
      },
      {
        id: "q8",
        prompt:
          "Which prompt would likely produce the most useful output for senior leaders?",
        choices: [
          { id: "a", text: "“Analyze this information.”" },
          {
            id: "b",
            text: "“Summarize these findings in a concise executive briefing of no more than 250 words.”",
            correct: true,
          },
          { id: "c", text: "“Review the data.”" },
          { id: "d", text: "“Explain the results.”" },
        ],
        explain:
          "The expectation matches the audience's needs.",
      },
      {
        id: "q9",
        prompt: "Which instruction is an example of an expectation?",
        choices: [
          {
            id: "a",
            text: "“Customer complaints increased by 15%.”",
          },
          {
            id: "b",
            text: "“Act as a customer experience manager.”",
          },
          {
            id: "c",
            text: "“Draft a professional email to supervisors using a formal tone.”",
            correct: true,
          },
          { id: "d", text: "“Analyze customer feedback.”" },
        ],
        explain:
          "Expectations often include format, tone, length, or structure.",
      },
      {
        id: "q10",
        prompt:
          "Which prompt demonstrates strong use of the Expectations principle?",
        choices: [
          {
            id: "a",
            text: "“Our maintenance backlog increased by 25%. Recommend actions.”",
          },
          {
            id: "b",
            text: "“Our maintenance backlog increased by 25%. Recommend actions and present them as a prioritized checklist showing owner, due date, and expected impact.”",
            correct: true,
          },
          { id: "c", text: "“Maintenance backlog is increasing.”" },
          { id: "d", text: "“Review maintenance data.”" },
        ],
        explain:
          "The prompt clearly defines how the response should be organized and presented.",
      },
    ],
  },

  integration: {
    moduleSlug: "integration",
    title: "Integration check",
    intro:
      "Five items on assembling SCORE — compare full prompts, spot missing or mushy letters, and remember why the framework exists.",
    questions: [
      {
        id: "q1",
        prompt: "Which version uses SCORE more effectively?",
        choices: [
          { id: "a", text: "“Write a report.”" },
          {
            id: "b",
            text: "“Production output declined by 12% after a planned shutdown. Using the attached production data, act as an Operations Manager and prepare a one-page report explaining likely causes and recommending three corrective actions.”",
            correct: true,
          },
          {
            id: "c",
            text: "“As an expert, write a detailed professional report on production.”",
          },
          {
            id: "d",
            text: "“Please help with the production situation when you can.”",
          },
        ],
        explain:
          "Prompt B includes Situation, Context, Objective, Role, and Expectation.",
      },
      {
        id: "q2",
        prompt:
          "Which SCORE component is missing?\n\n“Customer complaints increased by 20%. Using the attached feedback data, prepare a summary with three recommended actions.”",
        choices: [
          { id: "a", text: "Situation" },
          { id: "b", text: "Context" },
          { id: "c", text: "Objective" },
          { id: "d", text: "Role", correct: true },
        ],
        explain:
          "The task, situation, and context are clear, but Copilot has not been assigned a role.",
      },
      {
        id: "q3",
        prompt:
          "Which prompt is most likely to produce a useful workplace result?",
        choices: [
          { id: "a", text: "“Help with safety.”" },
          {
            id: "b",
            text: "“Act as a Safety Manager. Three vehicle-related near misses occurred this month. Review the incident summaries and provide a prioritized action plan in table format.”",
            correct: true,
          },
          {
            id: "c",
            text: "“Write a professional document about safety culture.”",
          },
          {
            id: "d",
            text: "“Provide world-class advice on safety.”",
          },
        ],
        explain:
          "The prompt combines all SCORE elements.",
      },
      {
        id: "q4",
        prompt:
          "Which SCORE component is missing?\n\n“Our maintenance backlog increased by 25%. Use the attached work-order history. Act as a Reliability Engineer. Do something useful.”",
        choices: [
          { id: "a", text: "Situation" },
          { id: "b", text: "Context" },
          { id: "c", text: "Objective", correct: true },
          { id: "d", text: "Role" },
        ],
        explain:
          "“Do something useful” is not a clear objective.",
      },
      {
        id: "q5",
        prompt: "What is the main purpose of SCORE?",
        choices: [
          { id: "a", text: "To make prompts longer." },
          { id: "b", text: "To make prompts sound professional." },
          {
            id: "c",
            text: "To provide a repeatable framework for creating effective prompts.",
            correct: true,
          },
          {
            id: "d",
            text: "To eliminate the need for critical thinking.",
          },
        ],
        explain:
          "SCORE is a practical prompting framework, not a writing style.",
      },
    ],
  },

  capstone: {
    moduleSlug: "capstone",
    title: "Capstone check",
    intro:
      "Part A maps the plant scenario onto SCORE and picks the strongest full prompt. Part B checks whether you evaluate AI output critically.",
    questions: [
      {
        id: "q1",
        partHeading:
          "Part A — SCORE mapping: map the plant scenario onto SCORE, then pick the strongest full prompt (Q1–Q6).",
        prompt: "Which statement best represents the Situation?",
        choices: [
          { id: "a", text: "Act as an Operations Manager." },
          {
            id: "b",
            text: "On-time delivery performance fell from 94% to 87% during the last quarter.",
            correct: true,
          },
          { id: "c", text: "Provide recommendations." },
          { id: "d", text: "Present findings in a table." },
        ],
        explain:
          "Situation describes the scenario or problem requiring action.",
      },
      {
        id: "q2",
        prompt: "Which information represents Context?",
        choices: [
          {
            id: "a",
            text: "Increased equipment downtime, spare-part stockouts, increased overtime costs, and customer complaints.",
            correct: true,
          },
          { id: "b", text: "Act as an Operations Manager." },
          { id: "c", text: "Recommend corrective actions." },
          { id: "d", text: "Prepare a report." },
        ],
        explain:
          "Context provides facts, data, and background information.",
      },
      {
        id: "q3",
        prompt: "Which statement is the Objective?",
        choices: [
          {
            id: "a",
            text: "Develop a prioritized action plan with recommended actions, owners, and timelines to improve on-time delivery before the next quarterly review.",
            correct: true,
          },
          {
            id: "b",
            text: "On-time delivery fell from 94% to 87%.",
          },
          { id: "c", text: "Act as an Operations Manager." },
          { id: "d", text: "Use a formal tone." },
        ],
        explain:
          "Objective describes a checkable task or outcome — not just the problem or the role.",
      },
      {
        id: "q4",
        prompt: "Which statement defines the Role?",
        choices: [
          { id: "a", text: "Present findings in a table." },
          {
            id: "b",
            text: "Act as an Operations Manager.",
            correct: true,
          },
          { id: "c", text: "Delivery performance declined." },
          { id: "d", text: "Recommend improvements." },
        ],
        explain:
          "Role tells Copilot who it should act as.",
      },
      {
        id: "q5",
        prompt: "Which statement defines the Expectation?",
        choices: [
          { id: "a", text: "Increased customer complaints." },
          { id: "b", text: "Act as an Operations Manager." },
          {
            id: "c",
            text: "Present the recommendations as a one-page action plan with priorities, owners, and timelines.",
            correct: true,
          },
          { id: "d", text: "Improve delivery performance." },
        ],
        explain:
          "Expectation describes how the answer should be delivered.",
      },
      {
        id: "q6",
        prompt: "Which completed prompt is strongest?",
        choices: [
          { id: "a", text: "“Improve delivery performance.”" },
          {
            id: "b",
            text: "“Act as an Operations Manager. On-time delivery fell from 94% to 87% last quarter. Equipment downtime, spare-part stockouts, increasing overtime costs, and customer complaints contributed to the decline. Develop a prioritized action plan with recommended actions, owners, and timelines to improve performance before the next quarterly review.”",
            correct: true,
          },
          {
            id: "c",
            text: "“As an expert, write a detailed professional report on delivery performance.”",
          },
          { id: "d", text: "“Analyze performance.”" },
        ],
        explain:
          "Prompt B includes Situation, Context, Objective, Role, and a clear deliverable shape.",
      },
      {
        id: "q7",
        partHeading:
          "Part B — Trust check: evaluate AI output critically (Q7–Q10).",
        prompt:
          "Which statement should be treated with the greatest caution?",
        choices: [
          {
            id: "a",
            text: "“Customer complaints increased by 22%.”",
          },
          {
            id: "b",
            text: "“The data suggests Packaging Line 2 contributed to delays.”",
          },
          {
            id: "c",
            text: "“The delays were definitely caused by operator negligence.”",
            correct: true,
          },
          {
            id: "d",
            text: "“Further investigation may be required.”",
          },
        ],
        explain:
          "Claims presented as certainty without supporting evidence should be verified.",
      },
      {
        id: "q8",
        prompt:
          "If Copilot provides a numerical claim that is not in the supplied data, what should you do?",
        choices: [
          { id: "a", text: "Accept it immediately." },
          {
            id: "b",
            text: "Verify the source or supporting evidence.",
            correct: true,
          },
          {
            id: "c",
            text: "Assume Copilot calculated it correctly.",
          },
          { id: "d", text: "Ignore all results." },
        ],
        explain:
          "AI can invent numbers. Verify important claims before acting.",
      },
      {
        id: "q9",
        prompt: "Which response demonstrates healthy AI skepticism?",
        choices: [
          {
            id: "a",
            text: "“Copilot said it, so it must be true.”",
          },
          {
            id: "b",
            text: "“I'll verify important claims before acting on them.”",
            correct: true,
          },
          { id: "c", text: "“AI never makes mistakes.”" },
          { id: "d", text: "“Every AI response is wrong.”" },
        ],
        explain:
          "Great AI users evaluate responses critically — they neither blindly trust nor blindly reject.",
      },
      {
        id: "q10",
        prompt:
          "If supporting evidence is missing, what is the best follow-up prompt?",
        choices: [
          { id: "a", text: "“Trust me.”" },
          { id: "b", text: "“Give me more ideas.”" },
          {
            id: "c",
            text: "“What evidence supports this conclusion, and what assumptions were made?”",
            correct: true,
          },
          { id: "d", text: "“Make the answer longer.”" },
        ],
        explain:
          "Force honesty: ask for evidence and assumptions instead of accepting confident filler.",
      },
    ],
  },
};

export function getLessonQuiz(moduleSlug: string): LessonQuiz | undefined {
  return lessonQuizzes[moduleSlug];
}
