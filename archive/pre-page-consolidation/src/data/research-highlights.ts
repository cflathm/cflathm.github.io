// Verified against the PDFs already hosted in public/application/.
// These findings describe research studies, not product deployments or metrics.
export const researchHighlights = [
  {
    label: 'Human-AI teamwork',
    title: 'People approach an AI teammate differently.',
    method: '32 mixed human-AI teams · Mixed-methods study',
    finding:
      'Participants reported stronger teamwork and less conflict with their human teammate than with their AI teammate. Their expectations of AI and difficulty understanding it helped explain the difference.',
    implication:
      'A capable AI still needs to be a teammate people can understand and coordinate with.',
    paper: 'The Teammate Divide',
    href: '/application/Teammate-Divide.pdf',
    attribution: 'First author · ACM GROUP, 2026',
  },
  {
    label: 'Communication + coordination',
    title: 'How an AI communicates changes the teamwork.',
    method: '100 participants · Experiment and group interviews',
    finding:
      'We studied verbal and visual AI communication in teams with different mixes of human and AI teammates. The study identified trade-offs between those communication modes.',
    implication:
      'The choice of interface needs to account for who is working together and what they need to share.',
    paper: 'Verbal vs. Visual',
    href: '/application/Verbal-Visual.pdf',
    attribution: 'Co-author · ACM CSCW, 2024',
  },
  {
    label: 'Evaluation methods',
    title: 'Evaluate the team, as well as the AI.',
    method: 'Research methods · Experimental design',
    finding:
      'This paper works through the decisions behind a human-AI teaming experiment: the research question, team composition, environment, and data collection.',
    implication:
      'An evaluation should make clear what the AI changes about the work people do together.',
    paper: 'Designing High-Impact Experiments for Human–Autonomy / AI Teaming',
    href: '/application/Experiment-Design.pdf',
    attribution: 'First author · JCEDM, 2025',
  },
];
