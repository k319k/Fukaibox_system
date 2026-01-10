#!/bin/bash
# FukaiBox Sandbox API for ProDesk LXC
# シンプルなサンドボックスプロジェクト管理API

from flask import Flask, request, jsonify
import os
import uuid
import subprocess
from datetime import datetime

app = Flask(__name__)

PROJECTS_DIR = "/app/projects"
MAX_RUNNING = 3
MAX_STORAGE_GB = 2

# In-memory project storage
projects = {}

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        "status": "ok",
        "service": "fukaibox-sandbox",
        "max_running": MAX_RUNNING,
        "max_storage_gb": MAX_STORAGE_GB
    })

@app.route('/projects', methods=['GET'])
def list_projects():
    """List user's projects"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401
    
    user_projects = [p for p in projects.values() if p['owner_id'] == user_id]
    return jsonify(user_projects)

@app.route('/projects', methods=['POST'])
def create_project():
    """Create new project"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401
    
    data = request.json
    project_id = str(uuid.uuid4())
    
    project = {
        "id": project_id,
        "name": data.get('name', 'Unnamed Project'),
        "description": data.get('description'),
        "html_content": data.get('html_content'),
        "owner_id": user_id,
        "status": "stopped",
        "created_at": datetime.utcnow().isoformat(),
        "storage_used_mb": 0
    }
    
    projects[project_id] = project
    
    # Create project directory
    project_dir = os.path.join(PROJECTS_DIR, user_id, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Save HTML content
    if data.get('html_content'):
        with open(os.path.join(project_dir, 'index.html'), 'w') as f:
            f.write(data['html_content'])
    
    return jsonify(project), 201

@app.route('/projects/<project_id>/run', methods=['POST'])
def run_project(project_id):
    """Run project"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401
    
    if project_id not in projects:
        return jsonify({"error": "Project not found"}), 404
    
    project = projects[project_id]
    
    if project['owner_id'] != user_id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Check running count
    running_count = sum(1 for p in projects.values() if p['status'] == 'running')
    if running_count >= MAX_RUNNING:
        return jsonify({"error": f"Maximum {MAX_RUNNING} projects can run simultaneously"}), 429
    
    # Start project (simplified - in production use Docker containers)
    project['status'] = 'running'
    
    return jsonify(project)

@app.route('/projects/<project_id>/stop', methods=['POST'])
def stop_project(project_id):
    """Stop project"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401
    
    if project_id not in projects:
        return jsonify({"error": "Project not found"}), 404
    
    project = projects[project_id]
    
    if project['owner_id'] != user_id:
        return jsonify({"error": "Permission denied"}), 403
    
    project['status'] = 'stopped'
    
    return jsonify(project)

@app.route('/projects/<project_id>/logs', methods=['GET'])
def get_logs(project_id):
    """Get project logs"""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401
    
    if project_id not in projects:
        return jsonify({"error": "Project not found"}), 404
    
    project = projects[project_id]
    
    if project['owner_id'] != user_id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Return empty logs for now
    return jsonify([])

if __name__ == '__main__':
    os.makedirs(PROJECTS_DIR, exist_ok=True)
    app.run(host='0.0.0.0', port=9000)
