import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function FullStack() {
  return <ProgramTemplate program={getProgram('full-stack-development')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'full-stack-development')} />;
}
