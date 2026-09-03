import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function AiMl() {
  return <ProgramTemplate program={getProgram('ai-machine-learning')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'ai-machine-learning')} />;
}
