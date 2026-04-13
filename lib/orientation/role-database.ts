/**
 * ROLE INTELLIGENCE DATABASE
 * 40+ Job Roles with Real-World Data
 * 
 * NO FAKE DATA - REAL MARKET INSIGHTS
 */

export interface Role {
  id: string
  name: string
  domain: 'Software Engineering' | 'Data & AI' | 'Cybersecurity' | 'Cloud & DevOps' | 'Product & Design' | 'Mobile & Game Dev'
  description: string
  dailyWork: string[]
  requiredSkills: {
    name: string
    level: 'basic' | 'intermediate' | 'advanced'
  }[]
  optionalSkills: string[]
  difficulty: 'foundation' | 'intermediate' | 'advanced'
  demandLevel: 'high' | 'medium' | 'low' | 'emerging'
  salaryRangeIndia: {
    entry: number // in LPA
    mid: number
    senior: number
  }
  growthPath: string[]
  workStyle: ('creative' | 'analytical' | 'system-focused' | 'collaborative' | 'independent')[]
  marketOutlook: string
  companiesHiring: string[]
  typicalCompanies: string[]
  averageExperience: string
}

export const roleDatabase: Record<string, Role> = {
  // ─────────────────────────────────────────────────────────────
  // SOFTWARE ENGINEERING (8 roles)
  // ─────────────────────────────────────────────────────────────

  'backend-engineer': {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    domain: 'Software Engineering',
    description: 'Build scalable server-side systems that power applications. Design databases, APIs, and infrastructure. Focus on security, performance, and data handling.',
    dailyWork: [
      'Design and implement REST/GraphQL APIs',
      'Optimize database queries and schema design',
      'Build microservices and handle concurrency',
      'Write production code with testing and documentation',
      'Debug production issues and performance bottlenecks',
      'Collaborate with frontend teams on contracts',
    ],
    requiredSkills: [
      { name: 'Python/Java/Go/Node.js', level: 'advanced' },
      { name: 'SQL/Database Design', level: 'intermediate' },
      { name: 'System Design', level: 'intermediate' },
      { name: 'REST APIs', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
    ],
    optionalSkills: ['Docker', 'Kubernetes', 'Redis', 'Message Queues', 'AWS/GCP'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior Backend Engineer',
      'Staff Engineer',
      'Engineering Manager',
      'Principal Engineer',
    ],
    workStyle: ['analytical', 'system-focused', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND. Every company needs backend engineers. Remote-first roles abundant. Salary growth fastest in engineering.',
    companiesHiring: ['Amazon', 'Google', 'Microsoft', 'Flipkart', 'Gojek', 'PhonePe'],
    typicalCompanies: ['Startups (Series B+)', 'Tech Giants', 'Fintech', 'E-commerce'],
    averageExperience: '3–5 years to mid-level, 8–10+ for senior roles',
  },

  'frontend-engineer': {
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    domain: 'Software Engineering',
    description: 'Create the visual interface users interact with. Build responsive, fast, accessible UIs using modern frameworks. Own user experience and performance.',
    dailyWork: [
      'Build UI components with React/Vue/Angular',
      'Optimize rendering and bundle sizes',
      'Implement responsive designs across devices',
      'Write unit and integration tests',
      'Collaborate with designers and backend teams',
      'Debug browser compatibility issues',
    ],
    requiredSkills: [
      { name: 'JavaScript/TypeScript', level: 'advanced' },
      { name: 'React/Vue/Angular', level: 'advanced' },
      { name: 'CSS/HTML', level: 'intermediate' },
      { name: 'Redux/State Management', level: 'intermediate' },
      { name: 'Testing', level: 'intermediate' },
    ],
    optionalSkills: ['Next.js', 'GraphQL', 'Web Performance', 'Accessibility', 'Design Systems'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 16,
      senior: 35,
    },
    growthPath: [
      'Senior Frontend Engineer',
      'Staff Engineer',
      'Design Systems Engineer',
      'Engineering Manager',
    ],
    workStyle: ['creative', 'collaborative', 'analytical'],
    marketOutlook: 'EXTREMELY HIGH DEMAND. Every product needs frontend talent. Remote roles abundant. Slightly lower ceiling than backend but faster feedback loop.',
    companiesHiring: ['Amazon', 'Google', 'Meta', 'Flipkart', 'Hotstar', 'Zerodha'],
    typicalCompanies: ['Startups', 'Tech Giants', 'SaaS', 'Fintech'],
    averageExperience: '2–4 years to mid-level, 6–8+ for senior roles',
  },

  'full-stack-engineer': {
    id: 'full-stack-engineer',
    name: 'Full Stack Engineer',
    domain: 'Software Engineering',
    description: 'Own entire feature from database to UI. Build complete products end-to-end. Work on both server and client code.',
    dailyWork: [
      'Design features from database to UI',
      'Build backend APIs and frontend components',
      'Deploy and monitor full applications',
      'Make architectural decisions',
      'Write integration tests',
      'Own feature development end-to-end',
    ],
    requiredSkills: [
      { name: 'Backend Language', level: 'advanced' },
      { name: 'Frontend Framework', level: 'advanced' },
      { name: 'Database Design', level: 'intermediate' },
      { name: 'System Design', level: 'intermediate' },
      { name: 'DevOps Basics', level: 'basic' },
    ],
    optionalSkills: ['Docker', 'AWS', 'SQL', 'NoSQL', 'Message Queues'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 17,
      senior: 38,
    },
    growthPath: [
      'Senior Full Stack Engineer',
      'Tech Lead',
      'Product Engineer',
      'Architect',
    ],
    workStyle: ['system-focused', 'analytical', 'independent'],
    marketOutlook: 'HIGH DEMAND in startups. Companies love engineers who can move fast. Lower demand in large orgs (where specialization preferred).',
    companiesHiring: ['Startups', 'Early-stage', 'Smaller tech companies'],
    typicalCompanies: ['Series A-C startups', 'Scale-ups', 'Smaller fintech'],
    averageExperience: '3–5 years to mid-level',
  },

  'devops-engineer': {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    domain: 'Cloud & DevOps',
    description: 'Build and maintain infrastructure, CI/CD pipelines, and deployment systems. Ensure reliability, scalability, and security of systems.',
    dailyWork: [
      'Set up and manage Kubernetes clusters',
      'Build CI/CD pipelines (Jenkins, GitHub Actions)',
      'Monitor infrastructure and set up alerts',
      'Automate deployment and scaling',
      'Debug infrastructure issues',
      'Document runbooks and procedures',
    ],
    requiredSkills: [
      { name: 'Linux/Unix', level: 'advanced' },
      { name: 'Docker/Kubernetes', level: 'advanced' },
      { name: 'Scripting (Python/Bash)', level: 'intermediate' },
      { name: 'AWS/GCP/Azure', level: 'intermediate' },
      { name: 'Networking Basics', level: 'intermediate' },
    ],
    optionalSkills: ['Terraform', 'Ansible', 'Jenkins', 'Prometheus', 'ELK Stack'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 20,
      senior: 45,
    },
    growthPath: [
      'Senior DevOps Engineer',
      'Infrastructure Architect',
      'SRE Manager',
      'Principal Architect',
    ],
    workStyle: ['analytical', 'system-focused', 'independent'],
    marketOutlook: 'VERY HIGH DEMAND. Critical role. Fewer DevOps engineers than needed. Premium salaries. Remote-first.',
    companiesHiring: ['Amazon', 'Google', 'Flipkart', 'OYO', 'Swiggy'],
    typicalCompanies: ['Tech Giants', 'Fintech', 'Scale-ups'],
    averageExperience: '3–5 years to mid-level, 8+ for senior',
  },

  'qa-engineer': {
    id: 'qa-engineer',
    name: 'QA/Test Automation Engineer',
    domain: 'Software Engineering',
    description: 'Ensure software quality through testing, automation, and process improvement. Prevent bugs before they reach users.',
    dailyWork: [
      'Write automated tests (unit, integration, e2e)',
      'Design test strategies and test plans',
      'Execute manual testing when needed',
      'Report and track bugs',
      'Improve testing infrastructure',
      'Collaborate with developers on edge cases',
    ],
    requiredSkills: [
      { name: 'Test Automation (Selenium/Cypress)', level: 'advanced' },
      { name: 'Programming Language', level: 'intermediate' },
      { name: 'Testing Best Practices', level: 'intermediate' },
      { name: 'SQL', level: 'intermediate' },
      { name: 'Problem Solving', level: 'intermediate' },
    ],
    optionalSkills: ['Performance Testing', 'Load Testing', 'API Testing', 'CI/CD'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 5,
      mid: 12,
      senior: 25,
    },
    growthPath: [
      'Senior QA Engineer',
      'QA Lead',
      'SDET (QA Developer)',
      'Quality Manager',
    ],
    workStyle: ['analytical', 'collaborative', 'detail-oriented'],
    marketOutlook: 'STEADY DEMAND. Lower entry barrier than software engineering. Good path to SDET (higher pay). Growing automation need.',
    companiesHiring: ['All product companies', 'Startups', 'Quality-focused orgs'],
    typicalCompanies: ['Product Companies', 'Tech Giants (less), Startups more'],
    averageExperience: '2–4 years to mid-level',
  },

  'mobile-engineer-ios': {
    id: 'mobile-engineer-ios',
    name: 'iOS Engineer',
    domain: 'Mobile & Game Dev',
    description: 'Build native iOS applications using Swift. Create smooth, performant apps optimized for Apple devices.',
    dailyWork: [
      'Build UI with SwiftUI/UIKit',
      'Implement networking and data persistence',
      'Optimize app performance and battery life',
      'Debug on physical devices',
      'Write unit and UI tests',
      'Collaborate with backend and design',
    ],
    requiredSkills: [
      { name: 'Swift', level: 'advanced' },
      { name: 'iOS SDK', level: 'advanced' },
      { name: 'UIKit/SwiftUI', level: 'intermediate' },
      { name: 'Networking', level: 'intermediate' },
      { name: 'Debugging', level: 'intermediate' },
    ],
    optionalSkills: ['Objective-C', 'Core Data', 'RxSwift', 'MVVM', 'Memory Management'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior iOS Engineer',
      'Technical Lead',
      'Staff Engineer',
      'Engineering Manager',
    ],
    workStyle: ['analytical', 'creative', 'detail-oriented'],
    marketOutlook: 'HIGH DEMAND. iOS developers less common than Android. Premium salaries. Most fintech and premium apps need iOS.',
    companiesHiring: ['Flipkart', 'PhonePe', 'Hotstar', 'Swiggy', 'OYO'],
    typicalCompanies: ['Premium apps', 'Fintech', 'E-commerce'],
    averageExperience: '3–5 years to mid-level',
  },

  'mobile-engineer-android': {
    id: 'mobile-engineer-android',
    name: 'Android Engineer',
    domain: 'Mobile & Game Dev',
    description: 'Build native Android applications using Kotlin/Java. Create robust apps for the largest mobile platform globally.',
    dailyWork: [
      'Build UI with Jetpack Compose/XML',
      'Implement services and background tasks',
      'Optimize for various device sizes and Android versions',
      'Debug on emulators and devices',
      'Write unit and integration tests',
      'Manage app permissions and security',
    ],
    requiredSkills: [
      { name: 'Kotlin/Java', level: 'advanced' },
      { name: 'Android SDK', level: 'advanced' },
      { name: 'XML/Jetpack Compose', level: 'intermediate' },
      { name: 'Networking', level: 'intermediate' },
      { name: 'Threading', level: 'intermediate' },
    ],
    optionalSkills: ['RxJava', 'Dagger', 'Room Database', 'MVVM', 'Kotlin Coroutines'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 16,
      senior: 38,
    },
    growthPath: [
      'Senior Android Engineer',
      'Technical Lead',
      'Architecture Lead',
      'Engineering Manager',
    ],
    workStyle: ['analytical', 'collaborative', 'system-focused'],
    marketOutlook: 'VERY HIGH DEMAND. Larger market share than iOS. Highest demand in India given Android penetration.',
    companiesHiring: ['Flipkart', 'Uber', 'Swiggy', 'OYO', 'Amazon'],
    typicalCompanies: ['Product Companies', 'E-commerce', 'Startups'],
    averageExperience: '3–5 years to mid-level',
  },

  'game-developer': {
    id: 'game-developer',
    name: 'Game Developer',
    domain: 'Mobile & Game Dev',
    description: 'Create engaging games for multiple platforms. Master game engines like Unity or Unreal. Blend creativity with technical skill.',
    dailyWork: [
      'Develop game mechanics and gameplay systems',
      'Optimize performance for target platforms',
      'Implement physics and collision systems',
      'Debug complex gameplay issues',
      'Collaborate with designers and artists',
      'Profile and optimize frame rates',
    ],
    requiredSkills: [
      { name: 'C#/C++', level: 'advanced' },
      { name: 'Game Engine (Unity/Unreal)', level: 'advanced' },
      { name: 'Graphics/Shaders', level: 'intermediate' },
      { name: 'Physics & Collision', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
    ],
    optionalSkills: ['Networking', 'Audio', 'Particle Systems', 'AI Scripting'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 5,
      mid: 15,
      senior: 35,
    },
    growthPath: [
      'Senior Game Developer',
      'Lead Programmer',
      'Technical Director',
      'Studio Director',
    ],
    workStyle: ['creative', 'analytical', 'collaborative'],
    marketOutlook: 'EMERGING DEMAND IN INDIA. Mobile gaming huge. Creative satisfaction high. Startup ecosystem growing.',
    companiesHiring: ['Zynga', 'King', 'Miniclip', 'Indian studios (Octro)'],
    typicalCompanies: ['Game Studios', 'Gaming Startups', 'Publishers'],
    averageExperience: '3–5 years to mid-level',
  },

  // ─────────────────────────────────────────────────────────────
  // DATA & AI (8 roles)
  // ─────────────────────────────────────────────────────────────

  'data-engineer': {
    id: 'data-engineer',
    name: 'Data Engineer',
    domain: 'Data & AI',
    description: 'Build and maintain data infrastructure. Create pipelines that process, store, and serve data reliably at scale.',
    dailyWork: [
      'Design and build data pipelines (ETL/ELT)',
      'Optimize data warehouse queries',
      'Monitor data quality and freshness',
      'Work with Spark, Kafka, Airflow',
      'Collaborate with data scientists on infrastructure',
      'Debug pipeline failures',
    ],
    requiredSkills: [
      { name: 'Python/Scala', level: 'advanced' },
      { name: 'SQL', level: 'advanced' },
      { name: 'Spark/Hadoop', level: 'intermediate' },
      { name: 'ETL Tools', level: 'intermediate' },
      { name: 'Data Warehousing', level: 'intermediate' },
    ],
    optionalSkills: ['Kafka', 'Airflow', 'dbt', 'Snowflake', 'BigQuery'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 20,
      senior: 45,
    },
    growthPath: [
      'Senior Data Engineer',
      'Data Architect',
      'Data Infrastructure Lead',
      'Principal Data Engineer',
    ],
    workStyle: ['analytical', 'system-focused', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND. Every data-driven company needs data engineers. Fewer available vs demand. Remote-friendly. Top salaries.',
    companiesHiring: ['Google', 'Amazon', 'Flipkart', 'Hotstar', 'Swiggy'],
    typicalCompanies: ['Tech Giants', 'Analytics companies', 'E-commerce'],
    averageExperience: '3–5 years to mid-level',
  },

  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    domain: 'Data & AI',
    description: 'Extract insights from data. Build predictive models that drive business decisions. Blend statistics, programming, and business.',
    dailyWork: [
      'Explore and analyze datasets',
      'Build and train ML models',
      'Create data visualizations and dashboards',
      'A/B test new algorithms',
      'Deploy models to production',
      'Communicate insights to stakeholders',
    ],
    requiredSkills: [
      { name: 'Python/R', level: 'advanced' },
      { name: 'Statistics & Probability', level: 'advanced' },
      { name: 'Machine Learning', level: 'intermediate' },
      { name: 'SQL', level: 'intermediate' },
      { name: 'Data Visualization', level: 'intermediate' },
    ],
    optionalSkills: ['Deep Learning', 'NLP', 'Computer Vision', 'Big Data', 'Causal Inference'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior Data Scientist',
      'Research Scientist',
      'ML Engineer',
      'Data Science Manager',
    ],
    workStyle: ['analytical', 'creative', 'independent'],
    marketOutlook: 'VERY HIGH DEMAND but competitive entry. Requires strong foundation in stats/ML. Highly valued. Growing AI hype.',
    companiesHiring: ['Google', 'Microsoft', 'Amazon', 'PhonePe', 'OYO'],
    typicalCompanies: ['Tech Giants', 'Fintech', 'E-commerce'],
    averageExperience: '2–4 years to mid-level',
  },

  'ml-engineer': {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    domain: 'Data & AI',
    description: 'Take ML models to production. Build scalable systems that run predictions reliably at scale. Bridge data science and engineering.',
    dailyWork: [
      'Deploy ML models as services',
      'Build model monitoring systems',
      'Optimize model latency and accuracy',
      'Set up A/B testing infrastructure',
      'Collaborate with data scientists',
      'Handle model retraining pipelines',
    ],
    requiredSkills: [
      { name: 'Python', level: 'advanced' },
      { name: 'Machine Learning', level: 'advanced' },
      { name: 'System Design', level: 'intermediate' },
      { name: 'Deployment & Monitoring', level: 'intermediate' },
      { name: 'Software Engineering', level: 'intermediate' },
    ],
    optionalSkills: ['TensorFlow', 'PyTorch', 'FastAPI', 'Docker', 'Kubernetes'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 20,
      senior: 45,
    },
    growthPath: [
      'Senior ML Engineer',
      'ML Platform Lead',
      'Machine Learning Architect',
      'AI/ML Director',
    ],
    workStyle: ['analytical', 'system-focused', 'collaborative'],
    marketOutlook: 'EMERGING & GROWING FAST. AI boom = high demand. Salaries rising. Fewer specialists than data scientists.',
    companiesHiring: ['Google', 'Amazon', 'PhonePe', 'Hotstar'],
    typicalCompanies: ['Tech Giants', 'AI-focused startups'],
    averageExperience: '3–5 years to mid-level',
  },

  'llm-engineer': {
    id: 'llm-engineer',
    name: 'LLM Engineer',
    domain: 'Data & AI',
    description: 'Build AI applications with Large Language Models. Create RAG systems, fine-tune models, and integrate LLMs into products.',
    dailyWork: [
      'Integrate LLMs via APIs (GPT, Claude, Llama)',
      'Build RAG (Retrieval-Augmented Generation) systems',
      'Fine-tune open-source LLMs',
      'Implement prompt engineering strategies',
      'Build evaluation frameworks',
      'Optimize token usage and costs',
    ],
    requiredSkills: [
      { name: 'Python', level: 'advanced' },
      { name: 'LLM APIs & Frameworks', level: 'advanced' },
      { name: 'Prompt Engineering', level: 'intermediate' },
      { name: 'Vector Databases', level: 'intermediate' },
      { name: 'API Integration', level: 'intermediate' },
    ],
    optionalSkills: ['Langchain', 'LlamaIndex', 'Pinecone', 'Fine-tuning', 'Evaluation'],
    difficulty: 'intermediate',
    demandLevel: 'emerging',
    salaryRangeIndia: {
      entry: 6,
      mid: 16,
      senior: 38,
    },
    growthPath: [
      'Senior LLM Engineer',
      'AI Product Engineer',
      'LLM Research Engineer',
      'AI Lead',
    ],
    workStyle: ['creative', 'analytical', 'independent'],
    marketOutlook: 'EMERGING & HOTTEST ROLE. AI fever. New field. Will have high demand. Salaries rising fast.',
    companiesHiring: ['All tech companies now', 'AI startups', 'ChatGPT-like platforms'],
    typicalCompanies: ['Tech Companies', 'AI Startups'],
    averageExperience: '1–3 years (new field)',
  },

  'analytics-engineer': {
    id: 'analytics-engineer',
    name: 'Analytics Engineer',
    domain: 'Data & AI',
    description: 'Bridge between data engineers and analysts. Transform raw data into analytics-ready datasets for business intelligence.',
    dailyWork: [
      'Transform and model data using dbt/SQL',
      'Create data marts and semantic layers',
      'Monitor data quality',
      'Collaborate with analysts on schemas',
      'Build documentation and lineage',
      'Optimize query performance',
    ],
    requiredSkills: [
      { name: 'SQL', level: 'advanced' },
      { name: 'dbt/Data Modeling', level: 'advanced' },
      { name: 'Data Warehousing', level: 'intermediate' },
      { name: 'Python/Scripting', level: 'intermediate' },
      { name: 'Business Logic', level: 'intermediate' },
    ],
    optionalSkills: ['Looker', 'Git', 'Testing Frameworks', 'Cloud Data Warehouses'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 15,
      senior: 30,
    },
    growthPath: [
      'Senior Analytics Engineer',
      'Data Architect',
      'Analytics Lead',
      'Data Strategy Lead',
    ],
    workStyle: ['analytical', 'collaborative', 'detail-oriented'],
    marketOutlook: 'GROWING DEMAND. Newer field but high-value. Companies need data-driven culture. Remote-friendly.',
    companiesHiring: ['Tech Giants', 'Analytics startups', 'Data-driven companies'],
    typicalCompanies: ['Product Companies', 'BI/Analytics startups'],
    averageExperience: '2–4 years to mid-level',
  },

  'ai-researcher': {
    id: 'ai-researcher',
    name: 'AI/ML Researcher',
    domain: 'Data & AI',
    description: 'Advance AI/ML field through research. Publish papers, develop new algorithms, and explore frontier technologies.',
    dailyWork: [
      'Conduct novel research in AI/ML',
      'Design and run experiments',
      'Publish research papers',
      'Implement state-of-the-art models',
      'Collaborate with academic partners',
      'Present findings at conferences',
    ],
    requiredSkills: [
      { name: 'Advanced Math & Statistics', level: 'advanced' },
      { name: 'Python/PyTorch/TensorFlow', level: 'advanced' },
      { name: 'Machine Learning Theory', level: 'advanced' },
      { name: 'Research Methodology', level: 'advanced' },
      { name: 'Academic Writing', level: 'intermediate' },
    ],
    optionalSkills: ['Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning'],
    difficulty: 'advanced',
    demandLevel: 'low',
    salaryRangeIndia: {
      entry: 8,
      mid: 20,
      senior: 50,
    },
    growthPath: [
      'Senior Research Scientist',
      'Principal Researcher',
      'AI Research Lead',
      'Lab Director',
    ],
    workStyle: ['analytical', 'creative', 'independent'],
    marketOutlook: 'LOW COMMERCIAL DEMAND but PREMIUM COMPENSATION. Limited roles in India. More in US. PhD expected.',
    companiesHiring: ['Google Cloud AI', 'Microsoft Research', 'IIT labs'],
    typicalCompanies: ['Tech research labs', 'Universities'],
    averageExperience: 'PhD + 2–5 years',
  },

  'bioinformatics-engineer': {
    id: 'bioinformatics-engineer',
    name: 'Bioinformatics Engineer',
    domain: 'Data & AI',
    description: 'Apply ML/data science to biology. Build genomics pipelines. Work on healthcare AI, drug discovery, or genetic analysis.',
    dailyWork: [
      'Analyze genomic and biological data',
      'Build bioinformatics pipelines',
      'Develop ML models for protein folding, drug discovery',
      'Work with sequencing data',
      'Collaborate with biologists',
      'Publish research',
    ],
    requiredSkills: [
      { name: 'Python/Bioinformatics Tools', level: 'advanced' },
      { name: 'Biology Fundamentals', level: 'intermediate' },
      { name: 'Statistical Analysis', level: 'intermediate' },
      { name: 'Machine Learning', level: 'intermediate' },
      { name: 'Unix/Linux', level: 'intermediate' },
    ],
    optionalSkills: ['R', 'NGS Analysis', 'Bioconductor', 'Deep Learning'],
    difficulty: 'advanced',
    demandLevel: 'emerging',
    salaryRangeIndia: {
      entry: 6,
      mid: 15,
      senior: 35,
    },
    growthPath: [
      'Senior Bioinformatics Engineer',
      'Computational Biology Lead',
      'Research Director',
      'Product Lead (Healthcare AI)',
    ],
    workStyle: ['analytical', 'research-driven', 'collaborative'],
    marketOutlook: 'EMERGING & NICHE. Limited roles in India but growing. Healthcare AI boom. Remote possibilities in US.',
    companiesHiring: ['Sequoia Healthcare', 'GenomeAsia Startups'],
    typicalCompanies: ['Biotech companies', 'Healthcare startups'],
    averageExperience: '3–5 years',
  },

  // ─────────────────────────────────────────────────────────────
  // CYBERSECURITY (6 roles)
  // ─────────────────────────────────────────────────────────────

  'security-engineer': {
    id: 'security-engineer',
    name: 'Security Engineer',
    domain: 'Cybersecurity',
    description: 'Build secure systems and identify vulnerabilities. Harden applications and infrastructure against attacks.',
    dailyWork: [
      'Conduct security code reviews',
      'Design secure architectures',
      'Set up authentication and encryption',
      'Perform threat modeling',
      'Implement security best practices',
      'Respond to security incidents',
    ],
    requiredSkills: [
      { name: 'Networking & Security Concepts', level: 'advanced' },
      { name: 'Programming (C/Python/Java)', level: 'intermediate' },
      { name: 'Web Security/OWASP', level: 'intermediate' },
      { name: 'Cryptography Basics', level: 'intermediate' },
      { name: 'System Design', level: 'intermediate' },
    ],
    optionalSkills: ['CCNA', 'CEH', 'Penetration Testing', 'Cloud Security'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior Security Engineer',
      'Security Architect',
      'Security Lead',
      'Chief Security Officer',
    ],
    workStyle: ['analytical', 'system-focused', 'detail-oriented'],
    marketOutlook: 'VERY HIGH DEMAND. Every company needs security. Regulatory pressure (GDPR, data laws). Premium salaries.',
    companiesHiring: ['Amazon', 'Google', 'Microsoft', 'Banks', 'Fintech'],
    typicalCompanies: ['Tech Giants', 'Banks', 'Fintech', 'Security companies'],
    averageExperience: '3–5 years to mid-level',
  },

  'penetration-tester': {
    id: 'penetration-tester',
    name: 'Penetration Tester / Ethical Hacker',
    domain: 'Cybersecurity',
    description: 'Legally hack systems to find vulnerabilities. Test defensive measures. Identify security weaknesses before attackers do.',
    dailyWork: [
      'Plan and execute penetration tests',
      'Try to break into systems ethically',
      'Document vulnerabilities and proof-of-concept',
      'Write detailed security reports',
      'Perform vulnerability scanning',
      'Test security controls',
    ],
    requiredSkills: [
      { name: 'Networking & Systems', level: 'advanced' },
      { name: 'Penetration Testing Tools', level: 'advanced' },
      { name: 'Unix/Linux', level: 'advanced' },
      { name: 'Web/Network Security', level: 'advanced' },
      { name: 'Programming Basics', level: 'intermediate' },
    ],
    optionalSkills: ['CEH', 'OSCP', 'Exploit Development', 'Reverse Engineering'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 16,
      senior: 38,
    },
    growthPath: [
      'Senior Penetration Tester',
      'Security Researcher',
      'Chief Information Security Officer',
      'Consultant',
    ],
    workStyle: ['analytical', 'creative', 'independent'],
    marketOutlook: 'HIGH DEMAND. Consulting-heavy. Remote-friendly. Can freelance. Certifications (CEH, OSCP) important.',
    companiesHiring: ['Security firms', 'Banks', 'Tech Giants', 'Government'],
    typicalCompanies: ['Security consulting', 'Banks', 'Defense', 'Tech companies'],
    averageExperience: '3–5 years to mid-level',
  },

  'incident-response-engineer': {
    id: 'incident-response-engineer',
    name: 'Incident Response Engineer',
    domain: 'Cybersecurity',
    description: 'Handle security breaches and attacks in real-time. Contain damage, investigate incidents, and improve future defenses.',
    dailyWork: [
      'Respond to security alerts and incidents',
      'Investigate breaches and attacks',
      'Contain and remove threats',
      'Perform forensic analysis',
      'Document incident timeline',
      'Implement preventive measures',
    ],
    requiredSkills: [
      { name: 'Forensics & Incident Handling', level: 'advanced' },
      { name: 'Networking & Systems', level: 'advanced' },
      { name: 'Linux/Windows Administration', level: 'intermediate' },
      { name: 'Log Analysis', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
    ],
    optionalSkills: ['Splunk', 'ELK Stack', 'SIEM Tools', 'Reverse Engineering'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 16,
      senior: 38,
    },
    growthPath: [
      'Senior IR Engineer',
      'Security Operations Manager',
      'CISO',
      'Consultant',
    ],
    workStyle: ['analytical', 'high-pressure', 'collaborative'],
    marketOutlook: 'HIGH DEMAND. 24/7 on-call roles common. Salary premium for on-call. Stressful but critical.',
    companiesHiring: ['Banks', 'Tech Giants', 'Defense', 'SOC teams'],
    typicalCompanies: ['Security Operations', 'Banks', 'Tech Giants'],
    averageExperience: '3–5 years to mid-level',
  },

  'cloud-security-engineer': {
    id: 'cloud-security-engineer',
    name: 'Cloud Security Engineer',
    domain: 'Cybersecurity',
    description: 'Secure cloud infrastructure and applications. Manage cloud IAM, data protection, and compliance.',
    dailyWork: [
      'Audit cloud infrastructure (AWS/GCP/Azure)',
      'Manage cloud IAM and access control',
      'Implement encryption and secrets management',
      'Set up compliance monitoring',
      'Secure containerized applications',
      'Perform cloud security assessments',
    ],
    requiredSkills: [
      { name: 'Cloud Platforms (AWS/GCP/Azure)', level: 'advanced' },
      { name: 'Cloud Security Best Practices', level: 'advanced' },
      { name: 'Identity & Access Management', level: 'intermediate' },
      { name: 'Container Security', level: 'intermediate' },
      { name: 'Compliance Frameworks', level: 'intermediate' },
    ],
    optionalSkills: ['Terraform', 'Kubernetes Security', 'SIEM', 'DLP'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior Cloud Security Engineer',
      'Cloud Security Architect',
      'Cloud Security Lead',
      'Advisory CISO',
    ],
    workStyle: ['analytical', 'system-focused', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND as companies migrate to cloud. Premium salaries. Remote-first.',
    companiesHiring: ['Amazon', 'Google', 'Microsoft', 'Tech Giants'],
    typicalCompanies: ['Cloud companies', 'Tech Giants', 'Fintech'],
    averageExperience: '3–5 years to mid-level',
  },

  'security-architect': {
    id: 'security-architect',
    name: 'Security Architect',
    domain: 'Cybersecurity',
    description: 'Design comprehensive security strategies for organizations. Build security frameworks and policies.',
    dailyWork: [
      'Design enterprise security architecture',
      'Define security strategies and policies',
      'Conduct threat modeling',
      'Evaluate security tools and solutions',
      'Ensure compliance with regulations',
      'Guide security teams',
    ],
    requiredSkills: [
      { name: 'Enterprise Security', level: 'advanced' },
      { name: 'System Design', level: 'advanced' },
      { name: 'Compliance Frameworks', level: 'advanced' },
      { name: 'Risk Management', level: 'advanced' },
      { name: 'Leadership', level: 'intermediate' },
    ],
    optionalSkills: ['Certifications (CISSP)', 'Cloud Architecture', 'Zero Trust'],
    difficulty: 'advanced',
    demandLevel: 'medium',
    salaryRangeIndia: {
      entry: 12,
      mid: 25,
      senior: 50,
    },
    growthPath: [
      'Chief Information Security Officer',
      'Security VP',
      'Consultant',
      'Advisor',
    ],
    workStyle: ['analytical', 'strategic', 'collaborative'],
    marketOutlook: 'MEDIUM DEMAND but PREMIUM COMPENSATION. Requires 8–10 years experience. Leadership path.',
    companiesHiring: ['Banks', 'Insurance', 'Tech Giants', 'Consulting'],
    typicalCompanies: ['Enterprise', 'Consulting', 'Financial'],
    averageExperience: '8–10+ years',
  },

  // ─────────────────────────────────────────────────────────────
  // PRODUCT & DESIGN (6 roles)
  // ─────────────────────────────────────────────────────────────

  'product-manager': {
    id: 'product-manager',
    name: 'Product Manager',
    domain: 'Product & Design',
    description: 'Own product strategy and roadmap. Balance user needs, business goals, and technical constraints. Lead cross-functional teams.',
    dailyWork: [
      'Analyze user needs and market trends',
      'Define product vision and strategy',
      'Write requirements and PRDs',
      'Prioritize features and roadmap',
      'Collaborate across engineering, design, marketing',
      'Measure product metrics and iterate',
    ],
    requiredSkills: [
      { name: 'Product Thinking', level: 'advanced' },
      { name: 'Data Analysis & Metrics', level: 'advanced' },
      { name: 'Communication', level: 'advanced' },
      { name: 'User Research', level: 'intermediate' },
      { name: 'Technical Basics', level: 'intermediate' },
    ],
    optionalSkills: ['SQL', 'A/B Testing', 'Product Analytics', 'User Testing'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 18,
      senior: 40,
    },
    growthPath: [
      'Senior Product Manager',
      'Group Product Manager',
      'Director of Product',
      'VP Product',
    ],
    workStyle: ['strategic', 'collaborative', 'analytical'],
    marketOutlook: 'VERY HIGH DEMAND. Every tech company needs PMs. Great career arc. Highest pay ceiling in non-eng roles.',
    companiesHiring: ['Amazon', 'Google', 'Flipkart', 'Swiggy', 'OYO'],
    typicalCompanies: ['Tech Giants', 'Product Companies', 'Startups'],
    averageExperience: '3–5 years to mid-level',
  },

  'ux-designer': {
    id: 'ux-designer',
    name: 'UX Designer',
    domain: 'Product & Design',
    description: 'Design user experiences that are intuitive and delightful. Conduct research, create wireframes, and test solutions.',
    dailyWork: [
      'Conduct user research and interviews',
      'Create wireframes and prototypes',
      'Design user flows and interactions',
      'Run usability testing',
      'Collaborate with product and engineering',
      'Iterate based on feedback',
    ],
    requiredSkills: [
      { name: 'UX Design Principles', level: 'advanced' },
      { name: 'Figma/Design Tools', level: 'advanced' },
      { name: 'User Research', level: 'intermediate' },
      { name: 'Prototyping', level: 'intermediate' },
      { name: 'Communication', level: 'intermediate' },
    ],
    optionalSkills: ['Interaction Design', 'User Testing', 'Accessibility', 'Motion Design'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 5,
      mid: 12,
      senior: 28,
    },
    growthPath: [
      'Senior UX Designer',
      'Design Lead',
      'Head of Design',
      'Design Director',
    ],
    workStyle: ['creative', 'collaborative', 'analytical'],
    marketOutlook: 'VERY HIGH DEMAND. Design-driven companies need designers. Remote-friendly. Growing specialization.',
    companiesHiring: ['Amazon', 'Google', 'Hotstar', 'Flipkart', 'Design studios'],
    typicalCompanies: ['Product Companies', 'Design Studios', 'Agencies'],
    averageExperience: '2–4 years to mid-level',
  },

  'ui-designer': {
    id: 'ui-designer',
    name: 'UI Designer',
    domain: 'Product & Design',
    description: 'Create beautiful, polished user interfaces. Design visual systems and components. Make products delightful.',
    dailyWork: [
      'Design UI visuals and layouts',
      'Create design systems and component libraries',
      'Produce high-fidelity mockups',
      'Ensure design consistency',
      'Collaborate with developers on implementation',
      'Iterate on design feedback',
    ],
    requiredSkills: [
      { name: 'Visual Design & Aesthetics', level: 'advanced' },
      { name: 'Figma/Design Tools', level: 'advanced' },
      { name: 'Design System Knowledge', level: 'intermediate' },
      { name: 'CSS Basics', level: 'basic' },
      { name: 'Color & Typography', level: 'intermediate' },
    ],
    optionalSkills: ['Motion Design', 'Interaction Design', 'Prototyping', 'CSS'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 4,
      mid: 10,
      senior: 24,
    },
    growthPath: [
      'Senior UI Designer',
      'Design Lead',
      'Design System Lead',
      'Head of Design',
    ],
    workStyle: ['creative', 'detail-oriented', 'collaborative'],
    marketOutlook: 'HIGH DEMAND. Design professionals growing. More specialized than UX. Premium in premium products.',
    companiesHiring: ['Tech Companies', 'Design Studios', 'Premium brands'],
    typicalCompanies: ['Product Companies', 'Agencies', 'In-house teams'],
    averageExperience: '2–4 years to mid-level',
  },

  'product-designer': {
    id: 'product-designer',
    name: 'Product Designer (UX/UI Hybrid)',
    domain: 'Product & Design',
    description: 'Combine UX and UI skills. Own end-to-end product design. Design experiences, not just interfaces.',
    dailyWork: [
      'Research and define user needs',
      'Design complete user experiences',
      'Create high-fidelity mockups',
      'Prototype and test ideas',
      'Collaborate with product and engineering',
      'Ensure design quality end-to-end',
    ],
    requiredSkills: [
      { name: 'UX Design', level: 'advanced' },
      { name: 'Visual Design', level: 'advanced' },
      { name: 'Figma/Design Tools', level: 'advanced' },
      { name: 'User Research', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
    ],
    optionalSkills: ['Prototyping', 'Motion Design', 'CSS', 'User Testing'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 14,
      senior: 32,
    },
    growthPath: [
      'Senior Product Designer',
      'Design Lead',
      'Design Manager',
      'Head of Design',
    ],
    workStyle: ['creative', 'analytical', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND in modern product companies. Preferred over separate UX/UI roles.',
    companiesHiring: ['Tech Giants', 'Startups', 'Design-focused companies'],
    typicalCompanies: ['Product Companies', 'Design-first startups'],
    averageExperience: '3–5 years to mid-level',
  },

  'design-systems-engineer': {
    id: 'design-systems-engineer',
    name: 'Design Systems Engineer',
    domain: 'Product & Design',
    description: 'Build and maintain design systems. Create shared components and patterns that scale across products.',
    dailyWork: [
      'Build reusable component libraries',
      'Document design patterns',
      'Maintain design system documentation',
      'Collaborate with designers and developers',
      'Ensure consistency across products',
      'Evolve system based on feedback',
    ],
    requiredSkills: [
      { name: 'Design Systems Thinking', level: 'advanced' },
      { name: 'Figma/Design Tools', level: 'advanced' },
      { name: 'Component Design', level: 'advanced' },
      { name: 'CSS/Front-end Basics', level: 'intermediate' },
      { name: 'Communication', level: 'intermediate' },
    ],
    optionalSkills: ['React', 'Storybook', 'Documentation', 'Git'],
    difficulty: 'advanced',
    demandLevel: 'medium',
    salaryRangeIndia: {
      entry: 6,
      mid: 14,
      senior: 32,
    },
    growthPath: [
      'Senior Design Systems Lead',
      'Design Infrastructure Lead',
      'Director of Design Systems',
      'Engineering Manager',
    ],
    workStyle: ['analytical', 'collaborative', 'systematic'],
    marketOutlook: 'GROWING DEMAND. Larger companies need design systems. Specialized role with good compensation.',
    companiesHiring: ['Amazon', 'Google', 'Tech Giants'],
    typicalCompanies: ['Large product companies', 'Design agencies'],
    averageExperience: '4–6 years to mid-level',
  },

  // ─────────────────────────────────────────────────────────────
  // ADDITIONAL STRATEGIC ROLES (9 roles)
  // ─────────────────────────────────────────────────────────────

  'solutions-architect': {
    id: 'solutions-architect',
    name: 'Solutions Architect',
    domain: 'Cloud & DevOps',
    description: 'Design technology solutions for enterprise clients. Translate business needs into technical architecture.',
    dailyWork: [
      'Understand client requirements',
      'Design scalable technical solutions',
      'Create architecture documents',
      'Lead implementation discussions',
      'Ensure solution feasibility',
      'Support sales and delivery teams',
    ],
    requiredSkills: [
      { name: 'System Design', level: 'advanced' },
      { name: 'Cloud Architecture', level: 'advanced' },
      { name: 'Communication', level: 'advanced' },
      { name: 'Technical Breadth', level: 'advanced' },
      { name: 'Business Acumen', level: 'intermediate' },
    ],
    optionalSkills: ['Cloud Certifications', 'Industry Knowledge', 'Sales Skills'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 10,
      mid: 20,
      senior: 45,
    },
    growthPath: [
      'Senior Solutions Architect',
      'Principal Architect',
      'VP Sales Engineering',
      'Consultant',
    ],
    workStyle: ['analytical', 'strategic', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND. Sales role. Good compensation. Requires technical credibility and communication.',
    companiesHiring: ['Consulting firms', 'Cloud providers', 'Tech Giants'],
    typicalCompanies: ['Consulting', 'Tech companies', 'Cloud providers'],
    averageExperience: '5–7 years',
  },

  'platform-engineer': {
    id: 'platform-engineer',
    name: 'Platform Engineer',
    domain: 'Cloud & DevOps',
    description: 'Build internal platforms that enable developer productivity. Create tools, services, and infrastructure.',
    dailyWork: [
      'Design internal developer platforms',
      'Build CI/CD and deployment systems',
      'Create observability and monitoring',
      'Support internal customers (developers)',
      'Implement self-service infrastructure',
      'Document platform features',
    ],
    requiredSkills: [
      { name: 'System Design', level: 'advanced' },
      { name: 'Kubernetes/Container Orchestration', level: 'advanced' },
      { name: 'Scripting/Programming', level: 'advanced' },
      { name: 'DevOps Tooling', level: 'intermediate' },
      { name: 'User Empathy', level: 'intermediate' },
    ],
    optionalSkills: ['Go/Rust', 'Terraform', 'Prometheus', 'Service Mesh'],
    difficulty: 'advanced',
    demandLevel: 'emerging',
    salaryRangeIndia: {
      entry: 9,
      mid: 19,
      senior: 42,
    },
    growthPath: [
      'Senior Platform Engineer',
      'Platform Lead',
      'Infrastructure VP',
      'CTO',
    ],
    workStyle: ['analytical', 'collaborative', 'system-focused'],
    marketOutlook: 'EMERGING & HOTTEST. Developer experience critical. High-growth companies hiring. Premium salaries coming.',
    companiesHiring: ['Uber', 'Google', 'Amazon', 'Tech Giants'],
    typicalCompanies: ['Large tech companies', 'Infrastructure-focused'],
    averageExperience: '4–6 years',
  },

  'tech-lead': {
    id: 'tech-lead',
    name: 'Tech Lead / Engineering Lead',
    domain: 'Software Engineering',
    description: 'Lead technical direction of team or project. Guide engineering strategies and mentor engineers.',
    dailyWork: [
      'Define technical architecture',
      'Lead code reviews and design',
      'Mentor junior engineers',
      'Resolve technical blockers',
      'Plan technical roadmap',
      'Balance technical debt and velocity',
    ],
    requiredSkills: [
      { name: 'Deep Technical Knowledge', level: 'advanced' },
      { name: 'System Design', level: 'advanced' },
      { name: 'Leadership', level: 'intermediate' },
      { name: 'Communication', level: 'advanced' },
      { name: 'Mentoring', level: 'intermediate' },
    ],
    optionalSkills: ['Architecture', 'Hiring', 'Roadmap Planning'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 12,
      mid: 22,
      senior: 48,
    },
    growthPath: [
      'Engineering Manager',
      'Director of Engineering',
      'VP Engineering',
      'CTO',
    ],
    workStyle: ['collaborative', 'strategic', 'analytical'],
    marketOutlook: 'HIGH DEMAND. Stepping stone to management. Good comp. Leadership path.',
    companiesHiring: ['All tech companies'],
    typicalCompanies: ['Tech Companies', 'Startups'],
    averageExperience: '5–7 years',
  },

  'engineering-manager': {
    id: 'engineering-manager',
    name: 'Engineering Manager',
    domain: 'Software Engineering',
    description: 'Manage engineering teams. Hire, develop, and support engineers. Deliver business goals.',
    dailyWork: [
      'Manage and develop team members',
      'Plan and schedule work',
      'Conduct 1-on-1s and performance reviews',
      'Hire and onboard engineers',
      'Remove blockers for team',
      'Report to leadership',
    ],
    requiredSkills: [
      { name: 'Technical Knowledge', level: 'advanced' },
      { name: 'People Management', level: 'advanced' },
      { name: 'Communication', level: 'advanced' },
      { name: 'Problem Solving', level: 'advanced' },
      { name: 'Emotional Intelligence', level: 'advanced' },
    ],
    optionalSkills: ['Hiring', 'Strategy', 'OKRs'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 12,
      mid: 22,
      senior: 50,
    },
    growthPath: [
      'Senior Engineering Manager',
      'Director of Engineering',
      'VP Engineering',
      'CTO/COO',
    ],
    workStyle: ['collaborative', 'strategic', 'people-focused'],
    marketOutlook: 'HIGH DEMAND. Management track. Highest salary ceiling in many companies.',
    companiesHiring: ['All tech companies'],
    typicalCompanies: ['Tech Companies', 'Startups'],
    averageExperience: '5–7 years + management training',
  },

  'staff-engineer': {
    id: 'staff-engineer',
    name: 'Staff Engineer',
    domain: 'Software Engineering',
    description: 'Senior technical leadership without people management. High-impact technical contributor. Shape technology strategy.',
    dailyWork: [
      'Drive architectural decisions',
      'Solve complex technical problems',
      'Mentor senior engineers',
      'Influence product strategy',
      'Lead technical initiatives',
      'Define technical direction',
    ],
    requiredSkills: [
      { name: 'Expert Technical Knowledge', level: 'advanced' },
      { name: 'System Design', level: 'advanced' },
      { name: 'Communication & Influence', level: 'advanced' },
      { name: 'Strategic Thinking', level: 'advanced' },
      { name: 'Leadership', level: 'advanced' },
    ],
    optionalSkills: ['Architecture', 'Research', 'Industry Influence'],
    difficulty: 'advanced',
    demandLevel: 'medium',
    salaryRangeIndia: {
      entry: 15,
      mid: 28,
      senior: 60,
    },
    growthPath: [
      'Principal Engineer',
      'Distinguished Engineer',
      'VP Engineering',
      'CTO',
    ],
    workStyle: ['analytical', 'strategic', 'independent'],
    marketOutlook: 'MEDIUM DEMAND but PREMIUM COMPENSATION. Only ~5% of engineers reach here. Career ceiling high.',
    companiesHiring: ['Google', 'Amazon', 'Uber', 'Tech Giants'],
    typicalCompanies: ['Large tech companies', 'Mature startups'],
    averageExperience: '10+ years',
  },

  'developer-advocate': {
    id: 'developer-advocate',
    name: 'Developer Advocate / Relations',
    domain: 'Product & Design',
    description: 'Be the voice of developers. Document APIs, write tutorials, speak at conferences. Build community.',
    dailyWork: [
      'Write technical documentation and guides',
      'Create code examples and tutorials',
      'Speak at conferences and meetups',
      'Build developer community',
      'Gather feedback from developers',
      'Create videos and content',
    ],
    requiredSkills: [
      { name: 'Technical Writing', level: 'advanced' },
      { name: 'Coding Ability', level: 'advanced' },
      { name: 'Communication & Public Speaking', level: 'advanced' },
      { name: 'Product Understanding', level: 'intermediate' },
      { name: 'Empathy', level: 'advanced' },
    ],
    optionalSkills: ['Content Creation', 'Video Production', 'Social Media'],
    difficulty: 'intermediate',
    demandLevel: 'emerging',
    salaryRangeIndia: {
      entry: 6,
      mid: 14,
      senior: 32,
    },
    growthPath: [
      'Senior Developer Advocate',
      'Head of Developer Relations',
      'Developer Experience Director',
      'Product Lead',
    ],
    workStyle: ['creative', 'collaborative', 'public-facing'],
    marketOutlook: 'EMERGING DEMAND. SaaS and platform companies need this. CHILL role with good comp.',
    companiesHiring: ['API companies', 'Cloud providers', 'SaaS startups'],
    typicalCompanies: ['SaaS', 'API platforms', 'Cloud companies'],
    averageExperience: '3–5 years',
  },

  'technical-writer': {
    id: 'technical-writer',
    name: 'Technical Writer',
    domain: 'Product & Design',
    description: 'Create clear documentation for users and developers. Make complex technology understandable.',
    dailyWork: [
      'Write technical documentation',
      'Create API documentation',
      'Write guides and tutorials',
      'Manage documentation site',
      'Collaborate with engineers',
      'Update docs based on feedback',
    ],
    requiredSkills: [
      { name: 'Technical Writing', level: 'advanced' },
      { name: 'Technical Understanding', level: 'intermediate' },
      { name: 'Clarity & Simplicity', level: 'advanced' },
      { name: 'Markdown & Git', level: 'intermediate' },
      { name: 'Communication', level: 'advanced' },
    ],
    optionalSkills: ['API Documentation', 'Diagramming', 'Video', 'UX Writing'],
    difficulty: 'intermediate',
    demandLevel: 'medium',
    salaryRangeIndia: {
      entry: 4,
      mid: 9,
      senior: 22,
    },
    growthPath: [
      'Senior Technical Writer',
      'Documentation Lead',
      'Content Strategy Lead',
      'Head of Documentation',
    ],
    workStyle: ['creative', 'collaborative', 'detail-oriented'],
    marketOutlook: 'GROWING DEMAND. SaaS and dev tool companies need docs. Remote-friendly. Undervalued initially.',
    companiesHiring: ['Tech companies', 'SaaS', 'Documentation startups'],
    typicalCompanies: ['Tech companies', 'SaaS platforms'],
    averageExperience: '2–4 years to mid-level',
  },

  'data-analyst': {
    id: 'data-analyst',
    name: 'Data Analyst',
    domain: 'Data & AI',
    description: 'Extract insights from data. Create dashboards and reports. Support business decisions with data.',
    dailyWork: [
      'Query databases and analyze data',
      'Create dashboards and reports',
      'Perform data exploration',
      'Identify trends and patterns',
      'Present insights to stakeholders',
      'Support business decisions',
    ],
    requiredSkills: [
      { name: 'SQL', level: 'advanced' },
      { name: 'Data Visualization', level: 'advanced' },
      { name: 'Statistical Analysis', level: 'intermediate' },
      { name: 'Business Acumen', level: 'intermediate' },
      { name: 'Problem Solving', level: 'intermediate' },
    ],
    optionalSkills: ['Looker', 'Tableau', 'Python', 'Spreadsheet Mastery'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 4,
      mid: 10,
      senior: 24,
    },
    growthPath: [
      'Senior Data Analyst',
      'Analytics Manager',
      'Data Science transition',
      'Analytics Lead',
    ],
    workStyle: ['analytical', 'collaborative', 'detail-oriented'],
    marketOutlook: 'VERY HIGH DEMAND. Lower barrier than data science. Good path to data science. Growing field.',
    companiesHiring: ['All product companies', 'Every company needs analytics'],
    typicalCompanies: ['Product Companies', 'Analytics-focused', 'Finance'],
    averageExperience: '2–4 years to mid-level',
  },

  'site-reliability-engineer': {
    id: 'site-reliability-engineer',
    name: 'Site Reliability Engineer (SRE)',
    domain: 'Cloud & DevOps',
    description: 'Ensure reliability and performance of systems. Blend operations and engineering. Own uptime.',
    dailyWork: [
      'Monitor system health and performance',
      'Write automation to prevent issues',
      'Deploy and scale systems reliably',
      'Respond to incidents',
      'Improve system reliability',
      'Measure and track SLOs/SLIs',
    ],
    requiredSkills: [
      { name: 'Systems & Networking', level: 'advanced' },
      { name: 'Scripting/Programming', level: 'advanced' },
      { name: 'Linux/Unix', level: 'advanced' },
      { name: 'Troubleshooting', level: 'advanced' },
      { name: 'On-call mindset', level: 'advanced' },
    ],
    optionalSkills: ['Kubernetes', 'Prometheus', 'Python', 'Go'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 8,
      mid: 19,
      senior: 42,
    },
    growthPath: [
      'Senior SRE',
      'SRE Lead',
      'Infrastructure Manager',
      'Engineering Manager',
    ],
    workStyle: ['analytical', 'on-call', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND. On-call compensation appeals to many. Salary growth good. Critical role.',
    companiesHiring: ['Google', 'Amazon', 'Uber', 'Tech Giants'],
    typicalCompanies: ['Tech Giants', 'Scale-ups', 'High-traffic sites'],
    averageExperience: '3–5 years to mid-level',
  },

  // ─────────────────────────────────────────────────────────────
  // GENERIC SOFTWARE ROLES
  // ─────────────────────────────────────────────────────────────

  'software-developer': {
    id: 'software-developer',
    name: 'Software Developer',
    domain: 'Software Engineering',
    description: 'Build high-quality software across the full stack. A software developer is a generalist who can work on frontend, backend, mobile, or full-stack depending on team needs and your growth. Start here if you\'re interested in software development but not sure about specialization.',
    dailyWork: [
      'Write clean, maintainable code',
      'Solve technical problems and debug issues',
      'Collaborate with team members on features',
      'Learn new technologies and frameworks',
      'Test and deploy code',
      'Participate in code reviews',
    ],
    requiredSkills: [
      { name: 'Programming Languages', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
      { name: 'Data Structures & Algorithms', level: 'intermediate' },
      { name: 'Version Control (Git)', level: 'intermediate' },
      { name: 'Web/Mobile Development Basics', level: 'basic' },
    ],
    optionalSkills: ['Multiple Languages', 'Testing', 'Debugging', 'Documentation', 'System Design'],
    difficulty: 'intermediate',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 6,
      mid: 15,
      senior: 35,
    },
    growthPath: [
      'Senior Software Developer',
      'Specialization (Backend/Frontend/Full-Stack/Mobile)',
      'Tech Lead',
      'Engineering Manager',
      'Architect',
    ],
    workStyle: ['analytical', 'collaborative', 'independent'],
    marketOutlook: 'EXTREMELY HIGH DEMAND. Every company needs developers. Best time to start a software development career. Highest salaries in the industry.',
    companiesHiring: ['Every tech company', 'Startups', 'Fortune 500 tech divisions'],
    typicalCompanies: ['Tech Giants', 'Startups', 'Banks', 'E-commerce', 'SaaS'],
    averageExperience: 'Entry-level to senior paths available',
  },

  'software-engineer': {
    id: 'software-engineer',
    name: 'Software Engineer',
    domain: 'Software Engineering',
    description: 'A software engineer with strong fundamentals in computer science. SWE/Software Engineer is a title used interchangeably with Software Developer in most companies. Focus on building robust systems, writing clean code, and solving complex engineering problems.',
    dailyWork: [
      'Design and implement software solutions',
      'Solve algorithmic problems',
      'Write production-quality code',
      'Optimize performance and scalability',
      'Collaborate on system architecture',
      'Mentor junior developers',
    ],
    requiredSkills: [
      { name: 'Programming Language', level: 'advanced' },
      { name: 'Computer Science Fundamentals', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
      { name: 'System Design', level: 'intermediate' },
      { name: 'Coding Best Practices', level: 'intermediate' },
    ],
    optionalSkills: ['Multiple Languages', 'Algorithms & DSA', 'Architecture', 'Leadership', 'Open Source'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 17,
      senior: 40,
    },
    growthPath: [
      'Senior Software Engineer',
      'Staff Engineer',
      'Principal Engineer',
      'Engineering Manager',
      'CTO',
    ],
    workStyle: ['analytical', 'system-focused', 'collaborative'],
    marketOutlook: 'VERY HIGH DEMAND. SWE is the most common title at tech companies. Strong career growth potential. Remote opportunities abundant.',
    companiesHiring: ['Google', 'Amazon', 'Microsoft', 'Meta', 'All tech startups'],
    typicalCompanies: ['Tech Giants', 'High-growth startups', 'Product companies'],
    averageExperience: '2-5 years to mid-level',
  },

  'swe-engineer': {
    id: 'swe-engineer',
    name: 'SWE (Software Engineer)',
    domain: 'Software Engineering',
    description: 'SWE is shorthand for Software Engineer. It\'s the most common job title at tech companies like Google, Amazon, and Meta. As an SWE, you\'ll solve complex technical problems, design scalable systems, and continuously learn new technologies.',
    dailyWork: [
      'Code features from specification to deployment',
      'Participate in design reviews',
      'Solve challenging technical problems',
      'Test and debug code thoroughly',
      'Optimize for performance and reliability',
      'Collaborate cross-functionally',
    ],
    requiredSkills: [
      { name: 'Programming Language', level: 'advanced' },
      { name: 'Data Structures & Algorithms', level: 'intermediate' },
      { name: 'Problem Solving', level: 'advanced' },
      { name: 'Software Design', level: 'intermediate' },
      { name: 'Testing & Debugging', level: 'intermediate' },
    ],
    optionalSkills: ['System Design', 'Scalability', 'Performance Tuning', 'Networking', 'Architecture'],
    difficulty: 'advanced',
    demandLevel: 'high',
    salaryRangeIndia: {
      entry: 7,
      mid: 17,
      senior: 40,
    },
    growthPath: [
      'Senior SWE',
      'Staff Engineer',
      'Senior Staff Engineer',
      'Engineering Manager',
      'Director of Engineering',
    ],
    workStyle: ['analytical', 'collaborative', 'independent'],
    marketOutlook: 'HIGHEST DEMAND ROLE. The industry standard title. Used by Google, Amazon, Meta, Microsoft. Premium compensation.',
    companiesHiring: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    typicalCompanies: ['Tech Giants', 'FAANG companies', 'Unicorn startups'],
    averageExperience: '3-5 years to mid-level',
  },
}

// ─────────────────────────────────────────────────────────────
// ROLE GROUPING BY DOMAIN
// ─────────────────────────────────────────────────────────────

export const rolesByDomain = {
  'Software Engineering': [
    'backend-engineer',
    'frontend-engineer',
    'full-stack-engineer',
    'qa-engineer',
    'mobile-engineer-ios',
    'mobile-engineer-android',
    'game-developer',
    'tech-lead',
    'engineering-manager',
    'staff-engineer',
    'software-developer',
    'software-engineer',
    'swe-engineer',
  ],
  'Data & AI': [
    'data-engineer',
    'data-scientist',
    'ml-engineer',
    'llm-engineer',
    'analytics-engineer',
    'ai-researcher',
    'bioinformatics-engineer',
    'data-analyst',
  ],
  Cybersecurity: [
    'security-engineer',
    'penetration-tester',
    'incident-response-engineer',
    'cloud-security-engineer',
    'security-architect',
  ],
  'Cloud & DevOps': [
    'devops-engineer',
    'solutions-architect',
    'platform-engineer',
    'site-reliability-engineer',
  ],
  'Product & Design': [
    'product-manager',
    'ux-designer',
    'ui-designer',
    'product-designer',
    'design-systems-engineer',
    'developer-advocate',
    'technical-writer',
  ],
  'Mobile & Game Dev': [
    'mobile-engineer-ios',
    'mobile-engineer-android',
    'game-developer',
  ],
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

export function getRoleById(id: string): Role | undefined {
  return roleDatabase[id]
}

export function getAllRoles(): Role[] {
  return Object.values(roleDatabase)
}

export function getRolesByDomain(domain: Role['domain']): Role[] {
  const roleIds = rolesByDomain[domain] || []
  return roleIds
    .map(id => roleDatabase[id])
    .filter((role): role is Role => !!role)
}

/**
 * Smart role search with abbreviation mapping and fuzzy matching
 */
export function searchRoles(query: string): Role[] {
  const lowerQuery = query.toLowerCase().trim()
  
  // Abbreviation mappings and role name variations
  const abbreviationMap: Record<string, string[]> = {
    // Generic Software Roles (DO NOT MAP - these are now primary roles)
    'swe': ['swe (software engineer)', 'software engineer', 'software developer'],
    'se': ['swe (software engineer)', 'software engineer'],
    'swde': ['software developer', 'software engineer'],
    'software developer': ['software developer'],
    'software engineer': ['software engineer', 'swe (software engineer)'],
    
    // Specific specializations (map to actual specialized roles)
    'sde': ['backend engineer', 'full stack engineer', 'frontend engineer'],
    'backend developer': ['backend engineer'],
    'frontend developer': ['frontend engineer'],
    'fullstack developer': ['full stack engineer'],
    'full stack': ['full stack engineer'],
    
    // Abbreviations for specializations
    'fe': ['frontend engineer', 'ui engineer'],
    'fsd': ['full stack engineer'],
    'devops': ['devops engineer'],
    'dsa': ['data scientist', 'data analyst'],
    
    // Language-specific developers
    'java developer': ['backend engineer'],
    'python developer': ['backend engineer', 'data engineer', 'ml engineer'],
    'javascript developer': ['frontend engineer', 'full stack engineer'],
    'web developer': ['frontend engineer', 'full stack engineer'],
    'mobile developer': ['ios engineer', 'android engineer'],
    
    // Other specializations
    'database engineer': ['data engineer', 'backend engineer'],
    'infrastructure engineer': ['devops engineer', 'platform engineer'],
    'platform engineer': ['devops engineer', 'platform engineer'],
    'sdet': ['qa engineer', 'qa/test automation engineer', 'test automation'],
    'pm': ['product manager'],
    'de': ['data engineer', 'backend engineer'],
    'ml': ['machine learning engineer', 'ml engineer'],
    'developer': ['software developer', 'backend engineer', 'full stack engineer', 'frontend engineer'],
  }
  
  // Check if query matches an abbreviation directly
  if (abbreviationMap[lowerQuery]) {
    const searchTerms = abbreviationMap[lowerQuery]
    return getAllRoles()
      .filter(role => {
        const roleName = role.name.toLowerCase()
        return searchTerms.some(term => term.includes(roleName) || roleName.includes(term))
      })
      .sort((a, b) => {
        // Sort by relevance - exact matches first
        const aExactMatch = searchTerms.some(term => a.name.toLowerCase() === term) ? 0 : 1
        const bExactMatch = searchTerms.some(term => b.name.toLowerCase() === term) ? 0 : 1
        return aExactMatch - bExactMatch
      })
  }
  
  // Fuzzy match and exact match
  const allRoles = getAllRoles()
  const results: { role: Role; score: number }[] = []
  
  allRoles.forEach(role => {
    let score = 0
    
    // Exact matches
    const roleName = role.name.toLowerCase()
    if (roleName === lowerQuery) score += 100
    if (roleName.includes(lowerQuery)) score += 50
    
    // Word-by-word matching for multi-word queries
    const queryWords = lowerQuery.split(/\s+/)
    const roleNameWords = roleName.split(/\s+/)
    const matchedWords = queryWords.filter(word => roleNameWords.some(rword => rword.includes(word) || word.includes(rword)))
    if (matchedWords.length > 0) {
      score += 35 * (matchedWords.length / Math.max(queryWords.length, roleNameWords.length))
    }
    
    // Description match
    const description = role.description.toLowerCase()
    if (description.includes(lowerQuery)) score += 25
    
    // Skill match
    if (role.requiredSkills.some(skill => skill.name.toLowerCase().includes(lowerQuery))) {
      score += 20
    }
    
    // Domain match
    if (role.domain.toLowerCase().includes(lowerQuery)) score += 15
    
    // Levenshtein distance for fuzzy matching (simple version)
    const similarity = calculateSimilarity(lowerQuery, roleName)
    if (similarity > 0.6) score += 40 * similarity
    
    if (score > 0) {
      results.push({ role, score })
    }
  })
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 matches
    .map(item => item.role)
}

/**
 * Calculate string similarity (Levenshtein-based, simplified)
 */
function calculateSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  
  if (longer.length === 0) return 1.0
  
  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate edit distance between two strings
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []
  
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  
  return costs[s2.length]
}

export function getRoleCount(): number {
  return Object.keys(roleDatabase).length
}
