export interface RoleData {
  role_name: string
  domain: string
  track: string
  description: string
  daily_work: string[]
  skills_required: string[]
  tools: string[]
  difficulty_level: number
  learning_time_months: { min: number; max: number }
  market_demand_weight: number
  salary_range: { entry: number; mid: number; senior: number }
  growth_path: string[]
  specializations?: string[]
}

export interface DomainStructure {
  domain: string
  tracks: {
    track: string
    roles: string[]
  }[]
}

const ROLE_DATABASE: RoleData[] = [
  {
    role_name: 'Frontend Developer',
    domain: 'Software Development',
    track: 'Web Development',
    description: 'Build user-facing web interfaces using modern frameworks and ensure responsive, accessible experiences',
    daily_work: ['Implement UI designs from mockups', 'Optimize web performance and loading times', 'Debug cross-browser compatibility issues', 'Collaborate with designers and backend engineers', 'Write component-based code'],
    skills_required: ['HTML', 'CSS', 'JavaScript', 'React/Vue/Angular', 'Responsive Design', 'Git'],
    tools: ['React', 'TypeScript', 'Tailwind CSS', 'Webpack', 'Figma', 'Chrome DevTools'],
    difficulty_level: 5,
    learning_time_months: { min: 4, max: 8 },
    market_demand_weight: 95,
    salary_range: { entry: 65000, mid: 95000, senior: 140000 },
    growth_path: ['Junior Frontend Developer', 'Frontend Developer', 'Senior Frontend Developer', 'Frontend Architect'],
    specializations: ['Web Performance Engineer', 'Accessibility Engineer', 'UI Engineer']
  },
  {
    role_name: 'Backend Developer',
    domain: 'Software Development',
    track: 'Web Development',
    description: 'Design and build server-side application logic, databases, and APIs that power web applications',
    daily_work: ['Design database schemas and optimize queries', 'Build RESTful or GraphQL APIs', 'Implement authentication and authorization', 'Deploy and monitor production systems', 'Handle data processing and business logic'],
    skills_required: ['Server-side language (Node.js/Python/Java)', 'SQL/NoSQL', 'API Design', 'Authentication', 'System Design', 'Git'],
    tools: ['Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Redis', 'AWS/GCP'],
    difficulty_level: 6,
    learning_time_months: { min: 5, max: 10 },
    market_demand_weight: 98,
    salary_range: { entry: 70000, mid: 105000, senior: 160000 },
    growth_path: ['Junior Backend Developer', 'Backend Developer', 'Senior Backend Developer', 'Backend Architect'],
    specializations: ['API Engineer', 'Database Engineer', 'Microservices Engineer']
  },
  {
    role_name: 'Full Stack Developer',
    domain: 'Software Development',
    track: 'Web Development',
    description: 'Work across the entire web application stack from frontend to backend and databases',
    daily_work: ['Build complete features end-to-end', 'Design system architecture', 'Integrate frontend with backend APIs', 'Manage deployments', 'Debug across the full stack'],
    skills_required: ['Frontend frameworks', 'Backend frameworks', 'Database design', 'DevOps basics', 'Git', 'System design'],
    tools: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'AWS'],
    difficulty_level: 7,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 100,
    salary_range: { entry: 75000, mid: 115000, senior: 175000 },
    growth_path: ['Full Stack Developer', 'Senior Full Stack Developer', 'Tech Lead', 'Engineering Manager'],
    specializations: ['MERN Stack Developer', 'JAMstack Developer', 'Serverless Developer']
  },
  {
    role_name: 'Android Developer',
    domain: 'Software Development',
    track: 'Mobile Development',
    description: 'Build native mobile applications for Android devices using Kotlin or Java',
    daily_work: ['Design mobile app architecture', 'Implement UI with Material Design', 'Integrate APIs and local databases', 'Optimize app performance and battery usage', 'Debug on various Android devices'],
    skills_required: ['Kotlin/Java', 'Android SDK', 'Jetpack Compose', 'REST APIs', 'SQLite', 'Git'],
    tools: ['Android Studio', 'Kotlin', 'Firebase', 'Retrofit', 'Room Database', 'Gradle'],
    difficulty_level: 6,
    learning_time_months: { min: 6, max: 10 },
    market_demand_weight: 85,
    salary_range: { entry: 70000, mid: 100000, senior: 150000 },
    growth_path: ['Junior Android Developer', 'Android Developer', 'Senior Android Developer', 'Mobile Architect'],
    specializations: ['Jetpack Compose Specialist', 'Android Performance Engineer']
  },
  {
    role_name: 'iOS Developer',
    domain: 'Software Development',
    track: 'Mobile Development',
    description: 'Create native iOS applications for iPhone and iPad using Swift and Apple frameworks',
    daily_work: ['Design iOS app architecture', 'Implement UI with SwiftUI/UIKit', 'Integrate with Apple services', 'Handle app store submissions', 'Debug across iOS devices'],
    skills_required: ['Swift', 'iOS SDK', 'SwiftUI/UIKit', 'Core Data', 'REST APIs', 'Git'],
    tools: ['Xcode', 'Swift', 'Firebase', 'Alamofire', 'Core Data', 'TestFlight'],
    difficulty_level: 6,
    learning_time_months: { min: 6, max: 10 },
    market_demand_weight: 83,
    salary_range: { entry: 72000, mid: 105000, senior: 155000 },
    growth_path: ['Junior iOS Developer', 'iOS Developer', 'Senior iOS Developer', 'Mobile Architect'],
    specializations: ['SwiftUI Specialist', 'iOS Performance Engineer']
  },
  {
    role_name: 'Flutter Developer',
    domain: 'Software Development',
    track: 'Mobile Development',
    description: 'Build cross-platform mobile apps for iOS and Android using Flutter and Dart',
    daily_work: ['Create reusable Flutter widgets', 'Implement state management', 'Build for both iOS and Android', 'Integrate native features', 'Optimize app performance'],
    skills_required: ['Dart', 'Flutter', 'State Management', 'REST APIs', 'Mobile UI/UX', 'Git'],
    tools: ['Flutter', 'Dart', 'Firebase', 'Riverpod/Bloc', 'Android Studio/VS Code'],
    difficulty_level: 5,
    learning_time_months: { min: 5, max: 9 },
    market_demand_weight: 78,
    salary_range: { entry: 65000, mid: 95000, senior: 145000 },
    growth_path: ['Flutter Developer', 'Senior Flutter Developer', 'Mobile Architect'],
    specializations: ['Flutter Web Developer', 'Flutter Desktop Developer']
  },
  {
    role_name: 'React Native Developer',
    domain: 'Software Development',
    track: 'Mobile Development',
    description: 'Develop cross-platform mobile applications using React Native and JavaScript',
    daily_work: ['Build mobile UI with React Native', 'Bridge native modules when needed', 'Manage app state', 'Debug on iOS and Android', 'Optimize bundle size and performance'],
    skills_required: ['JavaScript/TypeScript', 'React', 'React Native', 'Mobile APIs', 'Native bridges', 'Git'],
    tools: ['React Native', 'Expo', 'Redux', 'Firebase', 'Xcode', 'Android Studio'],
    difficulty_level: 6,
    learning_time_months: { min: 5, max: 9 },
    market_demand_weight: 80,
    salary_range: { entry: 68000, mid: 98000, senior: 148000 },
    growth_path: ['React Native Developer', 'Senior React Native Developer', 'Mobile Architect'],
    specializations: ['Expo Specialist', 'Native Module Developer']
  },
  {
    role_name: 'Game Developer',
    domain: 'Software Development',
    track: 'Specialized Engineering',
    description: 'Design and program video games for various platforms using game engines',
    daily_work: ['Implement game mechanics and physics', 'Optimize rendering performance', 'Create gameplay systems', 'Debug complex game logic', 'Collaborate with artists and designers'],
    skills_required: ['C++/C#', 'Game engines', '3D math', 'Physics', 'Graphics programming', 'Git'],
    tools: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Blender', 'Git'],
    difficulty_level: 8,
    learning_time_months: { min: 10, max: 18 },
    market_demand_weight: 65,
    salary_range: { entry: 60000, mid: 90000, senior: 140000 },
    growth_path: ['Junior Game Developer', 'Game Developer', 'Senior Game Developer', 'Technical Director'],
    specializations: ['Graphics Programmer', 'Gameplay Programmer', 'Engine Programmer']
  },
  {
    role_name: 'Embedded Systems Engineer',
    domain: 'Software Development',
    track: 'Specialized Engineering',
    description: 'Develop software for embedded hardware systems and IoT devices',
    daily_work: ['Write low-level firmware code', 'Debug hardware-software interactions', 'Optimize for memory and power', 'Interface with sensors and actuators', 'Test on physical devices'],
    skills_required: ['C/C++', 'Embedded systems', 'RTOS', 'Hardware protocols', 'Debugging tools', 'Version control'],
    tools: ['C', 'ARM Cortex', 'FreeRTOS', 'Oscilloscope', 'JTAG debugger', 'Git'],
    difficulty_level: 9,
    learning_time_months: { min: 12, max: 20 },
    market_demand_weight: 70,
    salary_range: { entry: 75000, mid: 110000, senior: 165000 },
    growth_path: ['Embedded Developer', 'Senior Embedded Engineer', 'Firmware Architect'],
    specializations: ['IoT Engineer', 'Automotive Software Engineer', 'Robotics Engineer']
  },
  {
    role_name: 'Data Analyst',
    domain: 'Data & AI',
    track: 'Data',
    description: 'Analyze data to extract insights and support business decision-making',
    daily_work: ['Clean and prepare datasets', 'Perform statistical analysis', 'Create visualizations and dashboards', 'Present findings to stakeholders', 'Identify trends and patterns'],
    skills_required: ['SQL', 'Excel', 'Statistics', 'Data visualization', 'Python/R basics', 'Business acumen'],
    tools: ['SQL', 'Excel', 'Tableau', 'Power BI', 'Python', 'Pandas'],
    difficulty_level: 4,
    learning_time_months: { min: 3, max: 6 },
    market_demand_weight: 92,
    salary_range: { entry: 55000, mid: 80000, senior: 120000 },
    growth_path: ['Junior Data Analyst', 'Data Analyst', 'Senior Data Analyst', 'Analytics Manager'],
    specializations: ['Marketing Analyst', 'Financial Analyst', 'Product Analyst']
  },
  {
    role_name: 'Business Analyst',
    domain: 'Data & AI',
    track: 'Data',
    description: 'Bridge business needs and technical solutions through data-driven analysis',
    daily_work: ['Gather business requirements', 'Analyze processes and workflows', 'Create reports and presentations', 'Recommend improvements', 'Collaborate with stakeholders'],
    skills_required: ['Business analysis', 'SQL', 'Requirements gathering', 'Process modeling', 'Communication', 'Excel'],
    tools: ['SQL', 'Excel', 'Tableau', 'JIRA', 'Confluence', 'Visio'],
    difficulty_level: 4,
    learning_time_months: { min: 3, max: 7 },
    market_demand_weight: 88,
    salary_range: { entry: 58000, mid: 85000, senior: 125000 },
    growth_path: ['Business Analyst', 'Senior Business Analyst', 'Lead Business Analyst', 'Product Manager'],
    specializations: ['IT Business Analyst', 'Systems Analyst', 'Process Analyst']
  },
  {
    role_name: 'Data Engineer',
    domain: 'Data & AI',
    track: 'Data',
    description: 'Build and maintain data pipelines and infrastructure for analytics',
    daily_work: ['Design ETL/ELT pipelines', 'Build data warehouses', 'Optimize data processing', 'Ensure data quality', 'Deploy on cloud platforms'],
    skills_required: ['Python', 'SQL', 'ETL tools', 'Data modeling', 'Cloud platforms', 'Distributed systems'],
    tools: ['Python', 'Spark', 'Airflow', 'AWS/GCP', 'SQL', 'Kafka'],
    difficulty_level: 7,
    learning_time_months: { min: 6, max: 12 },
    market_demand_weight: 96,
    salary_range: { entry: 80000, mid: 120000, senior: 180000 },
    growth_path: ['Data Engineer', 'Senior Data Engineer', 'Lead Data Engineer', 'Data Architect'],
    specializations: ['Cloud Data Engineer', 'Big Data Engineer', 'Streaming Engineer']
  },
  {
    role_name: 'Machine Learning Engineer',
    domain: 'Data & AI',
    track: 'AI/ML',
    description: 'Build and deploy machine learning models to production systems',
    daily_work: ['Train and tune ML models', 'Feature engineering', 'Deploy models to production', 'Monitor model performance', 'Optimize inference speed'],
    skills_required: ['Python', 'Machine learning', 'Deep learning', 'MLOps', 'Statistics', 'Software engineering'],
    tools: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Docker', 'Kubernetes'],
    difficulty_level: 8,
    learning_time_months: { min: 10, max: 16 },
    market_demand_weight: 98,
    salary_range: { entry: 95000, mid: 140000, senior: 210000 },
    growth_path: ['ML Engineer', 'Senior ML Engineer', 'Staff ML Engineer', 'ML Architect'],
    specializations: ['Deep Learning Engineer', 'Computer Vision Engineer', 'NLP Engineer']
  },
  {
    role_name: 'NLP Engineer',
    domain: 'Data & AI',
    track: 'AI/ML',
    description: 'Develop natural language processing systems for text understanding and generation',
    daily_work: ['Build text processing pipelines', 'Fine-tune language models', 'Implement chatbots and conversational AI', 'Work with embeddings and transformers', 'Evaluate model outputs'],
    skills_required: ['Python', 'NLP', 'Transformers', 'Deep learning', 'Linguistics basics', 'MLOps'],
    tools: ['Python', 'Hugging Face', 'spaCy', 'PyTorch', 'LangChain', 'OpenAI API'],
    difficulty_level: 8,
    learning_time_months: { min: 9, max: 15 },
    market_demand_weight: 94,
    salary_range: { entry: 90000, mid: 135000, senior: 200000 },
    growth_path: ['NLP Engineer', 'Senior NLP Engineer', 'NLP Research Engineer'],
    specializations: ['LLM Engineer', 'Conversational AI Engineer', 'Speech Recognition Engineer']
  },
  {
    role_name: 'Computer Vision Engineer',
    domain: 'Data & AI',
    track: 'AI/ML',
    description: 'Build AI systems that interpret and understand visual data from images and videos',
    daily_work: ['Train object detection models', 'Implement image segmentation', 'Optimize model inference', 'Work with video processing', 'Deploy vision models'],
    skills_required: ['Python', 'Computer vision', 'Deep learning', 'Image processing', 'Neural networks', 'C++'],
    tools: ['Python', 'PyTorch', 'OpenCV', 'YOLO', 'TensorFlow', 'CUDA'],
    difficulty_level: 9,
    learning_time_months: { min: 10, max: 16 },
    market_demand_weight: 90,
    salary_range: { entry: 95000, mid: 140000, senior: 205000 },
    growth_path: ['CV Engineer', 'Senior CV Engineer', 'Computer Vision Architect'],
    specializations: ['3D Vision Engineer', 'Medical Imaging Engineer', 'Autonomous Driving Engineer']
  },
  {
    role_name: 'MLOps Engineer',
    domain: 'Data & AI',
    track: 'AI/ML',
    description: 'Operationalize machine learning models and build ML infrastructure',
    daily_work: ['Build ML deployment pipelines', 'Monitor model performance', 'Automate training workflows', 'Manage ML infrastructure', 'Implement A/B testing'],
    skills_required: ['Python', 'MLOps', 'DevOps', 'Cloud platforms', 'Kubernetes', 'CI/CD'],
    tools: ['MLflow', 'Kubeflow', 'Docker', 'Kubernetes', 'Airflow', 'AWS SageMaker'],
    difficulty_level: 8,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 92,
    salary_range: { entry: 90000, mid: 130000, senior: 190000 },
    growth_path: ['MLOps Engineer', 'Senior MLOps Engineer', 'ML Platform Engineer'],
    specializations: ['ML Infrastructure Engineer', 'AI Platform Engineer']
  },
  {
    role_name: 'Data Scientist',
    domain: 'Data & AI',
    track: 'AI/ML',
    description: 'Apply statistical and machine learning techniques to solve business problems',
    daily_work: ['Explore and visualize data', 'Build predictive models', 'Run experiments and A/B tests', 'Communicate insights', 'Collaborate with stakeholders'],
    skills_required: ['Python/R', 'Statistics', 'Machine learning', 'Data visualization', 'SQL', 'Communication'],
    tools: ['Python', 'Jupyter', 'scikit-learn', 'Pandas', 'SQL', 'Tableau'],
    difficulty_level: 7,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 95,
    salary_range: { entry: 85000, mid: 125000, senior: 185000 },
    growth_path: ['Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Principal Data Scientist'],
    specializations: ['Research Scientist', 'Applied Scientist', 'Decision Scientist']
  },
  {
    role_name: 'DevOps Engineer',
    domain: 'Cloud & DevOps',
    track: 'Infrastructure',
    description: 'Automate deployment pipelines and manage cloud infrastructure',
    daily_work: ['Build CI/CD pipelines', 'Manage cloud infrastructure', 'Automate deployments', 'Monitor system health', 'Handle incidents'],
    skills_required: ['Linux', 'Cloud platforms', 'CI/CD', 'Infrastructure as code', 'Scripting', 'Containers'],
    tools: ['AWS/GCP/Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git'],
    difficulty_level: 7,
    learning_time_months: { min: 7, max: 12 },
    market_demand_weight: 97,
    salary_range: { entry: 80000, mid: 115000, senior: 170000 },
    growth_path: ['DevOps Engineer', 'Senior DevOps Engineer', 'DevOps Architect', 'Platform Engineer'],
    specializations: ['Cloud DevOps Engineer', 'Security DevOps Engineer', 'Release Engineer']
  },
  {
    role_name: 'Site Reliability Engineer',
    domain: 'Cloud & DevOps',
    track: 'Infrastructure',
    description: 'Ensure system reliability, availability, and performance at scale',
    daily_work: ['Monitor production systems', 'Respond to incidents', 'Improve system reliability', 'Automate operational tasks', 'Capacity planning'],
    skills_required: ['Linux', 'Distributed systems', 'Monitoring', 'Automation', 'Cloud platforms', 'Programming'],
    tools: ['Kubernetes', 'Prometheus', 'Grafana', 'Terraform', 'Python', 'AWS/GCP'],
    difficulty_level: 8,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 93,
    salary_range: { entry: 90000, mid: 130000, senior: 190000 },
    growth_path: ['SRE', 'Senior SRE', 'Staff SRE', 'SRE Manager'],
    specializations: ['Production Engineer', 'Infrastructure SRE', 'Platform SRE']
  },
  {
    role_name: 'Cloud Engineer',
    domain: 'Cloud & DevOps',
    track: 'Infrastructure',
    description: 'Design and implement cloud infrastructure solutions',
    daily_work: ['Design cloud architectures', 'Deploy cloud resources', 'Optimize cloud costs', 'Implement security best practices', 'Migrate workloads to cloud'],
    skills_required: ['Cloud platforms', 'Infrastructure as code', 'Networking', 'Security', 'Automation', 'Linux'],
    tools: ['AWS/Azure/GCP', 'Terraform', 'CloudFormation', 'Docker', 'Kubernetes', 'Python'],
    difficulty_level: 7,
    learning_time_months: { min: 6, max: 11 },
    market_demand_weight: 96,
    salary_range: { entry: 85000, mid: 120000, senior: 175000 },
    growth_path: ['Cloud Engineer', 'Senior Cloud Engineer', 'Cloud Architect', 'Cloud Solutions Architect'],
    specializations: ['AWS Specialist', 'Azure Specialist', 'Multi-Cloud Engineer']
  },
  {
    role_name: 'Cloud Architect',
    domain: 'Cloud & DevOps',
    track: 'Infrastructure',
    description: 'Design enterprise-scale cloud architectures and migration strategies',
    daily_work: ['Design cloud solutions', 'Create architecture diagrams', 'Review technical designs', 'Provide guidance to teams', 'Ensure best practices'],
    skills_required: ['Cloud platforms', 'System design', 'Architecture patterns', 'Security', 'Cost optimization', 'Leadership'],
    tools: ['AWS/Azure/GCP', 'Architecture tools', 'Terraform', 'Kubernetes', 'Documentation'],
    difficulty_level: 9,
    learning_time_months: { min: 12, max: 20 },
    market_demand_weight: 90,
    salary_range: { entry: 110000, mid: 160000, senior: 230000 },
    growth_path: ['Cloud Engineer', 'Senior Cloud Engineer', 'Cloud Architect', 'Principal Architect'],
    specializations: ['Solutions Architect', 'Enterprise Architect', 'Security Architect']
  },
  {
    role_name: 'Kubernetes Engineer',
    domain: 'Cloud & DevOps',
    track: 'Infrastructure',
    description: 'Manage and optimize Kubernetes clusters and containerized applications',
    daily_work: ['Deploy and manage K8s clusters', 'Configure workloads and services', 'Troubleshoot container issues', 'Implement security policies', 'Optimize resource usage'],
    skills_required: ['Kubernetes', 'Docker', 'Linux', 'Networking', 'YAML', 'Automation'],
    tools: ['Kubernetes', 'Helm', 'Docker', 'kubectl', 'Prometheus', 'Istio'],
    difficulty_level: 8,
    learning_time_months: { min: 7, max: 13 },
    market_demand_weight: 88,
    salary_range: { entry: 85000, mid: 125000, senior: 180000 },
    growth_path: ['K8s Engineer', 'Senior K8s Engineer', 'Platform Engineer'],
    specializations: ['Service Mesh Engineer', 'Container Security Engineer']
  },
  {
    role_name: 'Security Engineer',
    domain: 'Cybersecurity',
    track: 'Security Operations',
    description: 'Protect systems and data from security threats and vulnerabilities',
    daily_work: ['Monitor security alerts', 'Conduct vulnerability assessments', 'Implement security controls', 'Respond to incidents', 'Security tool management'],
    skills_required: ['Network security', 'Threat analysis', 'Security tools', 'Incident response', 'Linux', 'Scripting'],
    tools: ['SIEM', 'IDS/IPS', 'Wireshark', 'Nmap', 'Metasploit', 'Python'],
    difficulty_level: 8,
    learning_time_months: { min: 9, max: 15 },
    market_demand_weight: 94,
    salary_range: { entry: 80000, mid: 120000, senior: 175000 },
    growth_path: ['Security Analyst', 'Security Engineer', 'Senior Security Engineer', 'Security Architect'],
    specializations: ['Application Security Engineer', 'Cloud Security Engineer', 'Network Security Engineer']
  },
  {
    role_name: 'Penetration Tester',
    domain: 'Cybersecurity',
    track: 'Offensive Security',
    description: 'Ethically hack systems to discover vulnerabilities before attackers do',
    daily_work: ['Plan penetration tests', 'Perform vulnerability scanning', 'Exploit security weaknesses', 'Write detailed reports', 'Recommend fixes'],
    skills_required: ['Ethical hacking', 'Web security', 'Network protocols', 'Exploitation techniques', 'Report writing', 'Scripting'],
    tools: ['Kali Linux', 'Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 'Python'],
    difficulty_level: 9,
    learning_time_months: { min: 10, max: 18 },
    market_demand_weight: 85,
    salary_range: { entry: 75000, mid: 115000, senior: 170000 },
    growth_path: ['Junior Pentester', 'Penetration Tester', 'Senior Pentester', 'Red Team Lead'],
    specializations: ['Web App Pentester', 'Mobile Pentester', 'Red Team Operator']
  },
  {
    role_name: 'Cybersecurity Analyst',
    domain: 'Cybersecurity',
    track: 'Security Operations',
    description: 'Monitor and analyze security events to protect organizational assets',
    daily_work: ['Monitor security dashboards', 'Analyze security logs', 'Investigate alerts', 'Create incident reports', 'Recommend improvements'],
    skills_required: ['Security fundamentals', 'SIEM tools', 'Log analysis', 'Incident response', 'Threat intelligence', 'Networking'],
    tools: ['Splunk', 'QRadar', 'CrowdStrike', 'Wireshark', 'threat intelligence platforms'],
    difficulty_level: 6,
    learning_time_months: { min: 6, max: 10 },
    market_demand_weight: 92,
    salary_range: { entry: 65000, mid: 95000, senior: 140000 },
    growth_path: ['Security Analyst', 'Senior Security Analyst', 'Security Engineer', 'SOC Manager'],
    specializations: ['SOC Analyst', 'Threat Intelligence Analyst', 'Incident Responder']
  },
  {
    role_name: 'UI Designer',
    domain: 'Design & Product',
    track: 'Design',
    description: 'Create visually appealing and intuitive user interfaces',
    daily_work: ['Design UI components and screens', 'Create design systems', 'Collaborate with developers', 'Iterate based on feedback', 'Maintain brand consistency'],
    skills_required: ['Visual design', 'Typography', 'Color theory', 'Design tools', 'Attention to detail', 'Communication'],
    tools: ['Figma', 'Adobe XD', 'Sketch', 'Illustrator', 'Photoshop'],
    difficulty_level: 5,
    learning_time_months: { min: 4, max: 8 },
    market_demand_weight: 82,
    salary_range: { entry: 55000, mid: 85000, senior: 130000 },
    growth_path: ['UI Designer', 'Senior UI Designer', 'Lead Designer', 'Design Director'],
    specializations: ['Visual Designer', 'Brand Designer', 'Interaction Designer']
  },
  {
    role_name: 'UX Designer',
    domain: 'Design & Product',
    track: 'Design',
    description: 'Research user needs and design optimal user experiences',
    daily_work: ['Conduct user research', 'Create user flows and wireframes', 'Run usability tests', 'Iterate on designs', 'Collaborate with stakeholders'],
    skills_required: ['User research', 'Information architecture', 'Wireframing', 'Prototyping', 'Usability testing', 'Empathy'],
    tools: ['Figma', 'Miro', 'UserTesting', 'Maze', 'Optimal Workshop'],
    difficulty_level: 6,
    learning_time_months: { min: 5, max: 9 },
    market_demand_weight: 87,
    salary_range: { entry: 60000, mid: 90000, senior: 140000 },
    growth_path: ['UX Designer', 'Senior UX Designer', 'Lead UX Designer', 'UX Director'],
    specializations: ['UX Researcher', 'Information Architect', 'Service Designer']
  },
  {
    role_name: 'Product Designer',
    domain: 'Design & Product',
    track: 'Design',
    description: 'Own end-to-end design from research to visual execution',
    daily_work: ['Research user problems', 'Design complete product experiences', 'Create prototypes', 'Collaborate with product and engineering', 'Test and iterate'],
    skills_required: ['UX research', 'UI design', 'Prototyping', 'Product thinking', 'Communication', 'Systems thinking'],
    tools: ['Figma', 'Miro', 'Principle', 'Framer', 'Analytics tools'],
    difficulty_level: 7,
    learning_time_months: { min: 6, max: 11 },
    market_demand_weight: 90,
    salary_range: { entry: 70000, mid: 105000, senior: 160000 },
    growth_path: ['Product Designer', 'Senior Product Designer', 'Lead Product Designer', 'Design Manager'],
    specializations: ['UX/UI Designer', 'Design Strategist', 'Design Systems Designer']
  },
  {
    role_name: 'Product Manager',
    domain: 'Design & Product',
    track: 'Product',
    description: 'Define product vision and roadmap while coordinating cross-functional teams',
    daily_work: ['Define product strategy', 'Prioritize features', 'Write specifications', 'Coordinate with engineering and design', 'Analyze metrics'],
    skills_required: ['Product strategy', 'User research', 'Data analysis', 'Communication', 'Prioritization', 'Technical understanding'],
    tools: ['JIRA', 'Confluence', 'Analytics', 'Figma', 'Roadmap tools'],
    difficulty_level: 7,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 93,
    salary_range: { entry: 85000, mid: 125000, senior: 190000 },
    growth_path: ['Associate PM', 'Product Manager', 'Senior PM', 'Director of Product'],
    specializations: ['Technical PM', 'Growth PM', 'Platform PM']
  },
  {
    role_name: 'Technical Product Manager',
    domain: 'Design & Product',
    track: 'Product',
    description: 'Manage technical products with deep engineering understanding',
    daily_work: ['Define technical requirements', 'Work closely with engineering', 'Make technical tradeoffs', 'Plan architecture', 'Manage API products'],
    skills_required: ['Engineering background', 'System design', 'API design', 'Technical communication', 'Product strategy', 'Data analysis'],
    tools: ['JIRA', 'Git', 'API documentation tools', 'Database tools', 'Analytics'],
    difficulty_level: 8,
    learning_time_months: { min: 10, max: 16 },
    market_demand_weight: 88,
    salary_range: { entry: 95000, mid: 140000, senior: 210000 },
    growth_path: ['Technical PM', 'Senior Technical PM', 'Principal PM', 'VP of Product'],
    specializations: ['Platform PM', 'Infrastructure PM', 'Developer Tools PM']
  },
  {
    role_name: 'QA Engineer',
    domain: 'Testing & Quality',
    track: 'Quality Assurance',
    description: 'Ensure software quality through testing and quality processes',
    daily_work: ['Design test cases', 'Execute manual tests', 'Report bugs', 'Verify fixes', 'Participate in requirements review'],
    skills_required: ['Testing fundamentals', 'Bug tracking', 'Test planning', 'Attention to detail', 'Communication', 'Basic SQL'],
    tools: ['JIRA', 'TestRail', 'Postman', 'Browser DevTools', 'SQL'],
    difficulty_level: 4,
    learning_time_months: { min: 3, max: 6 },
    market_demand_weight: 78,
    salary_range: { entry: 50000, mid: 75000, senior: 110000 },
    growth_path: ['QA Tester', 'QA Engineer', 'Senior QA Engineer', 'QA Lead'],
    specializations: ['Manual Tester', 'API Tester', 'Mobile QA']
  },
  {
    role_name: 'Automation Test Engineer',
    domain: 'Testing & Quality',
    track: 'Quality Assurance',
    description: 'Build automated test frameworks and scripts',
    daily_work: ['Write automated tests', 'Maintain test frameworks', 'Integrate with CI/CD', 'Debug test failures', 'Improve test coverage'],
    skills_required: ['Programming', 'Test automation', 'Testing frameworks', 'CI/CD', 'Git', 'API testing'],
    tools: ['Selenium', 'Pytest', 'Cypress', 'Jenkins', 'Git', 'Postman'],
    difficulty_level: 6,
    learning_time_months: { min: 5, max: 9 },
    market_demand_weight: 85,
    salary_range: { entry: 65000, mid: 95000, senior: 140000 },
    growth_path: ['Automation Engineer', 'Senior Automation Engineer', 'Test Architect'],
    specializations: ['API Test Automation Engineer', 'Performance Test Engineer', 'Mobile Automation Engineer']
  },
  {
    role_name: 'SDET',
    domain: 'Testing & Quality',
    track: 'Quality Assurance',
    description: 'Software Development Engineer in Test - combines development and testing',
    daily_work: ['Build test infrastructure', 'Develop testing tools', 'Write automated tests', 'Review code', 'Improve CI/CD pipelines'],
    skills_required: ['Software development', 'Test automation', 'System design', 'CI/CD', 'Multiple languages', 'Git'],
    tools: ['Programming languages', 'Testing frameworks', 'Docker', 'Kubernetes', 'Jenkins', 'Git'],
    difficulty_level: 7,
    learning_time_months: { min: 6, max: 11 },
    market_demand_weight: 82,
    salary_range: { entry: 75000, mid: 110000, senior: 160000 },
    growth_path: ['SDET', 'Senior SDET', 'Staff SDET', 'Engineering Manager'],
    specializations: ['Infrastructure SDET', 'Performance SDET', 'Security SDET']
  },
  {
    role_name: 'Network Engineer',
    domain: 'Systems & Networks',
    track: 'Infrastructure',
    description: 'Design, implement, and maintain computer networks',
    daily_work: ['Configure network devices', 'Monitor network performance', 'Troubleshoot connectivity issues', 'Implement security policies', 'Plan network upgrades'],
    skills_required: ['Networking fundamentals', 'Routing protocols', 'Switching', 'Firewalls', 'Network security', 'Troubleshooting'],
    tools: ['Cisco IOS', 'Wireshark', 'Network monitoring tools', 'VPN software'],
    difficulty_level: 7,
    learning_time_months: { min: 7, max: 12 },
    market_demand_weight: 75,
    salary_range: { entry: 60000, mid: 90000, senior: 135000 },
    growth_path: ['Network Technician', 'Network Engineer', 'Senior Network Engineer', 'Network Architect'],
    specializations: ['Wireless Engineer', 'Security Engineer', 'WAN Engineer']
  },
  {
    role_name: 'Database Administrator',
    domain: 'Systems & Networks',
    track: 'Data Infrastructure',
    description: 'Manage and optimize database systems',
    daily_work: ['Monitor database performance', 'Backup and recovery', 'Optimize queries', 'Manage security', 'Plan capacity'],
    skills_required: ['SQL', 'Database systems', 'Performance tuning', 'Backup strategies', 'Security', 'Scripting'],
    tools: ['MySQL/PostgreSQL', 'SQL Server', 'MongoDB', 'Monitoring tools', 'Backup tools'],
    difficulty_level: 7,
    learning_time_months: { min: 6, max: 11 },
    market_demand_weight: 73,
    salary_range: { entry: 65000, mid: 95000, senior: 140000 },
    growth_path: ['Junior DBA', 'Database Administrator', 'Senior DBA', 'Database Architect'],
    specializations: ['Oracle DBA', 'SQL Server DBA', 'NoSQL Administrator']
  },
  {
    role_name: 'Blockchain Developer',
    domain: 'Emerging & Hybrid',
    track: 'Web3',
    description: 'Build decentralized applications and smart contracts',
    daily_work: ['Write smart contracts', 'Build dApps', 'Integrate with blockchains', 'Test contract security', 'Deploy to networks'],
    skills_required: ['Solidity', 'Web3.js', 'Blockchain fundamentals', 'Smart contracts', 'JavaScript', 'Security'],
    tools: ['Solidity', 'Hardhat', 'Ethers.js', 'MetaMask', 'IPFS', 'Remix'],
    difficulty_level: 8,
    learning_time_months: { min: 8, max: 14 },
    market_demand_weight: 68,
    salary_range: { entry: 80000, mid: 125000, senior: 185000 },
    growth_path: ['Blockchain Developer', 'Senior Blockchain Developer', 'Blockchain Architect'],
    specializations: ['Smart Contract Developer', 'DeFi Developer', 'NFT Developer']
  },
  {
    role_name: 'Robotics Engineer',
    domain: 'Emerging & Hybrid',
    track: 'Hardware-Software',
    description: 'Design and program robotic systems combining hardware and software',
    daily_work: ['Develop robot control systems', 'Integrate sensors and actuators', 'Implement navigation algorithms', 'Test robotic systems', 'Debug hardware-software issues'],
    skills_required: ['C++/Python', 'ROS', 'Control systems', 'Computer vision', 'Kinematics', 'Embedded systems'],
    tools: ['ROS', 'Python', 'C++', 'Gazebo', 'MATLAB', 'PCB design tools'],
    difficulty_level: 9,
    learning_time_months: { min: 12, max: 20 },
    market_demand_weight: 70,
    salary_range: { entry: 75000, mid: 115000, senior: 170000 },
    growth_path: ['Robotics Engineer', 'Senior Robotics Engineer', 'Robotics Architect'],
    specializations: ['Autonomous Systems Engineer', 'Industrial Automation Engineer', 'Drone Engineer']
  },
  {
    role_name: 'IoT Engineer',
    domain: 'Emerging & Hybrid',
    track: 'Hardware-Software',
    description: 'Build Internet of Things systems connecting devices to the cloud',
    daily_work: ['Develop IoT firmware', 'Integrate with cloud platforms', 'Implement communication protocols', 'Optimize power consumption', 'Build dashboards'],
    skills_required: ['Embedded C', 'IoT protocols', 'Cloud platforms', 'Networking', 'Sensors', 'Security'],
    tools: ['Arduino', 'Raspberry Pi', 'MQTT', 'AWS IoT', 'Python', 'Node-RED'],
    difficulty_level: 7,
    learning_time_months: { min: 7, max: 13 },
    market_demand_weight: 75,
    salary_range: { entry: 70000, mid: 105000, senior: 155000 },
    growth_path: ['IoT Developer', 'IoT Engineer', 'Senior IoT Engineer', 'IoT Architect'],
    specializations: ['Industrial IoT Engineer', 'Smart Home Engineer', 'Wearables Engineer']
  }
]

export const DOMAIN_TAXONOMY: DomainStructure[] = [
  {
    domain: 'Software Development',
    tracks: [
      { track: 'Web Development', roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'] },
      { track: 'Mobile Development', roles: ['Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Developer'] },
      { track: 'Specialized Engineering', roles: ['Game Developer', 'Embedded Systems Engineer'] }
    ]
  },
  {
    domain: 'Data & AI',
    tracks: [
      { track: 'Data', roles: ['Data Analyst', 'Business Analyst', 'Data Engineer'] },
      { track: 'AI/ML', roles: ['Machine Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'MLOps Engineer', 'Data Scientist'] }
    ]
  },
  {
    domain: 'Cloud & DevOps',
    tracks: [
      { track: 'Infrastructure', roles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Cloud Architect', 'Kubernetes Engineer'] }
    ]
  },
  {
    domain: 'Cybersecurity',
    tracks: [
      { track: 'Security Operations', roles: ['Security Engineer', 'Cybersecurity Analyst'] },
      { track: 'Offensive Security', roles: ['Penetration Tester'] }
    ]
  },
  {
    domain: 'Design & Product',
    tracks: [
      { track: 'Design', roles: ['UI Designer', 'UX Designer', 'Product Designer'] },
      { track: 'Product', roles: ['Product Manager', 'Technical Product Manager'] }
    ]
  },
  {
    domain: 'Testing & Quality',
    tracks: [
      { track: 'Quality Assurance', roles: ['QA Engineer', 'Automation Test Engineer', 'SDET'] }
    ]
  },
  {
    domain: 'Systems & Networks',
    tracks: [
      { track: 'Infrastructure', roles: ['Network Engineer'] },
      { track: 'Data Infrastructure', roles: ['Database Administrator'] }
    ]
  },
  {
    domain: 'Emerging & Hybrid',
    tracks: [
      { track: 'Web3', roles: ['Blockchain Developer'] },
      { track: 'Hardware-Software', roles: ['Robotics Engineer', 'IoT Engineer'] }
    ]
  }
]

export function findRoleByName(roleName: string): RoleData | null {
  const normalized = roleName.toLowerCase().trim()
  return ROLE_DATABASE.find(r => r.role_name.toLowerCase() === normalized) || null
}

export function fuzzyMatchRole(input: string): RoleData[] {
  const normalized = input.toLowerCase().trim()
  const words = normalized.split(/\s+/)
  
  const scored = ROLE_DATABASE.map(role => {
    let score = 0
    const roleNameLower = role.role_name.toLowerCase()
    const roleDomainLower = role.domain.toLowerCase()
    const roleTrackLower = role.track.toLowerCase()
    
    if (roleNameLower === normalized) score += 100
    else if (roleNameLower.includes(normalized)) score += 50
    else if (normalized.includes(roleNameLower)) score += 40
    
    words.forEach(word => {
      if (roleNameLower.includes(word)) score += 15
      if (roleDomainLower.includes(word)) score += 8
      if (roleTrackLower.includes(word)) score += 8
      if (role.description.toLowerCase().includes(word)) score += 5
    })
    
    const synonyms: Record<string, string[]> = {
      'developer': ['engineer', 'programmer', 'coder'],
      'engineer': ['developer', 'architect'],
      'ai': ['machine learning', 'ml', 'artificial intelligence'],
      'web': ['website', 'frontend', 'backend'],
      'mobile': ['app', 'android', 'ios'],
      'security': ['cybersecurity', 'infosec'],
      'data': ['analytics', 'database']
    }
    
    words.forEach(word => {
      if (synonyms[word]) {
        synonyms[word].forEach(syn => {
          if (roleNameLower.includes(syn)) score += 10
        })
      }
    })
    
    return { role, score }
  })
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.role)
}

export function getRolesByDomain(domain: string): RoleData[] {
  return ROLE_DATABASE.filter(r => r.domain.toLowerCase() === domain.toLowerCase())
}

export function getRolesByTrack(track: string): RoleData[] {
  return ROLE_DATABASE.filter(r => r.track.toLowerCase() === track.toLowerCase())
}

export function getAllDomains(): string[] {
  return DOMAIN_TAXONOMY.map(d => d.domain)
}

export function getTracksInDomain(domain: string): string[] {
  const domainData = DOMAIN_TAXONOMY.find(d => d.domain.toLowerCase() === domain.toLowerCase())
  return domainData ? domainData.tracks.map(t => t.track) : []
}

export function intelligentRoleRecommendation(
  interests: string[],
  workStyle: string,
  timeAvailability: string,
  skills: string[] = []
): Array<{ role: RoleData; score: number; reasoning: string }> {
  const scored = ROLE_DATABASE.map(role => {
    let score = 0
    const reasons: string[] = []
    
    skills.forEach(skill => {
      if (role.skills_required.some(req => req.toLowerCase().includes(skill.toLowerCase()))) {
        score += 15
        if (!reasons.includes('Matches your existing skills')) {
          reasons.push('Matches your existing skills')
        }
      }
    })
    
    interests.forEach(interest => {
      const interestLower = interest.toLowerCase()
      if (role.role_name.toLowerCase().includes(interestLower) ||
          role.domain.toLowerCase().includes(interestLower) ||
          role.track.toLowerCase().includes(interestLower) ||
          role.description.toLowerCase().includes(interestLower)) {
        score += 20
        reasons.push(`Aligns with ${interest} interest`)
      }
    })
    
    const styleMap: Record<string, string[]> = {
      'coding': ['Developer', 'Engineer', 'Programmer'],
      'creative': ['Designer', 'UX', 'UI', 'Product'],
      'analytical': ['Data', 'Analyst', 'Scientist'],
      'communication': ['Product Manager', 'Business Analyst']
    }
    
    if (styleMap[workStyle]) {
      styleMap[workStyle].forEach(keyword => {
        if (role.role_name.includes(keyword)) {
          score += 18
          reasons.push(`Fits ${workStyle} work style`)
        }
      })
    }
    
    const timeMap: Record<string, number> = { 'limited': 6, 'moderate': 12, 'full-time': 18 }
    const userMonths = timeMap[timeAvailability] || 12
    
    if (role.learning_time_months.max <= userMonths) {
      score += 12
      reasons.push('Achievable in your timeframe')
    }
    
    if (role.market_demand_weight >= 90) {
      score += 10
      reasons.push('High market demand')
    } else if (role.market_demand_weight >= 80) {
      score += 5
    }
    
    if (role.difficulty_level <= 5) {
      score += 8
      reasons.push('Beginner-friendly difficulty')
    }
    
    return {
      role,
      score,
      reasoning: reasons.join('. ') || 'General match based on the tech industry landscape'
    }
  })
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export function calculateRoleSkillGap(
  role: RoleData,
  currentSkills: Array<{ name: string; level: string }>
): { gaps: string[]; strengths: string[]; learningDistance: string; estimatedMonths: number } {
  const userSkillsLower = currentSkills.map(s => s.name.toLowerCase())
  
  const strengths = role.skills_required.filter(req =>
    userSkillsLower.some(user => req.toLowerCase().includes(user) || user.includes(req.toLowerCase()))
  )
  
  const gaps = role.skills_required.filter(req =>
    !userSkillsLower.some(user => req.toLowerCase().includes(user) || user.includes(req.toLowerCase()))
  )
  
  const coverage = (strengths.length / role.skills_required.length) * 100
  
  let learningDistance: string
  let estimatedMonths: number
  
  if (coverage >= 70) {
    learningDistance = 'Close'
    estimatedMonths = Math.ceil(role.learning_time_months.min * 0.5)
  } else if (coverage >= 40) {
    learningDistance = 'Moderate'
    estimatedMonths = Math.ceil((role.learning_time_months.min + role.learning_time_months.max) / 2 * 0.7)
  } else if (coverage >= 20) {
    learningDistance = 'Far'
    estimatedMonths = Math.ceil((role.learning_time_months.min + role.learning_time_months.max) / 2)
  } else {
    learningDistance = 'Very Far'
    estimatedMonths = role.learning_time_months.max
  }
  
  return { gaps, strengths, learningDistance, estimatedMonths }
}

export function generateAdaptiveRoadmap(
  role: RoleData,
  skillGap: ReturnType<typeof calculateRoleSkillGap>
): { estimatedMonths: number; intensity: string; difficultyScore: number; milestones: string[] } {
  const { estimatedMonths, gaps } = skillGap
  
  let intensity: string
  if (gaps.length > 8) intensity = 'High'
  else if (gaps.length > 4) intensity = 'Moderate'
  else intensity = 'Light'
  
  const milestones: string[] = []
  
  if (gaps.length > 0) {
    const foundational = gaps.slice(0, 3)
    milestones.push(`Foundation: ${foundational.join(', ')}`)
  }
  
  if (gaps.length > 3) {
    const advanced = gaps.slice(3, 6)
    milestones.push(`Advanced skills: ${advanced.join(', ')}`)
  }
  
  milestones.push(`Build 3-5 projects using ${role.tools.slice(0, 3).join(', ')}`)
  milestones.push(`Portfolio showcasing ${role.daily_work[0].toLowerCase()}`)
  milestones.push(`Network and apply for ${role.growth_path[0]} positions`)
  
  return {
    estimatedMonths,
    intensity,
    difficultyScore: role.difficulty_level,
    milestones
  }
}

export function getAllRolesCount(): number {
  return ROLE_DATABASE.length
}

export function getRolesByDifficulty(maxDifficulty: number): RoleData[] {
  return ROLE_DATABASE.filter(r => r.difficulty_level <= maxDifficulty)
    .sort((a, b) => a.difficulty_level - b.difficulty_level)
}

export function getHighDemandRoles(minDemand: number = 85): RoleData[] {
  return ROLE_DATABASE.filter(r => r.market_demand_weight >= minDemand)
    .sort((a, b) => b.market_demand_weight - a.market_demand_weight)
}

export function searchRolesByKeyword(keyword: string): RoleData[] {
  const kw = keyword.toLowerCase()
  return ROLE_DATABASE.filter(role =>
    role.role_name.toLowerCase().includes(kw) ||
    role.domain.toLowerCase().includes(kw) ||
    role.track.toLowerCase().includes(kw) ||
    role.description.toLowerCase().includes(kw) ||
    role.skills_required.some(skill => skill.toLowerCase().includes(kw)) ||
    role.tools.some(tool => tool.toLowerCase().includes(kw))
  )
}
