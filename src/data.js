/**
 * ============================================
 * DATA - Portfolio Content
 * ============================================
 */

export const profile = {
    name: "Varun Singh",
    title: "Data Scientist & Software Developer"
};

export const sections = {
    about: {
        title: "About Me",
        content: `
      <p>A data-driven professional with expertise in <span class="highlight">Data Science</span> 
      and <span class="highlight">Software Development</span>.</p>
      
      <p>Currently pursuing a Master's in Data Science at the University at Buffalo, 
      with experience in pharmaceutical forecasting and analytics.</p>
      
      <div class="stats">
        <div class="stat">
          <span class="stat-value">3+</span>
          <span class="stat-label">Years Experience</span>
        </div>
        <div class="stat">
          <span class="stat-value">30+</span>
          <span class="stat-label">Projects Delivered</span>
        </div>
      </div>
    `
    },

    skills: {
        title: "Skills & Technologies",
        content: `
      <div class="skill-category">
        <h4>Programming</h4>
        <div class="skill-tags">
          <span class="skill-tag" data-level="5">Python</span>
          <span class="skill-tag" data-level="4">JavaScript</span>
          <span class="skill-tag" data-level="5">SQL</span>
          <span class="skill-tag" data-level="3">Java</span>
        </div>
      </div>
      
      <div class="skill-category">
        <h4>Data Science</h4>
        <div class="skill-tags">
          <span class="skill-tag" data-level="4">Machine Learning</span>
          <span class="skill-tag" data-level="5">Time Series</span>
          <span class="skill-tag" data-level="4">Visualization</span>
        </div>
      </div>
      
      <div class="skill-category">
        <h4>Tools & Platforms</h4>
        <div class="skill-tags">
          <span class="skill-tag" data-level="3">Docker</span>
          <span class="skill-tag" data-level="4">Git</span>
          <span class="skill-tag" data-level="3">AWS</span>
        </div>
      </div>
    `
    },

    projects: {
        title: "Featured Projects",
        content: `
      <div class="project-card">
        <h4>🧠 AI Mental Health Support</h4>
        <p>AI-powered mental health support system using LLMs for personalized assistance.</p>
        <div class="project-tags">
          <span>Python</span>
          <span>LLMs</span>
          <span>NLP</span>
        </div>
      </div>
      
      <div class="project-card">
        <h4>📊 Drug Sales Forecasting</h4>
        <p>Time series forecasting models for pharmaceutical markets with Monte Carlo simulation.</p>
        <div class="project-tags">
          <span>Python</span>
          <span>Time Series</span>
          <span>Monte Carlo</span>
        </div>
      </div>
      
      <div class="project-card">
        <h4>❤️ Heart Disease Prediction</h4>
        <p>ML model achieving 92% accuracy in heart disease prediction.</p>
        <div class="project-tags">
          <span>Scikit-learn</span>
          <span>Classification</span>
        </div>
      </div>
    `
    },

    experience: {
        title: "Experience",
        content: `
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">Dec 2023 - Jul 2024</div>
            <h4>Associate - Forecasting</h4>
            <div class="timeline-company">Viscadia, India</div>
            <p>Built forecasting models for pharmaceutical markets. Automated VBA modules, reducing project timelines by 50%.</p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">Aug 2022 - Nov 2023</div>
            <h4>Data Analyst</h4>
            <div class="timeline-company">IQVIA, India</div>
            <p>Automated reporting with Python. Led PowerBI initiatives. Managed engagement for 20+ European countries.</p>
          </div>
        </div>
      </div>
    `
    },

    contact: {
        title: "Get In Touch",
        content: `
      <p class="contact-intro">Interested in working together? Let's connect!</p>
      
      <div class="contact-links">
        <a href="https://github.com/varunnn789" target="_blank" class="contact-link">
          <span class="contact-icon">⌨️</span>
          <span>GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/varun789/" target="_blank" class="contact-link">
          <span class="contact-icon">💼</span>
          <span>LinkedIn</span>
        </a>
        <a href="mailto:varun@example.com" class="contact-link">
          <span class="contact-icon">📧</span>
          <span>Email</span>
        </a>
      </div>
    `
    }
};
