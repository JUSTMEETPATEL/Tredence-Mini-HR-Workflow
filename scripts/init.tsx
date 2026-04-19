import React, { useState, useEffect, useRef } from 'react';
import { render, Text, Box, useApp, useInput } from 'ink';
import SelectInputLib from 'ink-select-input';
import TextInputLib from 'ink-text-input';
import SpinnerLib from 'ink-spinner';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling ESM defaults
const SelectInput = (SelectInputLib as any).default || SelectInputLib;
const TextInput = (TextInputLib as any).default || TextInputLib;
const Spinner = (SpinnerLib as any).default || SpinnerLib;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/* --- Constants --- */
const DB_OPTIONS = [
  { label: 'PostgreSQL (Full Docker Stack - Recommended)', value: 'postgresql' },
  { label: 'SQLite (Local File - Basic API only)', value: 'sqlite' },
  { label: 'None (Frontend Mock Mode Only)', value: 'none' }
];
const YES_NO_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

/* --- Types --- */
type Step = 'WELCOME' | 'DB_SELECT' | 'AI_CONFIRM' | 'API_KEY' | 'INSTALL_DEPS' | 'EXECUTION' | 'SUMMARY';
type Config = {
  dbChoice: string;
  useAi: boolean;
  apiKey: string;
  installDeps: boolean;
};

/* --- Execution Logic --- */
function executeIO(config: Config) {
  const apiEnvPath = path.join(ROOT_DIR, 'apps/api/.env');
  const webEnvPath = path.join(ROOT_DIR, 'apps/web/.env');
  const schemaPath = path.join(ROOT_DIR, 'apps/api/prisma/schema.prisma');
  
  if (config.useAi && config.apiKey) {
    fs.writeFileSync(webEnvPath, `OPENROUTER_API_KEY=${config.apiKey}\n`);
  }

  if (config.dbChoice === 'none') {
    return; // Mock mode skips backend changes
  }

  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  if (config.dbChoice === 'postgresql') {
    fs.writeFileSync(apiEnvPath, 'DATABASE_URL=postgresql://hrflow:hrflow_dev@postgres:5432/hr_workflow\nPORT=4000\nNODE_ENV=development\nCORS_ORIGIN=http://localhost:3000\n');
    const newDatasource = `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}`;
    schemaContent = schemaContent.replace(/datasource db \{[\s\S]*?\}/, newDatasource);
    
    // Ensure postgres types
    schemaContent = schemaContent.replace(/params\s+String\s*$/gm, 'params    String[]');
    schemaContent = schemaContent.replace(/data\s+String\s*$/gm, 'data      Json');
    schemaContent = schemaContent.replace(/params\s+String\s*\/\/ \{/gm, 'params    Json       // {');
    
  } else if (config.dbChoice === 'sqlite') {
    fs.writeFileSync(apiEnvPath, 'DATABASE_URL="file:./dev.db"\nPORT=4000\nNODE_ENV=development\nCORS_ORIGIN=http://localhost:3000\n');
    const newDatasource = `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`;
    schemaContent = schemaContent.replace(/datasource db \{[\s\S]*?\}/, newDatasource);
    
    // Modify unsupported SQLite types
    schemaContent = schemaContent.replace(/params\s+String\[\]/g, 'params    String');
    schemaContent = schemaContent.replace(/data\s+Json/g, 'data      String');
    schemaContent = schemaContent.replace(/params\s+Json/g, 'params    String');
  }

  fs.writeFileSync(schemaPath, schemaContent);
}

/* --- Components --- */

const App = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('WELCOME');
  const [config, setConfig] = useState<Config>({ dbChoice: '', useAi: false, apiKey: '', installDeps: true });
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string>('');

  useInput((input, key) => {
    if (key.escape || (input.toLowerCase() === 'c' && key.ctrl)) {
      exit();
    }
  });

  // Welcome Auto-advance
  useEffect(() => {
    if (step === 'WELCOME') {
      const timer = setTimeout(() => setStep('DB_SELECT'), 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Execution Step Logic
  useEffect(() => {
    if (step === 'EXECUTION') {
      const runExecution = async () => {
        try {
          setActiveTask('Writing configurations...');
          executeIO(config);
          await new Promise(r => setTimeout(r, 800)); // slight manual delay for UX
          setLogs(prev => [...prev, `✓ Configuration files generated (${config.dbChoice})`]);

          if (config.installDeps) {
            setActiveTask('Installing core dependencies (apps/web) - Please wait...');
            await runCommand('npm', ['install'], path.join(ROOT_DIR, 'apps/web'));
            setLogs(prev => [...prev, '✓ Frontend dependencies installed']);
            
            if (config.dbChoice !== 'none') {
              setActiveTask('Installing backend dependencies (apps/api)...');
              await runCommand('npm', ['install'], path.join(ROOT_DIR, 'apps/api'));
              setLogs(prev => [...prev, '✓ Backend dependencies installed']);
              
              if (config.dbChoice === 'sqlite') {
                setActiveTask('Running Prisma generate...');
                await runCommand('npx', ['prisma', 'generate'], path.join(ROOT_DIR, 'apps/api'));
                setLogs(prev => [...prev, '✓ Prisma schema generated']);
                
                setActiveTask('Pushing database & seeding...');
                await runCommand('npx', ['prisma', 'db', 'push', '--accept-data-loss'], path.join(ROOT_DIR, 'apps/api'));
                await runCommand('npm', ['run', 'seed'], path.join(ROOT_DIR, 'apps/api'), { DATABASE_URL: "file:./dev.db" });
                setLogs(prev => [...prev, '✓ Database seeded via SQLite']);
              }
            }
          }
          
          setActiveTask('Finalizing...');
          setTimeout(() => setStep('SUMMARY'), 500);
        } catch (err: any) {
          setLogs(prev => [...prev, `❌ Error: ${err.message}`]);
          process.exit(1);
        }
      };
      runExecution();
    }
  }, [step]);

  const runCommand = (command: string, args: string[], cwd: string, envAdditions?: Record<string,string>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { cwd, env: { ...process.env, ...envAdditions }, shell: true });
      // We purposefully don't stream outputs to keep TUI clean, but we could!
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Command ${command} failed with code ${code}`));
      });
    });
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} borderStyle="round" paddingX={2} borderColor="cyan">
        <Text bold color="cyan">🚀 FlowForge Setup Configuration Dashboard</Text>
      </Box>

      {step === 'WELCOME' && (
        <Box paddingLeft={2}>
          <Text color="gray"><Spinner type="dots" /> Initializing wizards...</Text>
        </Box>
      )}

      {step === 'DB_SELECT' && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text bold marginBottom={1}>Which database would you like to use?</Text>
          <SelectInput
            items={DB_OPTIONS}
            onSelect={item => {
              setConfig(c => ({ ...c, dbChoice: item.value }));
              setStep('AI_CONFIRM');
            }}
          />
        </Box>
      )}

      {step === 'AI_CONFIRM' && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text bold marginBottom={1}>Do you want to configure the AI Workflow Generator? (Requires OpenRouter API Key)</Text>
          <SelectInput
            items={YES_NO_OPTIONS}
            onSelect={item => {
              setConfig(c => ({ ...c, useAi: item.value === 'yes' }));
              setStep(item.value === 'yes' ? 'API_KEY' : 'INSTALL_DEPS');
            }}
          />
        </Box>
      )}

      {step === 'API_KEY' && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text bold>Enter your OpenRouter API Key:</Text>
          <Box marginLeft={2} marginY={1}>
            <TextInput
              placeholder="sk-or-v1-..."
              value={config.apiKey}
              onChange={(val) => setConfig(c => ({ ...c, apiKey: val }))}
              onSubmit={() => setStep('INSTALL_DEPS')}
            />
          </Box>
          <Text color="gray" italic>(Press Enter to submit or leave blank to skip)</Text>
        </Box>
      )}

      {step === 'INSTALL_DEPS' && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text bold marginBottom={1}>Would you like to automatically install NPM dependencies? (May take a minute)</Text>
          <SelectInput
            items={YES_NO_OPTIONS}
            onSelect={item => {
              setConfig(c => ({ ...c, installDeps: item.value === 'yes' }));
              setStep('EXECUTION');
            }}
          />
        </Box>
      )}

      {step === 'EXECUTION' && (
        <Box flexDirection="column" paddingLeft={2}>
          <Text bold color="yellow">Configuring Workspace...</Text>
          <Box marginY={1} flexDirection="column">
            {logs.map((log, i) => <Text key={i} color="green">{log}</Text>)}
            <Box marginTop={1}>
               <Text color="cyan"><Spinner type="dots" /> {activeTask}</Text>
            </Box>
          </Box>
        </Box>
      )}

      {step === 'SUMMARY' && (
        <React.Fragment>
          <Box flexDirection="column" borderStyle="single" borderColor="green" padding={1}>
            <Text bold color="green">✅ Setup Complete!</Text>
            <Box flexDirection="column" marginTop={1}>
               {config.dbChoice === 'none' && (
                 <Text>You are running in Front-end Mock Mode. Run <Text backgroundColor="gray" color="black"> npm run dev:web </Text> to launch.</Text>
               )}
               {config.dbChoice === 'postgresql' && (
                 <Box flexDirection="column">
                   <Text>Recommended Next Steps:</Text>
                   <Text color="blue"> 1. docker compose up --build -d</Text>
                   <Text color="blue"> 2. docker compose exec api npx prisma db push --accept-data-loss</Text>
                   <Text color="blue"> 3. docker compose exec api npx tsx src/seed.ts</Text>
                 </Box>
               )}
               {config.dbChoice === 'sqlite' && (
                  <Box flexDirection="column">
                   <Text>Your local SQLite DB has been synced! Run these to start:</Text>
                   <Text color="blue"> 1. npm run dev:api  <Text color="gray">(in apps/api)</Text></Text>
                   <Text color="blue"> 2. npm run dev:web  <Text color="gray">(in apps/web)</Text></Text>
                 </Box>
               )}
            </Box>
          </Box>
          {/* Automatically exit the TUI gracefully after rendering summary */}
          <ExitHandler exitApp={exit} />
        </React.Fragment>
      )}

      {step !== 'SUMMARY' && step !== 'EXECUTION' && step !== 'WELCOME' && (
         <Box marginTop={1} paddingLeft={2}>
            <Text color="gray" italic>[Use ↑/↓ arrows to select and Enter to confirm]</Text>
         </Box>
      )}
    </Box>
  );
};

const ExitHandler = ({ exitApp }: { exitApp: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      exitApp();
      process.exit(0);
    }, 100);
    return () => clearTimeout(timer);
  }, [exitApp]);
  return null;
};

render(<App />);
