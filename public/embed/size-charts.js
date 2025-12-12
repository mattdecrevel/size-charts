/**
 * Size Charts Embed Widget
 *
 * Embed size charts on any website with a simple script tag.
 *
 * Usage:
 *   <div id="size-chart" data-chart="mens-tops"></div>
 *   <script src="https://your-domain.com/embed/size-charts.js"
 *           data-api="https://your-domain.com"></script>
 *
 * Options (data attributes on container):
 *   data-chart: Chart slug (required)
 *   data-unit: "in" or "cm" (default: "in")
 *   data-theme: "light" or "dark" (default: "light")
 *   data-compact: "true" for compact mode
 */

(function() {
  'use strict';

  // Get script element and API URL
  const currentScript = document.currentScript;
  const apiUrl = currentScript?.getAttribute('data-api') || '';

  // CSS styles for the widget
  const styles = `
    .sc-widget {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .sc-widget * {
      box-sizing: border-box;
    }
    .sc-widget.sc-dark {
      color: #e5e5e5;
    }
    .sc-widget.sc-light {
      color: #171717;
    }
    .sc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .sc-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .sc-unit-toggle {
      display: flex;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #d4d4d4;
    }
    .sc-dark .sc-unit-toggle {
      border-color: #404040;
    }
    .sc-unit-btn {
      padding: 4px 12px;
      font-size: 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .sc-light .sc-unit-btn {
      color: #525252;
    }
    .sc-dark .sc-unit-btn {
      color: #a3a3a3;
    }
    .sc-unit-btn.sc-active {
      font-weight: 600;
    }
    .sc-light .sc-unit-btn.sc-active {
      background: #171717;
      color: white;
    }
    .sc-dark .sc-unit-btn.sc-active {
      background: #e5e5e5;
      color: #171717;
    }
    .sc-table-wrapper {
      overflow-x: auto;
      border-radius: 8px;
    }
    .sc-light .sc-table-wrapper {
      border: 1px solid #e5e5e5;
    }
    .sc-dark .sc-table-wrapper {
      border: 1px solid #404040;
    }
    .sc-table {
      width: 100%;
      border-collapse: collapse;
      white-space: nowrap;
    }
    .sc-table th,
    .sc-table td {
      padding: 10px 12px;
      text-align: left;
    }
    .sc-compact .sc-table th,
    .sc-compact .sc-table td {
      padding: 6px 10px;
      font-size: 13px;
    }
    .sc-table th {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .sc-light .sc-table th {
      background: #fafafa;
      border-bottom: 1px solid #e5e5e5;
      color: #525252;
    }
    .sc-dark .sc-table th {
      background: #262626;
      border-bottom: 1px solid #404040;
      color: #a3a3a3;
    }
    .sc-light .sc-table td {
      border-bottom: 1px solid #f5f5f5;
    }
    .sc-dark .sc-table td {
      border-bottom: 1px solid #333;
    }
    .sc-table tr:last-child td {
      border-bottom: none;
    }
    .sc-measurement {
      font-variant-numeric: tabular-nums;
    }
    .sc-range {
      color: inherit;
    }
    .sc-light .sc-range-sep {
      color: #a3a3a3;
    }
    .sc-dark .sc-range-sep {
      color: #525252;
    }
    .sc-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .sc-light .sc-loading {
      color: #a3a3a3;
    }
    .sc-dark .sc-loading {
      color: #525252;
    }
    .sc-error {
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    .sc-light .sc-error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .sc-dark .sc-error {
      background: #450a0a;
      color: #fca5a5;
      border: 1px solid #7f1d1d;
    }
    .sc-footer {
      margin-top: 8px;
      font-size: 11px;
      text-align: right;
    }
    .sc-light .sc-footer {
      color: #a3a3a3;
    }
    .sc-dark .sc-footer {
      color: #525252;
    }
    .sc-footer a {
      color: inherit;
      text-decoration: none;
    }
    .sc-footer a:hover {
      text-decoration: underline;
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('sc-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'sc-widget-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  // Format a cell value based on v1 API format
  function formatValue(cell, unit) {
    if (!cell) return '—';

    const suffix = unit === 'cm' ? ' cm' : '"';

    // Text or label value
    if (cell.type === 'text' || cell.type === 'label') {
      return escapeHtml(cell.value || '');
    }

    // Range value
    if (cell.type === 'range') {
      const values = unit === 'cm' ? cell.cm : cell.inches;
      if (values) {
        const min = values.min;
        const max = values.max;
        if (min !== null && min !== undefined && max !== null && max !== undefined) {
          return `<span class="sc-range">${min}<span class="sc-range-sep"> – </span>${max}${suffix}</span>`;
        } else if (min !== null && min !== undefined) {
          return `<span class="sc-measurement">${min}+${suffix}</span>`;
        } else if (max !== null && max !== undefined) {
          return `<span class="sc-measurement">≤${max}${suffix}</span>`;
        }
      }
    }

    // Single measurement
    if (cell.type === 'measurement') {
      const value = unit === 'cm' ? cell.cm : cell.inches;
      if (value !== null && value !== undefined) {
        return `<span class="sc-measurement">${value}${suffix}</span>`;
      }
    }

    return '—';
  }

  // Render the widget
  function renderWidget(container, data, options) {
    const theme = options.theme || 'light';
    const compact = options.compact === 'true';
    let unit = options.unit || 'in';

    function render() {
      const html = `
        <div class="sc-widget sc-${theme} ${compact ? 'sc-compact' : ''}">
          <div class="sc-header">
            <h3 class="sc-title">${escapeHtml(data.name)}</h3>
            <div class="sc-unit-toggle">
              <button class="sc-unit-btn ${unit === 'in' ? 'sc-active' : ''}" data-unit="in">IN</button>
              <button class="sc-unit-btn ${unit === 'cm' ? 'sc-active' : ''}" data-unit="cm">CM</button>
            </div>
          </div>
          <div class="sc-table-wrapper">
            <table class="sc-table">
              <thead>
                <tr>
                  ${data.columns.map(col => `<th>${escapeHtml(col.name)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.rows.map(row => `
                  <tr>
                    ${data.columns.map(col => {
                      const cell = row.cells.find(c => c.columnId === col.id);
                      return `<td>${formatValue(cell, unit)}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Attach unit toggle handlers
      container.querySelectorAll('.sc-unit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          unit = this.getAttribute('data-unit');
          render();
        });
      });
    }

    render();
  }

  // Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Fetch chart data
  async function fetchChart(slug, apiKey) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(`${apiUrl}/api/v1/size-charts?slug=${encodeURIComponent(slug)}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Chart not found' : 'Failed to load chart');
    }

    return response.json();
  }

  // Initialize widget for a container
  async function initWidget(container) {
    const chartSlug = container.getAttribute('data-chart');
    if (!chartSlug) {
      container.innerHTML = '<div class="sc-error">Missing data-chart attribute</div>';
      return;
    }

    const options = {
      unit: container.getAttribute('data-unit') || 'in',
      theme: container.getAttribute('data-theme') || 'light',
      compact: container.getAttribute('data-compact'),
    };

    const apiKey = container.getAttribute('data-api-key');
    const theme = options.theme;

    // Show loading state
    container.innerHTML = `<div class="sc-widget sc-${theme}"><div class="sc-loading">Loading...</div></div>`;

    try {
      const data = await fetchChart(chartSlug, apiKey);
      renderWidget(container, data, options);
    } catch (error) {
      container.innerHTML = `<div class="sc-widget sc-${theme}"><div class="sc-error">${escapeHtml(error.message)}</div></div>`;
    }
  }

  // Initialize all widgets on page
  function init() {
    injectStyles();

    // Find all containers with data-chart attribute
    const containers = document.querySelectorAll('[data-chart]');
    containers.forEach(initWidget);
  }

  // Expose global API
  window.SizeCharts = {
    init: init,
    render: initWidget,
    setApiUrl: function(url) {
      // Allow runtime API URL configuration
      Object.defineProperty(window.SizeCharts, 'apiUrl', { value: url, writable: true });
    }
  };

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
