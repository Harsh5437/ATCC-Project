const http = require('http');

const PORT = 8000;
const jobs = {};

// Helper to send JSON response
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`${req.method} ${path}`);

  // Health Endpoint
  if (path === '/api/v1/health' || path === '/') {
    sendJSON(res, 200, {
      status: 'healthy',
      device: 'CPU/GPU (Mock)',
      model: 'yolov8s.pt (Mock)',
      max_concurrent: 2,
      debug_mode: true
    });
    return;
  }

  // Jobs Endpoint - Get all jobs
  if (path === '/api/v1/jobs' && req.method === 'GET') {
    sendJSON(res, 200, Object.values(jobs));
    return;
  }

  // Single Job Endpoint - Get status
  if (path.startsWith('/api/v1/jobs/') && req.method === 'GET') {
    const jobId = path.split('/').pop();
    const job = jobs[jobId];
    if (job) {
      sendJSON(res, 200, job);
    } else {
      sendJSON(res, 404, { error: 'Job not found' });
    }
    return;
  }

  // Process video endpoint
  if (path === '/api/v1/process' && req.method === 'POST') {
    // We just consume the stream (since it's a mock upload) and respond immediately
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      const jobId = 'job_' + Math.random().toString(36).substring(2, 10);
      
      // Initialize job status
      jobs[jobId] = {
        job_id: jobId,
        video_path: 'uploads/mock_video.mp4',
        status: 'Processing',
        progress: 0,
        logs: 'Job submitted.\nInitializing detector...',
        error: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        report_path: `/api/v1/reports/${jobId}`,
        debug_video_path: `https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop`,
        thumbnail_path: null,
        worker_node: 'LOCAL-MOCK-NODE'
      };

      console.log(`Started mock job: ${jobId}`);

      // Simulate processing pipeline over 15 seconds
      let step = 0;
      const interval = setInterval(() => {
        const job = jobs[jobId];
        if (!job) {
          clearInterval(interval);
          return;
        }

        step++;
        if (step === 1) {
          job.progress = 15;
          job.logs += '\nLoading YOLOv8 model weights...';
        } else if (step === 2) {
          job.progress = 35;
          job.logs += '\nRunning frame-by-frame detector...';
        } else if (step === 3) {
          job.progress = 55;
          job.logs += '\nActive tracking: UP \u2191 (24 Cars, 7 Bikes, 4 Trucks, 12 LCVs) | DOWN \u2193 (23 Cars, 4 Bikes, 4 Trucks, 15 LCVs)';
        } else if (step === 4) {
          job.progress = 80;
          job.logs += '\nGenerating analytics graphs and PDF/XLSX summary reports...';
        } else if (step === 5) {
          job.progress = 100;
          job.status = 'Completed';
          job.logs += '\nPipeline executed successfully.\nReport generated.';
          job.completed_at = new Date().toISOString();
          clearInterval(interval);
          console.log(`Completed mock job: ${jobId}`);
        }
      }, 3000);

      sendJSON(res, 200, {
        job_id: jobId,
        status: 'queued',
        message: 'Job submitted to mock worker successfully'
      });
    });
    return;
  }

  // Reports placeholder endpoints
  if (path.startsWith('/api/v1/reports/') && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('Mock Report Content');
    return;
  }

  // Catch-all
  sendJSON(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Mock AI worker listening on port ${PORT}`);
});
