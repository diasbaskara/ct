// Workflow diagram utility for visualizing routing processes
export class WorkflowDiagram {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 400,
      nodeWidth: options.nodeWidth || 120,
      nodeHeight: options.nodeHeight || 60,
      spacing: options.spacing || 150,
      ...options
    };
    this.svg = null;
    this.nodes = [];
    this.connections = [];
  }

  // Create SVG container
  createSVG() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.className = 'ct-workflow-diagram';
    
    // Add styles
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      .ct-workflow-node {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .ct-workflow-node:hover {
        filter: brightness(1.1);
      }
      .ct-workflow-node.completed {
        fill: #28a745;
        stroke: #1e7e34;
      }
      .ct-workflow-node.current {
        fill: #007bff;
        stroke: #0056b3;
        stroke-width: 3;
      }
      .ct-workflow-node.pending {
        fill: #6c757d;
        stroke: #495057;
      }
      .ct-workflow-node.error {
        fill: #dc3545;
        stroke: #c82333;
      }
      .ct-workflow-text {
        fill: white;
        font-family: Arial, sans-serif;
        font-size: 12px;
        text-anchor: middle;
        dominant-baseline: middle;
        pointer-events: none;
      }
      .ct-workflow-connection {
        stroke: #6c757d;
        stroke-width: 2;
        fill: none;
        marker-end: url(#arrowhead);
      }
      .ct-workflow-connection.active {
        stroke: #007bff;
        stroke-width: 3;
      }
    `;
    this.svg.appendChild(style);
    
    // Add arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#6c757d');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
    
    this.container.appendChild(this.svg);
  }

  // Calculate node positions
  calculateLayout(steps) {
    const positions = [];
    const cols = Math.ceil(Math.sqrt(steps.length));
    const rows = Math.ceil(steps.length / cols);
    
    const startX = (this.options.width - (cols - 1) * this.options.spacing) / 2;
    const startY = (this.options.height - (rows - 1) * this.options.spacing) / 2;
    
    steps.forEach((step, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      positions.push({
        x: startX + col * this.options.spacing,
        y: startY + row * this.options.spacing,
        step: step
      });
    });
    
    return positions;
  }

  // Create workflow node
  createNode(position, index) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('data-step-index', index);
    
    // Node rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', position.x - this.options.nodeWidth / 2);
    rect.setAttribute('y', position.y - this.options.nodeHeight / 2);
    rect.setAttribute('width', this.options.nodeWidth);
    rect.setAttribute('height', this.options.nodeHeight);
    rect.setAttribute('rx', '8');
    rect.setAttribute('ry', '8');
    
    // Determine node status
    let status = 'pending';
    if (position.step.completed) status = 'completed';
    else if (position.step.current) status = 'current';
    else if (position.step.error) status = 'error';
    
    rect.className = `ct-workflow-node ${status}`;
    
    // Node text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', position.x);
    text.setAttribute('y', position.y - 5);
    text.className = 'ct-workflow-text';
    text.textContent = position.step.title || `Step ${index + 1}`;
    
    // Step number
    const stepNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    stepNumber.setAttribute('x', position.x);
    stepNumber.setAttribute('y', position.y + 10);
    stepNumber.className = 'ct-workflow-text';
    stepNumber.style.fontSize = '10px';
    stepNumber.textContent = `#${index + 1}`;
    
    group.appendChild(rect);
    group.appendChild(text);
    group.appendChild(stepNumber);
    
    // Add click handler
    group.addEventListener('click', () => {
      this.onNodeClick(position.step, index);
    });
    
    // Add tooltip
    if (position.step.description) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = position.step.description;
      group.appendChild(title);
    }
    
    return group;
  }

  // Create connection between nodes
  createConnection(from, to, isActive = false) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate connection points on node edges
    const fromX = from.x + (dx / distance) * (this.options.nodeWidth / 2);
    const fromY = from.y + (dy / distance) * (this.options.nodeHeight / 2);
    const toX = to.x - (dx / distance) * (this.options.nodeWidth / 2);
    const toY = to.y - (dy / distance) * (this.options.nodeHeight / 2);
    
    // Create curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlOffset = Math.min(50, distance / 4);
    
    const pathData = `M ${fromX} ${fromY} Q ${midX} ${midY - controlOffset} ${toX} ${toY}`;
    path.setAttribute('d', pathData);
    path.className = `ct-workflow-connection ${isActive ? 'active' : ''}`;
    
    return path;
  }

  // Render the complete workflow
  render(workflowData) {
    if (!this.svg) {
      this.createSVG();
    }
    
    // Clear existing content
    const existingNodes = this.svg.querySelectorAll('.ct-workflow-node, .ct-workflow-connection');
    existingNodes.forEach(node => node.remove());
    
    if (!workflowData || !workflowData.steps || workflowData.steps.length === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.options.width / 2);
      text.setAttribute('y', this.options.height / 2);
      text.className = 'ct-workflow-text';
      text.style.fill = '#6c757d';
      text.textContent = 'No workflow data available';
      this.svg.appendChild(text);
      return;
    }
    
    const positions = this.calculateLayout(workflowData.steps);
    
    // Create connections first (so they appear behind nodes)
    for (let i = 0; i < positions.length - 1; i++) {
      const isActive = positions[i].step.completed && !positions[i + 1].step.completed;
      const connection = this.createConnection(positions[i], positions[i + 1], isActive);
      this.svg.appendChild(connection);
    }
    
    // Create nodes
    positions.forEach((position, index) => {
      const node = this.createNode(position, index);
      this.svg.appendChild(node);
    });
  }

  // Handle node click events
  onNodeClick(step, index) {
    if (this.options.onNodeClick) {
      this.options.onNodeClick(step, index);
    }
  }

  // Update workflow status
  updateStatus(stepIndex, status) {
    const node = this.svg.querySelector(`[data-step-index="${stepIndex}"] .ct-workflow-node`);
    if (node) {
      node.className = `ct-workflow-node ${status}`;
    }
  }

  // Highlight path to current step
  highlightPath(currentStepIndex) {
    const connections = this.svg.querySelectorAll('.ct-workflow-connection');
    connections.forEach((connection, index) => {
      if (index < currentStepIndex) {
        connection.classList.add('active');
      } else {
        connection.classList.remove('active');
      }
    });
  }

  // Export diagram as SVG
  exportSVG() {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.svg);
  }

  // Destroy the diagram
  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}

// Helper function to create workflow from routing data
export function createWorkflowFromRouting(routingData) {
  if (!routingData || !routingData.timeline) {
    return null;
  }
  
  const steps = routingData.timeline.map((step, index) => ({
    id: step.id || index,
    title: step.title || `Step ${index + 1}`,
    description: step.description || '',
    completed: step.completed || false,
    current: step.current || false,
    error: step.error || false,
    assignedTo: step.assignedTo || '',
    department: step.department || '',
    startDate: step.startDate || step.date,
    endDate: step.endDate,
    duration: step.duration || '',
    notes: step.notes || ''
  }));
  
  return {
    id: routingData.id,
    name: routingData.name || 'Case Routing Workflow',
    description: routingData.description || '',
    steps: steps,
    currentStep: steps.findIndex(step => step.current),
    totalSteps: steps.length,
    completedSteps: steps.filter(step => step.completed).length
  };
}