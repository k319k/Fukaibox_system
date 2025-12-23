/**
 * API Documentation Component
 * Displays comprehensive API documentation and code examples.
 * Target: <150 lines
 */

import React from 'react';
import { Card, Typography, Tabs, Divider } from 'antd';
import { CodeOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * ApiDocumentation - Shows API endpoints and usage examples
 * Props: none
 */
export default function ApiDocumentation() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const codeExamples = [
        {
            title: 'JavaScript (fetch)',
            code: `// Get user points
const response = await fetch('${apiUrl}/api/public/points/1', {
  headers: {
    'X-API-KEY': 'your_api_key_here'
  }
});
const data = await response.json();
console.log(data);

// Add points
await fetch('${apiUrl}/api/public/points/1/add', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10,
    reason: 'Quest completed'
  })
});`
        },
        {
            title: 'Python (requests)',
            code: `import requests

# Get user points
response = requests.get(
    '${apiUrl}/api/public/points/1',
    headers={'X-API-KEY': 'your_api_key_here'}
)
print(response.json())

# Get ranking
ranking = requests.get(
    '${apiUrl}/api/public/points/ranking',
    headers={'X-API-KEY': 'your_api_key_here'}
)
print(ranking.json())`
        },
        {
            title: 'cURL',
            code: `# Health check (no auth)
curl ${apiUrl}/api/public/health

# Get user points
curl -H "X-API-KEY: your_api_key_here" \\
  ${apiUrl}/api/public/points/1

# Add points
curl -X POST \\
  -H "X-API-KEY: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 10, "reason": "API test"}' \\
  ${apiUrl}/api/public/points/1/add`
        }
    ];

    const endpoints = [
        {
            method: 'GET',
            path: '/api/public/health',
            auth: '❌ None',
            description: 'Health check endpoint'
        },
        {
            method: 'GET',
            path: '/api/public/points/{user_id}',
            auth: '✅ Read',
            description: 'Get points for a specific user'
        },
        {
            method: 'GET',
            path: '/api/public/points/ranking',
            auth: '✅ Read',
            description: 'Get top 10 users by points'
        },
        {
            method: 'POST',
            path: '/api/public/points/{user_id}/add',
            auth: '🔐 Write',
            description: 'Add points to a user'
        },
        {
            method: 'POST',
            path: '/api/public/points/{user_id}/set',
            auth: '🔐 Write',
            description: 'Set user points to a specific value'
        }
    ];

    return (
        <Card title={<><BookOutlined /> API Documentation</>}>
            <Title level={4}>Available Endpoints</Title>
            <div style={{ marginBottom: 24 }}>
                {endpoints.map((ep, idx) => (
                    <div key={idx} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                        <Text strong>
                            <Text code>{ep.method}</Text> <Text code style={{ color: '#1890ff' }}>{ep.path}</Text>
                        </Text>
                        <br />
                        <Text type="secondary">{ep.description}</Text>
                        <br />
                        <Text type={ep.auth.includes('Write') ? 'warning' : 'secondary'}>
                            Auth: {ep.auth}
                        </Text>
                    </div>
                ))}
            </div>

            <Divider />

            <Title level={4}>Code Examples</Title>
            <Tabs
                items={codeExamples.map((example) => ({
                    key: example.title,
                    label: example.title,
                    children: (
                        <pre style={{
                            background: '#f5f5f5',
                            padding: 16,
                            borderRadius: 4,
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: 13
                        }}>
                            {example.code}
                        </pre>
                    )
                }))}
            />

            <Divider />

            <Title level={4}>Authentication</Title>
            <Paragraph>
                Include your API key in the <Text code>X-API-KEY</Text> header for all requests (except health check).
            </Paragraph>
            <Paragraph type="warning">
                <strong>⚠️ Security Warning:</strong> Never expose your API key in client-side code or public repositories!
            </Paragraph>
        </Card>
    );
}
