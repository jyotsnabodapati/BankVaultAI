import { Question } from '../types';

export const defaultMockQuestions: Question[] = [
  // Quantitative Aptitude
  {
    id: 'QA1',
    question: 'The ratio of the speed of a boat in still water to the speed of the stream is 15:3. If the boat travels 90 km downstream in 3 hours, what is the speed of the boat in upstream direction?',
    options: ['12 km/h', '18 km/h', '20 km/h', '24 km/h'],
    correctAnswerIndex: 2, // 20 km/h
    subject: 'Quantitative Aptitude',
    explanation: 'Downstream speed = 90 km / 3 h = 30 km/h. Speed of boat = 15x, speed of stream = 3x. Downstream speed = 15x + 3x = 18x = 30 km/h => x = 30 / 18 = 5/3. Speed of still boat is 15 * (5/3) = 25 km/h, stream is 3 * (5/3) = 5 km/h. Upstream speed = speed of boat - speed of stream = 25 - 5 = 20 km/h.'
  },
  {
    id: 'QA2',
    question: 'In a class of 60 students, 40% are girls. The average score of girls in Mathematics is 72, and that of the boys is 78. What is the average score of the entire class in Mathematics?',
    options: ['74.4', '75.6', '76.2', '76.8'],
    correctAnswerIndex: 1, // 75.6
    subject: 'Quantitative Aptitude',
    explanation: 'Girls count = 40% of 60 = 24. Boys count = 60 - 24 = 36. Total marks of girls = 24 * 72 = 1728. Total marks of boys = 36 * 78 = 2808. Sum of marks = 1728 + 2808 = 4536. Overall class average = 4536 / 60 = 75.6.'
  },
  // Reasoning Ability
  {
    id: 'RA1',
    question: 'Directions: Statements: I. All tables are chairs. II. Some chairs are blocks. Conclusions: I. Some chairs are tables. II. Some blocks are chairs. III. No block is a chair.',
    options: ['Only conclusions I and II follow', 'Only conclusions II and III follow', 'Only conclusions I and III follow', 'All conclusions follow'],
    correctAnswerIndex: 0, // Only I and II follow
    subject: 'Reasoning Ability',
    explanation: 'Statement I: All tables are chairs => Conversion: Some chairs are tables (So conclusion I follows). Statement II: Some chairs are blocks => Conversion: Some blocks are chairs (So conclusion II follows. Conclusion III "No block is a chair" must be false, since some are chairs).'
  },
  {
    id: 'RA2',
    question: 'If "MONKEY" is coded as "XDJMNL" in a certain code language, how will "TIGER" be written in that code?',
    options: ['QDFHS', 'SDFHS', 'SHFDQ', 'RDHES'],
    correctAnswerIndex: 0, // QDFHS
    subject: 'Reasoning Ability',
    explanation: 'In MONKEY to XDJMNL, reverse the word and subtract 1 from each letter. Reverse of TIGER is REGIT. R-1=Q, E-1=D, G-1=F, I-1=H, T-1=S. So, the code becomes QDFHS.'
  },
  // English Language
  {
    id: 'EL1',
    question: 'Identify the segment in the sentence which contains a grammatical error: "The standard of living in our country is higher than any other developing country in the region."',
    options: ['The standard of living in', 'our country is higher', 'than any other developing country', 'in the region.'],
    correctAnswerIndex: 2, // 'than any other developing country' is incorrect style
    subject: 'English Language',
    explanation: 'Correct syntax is "higher than that of any other developing country" because we are comparing standard of living to standard of living, not country to standard of living. Thus, segment "than any other developing country" is grammatically flawed.'
  },
  {
    id: 'EL2',
    question: 'Complete the sentence with the most appropriate word: "Due to the bank’s strict security protocols, any unauthorized entry into the database triggers an ________ system containment script."',
    options: ['automated', 'hesitant', 'ambiguous', 'optional'],
    correctAnswerIndex: 0, // automated
    subject: 'English Language',
    explanation: 'Given the context of strict security protocols and system triggers, "automated" is the only adjective that logically matches the seamless nature of containment scripts.'
  },
  // General Awareness (Bankers preloaded highlights)
  {
    id: 'GA_PRE1',
    question: 'Which rate is defined as the interest rate at which the Reserve Bank of India (RBI) lends short-term money to commercial banks in the event of any shortfall of funds?',
    options: ['Repo Rate', 'Reverse Repo Rate', 'Bank Rate', 'Marginal Standing Facility'],
    correctAnswerIndex: 0, // Repo Rate
    subject: 'General Awareness',
    explanation: 'Repo rate is the key short-term rate at which the RBI lends money to commercial banks against government securities to resolve liquidity shortfalls.'
  },
  {
    id: 'GA_PRE2',
    question: 'The headquarters of the National Bank for Agriculture and Rural Development (NABARD) is located in which Indian city?',
    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Bengaluru'],
    correctAnswerIndex: 1, // Mumbai
    subject: 'General Awareness',
    explanation: 'NABARD was established in July 1982 to promote sustainable agriculture and rural prosperity, and its central headquarters is firmly located in Mumbai, Maharashtra.'
  }
];
