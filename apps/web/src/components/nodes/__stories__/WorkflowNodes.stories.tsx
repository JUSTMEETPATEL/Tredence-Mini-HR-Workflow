// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { StartNode } from '../StartNode';
import { TaskNode } from '../TaskNode';
import { ApprovalNode } from '../ApprovalNode';
import { AutomatedStepNode } from '../AutomatedStepNode';
import { EndNode } from '../EndNode';

const meta = {
  title: 'Nodes/WorkflowNodes',
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ padding: '20px', background: '#f8fafc', height: '100vh' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;

export const Start = {
  render: () => <StartNode id="start-1" data={{ title: 'Start Workflow' }} />,
} satisfies StoryObj<typeof StartNode>;

export const Task = {
  render: () => (
    <div className="flex gap-10 items-start">
      <TaskNode
        id="task-1"
        data={{ title: 'Review Application', description: 'Check resume and cover letter.', assignee: 'HR Generalist' }}
      />
      <TaskNode
        id="task-2"
        data={{ title: 'Simple Task' }}
        selected
      />
    </div>
  ),
} satisfies StoryObj<typeof TaskNode>;

export const Approval = {
  render: () => (
    <div className="flex gap-10 items-start">
      <ApprovalNode
        id="approval-1"
        data={{ title: 'Manager Approval', approverRole: 'Direct Manager' }}
      />
       <ApprovalNode
        id="approval-2"
        data={{ title: 'HRBP Approval' }}
        selected
      />
    </div>
  ),
} satisfies StoryObj<typeof ApprovalNode>;

export const AutomatedStep = {
  render: () => (
    <div className="flex gap-10 items-start">
      <AutomatedStepNode
        id="auto-1"
        data={{ title: 'Send Welcome Email', actionId: 'send_email' }}
      />
       <AutomatedStepNode
        id="auto-2"
        data={{ title: 'Create Jira Ticket', actionId: 'create_ticket' }}
        selected
      />
    </div>
  ),
} satisfies StoryObj<typeof AutomatedStepNode>;

export const End = {
  render: () => <EndNode id="end-1" data={{ endMessage: 'Process Completed' }} />,
} satisfies StoryObj<typeof EndNode>;
