import fs from 'fs';
import path from 'path';
import { Claude } from '@anthropic-ai/claude-code';
import dotenv from 'dotenv';

dotenv.config();
const claude = new Claude(process.env.ANTHROPIC_API_KEY);

const BASE_PROMPT = fs.readFileSync('./prompt-base.txt', 'utf8');
const TASKS_PATH = './tasks.json';

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_PATH));
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));
}

function buildPrompt(task) {
  return BASE_PROMPT.replace('[📌 **DESCRIBE AQUÍ LA FUNCIÓN O CAMBIO QUE DEBE IMPLEMENTARSE**]', task.name);
}

function waitUntil(hour, minute = 0) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(0);
  if (target < now) target.setDate(target.getDate() + 1);
  const delay = target - now;
  console.log(`🕒 Esperando hasta las ${target.toLocaleTimeString()} para continuar...`);
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function run() {
  const tasks = loadTasks();
  for (const task of tasks) {
    if (task.status !== 'pending') continue;

    const prompt = buildPrompt(task);
    console.log(`📌 Ejecutando tarea: ${task.name}...`);

    try {
      const result = await claude.complete(prompt, {
        model: 'claude-3-opus-20240229',
        max_tokens: 2048,
        temperature: 0.3
      });

      fs.writeFileSync(`./output/${task.name.replace(/\s+/g, '_')}.txt`, result);
      console.log(`✅ Respuesta guardada para: ${task.name}\n`);
      task.status = 'done';
      saveTasks(tasks);
    } catch (e) {
      console.error(`❌ Error con Claude: ${e.message}`);

      if (e.message.includes('rate') || e.message.includes('limit')) {
        await waitUntil(17); // espera hasta las 17:00
        await run(); // retoma
        return;
      }

      console.log('🛑 Saliendo por error no relacionado con límite.');
      return;
    }
  }

  console.log('🎉 Todas las tareas han sido completadas.');
}

run();
