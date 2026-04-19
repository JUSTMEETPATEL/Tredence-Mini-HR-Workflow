import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StartNodeForm } from '../StartNodeForm';
import { TaskNodeForm } from '../TaskNodeForm';
import { ApprovalNodeForm } from '../ApprovalNodeForm';
import { AutomatedStepNodeForm } from '../AutomatedStepNodeForm';
import { EndNodeForm } from '../EndNodeForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

// Create a client for stories that use TanStack queries
const queryClient = new QueryClient();

const meta = {
  title: 'Forms/WorkflowForms',
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div style={{ width: '400px', padding: '20px', border: '1px solid #e2e8f0', background: 'white' }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta;

export default meta;

export const Start = {
  render: () => {
    // We mock the react-hook-form context here
    const form = useForm({ defaultValues: { title: 'Start' } });
    return (
      <FormProvider {...form}>
         <StartNodeForm nodeId="dummy" data={{ title: 'Start' }} />
      </FormProvider>
    )
  },
} satisfies StoryObj<typeof StartNodeForm>;

export const Task = {
   render: () => {
    const form = useForm({ defaultValues: { title: 'Task', description: 'Review the document', assignee: 'John Doe' } });
    return (
      <FormProvider {...form}>
         <TaskNodeForm nodeId="dummy" data={{ title: 'Task', description: 'Review the document', assignee: 'John Doe' }} />
      </FormProvider>
    )
  },
} satisfies StoryObj<typeof TaskNodeForm>;

export const Approval = {
   render: () => {
    const form = useForm({ defaultValues: { title: 'Needs Approval', approverRole: 'Direct Manager', autoApproveThresholdDays: 5 } });
    return (
      <FormProvider {...form}>
         <ApprovalNodeForm nodeId="dummy" data={{ title: 'Needs Approval', approverRole: 'Direct Manager', autoApproveThresholdDays: 5 }} />
      </FormProvider>
    )
  },
} satisfies StoryObj<typeof ApprovalNodeForm>;

export const AutomatedStep = {
   render: () => {
    const form = useForm({ defaultValues: { title: 'Send Email', actionId: 'send_email', params: { to: 'hr@example.com', subject: 'Welcome' } } });
    return (
      <FormProvider {...form}>
         <AutomatedStepNodeForm nodeId="dummy" data={{ title: 'Send Email', actionId: 'send_email', params: { to: 'hr@example.com', subject: 'Welcome' } }} />
      </FormProvider>
    )
  },
} satisfies StoryObj<typeof AutomatedStepNodeForm>;

export const End = {
   render: () => {
    const form = useForm({ defaultValues: { endMessage: 'Process finished.', requiresSummary: true } });
    return (
      <FormProvider {...form}>
         <EndNodeForm nodeId="dummy" data={{ endMessage: 'Process finished.', requiresSummary: true }} />
      </FormProvider>
    )
  },
} satisfies StoryObj<typeof EndNodeForm>;
