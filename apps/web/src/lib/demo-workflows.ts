import type { SavedWorkflow } from '@/stores/canvasStore';


const demoWorkflow1: SavedWorkflow = {
  id: 'demo-1-simple',
  name: 'Simple Task Flow',
  type: 'demo',
  nameSource: 'manual',
  updatedAt: new Date().toISOString(),
  nodes: [
    { id: 'n1', type: 'start', position: { x: 250, y: 50 }, data: { title: 'Initiate Request' } },
    { id: 'n2', type: 'task', position: { x: 250, y: 150 }, data: { title: 'Basic Form filling', description: 'User provides initial details.' } },
    { id: 'n3', type: 'end', position: { x: 250, y: 250 }, data: { title: 'Complete' } }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2' },
    { id: 'e2-3', source: 'n2', target: 'n3' }
  ]
};

const demoWorkflow2: SavedWorkflow = {
  id: 'demo-2-onboarding',
  name: 'Employee Onboarding Automation',
  type: 'demo',
  nameSource: 'manual',
  updatedAt: new Date().toISOString(),
  nodes: [
    { id: 'n1', type: 'start', position: { x: 400, y: 50 }, data: { title: 'New Hire Added' } },
    { id: 'n2', type: 'task', position: { x: 400, y: 150 }, data: { title: 'Collect Documentation', assignee: 'HR' } },
    { id: 'n3', type: 'automated_step', position: { x: 400, y: 250 }, data: { title: 'Provision Email & Accounts', actionType: 'API Call', endpointUrl: 'https://api.internal/provision' } },
    { id: 'n4', type: 'approval', position: { x: 400, y: 350 }, data: { title: 'Manager Equipment Approval', approver: 'Hiring Manager' } },
    { id: 'n5', type: 'task', position: { x: 400, y: 450 }, data: { title: 'Schedule IT Orientation', assignee: 'IT Support' } },
    { id: 'n6', type: 'end', position: { x: 400, y: 550 }, data: { title: 'Onboarded Successfully' } }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2' },
    { id: 'e2-3', source: 'n2', target: 'n3' },
    { id: 'e3-4', source: 'n3', target: 'n4' },
    { id: 'e4-5', source: 'n4', target: 'n5' },
    { id: 'e5-6', source: 'n5', target: 'n6' }
  ]
};

const demoWorkflow3: SavedWorkflow = {
  id: 'demo-3-complex',
  name: 'Complex Expense Approval',
  type: 'demo',
  nameSource: 'manual',
  updatedAt: new Date().toISOString(),
  nodes: [
    { id: 'n1', type: 'start', position: { x: 300, y: 50 }, data: { title: 'Submit Expense Report' } },
    { id: 'n2', type: 'automated_step', position: { x: 300, y: 150 }, data: { title: 'Receipt OCR Validation', actionType: 'ML Model' } },
    { id: 'n3', type: 'approval', position: { x: 100, y: 250 }, data: { title: 'Direct Manager Review', approver: 'Direct Manager' } },
    { id: 'n4', type: 'approval', position: { x: 500, y: 250 }, data: { title: 'Finance Department Review', approver: 'CFO' } },
    { id: 'n5', type: 'task', position: { x: 300, y: 350 }, data: { title: 'Process Payout', assignee: 'Accounts Payable' } },
    { id: 'n6', type: 'end', position: { x: 300, y: 450 }, data: { title: 'Funds Disbursed' } }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2' },
    { id: 'e2-3', source: 'n2', target: 'n3' }, // OCR -> Manager
    { id: 'e2-4', source: 'n2', target: 'n4' }, // OCR -> Finance
    { id: 'e3-5', source: 'n3', target: 'n5' }, // Manager -> Payout
    { id: 'e4-5', source: 'n4', target: 'n5' }, // Finance -> Payout
    { id: 'e5-6', source: 'n5', target: 'n6' } // Payout -> End
  ]
};

export const DEMO_WORKFLOWS: SavedWorkflow[] = [
  demoWorkflow1,
  demoWorkflow2,
  demoWorkflow3
];
