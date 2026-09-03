import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function SoftwareTesting() {
  return <ProgramTemplate program={getProgram('software-testing')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'software-testing')} />;
}
