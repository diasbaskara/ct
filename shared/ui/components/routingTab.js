import { t } from '@i18n';
import { fetchRoutingData } from '@api/cases';
import { WorkflowDiagram, createWorkflowFromRouting } from '@utils/workflowDiagram';
import { exportToExcel, formatRoutingDataForExcel } from '@utils/excelExport';

export function createRoutingTab(container, caseId) {
  if (!caseId) {
    const noSelection = document.createElement('div');
    noSelection.className = 'ct-no-selection';
    noSelection.textContent = t('routing.no_case_selected');
    container.appendChild(noSelection);
    return;
  }

  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('common.loading');
  container.appendChild(loading);

  // Fetch and display routing data
  fetchRoutingData(caseId).then(routingData => {
    container.innerHTML = '';
    
    if (!routingData || !routingData.data) {
      const noData = document.createElement('div');
      noData.className = 'ct-no-data';
      noData.textContent = t('routing.no_data');
      container.appendChild(noData);
      return;
    }

    const routing = routingData.data;
    
    // Create routing container
    const routingContainer = document.createElement('div');
    routingContainer.className = 'ct-routing-container';
    
    // Controls section
    const controls = document.createElement('div');
    controls.className = 'ct-routing-controls';
    
    // View toggle buttons
    const viewToggle = document.createElement('div');
    viewToggle.className = 'ct-view-toggle';
    
    const diagramBtn = document.createElement('button');
    diagramBtn.className = 'ct-btn ct-btn-primary active';
    diagramBtn.textContent = t('routing.diagram_view');
    diagramBtn.onclick = () => switchView('diagram');
    
    const timelineBtn = document.createElement('button');
    timelineBtn.className = 'ct-btn ct-btn-secondary';
    timelineBtn.textContent = t('routing.timeline_view');
    timelineBtn.onclick = () => switchView('timeline');
    
    const tableBtn = document.createElement('button');
    tableBtn.className = 'ct-btn ct-btn-secondary';
    tableBtn.textContent = t('routing.table_view');
    tableBtn.onclick = () => switchView('table');
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'ct-btn ct-btn-outline';
    exportBtn.textContent = t('routing.export_excel');
    exportBtn.onclick = () => exportRoutingData(routing);
    
    viewToggle.appendChild(diagramBtn);
    viewToggle.appendChild(timelineBtn);
    viewToggle.appendChild(tableBtn);
    
    controls.appendChild(viewToggle);
    controls.appendChild(exportBtn);
    
    // Current status section
    const currentStatus = document.createElement('div');
    currentStatus.className = 'ct-routing-current-status';
    
    const statusTitle = document.createElement('h4');
    statusTitle.textContent = t('routing.current_status');
    
    const statusInfo = document.createElement('div');
    statusInfo.className = 'ct-status-info';
    
    const statusBadge = document.createElement('div');
    statusBadge.className = `ct-status-badge ct-status-${(routing.currentStatus || '').toLowerCase().replace(' ', '-')}`;
    statusBadge.textContent = routing.currentStatus || 'N/A';
    
    const statusDescription = document.createElement('p');
    statusDescription.textContent = routing.statusDescription || '';
    
    // Progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.className = 'ct-progress-container';
    
    const progressLabel = document.createElement('span');
    progressLabel.className = 'ct-progress-label';
    const completedSteps = routing.timeline ? routing.timeline.filter(step => step.completed).length : 0;
    const totalSteps = routing.timeline ? routing.timeline.length : 0;
    progressLabel.textContent = `${completedSteps}/${totalSteps} ${t('routing.steps_completed')}`;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'ct-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'ct-progress-fill';
    const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    progressFill.style.width = `${progressPercent}%`;
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressLabel);
    progressContainer.appendChild(progressBar);
    
    statusInfo.appendChild(statusBadge);
    statusInfo.appendChild(statusDescription);
    statusInfo.appendChild(progressContainer);
    
    currentStatus.appendChild(statusTitle);
    currentStatus.appendChild(statusInfo);
    
    // Content container for different views
    const contentContainer = document.createElement('div');
    contentContainer.className = 'ct-routing-content';
    
    // Create workflow diagram view
    const diagramView = document.createElement('div');
    diagramView.className = 'ct-routing-view ct-diagram-view active';
    diagramView.id = 'diagram-view';
    
    const diagramTitle = document.createElement('h4');
    diagramTitle.textContent = t('routing.workflow_diagram');
    diagramView.appendChild(diagramTitle);
    
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'ct-workflow-diagram-container';
    diagramView.appendChild(diagramContainer);
    
    // Create and render workflow diagram
    const workflowData = createWorkflowFromRouting(routing);
    if (workflowData) {
      const diagram = new WorkflowDiagram(diagramContainer, {
        width: 800,
        height: 400,
        onNodeClick: (step, index) => {
          showStepDetails(step, index);
        }
      });
      diagram.render(workflowData);
      
      // Store diagram reference for later use
      diagramView.workflowDiagram = diagram;
    }
    
    // Create timeline view
    const timelineView = createTimelineView(routing);
    
    // Create table view
    const tableView = createTableView(routing);
    
    contentContainer.appendChild(diagramView);
    contentContainer.appendChild(timelineView);
    contentContainer.appendChild(tableView);
    
    routingContainer.appendChild(controls);
    routingContainer.appendChild(currentStatus);
    routingContainer.appendChild(contentContainer);
    
    container.appendChild(routingContainer);
    
    // View switching function
    function switchView(viewType) {
      // Update button states
      const buttons = viewToggle.querySelectorAll('.ct-btn');
      buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('ct-btn-secondary');
        btn.classList.remove('ct-btn-primary');
      });
      
      const activeBtn = viewType === 'diagram' ? diagramBtn : 
        viewType === 'timeline' ? timelineBtn : tableBtn;
      activeBtn.classList.add('active');
      activeBtn.classList.add('ct-btn-primary');
      activeBtn.classList.remove('ct-btn-secondary');
      
      // Update view visibility
      const views = contentContainer.querySelectorAll('.ct-routing-view');
      views.forEach(view => view.classList.remove('active'));
      
      const activeView = contentContainer.querySelector(`#${viewType}-view`);
      if (activeView) {
        activeView.classList.add('active');
      }
    }
    
    // Step details modal function
    function showStepDetails(step, index) {
      const modal = document.createElement('div');
      modal.className = 'ct-modal ct-step-details-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'ct-modal-content';
      
      const modalHeader = document.createElement('div');
      modalHeader.className = 'ct-modal-header';
      
      const modalTitle = document.createElement('h3');
      modalTitle.textContent = `${step.title || `Step ${index + 1}`} - ${t('routing.step_details')}`;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ct-modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => modal.remove();
      
      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(closeBtn);
      
      const modalBody = document.createElement('div');
      modalBody.className = 'ct-modal-body';
      
      const detailsHTML = `
        <div class="ct-step-detail-item">
          <label>${t('routing.step_title')}:</label>
          <span>${step.title || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.description')}:</label>
          <span>${step.description || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.assigned_to')}:</label>
          <span>${step.assignedTo || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.department')}:</label>
          <span>${step.department || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.status')}:</label>
          <span class="ct-badge ct-status-${(step.completed ? 'completed' : step.current ? 'current' : 'pending')}">
            ${step.completed ? t('routing.completed') : step.current ? t('routing.current') : t('routing.pending')}
          </span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.start_date')}:</label>
          <span>${step.startDate || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.end_date')}:</label>
          <span>${step.endDate || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.duration')}:</label>
          <span>${step.duration || 'N/A'}</span>
        </div>
        <div class="ct-step-detail-item">
          <label>${t('routing.notes')}:</label>
          <span>${step.notes || 'N/A'}</span>
        </div>
      `;
      
      modalBody.innerHTML = detailsHTML;
      
      modalContent.appendChild(modalHeader);
      modalContent.appendChild(modalBody);
      modal.appendChild(modalContent);
      
      // Close modal when clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      };
      
      document.body.appendChild(modal);
    }
    
  }).catch(() => {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    container.appendChild(errorDiv);
  });
}

// Create timeline view (existing implementation)
function createTimelineView(routing) {
  const timelineView = document.createElement('div');
  timelineView.className = 'ct-routing-view ct-timeline-view';
  timelineView.id = 'timeline-view';
  
  const timelineTitle = document.createElement('h4');
  timelineTitle.textContent = t('routing.workflow_timeline');
  timelineView.appendChild(timelineTitle);
  
  if (routing.timeline && routing.timeline.length > 0) {
    const timelineList = document.createElement('div');
    timelineList.className = 'ct-timeline-list';
    
    routing.timeline.forEach((step, index) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = `ct-timeline-item ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`;
      
      const timelineMarker = document.createElement('div');
      timelineMarker.className = 'ct-timeline-marker';
      
      const timelineContent = document.createElement('div');
      timelineContent.className = 'ct-timeline-content';
      
      const stepTitle = document.createElement('h5');
      stepTitle.textContent = step.title || `Step ${index + 1}`;
      
      const stepDescription = document.createElement('p');
      stepDescription.textContent = step.description || '';
      
      const stepMeta = document.createElement('div');
      stepMeta.className = 'ct-timeline-meta';
      
      if (step.date) {
        const stepDate = document.createElement('span');
        stepDate.className = 'ct-timeline-date';
        stepDate.textContent = step.date;
        stepMeta.appendChild(stepDate);
      }
      
      if (step.user) {
        const stepUser = document.createElement('span');
        stepUser.className = 'ct-timeline-user';
        stepUser.textContent = `by ${step.user}`;
        stepMeta.appendChild(stepUser);
      }
      
      timelineContent.appendChild(stepTitle);
      timelineContent.appendChild(stepDescription);
      timelineContent.appendChild(stepMeta);
      
      timelineItem.appendChild(timelineMarker);
      timelineItem.appendChild(timelineContent);
      
      timelineList.appendChild(timelineItem);
    });
    
    timelineView.appendChild(timelineList);
  } else {
    const noTimeline = document.createElement('p');
    noTimeline.textContent = t('routing.no_timeline_data');
    timelineView.appendChild(noTimeline);
  }
  
  return timelineView;
}

// Create table view (existing implementation enhanced)
function createTableView(routing) {
  const tableView = document.createElement('div');
  tableView.className = 'ct-routing-view ct-table-view';
  tableView.id = 'table-view';
  
  const tableTitle = document.createElement('h4');
  tableTitle.textContent = t('routing.routing_details');
  tableView.appendChild(tableTitle);
  
  if (routing.details && routing.details.length > 0) {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'ct-table-container';
    
    const detailsTable = document.createElement('table');
    detailsTable.className = 'ct-table ct-routing-details-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
      t('routing.step'),
      t('routing.assigned_to'),
      t('routing.department'),
      t('routing.status'),
      t('routing.start_date'),
      t('routing.end_date'),
      t('routing.duration'),
      t('routing.notes')
    ];
    
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    detailsTable.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    routing.details.forEach(detail => {
      const row = document.createElement('tr');
      
      // Step
      const stepCell = document.createElement('td');
      stepCell.textContent = detail.step || 'N/A';
      row.appendChild(stepCell);
      
      // Assigned to
      const assignedCell = document.createElement('td');
      assignedCell.textContent = detail.assignedTo || 'N/A';
      row.appendChild(assignedCell);
      
      // Department
      const deptCell = document.createElement('td');
      deptCell.textContent = detail.department || 'N/A';
      row.appendChild(deptCell);
      
      // Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `ct-badge ct-status-${(detail.status || '').toLowerCase().replace(' ', '-')}`;
      statusBadge.textContent = detail.status || 'N/A';
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Start Date
      const startDateCell = document.createElement('td');
      startDateCell.textContent = detail.startDate || 'N/A';
      row.appendChild(startDateCell);
      
      // End Date
      const endDateCell = document.createElement('td');
      endDateCell.textContent = detail.endDate || 'N/A';
      row.appendChild(endDateCell);
      
      // Duration
      const durationCell = document.createElement('td');
      durationCell.textContent = detail.duration || 'N/A';
      row.appendChild(durationCell);
      
      // Notes
      const notesCell = document.createElement('td');
      notesCell.textContent = detail.notes || 'N/A';
      notesCell.title = detail.notes; // Show full text on hover
      row.appendChild(notesCell);
      
      tbody.appendChild(row);
    });
    
    detailsTable.appendChild(tbody);
    tableContainer.appendChild(detailsTable);
    tableView.appendChild(tableContainer);
  } else {
    const noDetails = document.createElement('p');
    noDetails.textContent = t('routing.no_details_data');
    tableView.appendChild(noDetails);
  }
  
  return tableView;
}

// Export routing data to Excel
function exportRoutingData(routing) {
  const data = routing.details || routing.timeline || [];
  const options = {
    formatFunction: formatRoutingDataForExcel,
    sheetName: 'Routing Details',
    title: 'Case Routing Data Export',
    subject: 'CoreTabs Routing Export'
  };
  
  exportToExcel(data, `routing-data-${new Date().toISOString().split('T')[0]}.xlsx`, options)
    .then(result => {
      if (result.success) {
        // Show success message
        const message = document.createElement('div');
        message.className = 'ct-success-message';
        message.textContent = t('routing.export_success');
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
      } else {
        throw new Error(result.error);
      }
    })
    .catch(error => {
      // Show error message
      const message = document.createElement('div');
      message.className = 'ct-error-message';
      message.textContent = t('routing.export_error') + ': ' + error.message;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 5000);
    });
}