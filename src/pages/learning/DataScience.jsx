import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function DataScience() {
  return <ProgramTemplate program={getProgram('data-science-business-analytics')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'data-science-business-analytics')} />;
}
