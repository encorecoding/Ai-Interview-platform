/**
 * Supported Roles, Categories, and Difficulties
 */

const ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'ML Engineer',
  'DevOps / SRE',
  'Data Engineer',
  'System Architect',
];

const INTERVIEW_TYPES = [
  { id: 'Technical', label: 'Technical Interview', desc: 'DSA, System Design, OS, DBMS & Core CS' },
  { id: 'HR', label: 'HR & Behavioral', desc: 'STAR method, leadership, communication & fit' },
  { id: 'Mixed', label: 'Comprehensive Mixed', desc: 'Balanced technical & behavioral evaluation' },
];

const DIFFICULTY_LEVELS = [
  { id: 'Easy', label: 'Entry Level / Intern', desc: 'Fundamentals and core language questions' },
  { id: 'Medium', label: 'Mid-Level (SDE-2)', desc: 'Algorithms, data structures & system concepts' },
  { id: 'Hard', label: 'Senior / Staff', desc: 'Complex algorithms, architecture & distributed systems' },
];

const CORE_TOPICS = [
  'Arrays & Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & Graphs',
  'Dynamic Programming',
  'System Design',
  'Database Management (DBMS)',
  'Operating Systems',
  'Object-Oriented Programming (OOP)',
  'Computer Networks',
  'Behavioral (STAR Method)',
];

module.exports = {
  ROLES,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  CORE_TOPICS,
};
